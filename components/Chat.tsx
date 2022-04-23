import Button from './button';

import colors from '../assets/styles/colors';

import { dimensionInRem } from '../assets/styles/dimensions';

import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Pusher from 'pusher-js';

import { css } from '@emotion/react';

import type { Channel } from 'pusher-js';

export enum MessageType {
  front,
  back,
  system,
}

export type Message = {
  type: MessageType;
  id: string;
  timestamp: number;
  payload: string;
};

export type FrontMessage = Message & {
  type: MessageType.front;
  ack: boolean;
};

export type BackMessage = Message & {
  type: MessageType.back;
};
export type SystemMessage = Message & {
  type: MessageType.system;
};

enum ChatState {
  WaitForFirstConnectingMessage = 'first-connecting-message',
  Connecting = 'connecting',
  ConnectedOnFrontSide = 'connected-front-side',
  Reconnecting = 'reconnecting',
  Connected = 'connected',
  Offline = 'offline',
  Failed = 'failed',
}
type ConnectionState =
  | 'error'
  | 'initialized'
  | 'connecting'
  | 'connected'
  | 'unavailable'
  | 'failed'
  | 'disconnected';
type ConnectionStateChange = {
  previous: ConnectionState;
  current: ConnectionState;
};
type FrontMessageAck = { ackMessageId: string };
const shouldDisableInterface = (
  state: ChatState,
  lastSentMessage: FrontMessage | null
): boolean => {
  if (
    lastSentMessage === null &&
    state === ChatState.WaitForFirstConnectingMessage
  )
    return false;

  if (lastSentMessage?.ack && state === ChatState.Connected) return false;

  return true;
};

const openChannel = (
  connectionStateListener: (states: ConnectionStateChange) => void
): Channel => {
  const channelId = `private-${uuidv4()}`;

  const connection = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER_REGION,
    authEndpoint: '/api/auth-front-chat',
  });

  const channel = connection.subscribe(channelId);
  connection.connection.bind('state_change', connectionStateListener);

  return channel;
};

const getClasses = () => ({
  messagesBox: css({
    maxWidth: 500,
    maxHeight: 500,
    paddingRight: 20,
    overflow: 'scroll',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
  }),
  message: css({
    marginBottom: 5,
    flex: '0 0 auto',
  }),
  userMessage: css({
    textAlign: 'right',
  }),
  backMessage: css({
    textAlign: 'left',
  }),
  systemMessage: css({
    textAlign: 'center',
    fontSize: dimensionInRem(-1),
  }),
  messageContent: css({
    display: 'inline-block',
    maxWidth: 270,
    padding: 5,
  }),
  messageMeta: css({
    fontFamily: 'Alegreya-Sans',
    fontSize: dimensionInRem(0),
    textAlign: 'right',
    color: colors.darkerGrey,
  }),
  userMessageContent: css({
    backgroundColor: colors.sugarPaperBlue,
    borderRadius: '18px 18px 3px 18px',
  }),
  backMessageContent: css({
    backgroundColor: colors.pastelViolet,
    borderRadius: '18px 18px 18px 3px',
  }),
  systemMessageContent: css({
    color: colors.darkerGrey,
    fontFamily: 'Alegreya-Sans',
  }),
  chatUserControl: css({
    width: '100%',
    maxWidth: 500,
    display: 'flex',
    marginRight: 20,
    boxSizing: 'border-box',
  }),
  chatInput: css({ flex: '1 0 auto', marginRight: 10 }),
});
const Chat = () => {
  const [status, setStatus] = useState<ChatState>(
    ChatState.WaitForFirstConnectingMessage
  );
  const [channel, setChannel] = useState<Channel | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<FrontMessage | null>(
    null
  );
  const [chatHistory, setChatHistory] = useState<Array<Message>>([]);
  const [userInput, setUserInput] = useState<string>('');
  const classes = getClasses();

  const sendMessage = () => {
    const message: FrontMessage = {
      type: MessageType.front,
      id: uuidv4(),
      timestamp: Date.now(),
      payload: userInput,
      ack: false,
    };

    setLastUserMessage(message);
    setUserInput('');

    // first message
    if (status === ChatState.WaitForFirstConnectingMessage) {
      setStatus(ChatState.Connecting);
      setChatHistory((previousMessages) => {
        return [
          ...previousMessages,
          {
            type: MessageType.system,
            id: uuidv4(),
            timestamp: Date.now(),
            payload: 'Connecting...',
          } as SystemMessage,
          message,
        ];
      });

      const channel = openChannel((states) => {
        switch (states.current) {
          case 'initialized':
          case 'connecting':
            setChannel(null);
            if (states.previous === 'connected') {
              setChatHistory((previousMessages) => {
                return [
                  ...previousMessages,
                  {
                    type: MessageType.system,
                    id: uuidv4(),
                    timestamp: Date.now(),
                    payload: 'Reconnecting...',
                  } as SystemMessage,
                ];
              });
              setStatus(ChatState.Reconnecting);
            } else {
              setStatus(ChatState.Connecting);
            }
            break;
          case 'connected':
            setChannel(channel);
            setStatus(ChatState.ConnectedOnFrontSide);
            break;
          case 'unavailable':
            setChannel(null);
            setStatus(ChatState.Offline);
            setChatHistory((previousMessages) => {
              return [
                ...previousMessages,
                {
                  type: MessageType.system,
                  id: uuidv4(),
                  timestamp: Date.now(),
                  payload: 'Chat unavailable',
                } as SystemMessage,
              ];
            });
            break;
          default:
            setChannel(null);
            setStatus(ChatState.Failed);
            break;
        }
      });

      return;
    }

    setLastUserMessage(message);
    setChatHistory((previousMessages) => {
      return [...previousMessages, message];
    });
    console.log('sending with ID' + message.id);
    channel?.trigger(
      'client-send-message',
      JSON.stringify({
        id: message.id,
        timestamp: message.timestamp,
        payload: message.payload,
      })
    );
  };

  useEffect(() => {
    channel?.unbind_all();

    if (status === ChatState.ConnectedOnFrontSide) {
      // channel?.bind('client-back-message-ack', () => {
      //   console.log('ACK RECEIVED!!!');
      // });
      channel?.bind('client-back-message-ack', (payload: FrontMessageAck) => {
        console.log('RECEIVED');
        setChatHistory((previousHistory) => {
          const ackedMessageIndex = previousHistory.findIndex(
            (message) => message.id === payload.ackMessageId
          );
          const newHistory = [...previousHistory];
          newHistory[ackedMessageIndex].ack = true;

          return newHistory;
        });

        if (lastUserMessage?.id === payload.ackMessageId) {
          lastUserMessage.ack = true;
        }

        if (status === ChatState.ConnectedOnFrontSide) {
          setStatus(ChatState.Connected);
          setChatHistory((previousMessages) => {
            return [
              ...previousMessages,
              {
                id: uuidv4(),
                timestamp: Date.now(),
                type: MessageType.system,
                payload: 'Connected.',
              } as SystemMessage,
            ];
          });
        }
      });

      console.log('sending with ID' + lastUserMessage.id);
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          id: channel?.name ?? '',
          openedAt: Date.now(),
          payload: lastUserMessage,
        }),
      }).catch((err) => {
        setStatus(ChatState.Failed);
        console.error(err);
      });
    }

    channel?.bind('client-back-send-message', (message: BackMessage) => {
      setChatHistory((previousHistory) => {
        const newHistory = [...previousHistory, message];
        return newHistory;
      });
    });

    // connected
    channel?.bind('client-back-message-ack', (payload: FrontMessageAck) => {
      console.log('RECEIVED2');
      console.log(payload);
      setChatHistory((previousHistory) => {
        const ackedMessageIndex = previousHistory.findIndex(
          (message) => message.id === payload.ackMessageId
        );
        const newHistory = [...previousHistory];

        newHistory[ackedMessageIndex].ack = true;

        return newHistory;
      });

      if (lastUserMessage?.id === payload.ackMessageId) {
        lastUserMessage.ack = true;
      }
    });
  }, [status, userInput]);
  const messagesBox = useRef(null);
  useEffect(() => {
    if (messagesBox.current) {
      messagesBox.current.scrollTop = messagesBox.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleChangeUserInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setUserInput(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      <div css={classes.messagesBox} ref={messagesBox}>
        {chatHistory.map((message) => {
          if (message.type === MessageType.front) {
            const frontMessage = message as FrontMessage;
            const frontMessageDate = new Date(frontMessage.timestamp);

            return (
              <div
                key={message.id}
                css={[classes.message, classes.userMessage]}
              >
                <div css={[classes.messageContent, classes.userMessageContent]}>
                  {frontMessage.payload}
                </div>
                <div css={classes.messageMeta}>
                  {(frontMessage.ack && '✔️️') || '⏳'}{' '}
                  {frontMessageDate.getHours()}:{frontMessageDate.getMinutes()}
                </div>
              </div>
            );
          }

          if (message.type === MessageType.back) {
            const backMessage = message as BackMessage;
            const backMessageDate = new Date(backMessage.timestamp);

            return (
              <div
                key={message.id}
                css={[classes.message, classes.backMessage]}
              >
                <div style={{ display: 'inline-block' }}>
                  <div
                    css={[classes.messageContent, classes.backMessageContent]}
                  >
                    {backMessage.payload}
                  </div>
                  <div css={classes.messageMeta}>
                    {backMessageDate.getHours()}:{backMessageDate.getMinutes()}
                  </div>
                </div>
              </div>
            );
          }

          if (message.type === MessageType.system) {
            return (
              <div
                css={[classes.message, classes.systemMessage]}
                key={message.id}
              >
                <div
                  css={(classes.messageContent, classes.systemMessageContent)}
                >
                  {message.payload}
                </div>
              </div>
            );
          }
        })}

        {/*<div css={[classes.message, classes.backMessage]}>*/}
        {/*  <div css={[classes.messageContent, classes.backMessageContent]}>*/}
        {/*    Sono il capone de la mafia, sono il filio de la mia mama. sei un*/}
        {/*    estronzo di merda*/}
        {/*  </div>*/}
        {/*  <div css={classes.messageMeta}>12:20</div>*/}
        {/*</div>*/}
      </div>
      <div css={classes.chatUserControl}>
        <input
          disabled={shouldDisableInterface(status, lastUserMessage)}
          css={classes.chatInput}
          type="text"
          onChange={handleChangeUserInput}
          value={userInput}
          onKeyPress={handleKeyPress}
        />
        {/* todo disabled status */}
        <a
          onKeyPress={() => {
            if (shouldDisableInterface(status, lastUserMessage)) return;

            sendMessage();
          }}
          onClick={() => {
            if (shouldDisableInterface(status, lastUserMessage)) return;
            sendMessage();
          }}
          tabIndex={0}
          role="button"
        >
          <Button caption="Send" />
        </a>
      </div>
    </>
  );
};

export default Chat;
