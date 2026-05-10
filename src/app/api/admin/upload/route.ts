import { NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const MAX_WIDTH = 1200;
const QUALITY = 80;

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const isImage = file.type.startsWith("image/");
    let outputBuffer: Buffer;
    let ext: string;

    if (isImage) {
      outputBuffer = await sharp(buffer)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer();
      ext = "webp";
    } else {
      outputBuffer = buffer;
      ext = path.extname(file.name).slice(1) || "bin";
    }

    const filename = `${Date.now()}-${file.name.replace(/\.[^.]+$/, "").replace(/\s/g, "-")}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filepath, outputBuffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Lỗi upload:", error);
    return NextResponse.json({ error: "Lỗi khi tải ảnh lên" }, { status: 500 });
  }
}