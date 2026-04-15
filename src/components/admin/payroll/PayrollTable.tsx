"use client";

export type LuongNhanVien = {
  ma_nguoi_dung: number;
  ho_ten: string;
  luong_theo_gio: number;
  tong_gio_thuc_te: number;
  tong_phut_tre: number;
  luong_co_ban: number;
  phu_cap_ca_toi: number;
  khau_tru_tre: number;
  thuc_nhan: number;
};

interface PayrollTableProps {
  bangLuong: LuongNhanVien[];
}

export function PayrollTable({ bangLuong }: PayrollTableProps) {
  // Helper format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-50/80 text-gray-600 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Nhân viên</th>
              <th className="px-4 py-3 font-medium text-center">Tổng giờ</th>
              <th className="px-4 py-3 font-medium text-right">Lương/giờ</th>
              <th className="px-4 py-3 font-medium text-right">Lương cơ bản</th>
              <th className="px-4 py-3 font-medium text-right text-green-600">
                + Phụ cấp (Tối)
              </th>
              <th className="px-4 py-3 font-medium text-right text-red-600">
                - Khấu trừ (Trễ)
              </th>
              <th className="px-4 py-3 font-bold text-right text-blue-700">
                Thực nhận
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bangLuong.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-gray-400 italic"
                >
                  Không có dữ liệu chấm công trong tháng này.
                </td>
              </tr>
            ) : (
              bangLuong.map((nv) => (
                <tr
                  key={nv.ma_nguoi_dung}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {nv.ho_ten}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    <span className="font-semibold">{nv.tong_gio_thuc_te}</span>{" "}
                    h
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {formatCurrency(nv.luong_theo_gio)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(nv.luong_co_ban)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">
                    {formatCurrency(nv.phu_cap_ca_toi)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 group relative">
                    {formatCurrency(nv.khau_tru_tre)}
                    {nv.tong_phut_tre > 0 && (
                      <span className="absolute -top-1 right-2 text-[10px] text-gray-400">
                        ({nv.tong_phut_tre}p)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-700">
                    {formatCurrency(nv.thuc_nhan)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
