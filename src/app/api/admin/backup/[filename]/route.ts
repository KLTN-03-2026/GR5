import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BACKUP_DIR = path.join(process.cwd(), "backups");

// GET - Download backup file
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filepath = path.join(BACKUP_DIR, filename);

    // Security: prevent path traversal
    if (!filepath.startsWith(BACKUP_DIR) || !fs.existsSync(filepath)) {
      return NextResponse.json({ error: "File không tồn tại" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filepath);
    const stats = fs.statSync(filepath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": stats.size.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Xoá backup file
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filepath = path.join(BACKUP_DIR, filename);

    if (!filepath.startsWith(BACKUP_DIR) || !fs.existsSync(filepath)) {
      return NextResponse.json({ error: "File không tồn tại" }, { status: 404 });
    }

    fs.unlinkSync(filepath);

    return NextResponse.json({ success: true, message: `Đã xoá ${filename}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
