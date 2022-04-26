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

  console.log('payload');
  console.log(data);

  pusher
    .trigger(
      'private-support-channel',
      'init-chat-req',
      JSON.stringify({
        id: data.id,
        openedAt: data.openedAt,
        firstMessage: { id: data.payload.id, message: data.payload.payload },
      })
    )
    .then((data) => {
      console.log('OK> ' + data);
      res.send('OK');
      res.end();
    })
    .catch((data) => {
      res.send('KO');
      res.end();
      console.log('ko>' + data);
    });
}
