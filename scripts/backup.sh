#!/bin/bash
BACKUP_DIR="/mnt/d/agricultural-products-trading/backups"
FILENAME="agri_db_$(date +%Y%m%d_%H%M%S)_auto.sql.gz"
GDRIVE_REMOTE="gdrive:agri-backups"

# Tạo thư mục nếu chưa có
mkdir -p "$BACKUP_DIR"

# Backup database từ Docker container
docker exec agri_mysql mysqldump -u root -prootpassword --single-transaction --routines --triggers agri_db 2>/dev/null | gzip > "$BACKUP_DIR/$FILENAME"

# Kiểm tra kết quả
if [ $? -eq 0 ] && [ -s "$BACKUP_DIR/$FILENAME" ]; then
  echo "[$(date)] Backup thành công: $FILENAME ($(du -h "$BACKUP_DIR/$FILENAME" | cut -f1))"
else
  echo "[$(date)] Backup THẤT BẠI!"
  rm -f "$BACKUP_DIR/$FILENAME"
  exit 1
fi

# Upload lên Google Drive qua rclone
if command -v rclone &> /dev/null; then
  rclone copy "$BACKUP_DIR/$FILENAME" "$GDRIVE_REMOTE/" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "[$(date)] Cloud upload thành công: $FILENAME -> $GDRIVE_REMOTE"
  else
    echo "[$(date)] Cloud upload THẤT BẠI (backup local vẫn an toàn)"
  fi

  # Xoá file cloud cũ hơn 30 ngày
  rclone delete "$GDRIVE_REMOTE/" --min-age 30d --include "*_auto.sql.gz" 2>/dev/null
else
  echo "[$(date)] rclone chưa cài đặt - bỏ qua cloud backup"
fi

# Xoá backup auto cũ hơn 30 ngày
find "$BACKUP_DIR" -name "*_auto.sql.gz" -mtime +30 -delete
