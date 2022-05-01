import Pusher from 'pusher';

import type { NextApiRequest, NextApiResponse } from 'next';

const {
  NEXT_PUBLIC_PUSHER_APP_KEY: channelKey,
  PUSHER_APP_ID: channelAppId,
  PUSHER_SECRET: channelAppSecret,
  NEXT_PUBLIC_PUSHER_CLUSTER_REGION: channelCluster,
} = process.env;

const pusher = new Pusher({
  appId: channelAppId || '',
  key: channelKey || '',
  secret: channelAppSecret || '',
  cluster: channelCluster || '',
});

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { channel_name } = req.body;

  if (channel_name === 'private-support-channel') {
    res.status(400);
    res.send('🤌🏽 che me stai a cojonà?');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(400);
    res.end();
    return;
  }

  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  const auth = pusher.authenticate(socketId, channel);
  res.send(auth);

  res.end();
}
