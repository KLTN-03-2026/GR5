import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(process.cwd(), "backups");

// POST - Khôi phục database từ file backup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json({ error: "Thiếu filename" }, { status: 400 });
    }

    const filepath = path.join(BACKUP_DIR, filename);

    if (!filepath.startsWith(BACKUP_DIR) || !fs.existsSync(filepath)) {
      return NextResponse.json({ error: "File backup không tồn tại" }, { status: 404 });
    }

    // Tạo backup trước khi restore (safety net)
    const preRestoreTimestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15).replace(/(\d{8})(\d{6})/, "$1_$2");
    const preRestoreFilename = `agri_db_${preRestoreTimestamp}_prerestore.sql.gz`;
    const preRestorePath = path.join(BACKUP_DIR, preRestoreFilename);

    const backupCmd = `docker exec agri_mysql mysqldump -u root -prootpassword --single-transaction --routines --triggers agri_db 2>/dev/null | gzip > "${preRestorePath}"`;
    await execAsync(backupCmd, { maxBuffer: 500 * 1024 * 1024 });

    // Restore
    let restoreCmd: string;
    if (filename.endsWith(".gz")) {
      restoreCmd = `gunzip -c "${filepath}" | docker exec -i agri_mysql mysql -u root -prootpassword agri_db`;
    } else {
      restoreCmd = `docker exec -i agri_mysql mysql -u root -prootpassword agri_db < "${filepath}"`;
    }

    await execAsync(restoreCmd, { maxBuffer: 500 * 1024 * 1024, timeout: 300000 });

    return NextResponse.json({
      success: true,
      message: "Khôi phục thành công",
      preRestoreBackup: preRestoreFilename,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
