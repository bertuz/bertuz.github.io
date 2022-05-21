import runMiddleware, {
  isPostOrErrorMiddleware,
} from '../../../../utils/api/middleware';

import {
  ChatSessionState,
  PRIVATE_BACK_SESSION_NAME,
} from '../../../../components/chat/model';

import clientPromise from '../../../../utils/api/db';

import Pusher from 'pusher';

import type { ChatSession } from '../../../../components/chat/model';

import type { NextApiRequest, NextApiResponse } from 'next';

import type { Override } from '../../../../utils/types';

const {
  NEXT_PUBLIC_PUSHER_APP_KEY: channelKey,
  PUSHER_APP_ID: channelAppId,
  PUSHER_SECRET: channelAppSecret,
  NEXT_PUBLIC_PUSHER_CLUSTER_REGION: channelCluster,
  DB_DB_NAME: dbName,
} = process.env;

const pusher = new Pusher({
  appId: channelAppId || '',
  key: channelKey || '',
  secret: channelAppSecret || '',
  cluster: channelCluster || '',
});

type AuthPrivateChannelNextApiRequest = Override<
  NextApiRequest,
  {
    body: { socket_id: string };
  }
>;

export default async function handler(
  req: AuthPrivateChannelNextApiRequest,
  res: NextApiResponse<Pusher.AuthResponse | string>
) {
  runMiddleware(req, res, isPostOrErrorMiddleware);

  const sessionId = req.query.id as string;

  if (sessionId === PRIVATE_BACK_SESSION_NAME) {
    res.status(400);
    res.send('🤌🏽 che me stai a cojonà?');
    res.end();
    return;
  }

  const socketId = req.body.socket_id;

  const dbClient = await clientPromise;
  const collection = dbClient
    .db(dbName)
    .collection<ChatSession>('chat-sessions');

  try {
    const pipeline = [
      {
        $match: {
          sessionId,
        },
      },
      {
        $count: 'totalSessions',
      },
    ];
    const chatSessionsWithRequestedStateAndId =
      (await collection.aggregate(pipeline).toArray())[0]?.totalSessions ?? 0;

    if (chatSessionsWithRequestedStateAndId !== 1) {
      res.status(404);
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);

    res.status(500);
    res.end();
    return;
  }

  const auth = pusher.authenticate(socketId, sessionId);

  res.send(auth);
  res.end();
}
