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
        return "/auth/sign-in?error=no_email";
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      const status = existingUser ? "back" : "new";
      (user as { welcomeStatus?: string }).welcomeStatus = status;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      if (user && (user as { welcomeStatus?: string }).welcomeStatus) {
        (token as { welcomeStatus?: string }).welcomeStatus = (user as { welcomeStatus?: string }).welcomeStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const userRecord = (await prisma.user.findUnique({
          where: { id: token.sub },
        })) as { id?: string; isSubscriber?: boolean; plan?: string | null; subscriptionStatus?: string | null } | null;

        (session.user as { id?: string; isSubscriber?: boolean; plan?: string | null; subscriptionStatus?: string | null }).id =
          userRecord?.id ?? token.sub;
        (session.user as { isSubscriber?: boolean }).isSubscriber = userRecord?.isSubscriber ?? false;
        (session.user as { plan?: string | null }).plan = userRecord?.plan ?? null;
        (session.user as { subscriptionStatus?: string | null }).subscriptionStatus = userRecord?.subscriptionStatus ?? null;
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
