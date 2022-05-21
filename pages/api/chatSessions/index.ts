import runMiddleware, {
  isPostOrErrorMiddleware,
} from '../../../utils/api/middleware';
import clientPromise from '../../../utils/api/db';

import { ChatSessionState } from '../../../components/chat/model';

import type { ChatSessionRequestBody } from '../../../components/chat/apiModel';

import type { ChatSession } from '../../../components/chat/model';
import type { Override } from '../../../utils/types';

import type { OptionalId } from 'mongodb';

import type { NextApiRequest, NextApiResponse } from 'next';

const { DB_DB_NAME: dbName } = process.env;

type InitFrontChatNextApiRequest = Override<
  NextApiRequest,
  {
    body: ChatSessionRequestBody;
  }
>;

async function postHandler(
  req: InitFrontChatNextApiRequest,
  res: NextApiResponse<null>
) {
  const data = req.body;

  try {
    const dbClient = await clientPromise;
    const collection = dbClient
      .db(dbName)
      .collection<OptionalId<ChatSession>>('chat-sessions');

    await collection.insertOne({
      ...data,
      state: ChatSessionState.channelRequested,
    });
  } catch (err) {
    res.status(500);
    res.end();
    return;
  }

  res.status(201);
  res.end();
}

export default async function handler(
  req: InitFrontChatNextApiRequest,
  res: NextApiResponse<null>
) {
  runMiddleware(req, res, isPostOrErrorMiddleware);

  if (req.method === 'POST') {
    postHandler(req, res);
    return;
  }
}
