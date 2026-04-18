import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        // 1. Tìm user trong DB bằng Prisma
        const user = await prisma.nguoi_dung.findUnique({
          where: { email },
        });

        if (!user || !user.mat_khau) return null;

        // 2. So khớp pass nhập vào với pass đã băm (Bcrypt)
        const isMatch = await bcrypt.compare(password, user.mat_khau);

        if (isMatch) {
          return { id: user.id.toString(), email: user.email };
        }
        return null;
      },
    }),
  ],

  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
});
