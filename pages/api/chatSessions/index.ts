import runMiddleware, {
  getHasSessionOrErrorMiddleware,
  isOneOfMethodsMiddleware,
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

async function getHandler(
  req: InitFrontChatNextApiRequest,
  res: NextApiResponse<Array<ChatSession>>
) {
  runMiddleware(req, res, getHasSessionOrErrorMiddleware('chatSessions:get'));

  try {
    const dbClient = await clientPromise;
    const agg = [
      {
        $match: {
          state: {
            $not: {
              $in: ['CLOSED_BY_BACK', 'CLOSED_FOR_ERROR'],
            },
          },
        },
      },
    ];
    const collection = dbClient
      .db(dbName)
      .collection<OptionalId<ChatSession>>('chat-sessions');
    const cursor = collection.aggregate<ChatSession>(agg);
    res.status(200);
    res.send(await cursor.toArray());
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
  res: NextApiResponse<null | Array<ChatSession>>
) {
  runMiddleware(req, res, isOneOfMethodsMiddleware(['GET', 'POST']));

  if (req.method === 'POST') {
    postHandler(req, res);
    return;
  }

  getHandler(req, res);
}
