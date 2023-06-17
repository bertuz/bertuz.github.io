import places from './data.json';

import runMiddleware, {
  isOneOfMethodsMiddleware,
} from '../../../utils/api/middleware';

import type { Place } from './model';

import type { NextApiRequest, NextApiResponse } from 'next';

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
