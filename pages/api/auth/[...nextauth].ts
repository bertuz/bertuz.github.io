import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
// @ts-ignore
import clientPromise from "../../../lib/mongodb";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  // @ts-ignore
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: "sdfkjksdfhjlkjsdha",
  },
  callbacks: {
    async jwt({ user, token }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as {
          name?: string | null;
          email?: string | null;
          image?: string | null;
          id: string;
        };
        user.id = token.id as string;
      }
      return session;
    },
  },
});
