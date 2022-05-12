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
  WaitForFirstConnectingMessage = 'first-connecting-message',
  Connecting = 'connecting',
  ConnectedOnFrontSide = 'connected-front-side',
  Reconnecting = 'reconnecting',
  Connected = 'connected',
  Offline = 'offline',
  NotAvailableWaitForContact = 'not-available-wait-for-contact',
  NotAvailable = 'not-available',
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

  if (
    state === ChatState.NotAvailableWaitForContact ||
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
    fontSize: dimensionInRem(-1),
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
  chatPromptDescription: css({
    transition: 'all 0.5s ease-in-out',
    display: 'block',
    overflow: 'hidden',
  }),
  chatInput: css({ flex: '1 0 auto', marginRight: 10 }),
  systemMessageAction: css({
    paddingTop: dimensionInRem(0),
    paddingBottom: dimensionInRem(0),
  }),
});

const Index = () => {
  const [status, setStatus] = useState<ChatState>(
    ChatState.WaitForFirstConnectingMessage
  );
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

  const startChannel = () => {
    const newChannel = openChannel((states) => {
      switch (states.current) {
        case 'initialized':
        case 'connecting':
          if (states.previous === 'connecting') {
            return;
          }

          setChannel(null);

          if (states.previous === 'connected') {
            if (status === ChatState.Connecting) {
              return;
            }

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
            setStatus(ChatState.Reconnecting);
            break;
          }
          setStatus(ChatState.Connecting);
          break;

        case 'connected':
          setChannel(newChannel);
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
                text: 'Index unavailable',
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
  };

  const restart = () => {
    setLastUserMessage(null);
    setChatHistory([]);
    setChannel(null);
    setStatus(ChatState.WaitForFirstConnectingMessage);
    setUserInput('');
  };

  const sendMessage = () => {
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

    switch (status) {
      case ChatState.Connected:
        setLastUserMessage(message);
        setChatHistory((previousMessages) => {
          return [...previousMessages, message];
        });

        channel?.trigger(
          FrontEvent.sendMessage,
          JSON.stringify({
            id: message.id,
            timestamp: message.timestamp,
            payload: message.text,
          } as FrontSendMessageEventBody)
        );
        break;
      case ChatState.NotAvailableWaitForContact:
        setStatus(ChatState.NotAvailable);
        setLastUserMessage(message);

        fetch('/api/closeFrontChat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: channel?.name ?? '',
            contactDetails: lastUserMessage?.text ?? 'none.',
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
          })
          .catch((err) => {
            setStatus(ChatState.Failed);
            console.error(err);
          });
        break;
      case ChatState.WaitForFirstConnectingMessage:
        setStatus(ChatState.Connecting);
        setChatHistory((previousMessages) => {
          return [
            ...previousMessages,
            {
              type: MessageType.system,
              id: uuidv4(),
              timestamp: Date.now(),
              text: 'Connecting...',
            } as SystemMessage,
            message,
          ];
        });

        setTimeoutId(
          window.setTimeout(() => {
            setStatus(ChatState.NotAvailableWaitForContact);
            setChatHistory((previousMessages) => {
              return [
                ...previousMessages,
                {
                  type: MessageType.system,
                  id: uuidv4(),
                  timestamp: Date.now(),
                  text: 'I am not available now 🤔',
                } as SystemMessage,
                {
                  type: MessageType.system,
                  id: uuidv4(),
                  timestamp: Date.now(),
                  text: (
                    <>
                      <div>
                        I&apos;ll read it later for sure. Leave your email or
                        mobile and I&apos;ll text you back 😉
                      </div>
                      <div css={classes.systemMessageAction}>
                        <a
                          onKeyPress={() => {
                            if (shouldDisableInterface(status, lastUserMessage))
                              return;

                            restart();
                          }}
                          onClick={() => {
                            if (shouldDisableInterface(status, lastUserMessage))
                              return;
                            restart();
                          }}
                          tabIndex={0}
                          role="button"
                          aria-disabled={shouldDisableInterface(
                            status,
                            lastUserMessage
                          )}
                        >
                          <Button
                            caption="Restart the chat"
                            disabled={shouldDisableInterface(
                              status,
                              lastUserMessage
                            )}
                          />
                        </a>
                      </div>
                    </>
                  ),
                } as SystemMessage,
              ];
            });
          }, 7000)
        );
        startChannel();
        break;

      default:
        throw new Error(
          `The message cannot be sent when the chat status is ${status}`
        );
        break;
    }
  };

  useEffect(() => {
    channel?.unbind_all();

    // waiting for the first message ack to fully open up the chat
    if (status === ChatState.ConnectedOnFrontSide) {
      channel?.bind(BackEvent.frontMessageAck, (payload: FrontMessageAck) => {
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

        if (lastUserMessage?.id === payload.ackMessageId) {
          lastUserMessage.ack = true;
        }

        if (status === ChatState.ConnectedOnFrontSide) {
          if (timeoutId) {
            window.clearTimeout(timeoutId);
          }
          setStatus(ChatState.Connected);
          setChatHistory((previousMessages) => {
            return [
              ...previousMessages,
              {
                id: uuidv4(),
                timestamp: Date.now(),
                type: MessageType.system,
                text: 'Connected.',
              } as SystemMessage,
            ];
          });
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
          message: { id: lastUserMessage?.id, text: lastUserMessage?.text },
        }),
      }).catch((err) => {
        setStatus(ChatState.Failed);
        console.error(err);
      });
    }

    //
    // normal flow events
    //
    channel?.bind(ApiEvent.internalError, () => {
      setChatHistory((previousHistory) => {
        setStatus(ChatState.Failed);
        const failedFeedback: Message = {
          type: MessageType.system,
          id: uuidv4(),
          timestamp: Date.now(),
          text: 'Something went wrong: disconnected.',
        };
        return [...previousHistory, failedFeedback];
      });
    });

    channel?.bind(BackEvent.sendMessage, (message: BackMessage) => {
      setChatHistory((previousHistory) => {
        return [...previousHistory, message];
      });
    });

    // connected
    channel?.bind(BackEvent.frontMessageAck, (payload: FrontMessageAck) => {
      setChatHistory((previousHistory) => {
        const ackedMessageIndex = previousHistory.findIndex(
          (message) => message.id === payload.ackMessageId
        );
        const newHistory = [...previousHistory];
        const messageToAck = newHistory[ackedMessageIndex];

        if (isAFrontMessage(messageToAck)) {
          messageToAck.ack = true;
        }

        return newHistory;
      });

      if (lastUserMessage?.id === payload.ackMessageId) {
        lastUserMessage.ack = true;
      }
    });
  }, [status, userInput]);
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
            status == ChatState.WaitForFirstConnectingMessage
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
                  {(frontMessage.ack && '✔️️') || '⏳'}{' '}
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
          disabled={shouldDisableInterface(status, lastUserMessage)}
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
            if (shouldDisableInterface(status, lastUserMessage)) return;

            sendMessage();
          }}
          onClick={() => {
            if (shouldDisableInterface(status, lastUserMessage)) return;
            sendMessage();
          }}
          tabIndex={0}
          role="button"
          aria-disabled={shouldDisableInterface(status, lastUserMessage)}
        >
          <Button
            caption="Send"
            disabled={shouldDisableInterface(status, lastUserMessage)}
          />
        </a>
      </div>
    </>
  );
};

export default Index;
