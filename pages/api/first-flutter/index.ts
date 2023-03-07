import runMiddleware, {
  isOneOfMethodsMiddleware,
} from '../../../utils/api/middleware';

import type { NextApiRequest, NextApiResponse } from 'next';

type Place = { id: number };

const places = [
  {
    id: 0,
    name: 'Pratosaiano, Trentino AA, Italy',
    url: 'http://upload.wikimedia.org/wikipedia/commons/2/23/Pratosaiano_-_Scorcio.jpg',
    facts: [
      {
        title: 'Summary',
        text: 'bla bla bla bla',
      },
      {
        title: 'Cosas que ver',
        text: 'una pintura, el blasón',
      },
    ],
  },
  {
    id: 0,
    name: 'Arco, Trentino AA, Italy',
    url: 'https://mediaim.expedia.com/destination/2/f94473eb4d094460d156a71bb1be9e89.jpg',
    facts: [
      {
        title: 'Summary',
        text: 'Ciudad del Alto Garda',
      },
      {
        title: 'Cosas que ver',
        text: 'Una iglesia, heladerías, el centro histórico.',
      },
    ],
  },
];

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<Array<Place>>
) {
  res.status(200);
  res.send(places);
  return;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<null | Array<Place>>
) {
  runMiddleware(req, res, isOneOfMethodsMiddleware(['GET']));

  getHandler(req, res);
}
