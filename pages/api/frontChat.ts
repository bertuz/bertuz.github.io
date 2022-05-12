import {
  ApiEvent,
  // Channels,
  ChatSessionState,
} from '../../components/chat/model';
import clientPromise from '../../utils/api/db';

import Pusher from 'pusher';

import type { Override } from '../../utils/types';

import type {
  ChatSession,
  ChatSessionRequest,
} from '../../components/chat/model';

import type { NextApiRequest, NextApiResponse } from 'next';

const {
  NEXT_PUBLIC_PUSHER_APP_KEY: channelKey,
  PUSHER_APP_ID: channelAppId,
  PUSHER_SECRET: channelAppSecret,
  NEXT_PUBLIC_PUSHER_CLUSTER_REGION: channelCluster,
  PUSHER_ENCRYPTION_MASTER_KEY: encryptionKey,
  DB_DB_NAME: dbName,
} = process.env;

const pusher = new Pusher({
  appId: channelAppId || '',
  key: channelKey || '',
  secret: channelAppSecret || '',
  cluster: channelCluster || '',
  useTLS: true,
  encryptionMasterKeyBase64: encryptionKey,
});

type InitFrontChatNextApiRequest = Override<
  NextApiRequest,
  {
    body: ChatSessionRequest;
  }
>;

export default async function handler(
  req: InitFrontChatNextApiRequest,
  res: NextApiResponse<any>
) {
  const data = req.body;

  try {
    const dbClient = await clientPromise;
    const collection = dbClient.db(dbName).collection('chat-sessions');

    await collection.insertOne(<ChatSession>{
      sessionId: data.sessionId,
      openedAt: data.openedAt,
      state: ChatSessionState.toBeAccepted,
      firstMessage: { id: data.message.id, message: data.message.text },
    });
  } catch (err) {
    console.error(err);
    pusher.trigger(data.sessionId, ApiEvent.internalError, {});

    return;
  }
  //
  // // optimistic flow with fallback for graceful degradation
  // // I send a failure via the channel in case the DB has problems
  // pusher
  //   .trigger(
  //     Channels.PrivateSupportChannel,
  //     ApiEvent.initChatReq,
  //     JSON.stringify(data)
  //   )
  //   .then(() => {
  //     res.send('OK');
  //     res.end();
  //   })
  //   .catch((data) => {
  //     res.send('KO');
  //     res.end();
  //     console.error('ko> ' + data);
  //   });

  res.send('OK');
  res.end();
}
