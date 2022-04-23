import Pusher from 'pusher';

import type { NextApiRequest, NextApiResponse } from 'next';

const { NEXT_PUBLIC_PUSHER_APP_KEY: key, APP_ID, SECRET } = process.env;

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
