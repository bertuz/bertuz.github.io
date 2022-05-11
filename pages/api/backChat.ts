import { BackEvent, ChatSessionState } from '../../components/chat/model';

import { assertWithSessionOrEnd } from '../../utils/api/auth';

import { assertIsPostOrEnd } from '../../utils/api/apiUtils';

import Pusher from 'pusher';

import { MongoClient, ServerApiVersion } from 'mongodb';

import type { Override } from '../../utils/types';

import type { ChatSession } from '../../components/chat/model';
import type { NextApiRequest, NextApiResponse } from 'next';

const {
  NEXT_PUBLIC_PUSHER_APP_KEY: channelKey,
  PUSHER_APP_ID: channelAppId,
  PUSHER_SECRET: channelAppSecret,
  NEXT_PUBLIC_PUSHER_CLUSTER_REGION: channelCluster,
  DB_URI: dbUri,
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

  const db = new MongoClient(dbUri!, { serverApi: ServerApiVersion.v1 });
  db.connect(async (err) => {
    const collection = db.db(dbName).collection('chat-sessions');
    try {
      if (err) throw err;

      await collection.updateOne({ sessionId: data.sessionId }, <ChatSession>{
        state: ChatSessionState.toBeAccepted,
        firstMessage: { id: data.message.id, message: data.message.message },
      });
    } catch (err) {
      console.error(err);

      res.status(500);
      res.send('KO');

      res.end();
    } finally {
      db.close();
    }
  });

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
}
