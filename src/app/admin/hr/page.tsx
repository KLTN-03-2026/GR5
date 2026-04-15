import { redirect } from "next/navigation";

export default function HrIndexPage() {
  // Khi user truy cập /admin/hr, hệ thống sẽ tự động đá sang trang chấm công
  redirect("/admin/hr/attendance");
}
