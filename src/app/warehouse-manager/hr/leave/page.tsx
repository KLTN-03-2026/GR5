"use client";

import { useEffect, useState } from "react";

type DonNghiPhep = {
  id: number;
  loai_nghi: string;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  ly_do: string;
  trang_thai: "CHO_DUYET" | "DA_DUYET" | "TU_CHOI";
  nguoi_dung_tao: { ho_so_nguoi_dung: { ho_ten: string; chuc_vu: string } };
};

export default function LeaveManagementPage() {
  const [list, setList] = useState<DonNghiPhep[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    setLoading(true);
    const res = await fetch("/api/nghi-phep");
    const result = await res.json();
    if (result.success) setList(result.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (id: number, status: string) => {
    const phan_hoi =
      status === "TU_CHOI" ? prompt("Lý do từ chối:") : "Đã phê duyệt";
    if (status === "TU_CHOI" && !phan_hoi) return;

    await fetch(`/api/nghi-phep/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trang_thai: status,
        phan_hoi_admin: phan_hoi,
        ma_nguoi_duyet: 1,
      }), // Giả định Admin ID = 1
    });
    fetchLeaves(); // Refresh
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Nghỉ Phép</h1>
        <p className="text-gray-500">Phê duyệt đơn xin nghỉ của nhân viên</p>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-10">Đang tải...</div>
        ) : (
          list.map((don) => (
            <div
              key={don.id}
              className="bg-white border rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex gap-4 items-center">
                <div
                  className={`w-2 h-12 rounded-full ${don.trang_thai === "CHO_DUYET" ? "bg-yellow-400" : don.trang_thai === "DA_DUYET" ? "bg-green-500" : "bg-red-500"}`}
                />
                <div>
                  <h3 className="font-bold text-gray-800">
                    {don.nguoi_dung_tao.ho_so_nguoi_dung.ho_ten}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                    {don.loai_nghi} •{" "}
                    {don.nguoi_dung_tao.ho_so_nguoi_dung.chuc_vu}
                  </p>
                  <p className="text-sm mt-1 text-gray-700 italic">
                    " {don.ly_do} "
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
                  Từ {new Date(don.ngay_bat_dau).toLocaleDateString("vi-VN")}{" "}
                  đến {new Date(don.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                </div>

                {don.trang_thai === "CHO_DUYET" ? (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAction(don.id, "TU_CHOI")}
                      className="px-4 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleAction(don.id, "DA_DUYET")}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm"
                    >
                      Phê duyệt
                    </button>
                  </div>
                ) : (
                  <span
                    className={`text-sm font-bold ${don.trang_thai === "DA_DUYET" ? "text-green-600" : "text-red-600"}`}
                  >
                    {don.trang_thai === "DA_DUYET" ? "✓ ĐÃ DUYỆT" : "✕ TỪ CHỐI"}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
