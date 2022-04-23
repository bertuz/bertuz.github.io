import Pusher from 'pusher';

import type { NextApiRequest, NextApiResponse } from 'next';

const {
  NEXT_PUBLIC_PUSHER_APP_KEY: key,
  CLUSTER: cluster,
  APP_ID,
  SECRET,
} = process.env;

const pusher = new Pusher({
  appId: APP_ID,
  key,
  secret: SECRET,
  cluster: 'eu', // if `host` is present, it will override the `cluster` option.
  // encryptionMasterKeyBase64: 'sdf', // a base64 string which encodes 32 bytes, used to derive the per-channel encryption keys (see below!)
});

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== 'POST') {
    res.send('UNAUTH');
    // todo bad format
    res.status(403);
    res.end();
  }

  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  const auth = pusher.authenticate(socketId, channel);
  res.send(auth);

  res.end();
}
