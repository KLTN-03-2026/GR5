# Backup & Restore Database

## Tổng quan
Hệ thống sao lưu database MySQL tự động mỗi ngày lúc 9:00 AM thông qua crontab Linux.
File backup được lưu tại thư mục `backups/` dưới dạng `.sql.gz` (nén gzip).

## Kiến trúc

```
┌─────────────────────────────────────────────────────┐
│  Crontab (Linux)                                    │
│  0 9 * * * scripts/backup.sh                        │
│  → Chạy mysqldump trực tiếp, không qua API         │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  Docker: agri_mysql                                 │
│  mysqldump → gzip → backups/agri_db_*_auto.sql.gz  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Trang Admin: /admin/backup                         │
│  - Xem danh sách backup                            │
│  - Tạo backup thủ công                             │
│  - Download / Xoá / Khôi phục                      │
└─────────────────────────────────────────────────────┘
```

## Cấu hình

### Thông tin database
- Host: localhost (Docker container `agri_mysql`)
- Port: 3307
- Database: agri_db
- User: root / rootpassword

### Thư mục backup
```
/mnt/d/agricultural-products-trading/backups/
```

### Cron job
```bash
# Chạy mỗi ngày lúc 9:00 AM
0 9 * * * /mnt/d/agricultural-products-trading/scripts/backup.sh >> /mnt/d/agricultural-products-trading/backups/cron.log 2>&1
```

## Files liên quan

| File | Mô tả |
|------|--------|
| `scripts/backup.sh` | Shell script backup tự động |
| `backups/` | Thư mục lưu file .sql.gz |
| `backups/cron.log` | Log cron job |
| `src/app/api/admin/backup/route.ts` | API: list + tạo backup |
| `src/app/api/admin/backup/[filename]/route.ts` | API: download + xoá |
| `src/app/api/admin/backup/restore/route.ts` | API: khôi phục |
| `src/app/admin/backup/page.tsx` | Trang admin UI |

## Quản lý Crontab

### Xem cron hiện tại
```bash
crontab -l
```

### Sửa cron
```bash
crontab -e
```

### Tạm dừng backup tự động
```bash
crontab -l | grep -v backup.sh | crontab -
```

## Backup thủ công (CLI)

```bash
# Dùng script
bash scripts/backup.sh

# Hoặc chạy trực tiếp
docker exec agri_mysql mysqldump -u root -prootpassword --single-transaction --routines --triggers agri_db | gzip > backups/agri_db_$(date +%Y%m%d_%H%M%S)_manual.sql.gz
```

## Restore thủ công (CLI)

```bash
# Từ file .sql.gz
gunzip -c backups/ten_file.sql.gz | docker exec -i agri_mysql mysql -u root -prootpassword agri_db

# Từ file .sql
docker exec -i agri_mysql mysql -u root -prootpassword agri_db < backups/ten_file.sql
```

## Trang Admin

Truy cập: http://localhost:3001/admin/backup

Chức năng:
- Xem danh sách tất cả bản backup
- Tạo backup thủ công (nút "Sao lưu ngay")
- Download file backup
- Xoá file backup
- Khôi phục database từ bản backup (tự động tạo bản sao lưu trước khi khôi phục)

## Chính sách lưu trữ

| Loại | Retention |
|------|-----------|
| Auto (tự động) | Giữ 30 ngày, cũ hơn tự xoá |
| Manual (thủ công) | Không tự xoá |
| Pre-restore | Không tự xoá |

## Quy ước đặt tên file

```
agri_db_{YYYYMMDD}_{HHmmss}_{type}.sql.gz
```

- `auto`: backup tự động từ cron
- `manual`: backup thủ công từ admin
- `prerestore`: backup tự động trước khi khôi phục

## Troubleshooting

### Backup thất bại
1. Kiểm tra Docker container đang chạy: `docker ps | grep agri_mysql`
2. Kiểm tra kết nối: `docker exec agri_mysql mysqladmin ping -u root -prootpassword`
3. Xem log cron: `cat backups/cron.log`

### Restore thất bại
1. Kiểm tra file backup không bị hỏng: `gunzip -t backups/ten_file.sql.gz`
2. Kiểm tra dung lượng: file .sql.gz phải > 0 bytes
3. Nếu restore lỗi, dùng bản pre-restore để phục hồi
