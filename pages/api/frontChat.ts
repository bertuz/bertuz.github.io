import {
  ApiEvent,
  Channels,
  ChatSessionState,
} from '../../components/chat/model';

import Pusher from 'pusher';

import { MongoClient, ServerApiVersion } from 'mongodb';

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
  DB_URI: dbUri,
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

  const db = new MongoClient(dbUri!, { serverApi: ServerApiVersion.v1 });
  db.connect(async (err) => {
    const collection = db.db(dbName).collection('chat-sessions');
    // try {
    if (err) throw err;

    await collection.insertOne(<ChatSession>{
      sessionId: data.sessionId,
      openedAt: data.openedAt,
      state: ChatSessionState.toBeAccepted,
      firstMessage: { id: data.message.id, message: data.message.text },
    });
    // } catch (err) {
    //   console.error(err);
    //
    //   res.status(500);
    //   res.send('KO');
    //
    //   res.end();
    //   return;
    // } finally {
    db.close();
    // }
  });

  pusher
    .trigger(
      Channels.PrivateSupportChannel,
      ApiEvent.initChatReq,
      JSON.stringify(data)
    )
    .then(() => {
      res.send('OK');
      res.end();
    })
    .catch((data) => {
      res.send('KO');
      res.end();
      console.error('ko> ' + data);
    });

  res.send('OK');
}
