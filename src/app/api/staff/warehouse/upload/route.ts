import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Không có file nào được gửi" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "warehouse");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `evidence-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      urls.push(`/uploads/warehouse/${filename}`);
    }

    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error("[POST /api/staff/warehouse/upload]", error);
    return NextResponse.json({ error: "Lỗi upload ảnh" }, { status: 500 });
  }
}
