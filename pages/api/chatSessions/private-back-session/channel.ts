import runMiddleware, {
  getHasSessionOrErrorMiddleware,
  isPostOrErrorMiddleware,
} from '../../../../utils/api/middleware';

import Pusher from 'pusher';

import type { NextApiRequest, NextApiResponse } from 'next';

const {
  NEXT_PUBLIC_PUSHER_APP_KEY: channelKey,
  PUSHER_APP_ID: channelAppId,
  PUSHER_SECRET: channelAppSecret,
  NEXT_PUBLIC_PUSHER_CLUSTER_REGION: channelCluster,
  PUSHER_ENCRYPTION_MASTER_KEY: encryptionKey,
} = process.env;

const pusher = new Pusher({
  appId: channelAppId || '',
  key: channelKey || '',
  secret: channelAppSecret || '',
  cluster: channelCluster || '',
  useTLS: true,
  encryptionMasterKeyBase64: encryptionKey,
});

type BackChatAuthChannelRequest = NextApiRequest & {
  body: {
    socket_id: string;
    channel_name: string;
  };
};

export default async function handler(
  req: BackChatAuthChannelRequest,
  res: NextApiResponse<any>
) {
  runMiddleware(req, res, isPostOrErrorMiddleware);
  runMiddleware(
    req,
    res,
    getHasSessionOrErrorMiddleware('private-back-session:post')
  );

  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  const auth = pusher.authenticate(socketId, channel);
  res.send(auth);

  res.end();
}
