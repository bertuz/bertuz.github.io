import type { NextApiRequest, NextApiResponse } from 'next';

export const assertIsPostOrEnd = (
  req: NextApiRequest,
  res: NextApiResponse
): boolean => {
  if (req.method !== 'POST') {
    res.send('🤌🏽 what are you sending me?');
    res.status(400);
    res.end();
    return false;
  }

  return true;
};
