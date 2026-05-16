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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #008A3D; margin: 0;">🌾 Chào mừng bạn đến với Nông Sản Việt!</h2>
          </div>

          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Xin chào,
          </p>

          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Cảm ơn bạn đã đăng ký tài khoản tại <strong>Nông Sản Việt</strong> - nền tảng kết nối nông sản sạch từ trang trại đến bàn ăn.
          </p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Mã xác thực của bạn là:</p>
            <p style="font-size: 32px; font-weight: bold; color: #008A3D; letter-spacing: 4px; margin: 10px 0;">
              ${generatedOtp}
            </p>
            <p style="font-size: 14px; color: #d32f2f; margin: 10px 0 0 0;">
              ⏱️ Mã này có hiệu lực trong <strong>5 phút</strong>
            </p>
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            Vui lòng nhập mã này vào trang đăng ký để hoàn tất quá trình tạo tài khoản.
          </p>

          <p style="font-size: 14px; color: #999; line-height: 1.6; margin-top: 20px;">
            <strong>Lưu ý:</strong> Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Mã xác thực sẽ tự động hết hiệu lực sau 5 phút.
          </p>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

          <div style="text-align: center;">
            <p style="font-size: 12px; color: #999; margin: 5px 0;">
              Trân trọng,<br/>
              <strong style="color: #008A3D;">Đội ngũ Nông Sản Việt</strong>
            </p>
            <p style="font-size: 11px; color: #bbb; margin: 10px 0 0 0;">
              © 2026 Nông Sản Việt. Hệ thống quản lý nông sản thông minh.
            </p>
          </div>
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
