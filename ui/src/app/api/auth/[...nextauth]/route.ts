import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      profile(profile) {
        const first = (profile as { given_name?: string }).given_name;
        const last = (profile as { family_name?: string }).family_name;
        const fullName = [first, last].filter(Boolean).join(" ").trim();
        return {
          id: profile.sub,
          name: fullName || profile.name,
          email: profile.email,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.OAUTH_GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.id?.toString(),
          name: profile.name || profile.login,
          email: profile.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      if (!email) {
        return "/auth/sign-in?error=no_email";
      }
      return true;
    },
    async jwt({ token, user, isNewUser }) {
      if (user?.id) {
        token.sub = user.id;
      }
      if (user?.email) {
        (token as { welcomeStatus?: string }).welcomeStatus = isNewUser ? "new" : "back";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const userRecord = (await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true },
        })) as { id?: string } | null;

        (session.user as { id?: string }).id = userRecord?.id ?? token.sub;
      }
      if (session.user && (token as { welcomeStatus?: string }).welcomeStatus) {
        (session.user as { welcomeStatus?: string }).welcomeStatus = (token as { welcomeStatus?: string }).welcomeStatus;
        delete (token as { welcomeStatus?: string }).welcomeStatus;
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
