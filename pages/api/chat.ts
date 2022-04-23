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

  // const rees = pusher
  //   .trigger(
  //     data.id,
  //     'message-sent-ack',
  //     '\nHola! Matteo is not really here right now, but in the future he will be. If you patiently wait here you can maybe get an answer once he is online :)'
  //   )
  //   .then((data) => {
  //     // console.log(data);
  //   })
  //   .catch((data) => {
  //     // console.log(data);
  //   });
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
    .then(() => {
      // console.log(data);
    })
    .catch(() => {
      // console.log(data);
    });

  res.end();
}
