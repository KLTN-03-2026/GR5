import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(process.cwd(), "backups");

export const dynamic = "force-dynamic";

// GET - Danh sách backup
export async function GET() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith(".sql.gz") || f.endsWith(".sql"))
      .map(filename => {
        const filepath = path.join(BACKUP_DIR, filename);
        const stats = fs.statSync(filepath);
        const isAuto = filename.includes("_auto");

        // Parse date from filename: agri_db_20260515_090000_auto.sql.gz
        let createdAt = stats.mtime.toISOString();
        const match = filename.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
        if (match) {
          createdAt = new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`).toISOString();
        }

        return {
          filename,
          size: stats.size,
          sizeFormatted: formatSize(stats.size),
          createdAt,
          type: isAuto ? "auto" : "manual",
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalSize = files.reduce((s, f) => s + f.size, 0);

    return NextResponse.json({
      success: true,
      data: files,
      summary: {
        total: files.length,
        totalSize,
        totalSizeFormatted: formatSize(totalSize),
        lastBackup: files[0]?.createdAt || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST - Tạo backup thủ công
export async function POST(request: NextRequest) {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const body = await request.json().catch(() => ({}));
    const uploadToCloud = body.uploadToCloud ?? false;

    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15).replace(/(\d{8})(\d{6})/, "$1_$2");
    const filename = `agri_db_${timestamp}_manual.sql.gz`;
    const filepath = path.join(BACKUP_DIR, filename);

    const cmd = `docker exec agri_mysql mysqldump -u root -prootpassword --single-transaction --routines --triggers agri_db 2>/dev/null | gzip > "${filepath}"`;

    await execAsync(cmd, { maxBuffer: 500 * 1024 * 1024 });

    if (!fs.existsSync(filepath) || fs.statSync(filepath).size === 0) {
      throw new Error("Backup file rỗng hoặc không tạo được");
    }

    let cloudStatus: "success" | "failed" | "skipped" = "skipped";

    if (uploadToCloud) {
      try {
        await execAsync(`rclone copy "${filepath}" gdrive:agri-backups/`, { timeout: 300000 });
        cloudStatus = "success";
      } catch {
        cloudStatus = "failed";
      }
    }

    const stats = fs.statSync(filepath);

    return NextResponse.json({
      success: true,
      message: cloudStatus === "success"
        ? "Sao lưu thành công (đã upload cloud)"
        : cloudStatus === "failed"
          ? "Sao lưu local thành công, upload cloud thất bại"
          : "Sao lưu thành công",
      data: {
        filename,
        size: stats.size,
        sizeFormatted: formatSize(stats.size),
        createdAt: new Date().toISOString(),
        type: "manual",
        cloudStatus,
      },
    });
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
