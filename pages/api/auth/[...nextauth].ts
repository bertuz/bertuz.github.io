import NextAuth from 'next-auth';

import GithubProvider from 'next-auth/providers/github';

import { JWE, JWK, JWS } from 'node-jose';

import { v4 as uuidv4 } from 'uuid';

import type { JWTDecodeParams, JWTEncodeParams } from 'next-auth/jwt/types';

import type { JWT } from 'next-auth/jwt';

import type { Session } from 'next-auth';

import type { CallbacksOptions } from 'next-auth/core/types';

export type MySession = Session & {
  scope: Array<string>;
};

const { NEXT_PUBLIC_ADMIN_USER_ID: ADMIN_ID } = process.env;
type JWTClaims = JWT & {
  accessToken: string;
  refreshToken: string;
  exp: number;
  jti: string;
  iss: string;
  sub: string;
  aud: string;
  scope: Array<string>;
};

const MAX_JWT_VALIDITY_IN_MS = 10 * 60 * 1000;
// JWT validity is tied to the access-refresh tokens for simplcity, which are stored inside as claim.
// since the JWT is supposed to be renew in the last 5 minutes of its validity window time,
// it means that the refresh token should be always valid longer than > 5min
const MIN_JWT_RENEW_IN_MS = MAX_JWT_VALIDITY_IN_MS - 5 * 60 * 1000;

async function refreshAccessToken(jwtClaims: JWTClaims): Promise<JWTClaims> {
  console.log('> REFRESH!');
  try {
    const url =
      'https://github.com/login/oauth/access_token?' +
      new URLSearchParams({
        refresh_token: jwtClaims.refreshToken as string,
        grant_type: 'refresh_token',
        client_id: process.env.GITHUB_ID as string,
        client_secret: process.env.GITHUB_SECRET as string,
      });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const returnedResponse = await response.text();

    if (!response.ok) {
      throw returnedResponse;
    }

    const parsedReturnedResponse = new URLSearchParams(returnedResponse);
    const newAccessToken = parsedReturnedResponse.get('access_token');
    const newRefreshToken = parsedReturnedResponse.get('refresh_token');
    const newExp =
      Math.floor(Date.now() / 1000) +
      Math.min(
        Math.floor(+MAX_JWT_VALIDITY_IN_MS / 1000),
        +(parsedReturnedResponse.get('expires_in') ?? Number.MAX_VALUE)
      );

    const ret = {
      ...jwtClaims,
      accessToken: newAccessToken ?? jwtClaims.accessToken, // Fall back to old access token
      exp: newExp,
      refreshToken: newRefreshToken ?? jwtClaims.refreshToken, // Fall back to old refresh token
    };
    console.log(ret);
    return ret;
  } catch (error) {
    console.error(error);

    return {
      ...jwtClaims,
      error: 'RefreshAccessTokenError',
    };
  }
}

const callbacks: Partial<CallbacksOptions> = {
  signIn: async function () {
    return true;
  },
  jwt: async function generateJWTClaimsCallback({ token: jwtClaims, account }) {
    // Persist the OAuth access_token to the token right after signin
    if (account) {
      const jwtClaimsToReturn: JWTClaims = jwtClaims as JWTClaims;
      jwtClaimsToReturn.accessToken = account.access_token ?? '';
      jwtClaimsToReturn.refreshToken = account.refresh_token ?? '';
      jwtClaimsToReturn.exp = Math.min(
        Math.floor(Date.now() / 1000 + MAX_JWT_VALIDITY_IN_MS / 1000),
        account.expires_at ?? Number.MAX_VALUE
      );
      jwtClaimsToReturn.jti = uuidv4().toString();
      jwtClaimsToReturn.iss = 'https://www.bertamini.net';
      jwtClaimsToReturn.sub = account.providerAccountId;
      jwtClaimsToReturn.aud = 'https://www.bertamini.net';
      jwtClaimsToReturn.scope = [];

      if (account.providerAccountId === ADMIN_ID) {
        jwtClaimsToReturn.scope.push(
          ...[
            'private-back-session:post',
            'chatSessions/[id]/ack-first-message:post',
            'front/admin:access',
          ]
        );
      }

      return jwtClaimsToReturn;
    }

    // Return previous token if the access token has not expired yet
    const jwtAssertionsToReturn: JWTClaims = jwtClaims as JWTClaims;

    if (
      Math.floor(Date.now() / 1000) <
      jwtAssertionsToReturn.exp - Math.floor(MIN_JWT_RENEW_IN_MS / 1000)
    ) {
      return jwtClaims;
    }

    // JWT within the refresh-expiring time window, trying to refresh it
    return refreshAccessToken(jwtAssertionsToReturn);
  },
  session: async function ({ session, token: jwtClaims }) {
    session.scope = jwtClaims.scope;

    return session;
  },
};

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      checks: 'pkce',
    }),
  ],
  secret: process.env.AUTH_SECRET,
  jwt: {
    async encode(params: JWTEncodeParams): Promise<string> {
      const { token: jwtClaims } = params;

      // this is actually DECODE
      const keyStore = await JWK.asKeyStore(process.env.JWS_KEYS ?? '');

      const encoded = await JWS.createSign(
        keyStore.get(process.env.JWS_KID ?? '')
      )
        .update(JSON.stringify(jwtClaims))
        .final();

      const encrypted = await JWE.createEncrypt(
        { format: 'compact' },
        keyStore.get('encrypt1')
      )
        .update(JSON.stringify(encoded))
        .final();

      return JSON.stringify(encrypted);
    },
    async decode(params: JWTDecodeParams): Promise<JWT | null> {
      const { token: rawJWE = '{}' } = params;

      const keyStore = await JWK.asKeyStore(process.env.JWS_KEYS ?? '');
      const jwe = JSON.parse(rawJWE);

      const decryptedJWEPayload = await JWE.createDecrypt(keyStore).decrypt(
        jwe ?? '{}'
      );

      const jws = JSON.parse(
        decryptedJWEPayload.plaintext.toLocaleString() ?? '{}'
      );

      const jwsClaims = await JWS.createVerify(keyStore)
        .verify(jws ?? '')
        .then((payload) => {
          return JSON.parse(payload.payload.toString());
        });

      if (jwsClaims.exp < Math.floor(Date.now() / 1000)) {
        console.error('JWT EXPIRED.');
        return null;
      }

      return jwsClaims;
    },
  },
  callbacks,
});
