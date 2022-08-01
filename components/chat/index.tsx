import {
  ChatSessionOperation,
  FrontEvent,
  isAFrontMessage,
  MessageType,
} from './model';

import { ACK_TIMEOUT_IN_MS, ApiEvent, BackEvent } from './channelModel';

import Button from '../button';

import colors from '../../assets/styles/colors';

import { dimensionInRem } from '../../assets/styles/dimensions';

import useDimensions from '../../utils/useDimensions';

import * as ga from '../../lib/google-analytics';

import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Pusher from 'pusher-js';

import { css } from '@emotion/react';

import axios from 'axios';

import type { Channel } from 'pusher-js';
import type {
  BackAckForFrontMessage,
  BackEventSendMessage,
  FrontSendMessageEventBody,
} from './channelModel';
import type {
  BackMessage,
  FrontMessage,
  Message,
  SystemMessage,
} from './model';

import type {
  ChatSessionRequestBody,
  CloseSessionFromFrontRequestBody,
  OpenBackEndRequestBody,
} from './apiModel';

enum ChatState {
  WaitingForFirstMessageToBoot = 'waiting-first-message-to-boot',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Offline = 'offline',
  NotAvailableWaitForLastMessage = 'not-available-wait-for-last-message',
  Terminated = 'terminated',
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

const shouldDisableInterface = (
  state: ChatState,
  lastSentMessage: FrontMessage | null
): boolean => {
  if (
    lastSentMessage === null &&
    state === ChatState.WaitingForFirstMessageToBoot
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
  channelId: string,
  connectionStateListener: (states: ConnectionStateChange) => void
): Channel => {
  const connection = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER_REGION,
    authEndpoint: `/api/chatSessions/${channelId}/channel`,
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
    flexWrap: 'wrap',
    marginRight: 20,
    boxSizing: 'border-box',
  }),
  chatPromptDescription: css({
    transition: 'all 0.5s ease-in-out',
    display: 'block',
    overflow: 'hidden',
  }),
  chatInput: css({
    width: 150,
    flex: '1 0 100px',
    marginRight: 10,
    fontFamily: 'Alegreya-Sans',
    fontSize: dimensionInRem(-1),
  }),
  messageReceivedIcon: css({
    height: dimensionInRem(-1),
    verticalAlign: 'baseline',
  }),
  sendButton: css({ flex: '0 1 auto' }),
  messageSendingIcon: css({
    width: dimensionInRem(2),
    verticalAlign: 'sub',
  }),
});

const sendFirstMessageAndWaitForAck = (
  sessionId: string,
  channel: Channel,
  firstUserMessage: FrontMessage,
  callbackMessageSent: () => void
) => {
  return new Promise((res, rej) => {
    if (sessionId !== channel.name) {
      rej();
      return;
    }

    channel.bind(
      BackEvent.frontMessageAck,
      (payload: BackAckForFrontMessage) => {
        channel?.unbind(BackEvent.frontMessageAck);
        if (firstUserMessage.id === payload.messageId) {
          firstUserMessage.ack = true;
          res(payload);
          return;
        } else {
          rej(payload);
          return;
        }
      }
    );

    axios
      .post<null, null, OpenBackEndRequestBody>(
        `/api/chatSessions/${sessionId}`,
        {
          operation: ChatSessionOperation.openBackEnd,
          firstMessage: firstUserMessage,
        }
      )
      .then(() => {
        callbackMessageSent();
      })
      .catch((err) => {
        channel?.unbind(BackEvent.frontMessageAck);
        console.error(err);
        rej(err);
      });
  });
};

const handleAckTimeoutNotAvailable = (
  messageToWaitForAck: FrontMessage,
  channel: Channel,
  onTimeoutTriggered: (timeoutId: number) => void,
  onTimeoutAck: () => void
) => {
  const ackCallback = (payload: BackAckForFrontMessage) => {
    if (payload.messageId === messageToWaitForAck.id) {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      channel?.unbind(BackEvent.frontMessageAck, ackCallback);
    }
  };

  channel?.bind(BackEvent.frontMessageAck, ackCallback);

  const timeoutId = window.setTimeout(() => {
    channel?.pusher.connection.unbind_all();
    channel?.unbind_all();
    onTimeoutAck();
  }, ACK_TIMEOUT_IN_MS);
  onTimeoutTriggered(timeoutId);
};

type FirstFrontMessage = {
  status: 'waiting-to-be-sent' | 'to-be-sent' | 'sending' | 'sent' | 'acked';
  message: FrontMessage;
};

const Index = () => {
  const [chatStatus, setChatStatus] = useState<ChatState>(
    ChatState.WaitingForFirstMessageToBoot
  );
  const [firstMessage, setFirstMessage] = useState<FirstFrontMessage | null>(
    null
  );
  const [lastUserMessage, setLastUserMessage] = useState<FrontMessage | null>(
    null
  );
  const [userInput, setUserInput] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [restartIntention, setRestartIntention] = useState<boolean>(false);

  const [connectionChannelStatus, setConnectionChannelStatus] =
    useState<ConnectionStateChange | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [chatHistory, setChatHistory] = useState<
    Array<Message | SystemMessage>
  >([]);
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

  useEffect(() => {
    if (
      chatStatus === ChatState.Failed ||
      chatStatus === ChatState.Terminated ||
      chatStatus === ChatState.Offline
    ) {
      channel?.unbind_all();
      channel?.pusher.connection.unbind_all();
    }
  }, [chatStatus, channel]);

  useEffect(() => {
    if (!restartIntention) {
      return;
    }

    setRestartIntention(false);
    channel?.disconnect();
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setLastUserMessage(null);
    setChatHistory([]);

    setChannel(null);
    setConnectionChannelStatus(null);
    setFirstMessage(null);
    setSessionId(null);

    setChatStatus(ChatState.WaitingForFirstMessageToBoot);
    setUserInput('');
  }, [channel, timeoutId, restartIntention]);

  useEffect(
    function handleConnectionChannelStatus() {
      switch (connectionChannelStatus?.current) {
        case undefined:
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
          if (firstMessage?.status === 'waiting-to-be-sent') {
            setFirstMessage({
              status: 'to-be-sent',
              message: firstMessage.message,
            });
            break;
          }
          if (firstMessage?.status === 'acked') {
            setChatStatus(ChatState.Connected);
            break;
          }
          break;

        case 'disconnected':
          channel?.unbind_all();
          channel?.pusher.connection.unbind_all();
          setChatStatus(ChatState.Terminated);
          break;
        case 'unavailable':
          handleChannelStateToReconnectingChatStatus();
          break;

        default:
          setChatStatus(ChatState.Failed);
          break;
      }
    },
    [channel, connectionChannelStatus, firstMessage]
  );

  useEffect(
    function handleBootConnectionWithBack() {
      if (chatStatus !== ChatState.Connecting) {
        return;
      }

      if (channel === null || firstMessage === null || sessionId === null) {
        return;
      }

      if (firstMessage.status === 'to-be-sent') {
        setFirstMessage({ status: 'sent', message: firstMessage.message });
        handleAckTimeoutNotAvailable(
          firstMessage.message,
          channel,
          setTimeoutId,
          () => {
            setFirstMessage((oldFirstMessage) => {
              if (!oldFirstMessage) {
                return null;
              }

              return {
                ...oldFirstMessage,
                message: { ...oldFirstMessage.message, ack: true },
              };
            });

            // todo DRY!
            setChatHistory((previousHistory) => {
              const ackedMessageIndex = previousHistory.findIndex(
                (message) => message.id === firstMessage.message.id
              );
              const newHistory = [...previousHistory];
              const frontMessageToAck = newHistory[ackedMessageIndex];

              if (isAFrontMessage(frontMessageToAck)) {
                frontMessageToAck.ack = true;
              }
              return newHistory;
            });
            setTimeoutId(null);
            setChatStatus((prevState) => {
              return prevState !== ChatState.Failed
                ? ChatState.NotAvailableWaitForLastMessage
                : ChatState.Failed;
            });
          }
        );
        sendFirstMessageAndWaitForAck(
          sessionId,
          channel,
          firstMessage.message,
          () => {
            setFirstMessage({ status: 'sent', message: firstMessage.message });
          }
        )
          .then(() => {
            setFirstMessage({ status: 'acked', message: firstMessage.message });
            setChatHistory((previousHistory) => {
              const ackedMessageIndex = previousHistory.findIndex(
                (message) => message.id === firstMessage.message.id
              );
              const newHistory = [...previousHistory];
              const frontMessageToAck = newHistory[ackedMessageIndex];

              if (isAFrontMessage(frontMessageToAck)) {
                frontMessageToAck.ack = true;
              }
              return newHistory;
            });
          })
          .catch(() => {
            setChatStatus(ChatState.Failed);
          });
        return;
      }

      if (firstMessage.status !== 'acked') {
        return;
      }

      channel.unbind(BackEvent.frontMessageAck);
      channel.bind(
        BackEvent.frontMessageAck,
        (payload: BackAckForFrontMessage) => {
          setChatHistory((previousHistory) => {
            const ackedMessageIndex = previousHistory.findIndex(
              (message) => message.id === payload.messageId
            );
            const newHistory = [...previousHistory];
            const frontMessageToAck = newHistory[ackedMessageIndex];

            if (isAFrontMessage(frontMessageToAck)) {
              frontMessageToAck.ack = true;
            }

            return newHistory;
          });

          setLastUserMessage((previousLastUserMessage) => {
            if (previousLastUserMessage?.id === payload.messageId) {
              previousLastUserMessage.ack = true;
            }

            return previousLastUserMessage;
          });
        }
      );

      channel.unbind(BackEvent.sendMessage);
      // todo ack to be sent
      channel?.bind(BackEvent.sendMessage, (message: BackEventSendMessage) => {
        const messageReceived: BackMessage = {
          ...message,
          type: MessageType.back,
        };
        setChatHistory((previousHistory) => {
          return [...previousHistory, messageReceived];
        });
      });

      channel?.unbind(ApiEvent.closedChatSession);
      channel?.bind(ApiEvent.closedChatSession, () => {
        channel?.unbind_all();
        channel?.pusher.connection.unbind_all();
        setChatHistory((previousMessages) => {
          return [
            ...previousMessages,
            {
              type: MessageType.system,
              id: uuidv4(),
              timestamp: Date.now(),
              text: 'Chat closed by Matteo',
            } as SystemMessage,
          ];
        });
        setChatStatus(ChatState.Offline);
      });

      channel.unbind(ApiEvent.internalError);
      channel?.bind(ApiEvent.internalError, () => {
        setChatStatus(ChatState.Failed);
      });
    },
    [sessionId, channel, chatStatus, firstMessage]
  );

  useEffect(
    function handleSystemChatMessages() {
      switch (chatStatus) {
        case ChatState.Connecting:
          setChatHistory((previousMessages) => {
            if (
              previousMessages[previousMessages.length - 1]?.type ===
                MessageType.system &&
              previousMessages[previousMessages.length - 1].text ===
                'Connecting'
            ) {
              return previousMessages;
            }

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
              {
                type: MessageType.system,
                id: uuidv4(),
                timestamp: Date.now(),
                text: (
                  <>
                    <a
                      onKeyDown={() => {
                        setRestartIntention(true);
                      }}
                      onClick={() => {
                        setRestartIntention(true);
                      }}
                      tabIndex={0}
                      role="button"
                    >
                      <Button caption="Restart the chat" />
                    </a>
                  </>
                ),
              },
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
                      onKeyDown={() => {
                        setRestartIntention(true);
                      }}
                      onClick={() => {
                        setRestartIntention(true);
                      }}
                      tabIndex={0}
                      role="button"
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
      case ChatState.WaitingForFirstMessageToBoot:
        setChatHistory((previousMessages) => {
          return [...previousMessages, message];
        });
        startSession(message);
        break;
      case ChatState.Connected:
        if (!channel) {
          setChatStatus(ChatState.Failed);
          return;
        }

        setChatHistory((previousMessages) => {
          return [...previousMessages, message];
        });
        handleAckTimeoutNotAvailable(message, channel, setTimeoutId, () => {
          setTimeoutId(null);
          setChatStatus((prevState) => {
            return prevState !== ChatState.Failed
              ? ChatState.NotAvailableWaitForLastMessage
              : ChatState.Failed;
          });
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
      case ChatState.NotAvailableWaitForLastMessage:
        axios
          .post<null, null, CloseSessionFromFrontRequestBody>(
            `/api/chatSessions/${channel?.name ?? ''}`,
            {
              operation: ChatSessionOperation.closeFromFront,
              message: {
                id: message.id,
                timestamp: message.timestamp,
                text: message.text,
              },
            }
          )
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
      default:
        setChatStatus(ChatState.Failed);
        throw new Error(
          `The message cannot be sent when the chat status is ${chatStatus}`
        );
        break;
    }
  };

  const startSession = (firstMessage: FrontMessage) => {
    setChatStatus(ChatState.Connecting);
    const sessionId = `private-${uuidv4()}`;

    if (firstMessage === null) {
      setChatStatus(ChatState.Failed);
      return;
    }

    setFirstMessage({
      status: 'waiting-to-be-sent',
      message: firstMessage,
    });
    setSessionId(sessionId);

    axios
      .post<null, null, ChatSessionRequestBody>('/api/chatSessions', {
        sessionId: sessionId,
        openedAt: Date.now(),
      })
      .then(() => {
        const channel = openChannel(sessionId, setConnectionChannelStatus);
        setChannel(channel);
      })
      .catch(() => {
        setChatStatus(ChatState.Failed);
      });
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
            chatStatus == ChatState.WaitingForFirstMessageToBoot
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
          if (isAFrontMessage(message)) {
            return (
              <div
                key={message.id}
                css={[classes.message, classes.userMessage]}
              >
                <div css={[classes.messageContent, classes.userMessageContent]}>
                  {message.text}
                </div>
                <div css={classes.messageMeta}>
                  {(message.ack && (
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
                  {new Date(message.timestamp).toLocaleTimeString([], {
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
          css={classes.sendButton}
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
