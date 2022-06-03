import { getSession } from 'next-auth/react';

import { getToken } from 'next-auth/jwt';

import type { MySession } from '../../pages/api/auth/[...nextauth]';

// import { SessionStore } from 'next-auth/core/lib/cookie';

import type { NextApiRequest, NextApiResponse } from 'next';

export type HTTPMethod = 'POST' | 'GET' | 'DELETE';
export const isOneOfMethodsMiddleware = (methods: Array<HTTPMethod>) => {
  return (
    req: NextApiRequest,
    res: NextApiResponse,
    handleResult: (result: any) => void
  ): void => {
    const method = req.method as HTTPMethod;

    if (!methods.includes(method)) {
      res.status(405);
      res.send('🤌🏽 what are you sending me?');
      res.end();
      handleResult(new Error(`req method is not the expected one: ${method}`));
      return;
    }

    handleResult(null);
  };
};

export const isPostOrErrorMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  handleResult: (result: any) => void
): void => {
  return isOneOfMethodsMiddleware(['POST'])(req, res, handleResult);
};

export const isDeleteOrErrorMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  handleResult: (result: any) => void
): void => {
  return isOneOfMethodsMiddleware(['DELETE'])(req, res, handleResult);
};

export const getHasSessionOrErrorMiddleware = (scope?: string) => {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    handleResult: (result: any) => void
  ): Promise<void> => {
    // const token = await getToken({
    //   req,
    //   cookieName: 'next-auth.session-token',
    // });
    // console.log('token check?', token);

    const a = await getToken({ req, raw: true });
    console.log('ba sessionnn?> ', a);
    // const sessionStore = new SessionStore(
    //   {
    //     name: 'next-auth.session-token',
    //     options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    //   },
    //   req,
    //   null
    // );

    const session = (await getSession({ req })) as MySession;
    console.log('ba> ', session);

    if (!session || (scope && !session.scope.includes(scope))) {
      res.status(403);
      res.send({
        error:
          '🤌🏽 You must be signed in and have with the right privileges to access this',
      });
      res.end();
      handleResult(new Error('You must be signed in as admin to access this'));
      return;
    }
  };
};

export default function runMiddleware<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    handleResult: (result: any) => void
  ) => void | Promise<void>
): Promise<T> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}
