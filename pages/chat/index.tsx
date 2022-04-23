import { MessageType } from '../../components/Chat';

import { useEffect, useState } from 'react';

import Pusher from 'pusher-js';

import { v4 as uuidv4 } from 'uuid';

import type { BackMessage } from '../../components/Chat';
import type { NextPage } from 'next';

type Chat = {
  id: string;
  openedAt: number;
  messages: Array<string>;
};
type InitChat = {
  id: string;
  openedAt: number;
  firstMessage: { id: string; message: string };
};
type Property = { chat: Chat };
const BackChat = ({ chat }: Property) => {
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
      payload: backInput,
    };

    setBackInput('');
    console.log(channels.channels);
    console.log(chat.id);
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
    <div style={{ border: '1 px solid blue' }}>
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
const channels = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER_REGION,
  authEndpoint: '/api/auth-front-chat',
});

const Chatboard: NextPage = () => {
  const [chats, setChats] = useState<Array<Chat>>([]);

  useEffect(() => {
    // Subscribe to the appropriate channel
    const channel = channels.subscribe('private-support-channel');

    // Bind a callback function to an event within the subscribed channel
    channel.bind('init-chat-req', (initChatData: InitChat) => {
      console.log('received');
      console.log(initChatData);

      console.log('subscribed to ' + initChatData.id);
      const newChatChannel = channels.subscribe(initChatData.id);
      newChatChannel.bind('client-send-message', (payload: any) => {
        console.log('==== SENT MESSAGE ====');
        console.log(payload);
        newChatChannel.trigger(
          'client-back-message-ack',
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

          console.log('>>>>> CHATS SET');
          console.log(newChats[updatedChatIndex].messages);

          newChats[updatedChatIndex].messages.push(payload.payload);
          console.log('last before return');
          console.log(newChats[updatedChatIndex].messages);
          return newChats;
        });
      });

      // newChatChannel.trigger('client-back-message-ack', {
      //   ackMessageId: data.payload.id,
      // });

      fetch('/api/backChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          id: initChatData.id,
          message: initChatData.firstMessage,
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
            id: initChatData.id,
            openedAt: initChatData.openedAt,
            messages: [initChatData.firstMessage.message],
          },
        ];
      });
    });
  }, []);

  return (
    <div>
      Total chats: {chats.length}
      {chats.map((chat) => (
        <BackChat chat={chat} key={chat.id} />
      ))}
    </div>
  );
};

export default Chatboard;
