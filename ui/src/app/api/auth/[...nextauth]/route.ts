import NextAuth, { type NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID ?? "",
      clientSecret: process.env.COGNITO_CLIENT_SECRET ?? "",
      issuer: process.env.COGNITO_ISSUER ?? "",
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
        (session.user as { id?: string }).id = token.sub;
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
