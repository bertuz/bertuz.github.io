import NextAuth from 'next-auth';

import GithubProvider from 'next-auth/providers/github';

import type { Session } from 'next-auth';

import type { CallbacksOptions } from 'next-auth/core/types';

type MySession = Session & {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;
  };
};

const callbacks: Partial<CallbacksOptions> = {
  signIn: async function () {
    return true;
  },
  jwt: async function ({ token, account, profile }) {
    // Persist the OAuth access_token to the token right after signin
    if (account) {
      token.accessToken = account.access_token;
    }

    if (profile) {
      token.profile = profile;
    }

    return token;
  },
  session: async function ({ session, token }) {
    const mySession = <MySession>session;
    if (mySession?.user) {
      mySession.user.id = token.sub!;
    }
    return session;
  },
};

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks,
});
