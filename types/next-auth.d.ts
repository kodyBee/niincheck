import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isSubscribed?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    isSubscribed?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isSubscribed?: boolean;
  }
}
