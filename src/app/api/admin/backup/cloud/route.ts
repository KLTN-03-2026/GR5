import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(process.cwd(), "backups");
const GDRIVE_REMOTE = "gdrive:agri-backups";

export const dynamic = "force-dynamic";

// GET - Danh sách file trên cloud
export async function GET() {
  try {
    let stdout: string;
    try {
      const result = await execAsync(`rclone lsjson "${GDRIVE_REMOTE}/"`, { timeout: 30000 });
      stdout = result.stdout;
    } catch (lsErr: any) {
      if (lsErr.message?.includes("directory not found") || lsErr.stderr?.includes("directory not found")) {
        await execAsync(`rclone mkdir "${GDRIVE_REMOTE}"`, { timeout: 30000 });
        return NextResponse.json({ success: true, data: [] });
      }
      throw lsErr;
    }

    const files = JSON.parse(stdout)
      .filter((f: any) => f.Name.endsWith(".sql.gz") || f.Name.endsWith(".sql"))
      .map((f: any) => ({
        filename: f.Name,
        size: f.Size,
        sizeFormatted: formatSize(f.Size),
        modTime: f.ModTime,
      }))
      .sort((a: any, b: any) => new Date(b.modTime).getTime() - new Date(a.modTime).getTime());

    return NextResponse.json({ success: true, data: files });
  } catch (err: any) {
    if (err.message?.includes("command not found") || err.message?.includes("ENOENT")) {
      return NextResponse.json({ success: false, error: "rclone chưa được cài đặt" }, { status: 400 });
    }
    if (err.message?.includes("didn't find section")) {
      return NextResponse.json({ success: false, error: "rclone chưa cấu hình remote 'gdrive'. Chạy: rclone config" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST - Upload 1 file local lên cloud
export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ success: false, error: "Tên file không hợp lệ" }, { status: 400 });
    }

    const filepath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ success: false, error: "File không tồn tại" }, { status: 404 });
    }

    await execAsync(`rclone copy "${filepath}" "${GDRIVE_REMOTE}/"`, { timeout: 300000 });

    return NextResponse.json({ success: true, message: `Đã upload "${filename}" lên Google Drive` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
