import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { success: allowed } = rateLimit(`otp:${ip}`, 3, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { message: "Bạn đã yêu cầu quá nhiều lần. Vui lòng đợi 1 phút." },
        { status: 429 },
      );
    }

    const { email } = await req.json();

    // 1. Kiểm tra xem email có tồn tại trong hệ thống không
    const user = await prisma.nguoi_dung.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email này chưa được đăng ký trong hệ thống!" },
        { status: 404 },
      );
    }

    // 2. Xóa các mã OTP cũ của email này (nếu có) để tránh rác DB
    await prisma.ma_otp.deleteMany({
      where: { email },
    });

    // 3. Tạo mã OTP ngẫu nhiên (6 số)
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Hash OTP trước khi lưu vào Database
    const hashedOtp = await bcrypt.hash(generatedOtp, 10);
    await prisma.ma_otp.create({
      data: {
        email: email,
        code: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // 5. Cấu hình Nodemailer (Dùng mã 16 ký tự Phú vừa lấy)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 6. Nội dung Email
    const mailOptions = {
      from: `"Nông Sản Việt" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã xác nhận khôi phục mật khẩu",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #008A3D;">Xác thực mã OTP</h2>
          <p>Xin chào, bạn vừa yêu cầu khôi phục mật khẩu.</p>
          <p>Mã OTP của bạn là: <b style="font-size: 24px; color: #008A3D;">${generatedOtp}</b></p>
          <p>Mã này có hiệu lực trong <b>5 phút</b>. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>
          <hr />
          <small>Hệ thống quản lý Nông Sản Việt</small>
        </div>
      `,
    };

    // 7. Thực hiện gửi mail thực tế
    await transporter.sendMail(mailOptions);
    console.log(">>> Đã gửi email thành công tới:", email);

    return NextResponse.json(
      { message: "Mã OTP đã được gửi thành công!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(">>> LỖI TẠI API FORGOT-PASSWORD:", error.message);
    return NextResponse.json(
      { message: "Lỗi hệ thống: " + error.message },
      { status: 500 },
    );
  }
}
