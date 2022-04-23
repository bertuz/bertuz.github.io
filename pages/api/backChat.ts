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
  const data = req.body;

  pusher
    .trigger(data.id, 'client-back-front-message-ack', {
      ackMessageId: data.message.id,
    })

    .then(() => {
      res.status(201);
      res.end();
    })
    .catch(() => {
      res.status(500);
      res.send('NO OK');
      res.end();
    });
}
