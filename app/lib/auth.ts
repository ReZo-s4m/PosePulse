/* eslint-disable */
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { Session } from "next-auth";
import db from "@/app/db";
import crypto from 'crypto';

export interface session extends Session {
    user: {
      email: string;
      name: string;
      image: string
      uid: string;
    };
}



export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET || 'secr3t',
  providers: [

    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // Credentials Provider (email/password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await db.user.findUnique({ where: { email: credentials.email } });
          if (!user || !user.passwordHash) return null;

          const [salt, key] = user.passwordHash.split(':');
          const derivedKey = crypto.scryptSync(credentials.password, salt, 64).toString('hex');

          if (derivedKey !== key) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (err) {
          console.error('Credentials auth error', err);
          return null;
        }
      }
    }),
  ],

  callbacks: {
    async session({ session, token }:any) {
      if (session.user && token.uid) {
        session.user.uid = token.uid; 
      }
      return session;
    },

    async jwt({ token, account, user }:any) {
      if (account?.provider === "google") {

        const dbUser = await db.user.findFirst({
          where: {
            sub: account.providerAccountId,
          },
        });

        if (dbUser) {
          token.uid = dbUser.id;
        }
      }

      if (user) {
        token.uid = user.id; 
      }

      return token;
    },

    async signIn({ user, account, profile }:any) {
      console.log("SignIn callback:", { user, account, profile });

      if (account?.provider === "google") {
        const email = user.email;

        // Check if user exists in the database
        const dbUser = await db.user.findFirst({
          where: { email: email },
        });

        if (dbUser) {
          return true; 
        }


        await db.user.create({
          data: {
            email: email,
            name: profile?.name,
            picture: profile?.picture,
            sub: account.providerAccountId,
          },
        });

        return true;
      }

      return true; 
    },
  },
};
