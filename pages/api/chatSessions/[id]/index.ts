import runMiddleware, {
  getHasSessionOrErrorMiddleware,
  isPostOrErrorMiddleware,
} from '../../../../utils/api/middleware';

import {
  Channels,
  ChatSessionOperation,
  ChatSessionState,
  PRIVATE_BACK_SESSION_NAME,
} from '../../../../components/chat/model';

import clientPromise from '../../../../utils/api/db';

import { ApiEvent, BackEvent } from '../../../../components/chat/channelModel';

import Pusher from 'pusher';

import type {
  CloseChatSessionFromBackRequestBody,
  AckFirstMessageRequestBody,
  OpenBackEndRequestBody,
} from '../../../../components/chat/apiModel';

import type {
  OpenEndBackChannelChatSessionBody,
  BackAckForFrontMessage,
} from '../../../../components/chat/channelModel';

import type { OptionalId } from 'mongodb';

import type {
  ChatSession,
  MessageBase,
} from '../../../../components/chat/model';

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

type OpenBackEndRequest = Override<
  NextApiRequest,
  {
    body: OpenBackEndRequestBody;
  }
>;

function isOpenBackEndRequest(req: NextApiRequest): req is OpenBackEndRequest {
  return req?.body?.operation === ChatSessionOperation.openBackEnd;
}

type AckFirstMessageRequest = Override<
  NextApiRequest,
  {
    body: AckFirstMessageRequestBody;
  }
>;

function isAckFirstMessageRequest(
  req: NextApiRequest
): req is AckFirstMessageRequest {
  return req?.body?.operation === ChatSessionOperation.ackFirstMessage;
}

type CloseSessionFromFrontRequest = Override<
  NextApiRequest,
  {
    body: {
      operation: ChatSessionOperation.closeFromFront;
      message: MessageBase;
    };
  }
>;

type CloseSessionFromBackRequest = Override<
  NextApiRequest,
  {
    body: CloseChatSessionFromBackRequestBody;
  }
>;

function isCloseSessionFromFrontRequest(
  req: NextApiRequest
): req is AckFirstMessageRequest {
  return req?.body?.operation === ChatSessionOperation.closeFromFront;
}

function isCloseSessionFromBackRequest(
  req: NextApiRequest
): req is AckFirstMessageRequest {
  return req?.body?.operation === ChatSessionOperation.closeFromBack;
}

type ChatSessionRequest = OpenBackEndRequest | AckFirstMessageRequest;

async function handleOpenBackEnd(
  req: OpenBackEndRequest,
  res: NextApiResponse<Pusher.AuthResponse | string>
) {
  const sessionId: string = req.query.id as unknown as string;

  if (sessionId === PRIVATE_BACK_SESSION_NAME) {
    res.status(400);
    res.send('🤌🏽 che me stai a cojonà?');
    res.end();
    return;
  }

  const { firstMessage } = req.body;

  const dbClient = await clientPromise;
  const collection = dbClient
    .db(dbName)
    .collection<ChatSession>('chat-sessions');

  try {
    const chatSession = await collection
      .find({
        sessionId,
        state: ChatSessionState.channelRequested,
      })
      .toArray();

    if (chatSession.length === 0) {
      res.status(404);
      res.end();
    }

    if (chatSession.length !== 1) {
      res.status(400);
      res.end();
    }

    await collection.updateOne(
      { sessionId: req.query.id },
      {
        $set: {
          state: ChatSessionState.channelBackEndOpening,
          firstMessage,
        },
      }
    );
  } catch (err) {
    console.error(err);

    res.status(500);
    res.end();
    return;
  }

  try {
    const openChatEventBody: OpenEndBackChannelChatSessionBody = {
      sessionId: sessionId.toString(),
      firstMessage,
    };
    await pusher.trigger(
      Channels.PrivateSupportChannel,
      ApiEvent.openEndBackChannelChatSession,
      JSON.stringify(openChatEventBody)
    );
  } catch (err) {
    console.error('ko> ' + err);

    await collection.updateOne(
      { sessionId: req.query.id },
      {
        $set: {
          state: ChatSessionState.closedForError,
        },
      }
    );

    res.status(500);
    res.end();
    return;
  }

  res.status(201);
  res.end();
}

async function handleAckFirstMessage(
  req: AckFirstMessageRequest,
  res: NextApiResponse<Pusher.AuthResponse | string>
) {
  runMiddleware(
    req,
    res,
    getHasSessionOrErrorMiddleware('chatSessions/[id]/ack-first-message:post')
  );

  const sessionId: string = req.query.id as unknown as string;
  const { messageId } = req.body;

  const dbClient = await clientPromise;
  const collection = dbClient
    .db(dbName)
    .collection<ChatSession>('chat-sessions');
  try {
    await collection.updateOne(
      { sessionId },
      {
        $set: {
          state: ChatSessionState.opened,
        },
      }
    );
  } catch (err) {
    console.error(err);

    await collection.updateOne(
      { sessionId: req.query.id },
      {
        $set: {
          state: ChatSessionState.closedForError,
        },
      }
    );

    await pusher.trigger(sessionId, ApiEvent.internalError, {});

    res.status(304);
    res.end();
    return;
  }

  try {
    await pusher.trigger(sessionId, BackEvent.frontMessageAck, {
      messageId,
    } as BackAckForFrontMessage);
  } catch (error) {
    try {
      await collection.updateOne(
        { sessionId },
        {
          $set: {
            state: ChatSessionState.closedForError,
          },
        }
      );
    } catch (err) {
      console.error(err);

      await pusher.trigger(sessionId, ApiEvent.internalError, {});

      res.status(304);
      res.end();
      return;
    }

    res.status(200);
    res.end();

    return;
  }

  res.status(200);
  res.end();
}

async function handleCloseSessionFromFront(
  req: CloseSessionFromFrontRequest,
  res: NextApiResponse<Pusher.AuthResponse | string>
) {
  const { message } = req.body;
  const sessionId: string = req.query.id as unknown as string;

  try {
    const dbClient = await clientPromise;
    const collection = dbClient
      .db(dbName)
      .collection<OptionalId<ChatSession>>('chat-sessions');

    await collection.updateOne(
      { sessionId },
      {
        $set: {
          state: ChatSessionState.closedByFront,
          frontClosingMessage: message,
        },
      }
    );
  } catch (err) {
    console.error(err);
    pusher.trigger(sessionId, ApiEvent.internalError, {});
    await pusher.trigger(
      Channels.PrivateSupportChannel,
      ApiEvent.closedChatSession,
      JSON.stringify(sessionId)
    );
    pusher.trigger(sessionId, ApiEvent.internalError, {});

    res.status(500);
    res.end();
    return;
  }

  res.status(200);
  res.end();
}

async function handleCloseSessionFromBack(
  req: CloseSessionFromBackRequest,
  res: NextApiResponse<Pusher.AuthResponse | string>
) {
  runMiddleware(
    req,
    res,
    getHasSessionOrErrorMiddleware('chatSessions/[id]:post')
  );

  const sessionId: string = req.query.id as unknown as string;

  try {
    const dbClient = await clientPromise;
    const collection = dbClient
      .db(dbName)
      .collection<OptionalId<ChatSession>>('chat-sessions');

    await collection.updateOne(
      { sessionId },
      {
        $set: {
          state: ChatSessionState.closedByBack,
        },
      }
    );
  } catch (err) {
    await pusher.trigger(sessionId, ApiEvent.internalError, {});
    await pusher.trigger(
      Channels.PrivateSupportChannel,
      ApiEvent.closedChatSession,
      JSON.stringify(sessionId)
    );

    res.status(500);
    res.end();
    return;
  }

  await pusher.trigger(sessionId, ApiEvent.closedChatSession, {});

  res.status(200);
  res.end();
}

export default async function handler(
  req: ChatSessionRequest,
  res: NextApiResponse<Pusher.AuthResponse | string>
) {
  runMiddleware(req, res, isPostOrErrorMiddleware);

  if (isOpenBackEndRequest(req)) {
    return handleOpenBackEnd(req, res);
  }

  if (isAckFirstMessageRequest(req)) {
    return handleAckFirstMessage(req, res);
  }

  if (isCloseSessionFromFrontRequest(req)) {
    return handleCloseSessionFromFront(req, res);
  }

  if (isCloseSessionFromBackRequest(req)) {
    return handleCloseSessionFromBack(req, res);
  }

  res.status(400);
  res.end();
}
