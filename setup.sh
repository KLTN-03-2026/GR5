#!/bin/bash
set -e  # Dừng ngay nếu có lỗi

echo "======================================"
echo "  NôngSản Shop — Setup môi trường"
echo "======================================"

# Kiểm tra Docker đã cài chưa
if ! command -v docker &> /dev/null; then
  echo "Lỗi: Docker chưa được cài. Tải tại https://www.docker.com"
  exit 1
fi

# Bước 1: Tạo .env
if [ ! -f .env ]; then
  echo "→ Tạo file .env từ .env.example..."
  cp .env.example .env
  echo "  Xong. Mở file .env và điền API keys nếu cần."
else
  echo "→ File .env đã tồn tại, bỏ qua."
fi

# Bước 2: Build và khởi động Docker
echo "→ Khởi động Docker containers..."
docker-compose up -d --build

# Bước 3: Chờ DB sẵn sàng (healthcheck tự xử lý, chờ thêm buffer)
echo "→ Chờ database khởi động..."
sleep 10

# Bước 4: Chạy migration
echo "→ Chạy Prisma migration..."
docker-compose exec app npx prisma migrate dev --name init

# Bước 5: Seed data mẫu
echo "→ Seed data mẫu..."
docker-compose exec app npx prisma db seed

echo ""
echo "======================================"
echo "  Hoàn tất! Truy cập:"
echo ""
echo "  App:      http://localhost:3000"
echo "  Adminer:  http://localhost:8080"
echo ""
echo "  Đăng nhập Adminer:"
echo "  System:   MySQL"
echo "  Server:   db"
echo "  Username: agri_user"
echo "  Password: agri_password"
echo "  Database: agri_db"
echo ""
echo "  Tài khoản Admin:"
echo "  Email:    admin@nongsanshop.vn"
echo "  Password: admin123"
echo "======================================"