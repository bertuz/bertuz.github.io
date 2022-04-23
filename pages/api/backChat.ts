import Pusher from 'pusher';

import type { NextApiRequest, NextApiResponse } from 'next';

const { NEXT_PUBLIC_PUSHER_APP_KEY: key, APP_ID, SECRET } = process.env;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const data = req.body;

  const pusher = new Pusher({
    appId: APP_ID,
    key,
    secret: SECRET,
    cluster: 'eu', // if `host` is present, it will override the `cluster` option.
    // encryptionMasterKeyBase64: 'sdf', // a base64 string which encodes 32 bytes, used to derive the per-channel encryption keys (see below!)
  });
  console.log(data.id);
  pusher
    .trigger(data.id, 'client-back-message-ack', {
      ackMessageId: data.message.id,
    })

    .then(() => {
      // console.log(data);
    })
    .catch(() => {
      // console.log(data);
    });

  res.end();
}
