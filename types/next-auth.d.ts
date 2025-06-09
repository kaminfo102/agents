import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nationalId: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    nationalId: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    nationalId: string;
    role: string;
  }
}