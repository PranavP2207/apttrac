import "server-only";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hashSync } from "bcryptjs";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { loginSchema } from "@/features/auth/validation";
import {
  canAttemptLogin,
  clearLoginFailures,
  recordLoginFailure,
} from "./rate-limit";

const dummyHash = hashSync("not-a-user-password", 12);

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success || !canAttemptLogin(parsed.data.email)) return null;
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        // Always compare a hash so unknown addresses do not have a cheap fast path.
        const matches = await compare(
          parsed.data.password,
          user?.passwordHash ?? dummyHash,
        );
        if (!user || !user.isActive || !matches) {
          recordLoginFailure(parsed.data.email);
          return null;
        }
        clearLoginFailures(user.email);
        await db.$transaction([
          db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }),
          db.activity.create({
            data: {
              actorId: user.id,
              action: "AUTH_LOGIN",
              entityType: "USER",
              entityId: user.id,
              description: `${user.name} signed in`,
            },
          }),
        ]);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.sessionVersion = user.sessionVersion;
      }
      const current = token.sub
        ? await db.user.findUnique({
            where: { id: token.sub },
            select: {
              name: true,
              email: true,
              image: true,
              role: true,
              isActive: true,
              sessionVersion: true,
            },
          })
        : null;
      token.isValid =
        !!current?.isActive && current.sessionVersion === token.sessionVersion;
      if (token.isValid && current) {
        token.name = current.name;
        token.email = current.email;
        token.picture = current.image;
        token.role = current.role;
      }
      return token;
    },
    session({ session, token }) {
      session.isValid = token.isValid === true;
      session.user = {
        id: token.sub ?? "",
        name: token.name,
        email: token.email,
        image: token.picture,
        role: token.role ?? "RECRUITER",
        sessionVersion: token.sessionVersion ?? -1,
      };
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (!token?.sub) return;
      try {
        const user = await db.user.findUnique({
          where: { id: token.sub },
          select: { id: true, name: true },
        });
        if (user)
          await db.activity.create({
            data: {
              actorId: user.id,
              action: "AUTH_LOGOUT",
              entityType: "USER",
              entityId: user.id,
              description: `${user.name} signed out`,
            },
          });
      } catch {
        console.error("Could not record the logout audit event.");
      }
    },
  },
};
