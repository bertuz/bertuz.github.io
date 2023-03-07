import places from '../data.json';

import runMiddleware, {
  isOneOfMethodsMiddleware,
} from '../../../../utils/api/middleware';

import type { Place } from '../model';

import type { NextApiRequest, NextApiResponse } from 'next';

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<Place | null>
) {
  const { id: placeId } = req.query;

  if (!Number.isInteger(placeId)) {
    res.status(400);
    res.send(null);
    return;
  }

  const place = places.find(
    (el) => el.id == (Number.parseInt(placeId as string) as number)
  );

  if (place === undefined) {
    res.status(400);
    res.send(null);
    return;
  }

  res.status(200);
  res.send(place);
  return;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<null | Place>
) {
  runMiddleware(req, res, isOneOfMethodsMiddleware(['GET']));

  getHandler(req, res);
}
