import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { success: allowed } = rateLimit(`send-register-otp:${ip}`, 3, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Bạn đã yêu cầu quá nhiều lần. Vui lòng đợi 1 phút." },
        { status: 429 },
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email là bắt buộc." },
        { status: 400 },
      );
    }

    // 1. Kiểm tra email đã tồn tại chưa
    const existing = await prisma.nguoi_dung.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email này đã được sử dụng." },
        { status: 409 },
      );
    }

    // 2. Xóa các mã OTP cũ của email này (nếu có)
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
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
      },
    });

    // 5. Cấu hình Nodemailer
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
      subject: "Mã xác nhận đăng ký tài khoản",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #008A3D;">Xác nhận đăng ký tài khoản</h2>
          <p>Xin chào, bạn đang tiến hành đăng ký tài khoản mới.</p>
          <p>Mã OTP của bạn là: <b style="font-size: 24px; color: #008A3D;">${generatedOtp}</b></p>
          <p>Mã này có hiệu lực trong <b>5 phút</b>. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>
          <hr />
          <small>Hệ thống quản lý Nông Sản Việt</small>
        </div>
      `,
    };

    // 7. Gửi mail
    await transporter.sendMail(mailOptions);
    console.log(">>> Đã gửi email đăng ký thành công tới:", email);

    return NextResponse.json(
      { success: true, message: "Mã OTP đã được gửi thành công!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(">>> LỖI TẠI API SEND-REGISTER-OTP:", error.message);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi gửi email: " + error.message },
      { status: 500 },
    );
  }
}
