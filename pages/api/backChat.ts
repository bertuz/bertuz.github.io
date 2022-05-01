import Pusher from 'pusher';

import { getSession } from 'next-auth/react';

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
  useTLS: true,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const data = req.body;

  const session = await getSession({ req });

  if (!session || session?.user?.email !== 'matteo.bertamini@telefonica.com') {
    res.status(403);
    res.send({
      error: '🤌🏽 You must be signed in as admin to access this',
    });
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.send('🤌🏽 what are you sending me?');
    res.status(400);
    res.end();
  }

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
      res.send('Something went wrong');
      res.end();
    });
}
