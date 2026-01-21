import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SIGNUP_COOKIE = "signup_intent";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.OAUTH_GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      if (!email) {
        return "/auth/sign-up?error=no_email";
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });

      let allowSignup = false;
      try {
        const cookieStore = await cookies();
        const signupFlag = cookieStore.get(SIGNUP_COOKIE)?.value;
        allowSignup = signupFlag === "true";
      } catch (err) {
        // Reading cookies can fail outside a request context; default to not allowing signup.
        allowSignup = false;
      }

      if (existingUser || allowSignup) {
        return true;
      }

      return `/auth/sign-up?error=no_account&email=${encodeURIComponent(email)}`;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/sign-in",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
