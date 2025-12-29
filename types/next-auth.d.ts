import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string | null;
      clearance: string | null;
      department: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string | null;
    clearance: string | null;
    department: string | null;
    mfaEnabled: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string | null;
    clearance: string | null;
    department: string | null;
  }
}
