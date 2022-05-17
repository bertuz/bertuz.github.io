import {
  ApiEvent,
  BackEvent,
  FrontEvent,
  isAFrontMessage,
  MessageType,
} from './model';

import Button from '../button';

import colors from '../../assets/styles/colors';

import { dimensionInRem } from '../../assets/styles/dimensions';

import useDimensions from '../../utils/useDimensions';

import * as ga from '../../lib/google-analytics';

import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Pusher from 'pusher-js';

import { css } from '@emotion/react';

import type { Channel } from 'pusher-js';
import type {
  BackMessage,
  FrontMessage,
  FrontSendMessageEventBody,
  Message,
  SystemMessage,
} from './model';

enum ChatState {
  WaitingForFirstMessageToConnect = 'waiting-first-message-to-connect',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Offline = 'offline',
  NotAvailableWaitForLastMessage = 'not-available-wait-for-last-message',
  TerminatedByFront = 'terminated-by-front',
  Failed = 'failed',
}

// https://pusher.com/docs/channels/using_channels/connection/#available-states
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
type AckForFrontMessage = { ackMessageId: string };
const ACK_TIMEOUT = 7000;

const shouldDisableInterface = (
  state: ChatState,
  lastSentMessage: FrontMessage | null
): boolean => {
  if (
    lastSentMessage === null &&
    state === ChatState.WaitingForFirstMessageToConnect
  )
    return false;

  if (
    state === ChatState.NotAvailableWaitForLastMessage ||
    (lastSentMessage?.ack && state === ChatState.Connected)
  )
    return false;

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
    flex: '0 0 auto',
    marginBottom: 5,
    textAlign: 'justify',
    textjustify: 'inter-word',
    hyphens: 'auto',
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
    paddingBottom: dimensionInRem(-1),
  }),
  messageContent: css({
    display: 'inline-block',
    maxWidth: 270,
    padding: 5,
  }),
  messageMeta: css({
    fontFamily: 'Alegreya-Sans',
    fontSize: dimensionInRem(-1),
    textAlign: 'right',
    color: colors.darkerGrey,
    paddingTop: '5px',
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
  chatPromptDescription: css({
    transition: 'all 0.5s ease-in-out',
    display: 'block',
    overflow: 'hidden',
  }),
  chatInput: css({ flex: '1 0 auto', marginRight: 10 }),
  messageReceivedIcon: css({
    height: dimensionInRem(-1),
    verticalAlign: 'baseline',
  }),
  messageSendingIcon: css({
    width: dimensionInRem(2),
    verticalAlign: 'sub',
  }),
});

const sendFirstMessageAndWaitForAck = (
  channel: Channel,
  firstUserMessage: FrontMessage
) => {
  return new Promise((res, rej) => {
    channel.bind(BackEvent.frontMessageAck, (payload: AckForFrontMessage) => {
      channel?.unbind(BackEvent.frontMessageAck);
      if (firstUserMessage.id === payload.ackMessageId) {
        firstUserMessage.ack = true;
        res(payload);
        return;
      } else {
        rej(payload);
        return;
      }
    });

    fetch('/api/frontChat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: channel?.name ?? '',
        openedAt: Date.now(),
        message: { id: firstUserMessage.id, text: firstUserMessage.text },
      }),
    })
      .catch((err) => {
        channel?.unbind(BackEvent.frontMessageAck);
        console.error(err);
        rej(err);
      })
      .then(() => {
        firstUserMessage.savedOnBack = true;
      });
  });
};

const Index = () => {
  const [chatStatus, setChatStatus] = useState<ChatState>(
    ChatState.WaitingForFirstMessageToConnect
  );
  const [connectionChannelStatus, setConnectionChannelStatus] =
    useState<ConnectionStateChange | null>(null);
  const [firstMessageStatus, setFirstMessageStatus] = useState<
    'idle' | 'to-be-sent' | 'sent' | 'acked'
  >('idle');
  const [channel, setChannel] = useState<Channel | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<FrontMessage | null>(
    null
  );
  const [chatHistory, setChatHistory] = useState<
    Array<Message | SystemMessage>
  >([]);
  const [userInput, setUserInput] = useState<string>('');
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const classes = getClasses();
  const bottomHistoryRef = useRef<HTMLDivElement | null>(null);
  const inputTextRef = useRef<HTMLInputElement | null>(null);
  const promptRef = useRef<HTMLParagraphElement | null>(null);
  const { height: promptHeight } = useDimensions(promptRef);

  const handleChannelStateToReconnectingChatStatus = () => {
    setChatStatus((previousState) => {
      if (
        previousState !== ChatState.NotAvailableWaitForLastMessage &&
        previousState !== ChatState.Connecting
      )
        return ChatState.Reconnecting;

      return previousState;
    });
  };

  useEffect(
    function handleConnectionChannelStatus() {
      switch (connectionChannelStatus?.current) {
        case undefined:
          setChatStatus(ChatState.WaitingForFirstMessageToConnect);
          break;
        case 'initialized':
          handleChannelStateToReconnectingChatStatus();
          break;
        case 'connecting':
          if (connectionChannelStatus.previous === 'connected') {
            handleChannelStateToReconnectingChatStatus();
            break;
          }

          if (connectionChannelStatus.previous === 'unavailable') {
            handleChannelStateToReconnectingChatStatus();
            break;
          }

          if (connectionChannelStatus.previous === 'initialized') {
            setChatStatus((previousState) => {
              if (previousState !== ChatState.NotAvailableWaitForLastMessage)
                return ChatState.Connecting;

              return previousState;
            });
            break;
          }
          break;
        case 'connected':
          if (firstMessageStatus === 'idle') {
            setFirstMessageStatus('to-be-sent');
            break;
          }
          if (firstMessageStatus === 'acked') {
            setChatStatus(ChatState.Connected);
            break;
          }
          break;

        case 'disconnected':
          channel?.unbind_all();
          channel?.pusher.connection.unbind_all();
          setChatStatus(ChatState.TerminatedByFront);
          break;
        case 'unavailable':
          handleChannelStateToReconnectingChatStatus();
          break;

        default:
          channel?.unbind_all();
          channel?.pusher.connection.unbind_all();
          setChatStatus(ChatState.Failed);
          break;
      }
    },
    [connectionChannelStatus, firstMessageStatus]
  );

  useEffect(
    function handleConnectionWithBack() {
      if (chatStatus !== ChatState.Connecting) {
        return;
      }

      if (channel === null || lastUserMessage === null) {
        setChatStatus(ChatState.Failed);
        return;
      }

      if (firstMessageStatus === 'to-be-sent') {
        setFirstMessageStatus('sent');
        handleAckTimeoutNotAvailable(lastUserMessage);
        sendFirstMessageAndWaitForAck(channel, lastUserMessage)
          .then(() => {
            setFirstMessageStatus('acked');
          })
          .catch(() => {
            setChatStatus(ChatState.Failed);
          });
        return;
      }

      if (firstMessageStatus === 'acked') {
        setChatStatus(ChatState.Connected);
      }
    },
    [channel, chatStatus, firstMessageStatus, lastUserMessage]
  );

  useEffect(
    function setupConnectedChatWithBack() {
      if (chatStatus === ChatState.WaitingForFirstMessageToConnect) {
        channel?.pusher.connection.unbind_all();
        channel?.unbind_all();
        return;
      }

      if (chatStatus !== ChatState.Connected) {
        return;
      }

      if (!channel) {
        setChatStatus(ChatState.Failed);
        return;
      }

      channel.unbind(BackEvent.frontMessageAck);
      channel.bind(BackEvent.frontMessageAck, (payload: AckForFrontMessage) => {
        setChatHistory((previousHistory) => {
          const ackedMessageIndex = previousHistory.findIndex(
            (message) => message.id === payload.ackMessageId
          );
          const newHistory = [...previousHistory];
          const frontMessageToAck = newHistory[ackedMessageIndex];

          if (isAFrontMessage(frontMessageToAck)) {
            frontMessageToAck.ack = true;
          }

          return newHistory;
        });

        setLastUserMessage((previousLastUserMessage) => {
          if (previousLastUserMessage?.id === payload.ackMessageId) {
            previousLastUserMessage.ack = true;
          }

          return previousLastUserMessage;
        });
      });

      channel.unbind(BackEvent.sendMessage);
      channel?.bind(BackEvent.sendMessage, (message: BackMessage) => {
        setChatHistory((previousHistory) => {
          return [...previousHistory, message];
        });
      });

      channel.unbind(ApiEvent.internalError);
      channel?.bind(ApiEvent.internalError, () => {
        setChatHistory((previousHistory) => {
          setChatStatus(ChatState.Failed);
          const failedFeedback: Message = {
            type: MessageType.system,
            id: uuidv4(),
            timestamp: Date.now(),
            text: 'Something went wrong: disconnected.',
          };
          return [...previousHistory, failedFeedback];
        });
      });
    },
    [channel, chatStatus]
  );

  useEffect(
    function handleSystemChatMessages() {
      switch (chatStatus) {
        case ChatState.Connecting:
          setChatHistory((previousMessages) => {
            return [
              ...previousMessages,
              {
                type: MessageType.system,
                id: uuidv4(),
                timestamp: Date.now(),
                text: 'Connecting',
              } as SystemMessage,
            ];
          });
          break;
        case ChatState.Connected:
          setChatHistory((previousMessages) => {
            return [
              ...previousMessages,
              {
                type: MessageType.system,
                id: uuidv4(),
                timestamp: Date.now(),
                text: 'Connected',
              } as SystemMessage,
            ];
          });
          break;
        case ChatState.Reconnecting:
          setChatHistory((previousMessages) => {
            return [
              ...previousMessages,
              {
                type: MessageType.system,
                id: uuidv4(),
                timestamp: Date.now(),
                text: 'Reconnecting...',
              } as SystemMessage,
            ];
          });
          break;
        case ChatState.Failed:
          setChatHistory((previousMessages) => {
            return [
              ...previousMessages,
              {
                type: MessageType.system,
                id: uuidv4(),
                timestamp: Date.now(),
                text: 'An unexpected error occurred.',
              } as SystemMessage,
            ];
          });
          break;
        case ChatState.Offline:
          setChatHistory((previousMessages) => {
            return [
              ...previousMessages,
              {
                type: MessageType.system,
                id: uuidv4(),
                timestamp: Date.now(),
                text: 'Disconnected.',
              } as SystemMessage,
              {
                type: MessageType.system,
                id: uuidv4(),
                timestamp: Date.now(),
                text: (
                  <>
                    <a
                      onKeyDown={restart}
                      onClick={restart}
                      tabIndex={0}
                      role="button"
                      aria-disabled={shouldDisableInterface(
                        chatStatus,
                        lastUserMessage
                      )}
                    >
                      <Button caption="Restart the chat" />
                    </a>
                  </>
                ),
              },
            ];
          });
          break;
        case ChatState.NotAvailableWaitForLastMessage:
          setChatHistory((previousMessages) => {
            return [
              ...previousMessages,
              {
                type: MessageType.system,
                id: uuidv4(),
                timestamp: Date.now(),
                text: "Whoops! It looks I'm not available right now.",
              } as SystemMessage,
              {
                type: MessageType.system,
                id: uuidv4(),
                timestamp: Date.now(),
                text: "Leave a last message that I can read when I've come back",
              } as SystemMessage,
            ];
          });
          break;
      }
    },
    [chatStatus]
  );

  const handleAckTimeoutNotAvailable = (messageToWaitForAck: FrontMessage) => {
    const firstAckCallback = (payload: AckForFrontMessage) => {
      if (payload.ackMessageId === messageToWaitForAck.id) {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        channel?.unbind(BackEvent.frontMessageAck, firstAckCallback);
      }
    };

    channel?.bind(BackEvent.frontMessageAck, firstAckCallback);

    const timeoutId = window.setTimeout(() => {
      channel?.pusher.connection.unbind_all();
      channel?.unbind_all();
      setChatStatus(ChatState.NotAvailableWaitForLastMessage);
    }, ACK_TIMEOUT);
    setTimeoutId(timeoutId);
  };

  const startChannel = () => {
    setChannel(openChannel(setConnectionChannelStatus));
  };

  const restart = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setLastUserMessage(null);
    setChatHistory([]);

    channel?.disconnect();
    setChannel(null);
    setConnectionChannelStatus(null);

    setFirstMessageStatus('idle');
    setChatStatus(ChatState.WaitingForFirstMessageToConnect);
    setUserInput('');
  };

  const sendMessage = () => {
    ga.click('chat-message-sent');

    if (userInput.length === 0) {
      return;
    }

    const message: FrontMessage = {
      type: MessageType.front,
      id: uuidv4(),
      timestamp: Date.now(),
      text: userInput,
      ack: false,
    };

    setLastUserMessage(message);
    setUserInput('');

    switch (chatStatus) {
      case ChatState.Connected:
        setLastUserMessage(message);
        setChatHistory((previousMessages) => {
          return [...previousMessages, message];
        });
        handleAckTimeoutNotAvailable(message);
        channel?.trigger(
          FrontEvent.sendMessage,
          JSON.stringify({
            id: message.id,
            timestamp: message.timestamp,
            payload: message.text,
          } as FrontSendMessageEventBody)
        );
        break;
      case ChatState.NotAvailableWaitForLastMessage:
        setLastUserMessage(message);

        fetch('/api/closeFrontChat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: channel?.name ?? '',
            contactDetails: message?.text ?? 'none.',
          }),
        })
          .then(() => {
            message.ack = true;
            setLastUserMessage(message);
            setChatHistory((previousMessages) => {
              return [
                ...previousMessages,
                message,
                {
                  type: MessageType.system,
                  id: uuidv4(),
                  timestamp: Date.now(),
                  text: 'Got it!',
                } as SystemMessage,
              ];
            });
            setChatStatus(ChatState.Offline);
          })
          .catch((err) => {
            setChatStatus(ChatState.Failed);
            console.error(err);
          });
        break;
      case ChatState.WaitingForFirstMessageToConnect:
        setChatStatus(ChatState.Connecting);
        setChatHistory((previousMessages) => {
          return [...previousMessages, message];
        });
        startChannel();
        break;

      default:
        throw new Error(
          `The message cannot be sent when the chat status is ${chatStatus}`
        );
        break;
    }
  };

  const messagesBox = useRef(null);
  useEffect(() => {
    if (chatHistory.length === 0) {
      return;
    }

    if (messagesBox.current) {
      bottomHistoryRef?.current?.scrollIntoView({ behavior: 'smooth' });
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
      <p
        ref={promptRef}
        style={{
          height:
            chatStatus == ChatState.WaitingForFirstMessageToConnect
              ? promptHeight || 'auto'
              : 0,
        }}
        css={classes.chatPromptDescription}
      >
        Yep, a 1:1 live chat with me. Keep in mind it&apos;s experimental, but
        everything should be working good!
      </p>
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
                  {frontMessage.text}
                </div>
                <div css={classes.messageMeta}>
                  {((frontMessage.ack || frontMessage.savedOnBack) && (
                    <img
                      css={classes.messageReceivedIcon}
                      src="/tick.svg"
                      alt="Received"
                    />
                  )) || (
                    <img
                      css={classes.messageSendingIcon}
                      src="/loading.svg"
                      alt="Sending"
                    />
                  )}{' '}
                  {frontMessageDate.toLocaleTimeString([], {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
                    {backMessage.text}
                  </div>
                  <div css={classes.messageMeta}>
                    {backMessageDate.toLocaleTimeString([], {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
                  {message.text}
                </div>
              </div>
            );
          }
        })}

        <div ref={bottomHistoryRef} />
      </div>
      <div css={classes.chatUserControl}>
        <input
          ref={inputTextRef}
          disabled={shouldDisableInterface(chatStatus, lastUserMessage)}
          css={classes.chatInput}
          type="text"
          placeholder={chatHistory.length > 0 ? '' : 'Write me something 🌝'}
          onFocusCapture={() => {
            window.setTimeout(() => {
              inputTextRef?.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          onChange={handleChangeUserInput}
          value={userInput}
          onKeyPress={handleKeyPress}
        />
        <a
          onKeyPress={() => {
            if (shouldDisableInterface(chatStatus, lastUserMessage)) return;
            sendMessage();
          }}
          onClick={() => {
            if (shouldDisableInterface(chatStatus, lastUserMessage)) return;
            sendMessage();
          }}
          tabIndex={0}
          role="button"
          aria-disabled={shouldDisableInterface(chatStatus, lastUserMessage)}
        >
          <Button
            caption="Send"
            disabled={shouldDisableInterface(chatStatus, lastUserMessage)}
          />
        </a>
      </div>
    </>
  );
};

export default Index;
