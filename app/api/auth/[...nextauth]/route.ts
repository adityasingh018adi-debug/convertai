import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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

        const adminEmail = process.env.ADMIN_EMAIL || "adityasingh018adi@gmail.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "ConvertAI@2025#Admin";
        const adminName = process.env.ADMIN_NAME || "Aditya Singh";

        if (credentials.email !== adminEmail) return null;

        const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
        const valid = await bcrypt.compare(credentials.password, adminPasswordHash);
        if (!valid) return null;

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
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
