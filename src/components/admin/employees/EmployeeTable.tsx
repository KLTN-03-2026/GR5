"use client";

// Định nghĩa Type từ API trả về
export type NhanVien = {
  id: number;
  email: string;
  ho_ten: string;
  sdt: string;
  chuc_vu: string;
  bo_phan: string;
  anh_dai_dien: string | null;
  ca_hom_nay: string;
  trang_thai: string;
};

interface EmployeeTableProps {
  employees: NhanVien[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  // Hàm map màu Badge theo Spec
  const renderTrangThai = (trangThai: string) => {
    switch (trangThai) {
      case "DANG_LAM_VIEC":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
            Đang làm việc
          </span>
        );
      case "CHUA_VAO_CA":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
            Chưa vào ca
          </span>
        );
      case "VANG_MAT":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
            Vắng mặt
          </span>
        );
      case "NGHI_PHEP":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
            Nghỉ phép
          </span>
        );
      case "DA_VE":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
            Đã về
          </span>
        );
      case "KHONG_CO_CA":
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
            Không có ca
          </span>
        );
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Nhân viên</th>
              <th className="px-4 py-3 font-medium">Chức vụ / Bộ phận</th>
              <th className="px-4 py-3 font-medium">SĐT</th>
              <th className="px-4 py-3 font-medium">Ca hôm nay</th>
              <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-400 italic"
                >
                  Chưa có nhân viên nào trong hệ thống.
                </td>
              </tr>
            ) : (
              employees.map((nv) => (
                <tr key={nv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                        {nv.anh_dai_dien ? (
                          <img
                            src={nv.anh_dai_dien}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          nv.ho_ten?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {nv.ho_ten}
                        </div>
                        <div className="text-xs text-gray-500">{nv.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-800">{nv.chuc_vu}</div>
                    <div className="text-xs text-gray-500">{nv.bo_phan}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{nv.sdt}</td>
                  <td className="px-4 py-3 text-gray-600 font-medium">
                    {nv.ca_hom_nay}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {renderTrangThai(nv.trang_thai)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm px-2">
                      Chi tiết
                    </button>
                    <button className="text-red-600 hover:text-red-800 font-medium text-sm px-2">
                      Nghỉ việc
                    </button>
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
