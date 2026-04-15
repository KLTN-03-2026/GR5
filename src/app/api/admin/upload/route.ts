import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo thư mục public/uploads nếu chưa có
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Đặt tên file không bị trùng
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const filepath = path.join(uploadDir, filename);
    
    // Lưu file vào thư mục
    await writeFile(filepath, buffer);

    // Trả về đường dẫn ảnh để lưu vào Database
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Lỗi upload:", error);
    return NextResponse.json({ error: "Lỗi khi tải ảnh lên" }, { status: 500 });
  }
}