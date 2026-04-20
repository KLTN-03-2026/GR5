import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // ── 1. Credentials (Email + Password) ────────────────────────────────────
    Credentials({
      authorize: async (credentials) => {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        const user = await prisma.nguoi_dung.findUnique({ where: { email } });
        if (!user || !user.mat_khau) return null;

        const isMatch = await bcrypt.compare(password, user.mat_khau);
        if (!isMatch) return null;

        return { id: user.id.toString(), email: user.email };
      },
    }),

    // ── 2. Google OAuth ───────────────────────────────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── 3. Facebook OAuth ─────────────────────────────────────────────────────
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  // ── Callbacks ───────────────────────────────────────────────────────────────
  callbacks: {
    // Khi đăng nhập bằng OAuth (Google/FB): tự động tạo/tìm user trong DB
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (!user.email) return false;

        try {
          // Tìm hoặc tạo user trong DB
          const existingUser = await prisma.nguoi_dung.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Tạo tài khoản mới (không có mật khẩu vì dùng OAuth)
            const newUser = await prisma.nguoi_dung.create({
              data: {
                email: user.email,
                mat_khau: "", // Không có mật khẩu với OAuth
                trang_thai: 1,
              },
            });

            // Tạo hồ sơ đính kèm
            await prisma.ho_so_nguoi_dung.create({
              data: {
                ma_nguoi_dung: newUser.id,
                ho_ten: user.name ?? "",
                anh_dai_dien: user.image ?? null,
              },
            });
          } else if (!existingUser.ho_so_nguoi_dung) {
            // User đã có nhưng chưa có hồ sơ → tạo
            await prisma.ho_so_nguoi_dung.upsert({
              where: { ma_nguoi_dung: existingUser.id },
              create: {
                ma_nguoi_dung: existingUser.id,
                ho_ten: user.name ?? "",
                anh_dai_dien: user.image ?? null,
              },
              update: {},
            });
          }

          return true;
        } catch {
          return false;
        }
      }
      return true;
    },

    // Đưa numeric id vào JWT token
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.id = user.id;
      }
      // Nếu OAuth, lấy ID từ DB bằng email
      if (account?.provider !== "credentials" && token.email && !token.id) {
        const dbUser = await prisma.nguoi_dung.findUnique({
          where: { email: token.email },
          select: { id: true },
        });
        if (dbUser) token.id = dbUser.id.toString();
      }
      return token;
    },

    // Đưa id vào session.user để dùng ở client
    async session({ session, token }) {
      if (token.id) {
        (session.user as any).id = Number(token.id);
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
});
