import { MessageType } from '../../../components/chat/model';

import AdminLoadingSkeleton from '../../../components/AdminLoadingSkeleton';

import { useEffect, useState } from 'react';

import Pusher from 'pusher-js';

import { v4 as uuidv4 } from 'uuid';

import { useSession } from 'next-auth/react';

import type { AuthConfig } from '../../../typings/next';

import type { BackMessage } from '../../../components/chat/model';
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
      payload: backInput,
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
  const { status, data } = useSession({ required: true });

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

    console.log(status, data);

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
          'client-back-front-message-ack',
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

      fetch('/api/auth/backChat', {
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
  }, [channels]);

  // if (status === 'unauthenticated') {
  //   return (
  //     <>
  //       <h1>Nothing to see here 🤌🏽</h1>
  //       <p>
  //         <Link href="/api/auth/signin">
  //           <a
  //             tabIndex={0}
  //             role="link"
  //             onClick={(e) => {
  //               e.preventDefault();
  //               signIn('github');
  //             }}
  //             onKeyPress={(e) => {
  //               e.preventDefault();
  //               signIn('github');
  //             }}
  //           >
  //             Login
  //           </a>
  //         </Link>
  //       </p>
  //     </>
  //   );
  // }

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
