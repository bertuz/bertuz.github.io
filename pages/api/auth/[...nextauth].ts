import NextAuth from 'next-auth';

import GithubProvider from 'next-auth/providers/github';

console.log('test' + process.env.GITHUB_SECRET);
export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
});
