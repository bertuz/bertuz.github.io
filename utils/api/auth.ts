import { getSession } from 'next-auth/react';

import type { NextApiRequest, NextApiResponse } from 'next';

const { NEXT_PUBLIC_ADMIN_USER_ID: adminId } = process.env;

export const assertWithSessionOrEnd = async (
  req: NextApiRequest,
  res: NextApiResponse,
  admin = false
): Promise<boolean> => {
  const session = await getSession({ req });

  if (!session || (admin && session?.user?.id !== adminId)) {
    console.log('SET!');
    res.status(403);
    res.send({
      error: '🤌🏽 You must be signed in as admin to access this',
    });
    res.end();
    return false;
  }

  return true;
};
