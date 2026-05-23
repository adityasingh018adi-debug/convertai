import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = (process.env.ADMIN_EMAIL || "").trim();
        const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
        const adminName = (process.env.ADMIN_NAME || "Admin").trim();

        if (!adminEmail || !adminPassword) return null;

        const emailMatch = credentials.email.trim() === adminEmail;
        const passwordMatch = credentials.password === adminPassword;

        if (!emailMatch || !passwordMatch) return null;

        return {
          id: "1",
          name: adminName,
          email: adminEmail,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
