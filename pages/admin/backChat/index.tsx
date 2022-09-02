import {
  Channels,
  ChatSessionOperation,
  ChatSessionState,
  FrontEvent,
  isABackMessage,
  isAFrontMessage,
  MessageType,
  PRIVATE_BACK_SESSION_NAME,
} from '../../../components/chat/model';

import AdminLoadingSkeleton from '../../../components/AdminLoadingSkeleton';

import colors from '../../../assets/styles/colors';

import { dimensionInRem } from '../../../assets/styles/dimensions';

import Button from '../../../components/Button';

import {
  ACK_TIMEOUT_IN_MS_FOR_BACKEND,
  ApiEvent,
  BackEvent,
} from '../../../components/chat/channelModel';

import { v4 as uuidv4 } from 'uuid';

import { useEffect, useMemo, useState } from 'react';

import Pusher from 'pusher-js';

import axios from 'axios';

import useSWR from 'swr';

import { css, Global } from '@emotion/react';

import type {
  BackAckForFrontMessage,
  BackEventSendMessage,
  FrontSendMessageEventBody,
  OpenEndBackChannelChatSessionBody,
} from '../../../components/chat/channelModel';
import type {
  BackMessage,
  ChatSession,
  Message,
} from '../../../components/chat/model';

import type {
  AckFirstMessageRequestBody,
  CloseChatSessionFromBackRequestBody,
} from '../../../components/chat/apiModel';

import type { AuthConfig } from '../../../typings/next';
import type { NextPage } from 'next';

type Chat = ChatSession & {
  messages: Array<Message>;
};

enum BoardState {
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Offline = 'offline',
  Failed = 'failed',
}

const getClasses = () => ({
  topBar: css({
    position: 'fixed',
    backgroundColor: colors.senape,
    width: '100%',
    height: dimensionInRem(3),
    top: 0,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: `0 ${dimensionInRem(0)}`,
  }),
  globalStyles: css({
    body: {
      backgroundColor: colors.sugarPaperBlue,
      fontFamily: 'Alegreya-Sans',
      fontSize: dimensionInRem(0),
      paddingTop: '70px',
    },
  }),
  sessionsBoard: css({
    display: 'flex',
    flexDirection: 'row-reverse',
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  }),
  chatSession: css({
    borderRadius: '5px',
    border: `2px solid ${colors.darkerGrey}`,
    boxSizing: 'border-box',
    width: 400,
    height: 500,
    marginBottom: 15,
    display: 'flex',
    padding: 0,
    flexDirection: 'column',
  }),
  chatSessionFocused: css({
    borderWidth: `4px`,
    borderColor: colors.almostBlack,
  }),
  message: css({
    flex: '0 0 auto',
    marginBottom: 5,
    textAlign: 'justify',
    textjustify: 'inter-word',
    hyphens: 'auto',
  }),
  frontMessage: css({
    textAlign: 'left',
  }),
  backMessage: css({
    textAlign: 'right',
  }),
  backMessageContent: css({
    backgroundColor: colors.senape,
    borderRadius: '18px 18px 3px 18px',
  }),
  messageContent: css({
    display: 'inline-block',
    maxWidth: 270,
    padding: 5,
  }),
  frontMessageContent: css({
    backgroundColor: colors.pastelViolet,
    borderRadius: '18px 18px 18px 3px',
  }),
  messageMeta: css({
    fontFamily: 'Alegreya-Sans',
    fontSize: dimensionInRem(-1),
    textAlign: 'right',
    color: colors.darkerGrey,
    paddingTop: '5px',
  }),
});

const shouldShowCloseButton = (chatSessionState: ChatSessionState) => {
  if (
    chatSessionState === ChatSessionState.closedByFront ||
    chatSessionState === ChatSessionState.closedByBack ||
    chatSessionState === ChatSessionState.closedForError ||
    chatSessionState === ChatSessionState.channelBackEndDangling ||
    chatSessionState === ChatSessionState.opened
  ) {
    return true;
  }

  return false;
};

const shouldDisableUserInput = (chatSessionState: ChatSessionState) => {
  if (chatSessionState !== ChatSessionState.opened) {
    return true;
  }

  return false;
};

type Property = {
  chatSessionHint: Chat;
  channels: Pusher;
  onChatClosed: (chatSessionId: string) => void;
};

const isChatSessionClosed = (chatSessionState: ChatSessionState) =>
  chatSessionState === ChatSessionState.closedByBack ||
  chatSessionState === ChatSessionState.closedByFront ||
  chatSessionState === ChatSessionState.closedForError;

const BackChatSession = ({
  chatSessionHint,
  channels,
  onChatClosed,
}: Property) => {
  const [backInput, setBackInput] = useState<string>('');
  const [chatSession, setChatSession] = useState<ChatSession>(chatSessionHint);
  const [firstAckSent, setFirstAckSent] = useState<boolean>(false);
  const [onFocus, setOnFocus] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<Message>>([]);

  useEffect(() => {
    setChatSession((currentChatSession) => {
      if (currentChatSession.state !== chatSessionHint.state) {
        // check what's the most fresh state. This way, we avoid a watermark and it's even safer
        if (
          isChatSessionClosed(chatSessionHint.state) &&
          !isChatSessionClosed(currentChatSession.state)
        ) {
          return chatSessionHint;
        }

        return currentChatSession;
      }
      return currentChatSession;
    });
  }, [chatSessionHint]);

  useEffect(
    function handleMessagesIfClosedByFront() {
      if (chatSession.state === ChatSessionState.closedByFront) {
        setMessages((currentMessages) => {
          if (currentMessages[0]?.id !== chatSession.firstMessage.id) {
            return [
              { ...chatSession.firstMessage, type: MessageType.front },
              ...currentMessages,
            ];
          }

          return currentMessages;
        });
      }
    },
    [chatSession.state]
  );

  useEffect(
    function checkDanglingState() {
      const now = Date.now();
      if (chatSession.state !== ChatSessionState.channelBackEndOpening) {
        return;
      }

      if (now - chatSession.openedAt >= ACK_TIMEOUT_IN_MS_FOR_BACKEND) {
        setChatSession({
          ...chatSession,
          state: ChatSessionState.channelBackEndDangling,
        });
        return;
      }

      const timeoutID = window.setTimeout(() => {
        setChatSession({
          ...chatSession,
          state: ChatSessionState.channelBackEndDangling,
        });
      }, now - chatSession.openedAt);

      return () => {
        window.clearTimeout(timeoutID);
      };
    },
    [chatSession]
  );

  useEffect(() => {
    if (chatSession.state !== ChatSessionState.channelBackEndOpening) {
      return;
    }

    if (firstAckSent) {
      return;
    }

    setFirstAckSent(true);

    const newChatChannel = channels.subscribe(chatSession.sessionId);
    newChatChannel.bind(
      FrontEvent.sendMessage,
      (payload: FrontSendMessageEventBody) => {
        const messageAckBody: BackAckForFrontMessage = {
          messageId: payload.id,
        };
        newChatChannel.trigger(
          BackEvent.frontMessageAck,
          JSON.stringify(messageAckBody)
        );
        setMessages((previousMessages) => {
          return [
            ...previousMessages,
            {
              id: payload.id,
              timestamp: payload.timestamp,
              text: payload.payload,
              type: MessageType.front,
            },
          ];
        });
      }
    );

    axios
      .post<null, null, AckFirstMessageRequestBody>(
        `/api/chatSessions/${chatSession.sessionId}`,
        {
          operation: ChatSessionOperation.ackFirstMessage,
          messageId: chatSession.firstMessage.id,
        }
      )
      .then(() => {
        setChatSession((currentChatSession) => {
          const newChatSession = { ...currentChatSession };
          newChatSession.state = ChatSessionState.opened;

          return newChatSession;
        });
        setMessages((currentMessages) => {
          return [
            ...currentMessages,
            { ...chatSession.firstMessage, type: MessageType.front },
          ];
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }, [channels, chatSession, firstAckSent]);

  const stateDescription = useMemo<string>(() => {
    switch (chatSession.state) {
      case ChatSessionState.closedByFront:
        return 'Closed by front';
        break;
      case ChatSessionState.channelBackEndOpening:
        return 'Connecting with a new chat request...';
        break;
      case ChatSessionState.channelBackEndDangling:
        return 'Dangling session';
        break;
      case ChatSessionState.opened:
        return 'Opened';
        break;
      default:
        return chatSession.state;
        break;
    }
  }, [chatSession]);

  const classes = getClasses();
  const handleChangeBackInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setBackInput(event.target.value);
  };
  const sendMessage = () => {
    const messageToSend: BackEventSendMessage = {
      id: uuidv4(),
      timestamp: Date.now(),
      text: backInput,
    };

    setBackInput('');

    const channel = channels?.subscribe(chatSession.sessionId);
    if (channel.subscribed) {
      const sent = channel.trigger(
        BackEvent.sendMessage,
        JSON.stringify(messageToSend as BackEventSendMessage)
      );

      if (sent) {
        setMessages((currentMessages) => {
          return [
            ...currentMessages,
            { ...messageToSend, type: MessageType.back } as BackMessage,
          ];
        });
      }
    } else {
      channel.bind('pusher:subscription_succeeded', () => {
        channel.trigger(
          BackEvent.sendMessage,
          JSON.stringify(messageToSend as BackEventSendMessage)
        );
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const handleCloseChatSession = () => {
    axios
      .post<null, null, CloseChatSessionFromBackRequestBody>(
        `/api/chatSessions/${chatSession.sessionId}`,
        { operation: ChatSessionOperation.closeFromBack }
      )
      .catch(() => {
        // todo manage this
      });

    onChatClosed(chatSession.sessionId);
  };

  return (
    <article
      css={[classes.chatSession, onFocus ? classes.chatSessionFocused : null]}
    >
      <div
        css={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <div
          css={{
            fontSize: dimensionInRem(-1),
            textAlign: 'center',
            flex: '1 0 auto',
          }}
        >
          {stateDescription}
          <br />
          {new Date(chatSessionHint.openedAt).toLocaleString()}
        </div>
        {shouldShowCloseButton(chatSessionHint.state) && (
          <div>
            <a
              onKeyPress={() => {
                // if (shouldDisableInterface(chatStatus, lastUserMessage)) return;
                // sendMessage();
              }}
              onClick={handleCloseChatSession}
              tabIndex={0}
              role="button"
              aria-disabled={false}
            >
              <Button caption="X" disabled={false} />
            </a>
          </div>
        )}
      </div>
      <div
        css={{
          padding: dimensionInRem(0),
          flex: '1 1 auto',
          overflow: 'scroll',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((message) => {
          if (isAFrontMessage(message)) {
            return (
              <div
                key={message.id}
                css={[classes.message, classes.frontMessage]}
              >
                <div
                  css={[classes.messageContent, classes.frontMessageContent]}
                >
                  {message.text}
                </div>
                <div css={classes.messageMeta}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          }

          if (isABackMessage(message)) {
            return (
              <div
                key={message.id}
                css={[classes.message, classes.backMessage]}
              >
                <div css={[classes.messageContent, classes.backMessageContent]}>
                  {message.text}
                </div>
                <div css={classes.messageMeta}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          }
        })}
        {chatSessionHint.state === ChatSessionState.closedByFront &&
          chatSessionHint?.frontClosingMessage && (
            <div
              key={chatSessionHint.frontClosingMessage.id}
              css={[classes.message, classes.frontMessage]}
            >
              <div style={{ display: 'inline-block' }}>
                <div
                  css={[classes.messageContent, classes.frontMessageContent]}
                >
                  {chatSessionHint.frontClosingMessage.text}
                </div>
                <div css={classes.messageMeta}>
                  {new Date(
                    chatSessionHint.frontClosingMessage.timestamp
                  ).toLocaleTimeString([], {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          )}
      </div>
      <div css={{ flex: '0 0 auto' }}>
        <input
          css={{ width: '100%', boxSizing: 'border-box' }}
          type="text"
          onChange={handleChangeBackInput}
          value={backInput}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            setOnFocus(true);
          }}
          onBlur={() => {
            setOnFocus(false);
          }}
          disabled={shouldDisableUserInput(chatSessionHint.state)}
        />
      </div>
    </article>
  );
};

// Initialize Channels client

type MyPage = NextPage & { auth?: AuthConfig };

const chatSessionsFetcher = (url: string) =>
  axios.get(url).then((res) => res.data);

const Chatboard: MyPage = () => {
  const [connectionChannels, setConnectionConnectionChannels] =
    useState<null | Pusher>(null);
  const [boardState, setBoardState] = useState<BoardState>(
    BoardState.Connecting
  );

  const [chatsHints, setChatsHints] = useState<Map<string, Chat>>(new Map());
  // todo , error: errorStoredSessionChats
  const { data: storedSessionChats } = useSWR<Array<ChatSession>>(
    '/api/chatSessions',
    chatSessionsFetcher
  );

  useEffect(
    function syncChatsWithBackend() {
      if (storedSessionChats === undefined) {
        return;
      }

      setChatsHints((chatsToUpdate) => {
        let updated = chatsToUpdate.size === 0;
        const updatedChatsToReturn = new Map<string, Chat>();
        for (const storedSessionChat of storedSessionChats) {
          let chatToUpdate = chatsToUpdate.get(storedSessionChat.sessionId) ?? {
            ...storedSessionChat,
            messages: [],
          };

          if (storedSessionChat.state !== chatToUpdate.state) {
            chatToUpdate = { ...chatToUpdate, ...storedSessionChat };
            updated = true;
          }

          updatedChatsToReturn.set(chatToUpdate.sessionId, chatToUpdate);
        }

        return updated ? updatedChatsToReturn : chatsToUpdate;
      });
    },
    [storedSessionChats]
  );

  useEffect(() => {
    const connectionChannel = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER_REGION,
        authEndpoint: `/api/chatSessions/${PRIVATE_BACK_SESSION_NAME}/channel`,
      }
    );
    setConnectionConnectionChannels(connectionChannel);

    connectionChannel.connection.bind(
      'state_change',
      function mapConnectionChannelStateToBoardState(state: {
        current: string;
        previous: string;
      }) {
        switch (state.current) {
          case 'unavailable':
          case 'connecting':
            if (
              state.previous === 'connected' ||
              state.previous === 'connecting'
            ) {
              setBoardState(BoardState.Reconnecting);
              break;
            }

            setBoardState(BoardState.Connecting);
            break;
          case 'connected':
            setBoardState(BoardState.Connected);
            break;
          case 'disconnected':
            setBoardState(BoardState.Offline);
            break;
          default:
            setBoardState(BoardState.Failed);
            break;
        }
      }
    );
  }, []);

  const classes = getClasses();

  useEffect(
    function listenToNewChatRequests() {
      if (!connectionChannels) {
        return;
      }

      // Subscribe to the appropriate channel
      const channel = connectionChannels.subscribe(
        Channels.PrivateSupportChannel
      );

      // Bind a callback function to an event within the subscribed channel
      channel.bind(
        ApiEvent.openEndBackChannelChatSession,
        (initChatData: OpenEndBackChannelChatSessionBody) => {
          setChatsHints((previousChats) => {
            if (previousChats.has(initChatData.sessionId)) {
              return previousChats;
            }
            const newChats = new Map<string, Chat>(previousChats);
            newChats.set(initChatData.sessionId, {
              sessionId: initChatData.sessionId,
              state: ChatSessionState.channelBackEndOpening,
              openedAt: initChatData.firstMessage.timestamp,
              firstMessage: initChatData.firstMessage,
              messages: [],
            });
            return newChats;
          });
        }
      );
    },
    [connectionChannels]
  );

  const handleChatClosed = (chatSessionId: string) => {
    setChatsHints((prevState) => {
      const newState = new Map(prevState);
      newState.delete(chatSessionId);

      return newState;
    });
  };

  if (
    (boardState !== BoardState.Connected && chatsHints.size === 0) ||
    connectionChannels === null
  ) {
    return <div>Loading chats...</div>;
  }

  return (
    <>
      <Global styles={[classes.globalStyles]} />
      <aside css={classes.topBar}>
        <div>Total chats: {chatsHints.size}</div>
        <div css={css({ marginLeft: '30px' })}>{boardState}</div>
      </aside>
      <main css={classes.sessionsBoard}>
        {[...chatsHints]
          .sort((chatA: [string, Chat], chatB: [string, Chat]) => {
            return chatB[1].openedAt - chatA[1].openedAt;
          })
          .map(([key, chatSessionHint]) => (
            <BackChatSession
              key={key}
              chatSessionHint={chatSessionHint}
              channels={connectionChannels}
              onChatClosed={handleChatClosed}
            />
          ))}
      </main>
    </>
  );
};

Chatboard.auth = {
  scope: 'front/admin:access',
  loading: <AdminLoadingSkeleton />,
  unauthorizedUrl: '/admin/login-with-different-user', // redirect to this url
};

export default Chatboard;
