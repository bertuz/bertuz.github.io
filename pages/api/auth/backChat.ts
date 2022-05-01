import Pusher from 'pusher';

import { getSession } from 'next-auth/react';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const session = await getSession({ req });

  if (!session || session?.user?.email !== 'matteo.bertamini@telefonica.com') {
    res.status(403);
    res.send({
      error:
        '🤌🏽 You must be signed in as admin to access this: ' +
        JSON.stringify(session),
    });
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.send('🤌🏽 what are you sending me?');
    res.status(400);
    res.end();
  }

  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  const auth = pusher.authenticate(socketId, channel);
  res.send(auth);

  res.end();
}
