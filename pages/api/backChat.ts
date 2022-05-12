import {
  ApiEvent,
  BackEvent,
  ChatSessionState,
} from '../../components/chat/model';

import { assertWithSessionOrEnd } from '../../utils/api/auth';

import { assertIsPostOrEnd } from '../../utils/api/apiUtils';

import clientPromise from '../../utils/api/db';

import Pusher from 'pusher';

import type { Override } from '../../utils/types';

import type { NextApiRequest, NextApiResponse } from 'next';

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
  useTLS: true,
});

type BackChatAckMessageRequest = Override<
  NextApiRequest,
  {
    body: {
      sessionId: string;
      message: {
        id: string;
        message: string;
      };
    };
  }
>;

export default async function handler(
  req: BackChatAckMessageRequest,
  res: NextApiResponse<any>
) {
  const data = req.body;

  if (!assertWithSessionOrEnd(req, res, true)) {
    return;
  }

  if (!assertIsPostOrEnd(req, res)) {
    return;
  }

  pusher
    .trigger(data.sessionId, BackEvent.frontMessageAck, {
      ackMessageId: data.message.id,
    })
    .then(() => {
      res.status(201);
      res.end();
    })
    .catch(() => {
      res.status(500);
      res.send('Something went wrong');
      res.end();
    });

  const dbClient = await clientPromise;
  const collection = dbClient.db(dbName).collection('chat-sessions');
  try {
    await collection.updateOne(
      { sessionId: data.sessionId },
      {
        $set: {
          state: ChatSessionState.opened,
        },
      }
    );
  } catch (err) {
    console.error(err);
    await pusher.trigger(data.sessionId, ApiEvent.internalError, {});

    res.end();
  }
}
