import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        nationalId: { label: "کد ملی", type: "text" },
        phoneNumber: { label: "شماره موبایل", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.nationalId || !credentials?.phoneNumber) {
          throw new Error("کد ملی و شماره موبایل الزامی است");
        }

        const user = await prisma.user.findUnique({
          where: {
            nationalId: credentials.nationalId,
          },
        });

        if (!user) {
          throw new Error("کاربری با این کد ملی یافت نشد");
        }

        // In a real application, you would hash the phone number and compare it
        // For this example, we're doing a direct comparison
        if (user.phoneNumber !== credentials.phoneNumber) {
          throw new Error("شماره موبایل اشتباه است");
        }

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          nationalId: user.nationalId,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.nationalId = user.nationalId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.nationalId = token.nationalId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If the URL is relative, prepend the base URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If the URL is absolute and on the same origin, allow it
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to the base URL
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === "development",
  events: {
    async signIn({ user, account, profile }) {
      console.log("User signed in:", { user, account, profile });
    },
    async signOut({ token, session }) {
      console.log("User signed out:", { token, session });
    },
    async session({ session, token }) {
      console.log("Session updated:", { session, token });
    },
  },
};