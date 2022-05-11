import {
  ApiEvent,
  BackEvent,
  Channels,
  FrontEvent,
  MessageType,
} from '../../../components/chat/model';

import AdminLoadingSkeleton from '../../../components/AdminLoadingSkeleton';

import { useEffect, useState } from 'react';

import Pusher from 'pusher-js';

import { v4 as uuidv4 } from 'uuid';

import type { AuthConfig } from '../../../typings/next';

import type {
  BackMessage,
  ChatSessionRequest,
} from '../../../components/chat/model';
import type { NextPage } from 'next';

type Chat = {
  id: string;
  openedAt: number;
  messages: Array<string>;
};

type Property = { chat: Chat; channels: Pusher };
const BackChat = ({ chat, channels }: Property) => {
  const [backInput, setBackInput] = useState<string>('');

  const handleChangeBackInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setBackInput(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const sendMessage = () => {
    const message: BackMessage = {
      type: MessageType.back,
      id: uuidv4(),
      timestamp: Date.now(),
      text: backInput,
    };

    setBackInput('');

    const channel = channels.subscribe(chat.id);
    if (channel.subscribed) {
      channel.trigger('client-back-send-message', JSON.stringify(message));
    } else {
      channel.bind('pusher:subscription_succeeded', () => {
        channel.trigger('client-back-send-message', JSON.stringify(message));
      });
    }
  };

  return (
    <div
      style={{
        border: '1px solid blue',
        marginRight: 15,
        marginBottom: 15,
        flex: '0 0 300px',
      }}
    >
      {chat.messages.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
      <br />
      <input
        type="text"
        onChange={handleChangeBackInput}
        value={backInput}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

// Initialize Channels client

type MyPage = NextPage & { auth?: AuthConfig };

const Chatboard: MyPage = () => {
  const [chats, setChats] = useState<Array<Chat>>([]);
  const [channels, setChannels] = useState<null | Pusher>(null);

  useEffect(() => {
    const channels = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER_REGION,
      authEndpoint: '/api/auth/backChat',
    });
    setChannels(channels);
  }, []);

  useEffect(() => {
    if (!channels) {
      return;
    }

    // Subscribe to the appropriate channel
    const channel = channels.subscribe(Channels.PrivateSupportChannel);

    // Bind a callback function to an event within the subscribed channel
    channel.bind(ApiEvent.initChatReq, (initChatData: ChatSessionRequest) => {
      const newChatChannel = channels.subscribe(initChatData.sessionId);
      newChatChannel.bind(FrontEvent.sendMessage, (payload: any) => {
        newChatChannel.trigger(
          BackEvent.frontMessageAck,
          JSON.stringify({ ackMessageId: payload.id })
        );

        setChats((previousChats) => {
          const newChats = [...previousChats];

          const updatedChatIndex = newChats.findIndex(
            (chat) => chat.id === newChatChannel.name
          );

          newChats[updatedChatIndex] = { ...previousChats[updatedChatIndex] };
          newChats[updatedChatIndex].messages = [
            ...previousChats[updatedChatIndex].messages,
          ];

          newChats[updatedChatIndex].messages.push(payload.payload);

          return newChats;
        });
      });

      fetch('/api/backChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          sessionId: initChatData.sessionId,
          message: initChatData.message,
        }),
      }).catch((err) => {
        console.error(err);
      });

      // todo subscribe updates
      // const chat = channels.subscribe(data.id);
      // channel.trigger('message-sent-ack', 'hola! He recibido el mensaje :o)');

      setChats((previousChats) => {
        return [
          ...previousChats,
          {
            id: initChatData.sessionId,
            openedAt: initChatData.openedAt,
            messages: [initChatData.message.text],
          },
        ];
      });
    });
  }, [channels]);

  if (!channels) {
    return <div>Loading...</div>;
  }

  return (
    <>
      Total chats: {chats.length}
      <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
        {chats.map((chat) => (
          <BackChat chat={chat} key={chat.id} channels={channels} />
        ))}
      </div>
    </>
  );
};

Chatboard.auth = {
  role: 'admin',
  loading: <AdminLoadingSkeleton />,
  unauthorizedUrl: '/admin/login-with-different-user', // redirect to this url
};

export default Chatboard;
