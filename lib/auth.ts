import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./password";
import { createAuditLog } from "./audit";

// ----- 2. NextAuth options -----
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes (Secure Session Management)
  },
  providers: [
    CredentialsProvider({
      name: "Secure Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const userRecord = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { roles: { include: { role: true } } },
        });

        if (!userRecord) {
          // Generic invalid credentials
          throw new Error("INVALID_CREDENTIALS");
        }

        // ----- Account lockout check -----
        if (userRecord.lockedUntil && userRecord.lockedUntil > new Date()) {
          throw new Error("ACCOUNT_LOCKED");
        }

        // ----- Password validation -----
        const isValid = await verifyPassword(
          credentials.password,
          userRecord.passwordHash
        );
        if (!isValid) {
          const failedCount = userRecord.failedLoginCount + 1;
          const isLocked = failedCount >= 5;

          await prisma.user.update({
            where: { id: userRecord.id },
            data: {
              failedLoginCount: failedCount,
              lockedUntil: isLocked ? new Date(Date.now() + 15 * 60_000) : null,
            },
          });

          await createAuditLog({
            userId: userRecord.id,
            action: "LOGIN_FAILURE",
            status: "BLOCKED",
            ipAddress: "system", // Replace with real IP from request
          });

          throw new Error("INVALID_CREDENTIALS");
        }

        // Reset failed attempts on success
        if (userRecord.failedLoginCount > 0 || userRecord.lockedUntil) {
          await prisma.user.update({
            where: { id: userRecord.id },
            data: { failedLoginCount: 0, lockedUntil: null },
          });
        }

        // ----- MFA check -----
        if (userRecord.mfaEnabled && !credentials.otp) {
          throw new Error("MFA_REQUIRED");
        }

        // ----- Return user object -----
        return {
          id: userRecord.id,
          email: userRecord.email,
          name: userRecord.email?.split("@")[0],
          role: userRecord.roles[0]?.role.name ?? null,
          clearance: userRecord.clearanceLevel ?? null,
          department: userRecord.department ?? null,
          mfaEnabled: userRecord.mfaEnabled,
        };
      },
    }),
  ],

  callbacks: {
    // Save data from the 'user' object (returned by authorize) into the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.clearance = user.clearance;
        token.department = user.department;
      }
      return token;
    },
    // Pass the data from the JWT into the session so the frontend can see it
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.clearance = token.clearance;
        session.user.department = token.department;
      }
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      if (!token?.id) return;

      await createAuditLog({
        userId: token.id as string,
        action: "LOGOUT",
        status: "SUCCESS",
        ipAddress: "system",
      });
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login on error
  },
};

export default NextAuth(authOptions);
