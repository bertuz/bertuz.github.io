import { ApiEvent, ChatSessionState } from '../../components/chat/model';
import clientPromise from '../../utils/api/db';

import Pusher from 'pusher';

import type { Override } from '../../utils/types';

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

type CloseFrontChatNextApiRequest = Override<
  NextApiRequest,
  {
    body: { contactDetails: string; sessionId: string };
  }
>;

export default async function handler(
  req: CloseFrontChatNextApiRequest,
  res: NextApiResponse<any>
) {
  const data = req.body;

  try {
    const dbClient = await clientPromise;
    const collection = dbClient.db(dbName).collection('chat-sessions');

    await collection.updateOne(
      { sessionId: data.sessionId },
      {
        $set: {
          state: ChatSessionState.closedByFront,
          lastMessage: data.contactDetails,
        },
      }
    );
  } catch (err) {
    console.error(err);
    pusher.trigger(data.sessionId, ApiEvent.internalError, {});

    res.status(500);
    res.end();
    return;
  }

  res.status(200);
  res.end();
}
