"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, PackageSearch, QrCode, CheckCircle, XCircle, Truck, PackageCheck, RefreshCcw } from "lucide-react";
import { useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function StaffOrderDetailPage() {
  const { id } = useParams();
  const [step, setStep] = useState(1); // 1: Chờ xác nhận, 2: Nhặt hàng & Quét QR, 3: Đóng gói xong (Giao vận)
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("CHI_TIET"); // 'CHI_TIET' hoặc 'DOI_TRA'
  
  // Giả lập Dữ liệu
  const orderDetails = {
    id: id,
    customer: "Trần Đại Nghĩa",
    phone: "0901234567",
    address: "123 Đường Rau Sạch, Phường Xanh, Đà Nẵng",
    notes: "Giao giờ hành chính, gọi trước khi đến",
    items: [
      { id: "P1", name: "Dâu tây Đà Lạt chuẩn VietGAP (Hộp 500g)", qty: 2, stock: 15 },
      { id: "P2", name: "Cải Kale Khủng Long (Bó 300g)", qty: 5, stock: 3 }, // Thiếu hàng
    ],
    total: 345000
  };

  // Giả lập quét QR
  const handleScan = (itemId: string) => {
    if (scannedItems.includes(itemId)) {
      toast.error("Kiện hàng này đã quét rồi!");
      return;
    }
    setScannedItems([...scannedItems, itemId]);
    toast.success("Quét mã thành công");
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        <Link href="/staff/orders" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} className="mr-1" />
          Quay lại danh sách
        </Link>
        <div className="flex space-x-2 bg-white rounded-lg p-1 border border-gray-200">
          <button onClick={() => setActiveTab("CHI_TIET")} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === "CHI_TIET" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>Thông tin đơn</button>
          <button onClick={() => setActiveTab("DOI_TRA")} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === "DOI_TRA" ? "bg-red-50 text-red-600" : "text-gray-500 hover:text-gray-700"}`}>Yêu cầu Đổi/Trả</button>
        </div>
      </div>

      {/* Cảnh báo tồn kho */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="text-amber-500 mt-0.5" size={20} />
        <div>
          <h3 className="text-amber-800 font-bold">Cảnh báo tồn kho & FEFO</h3>
          <ul className="list-disc ml-5 mt-1 text-sm text-amber-700">
            <li><strong>Cải Kale Khủng Long</strong> yêu cầu 5 nhưng kho chỉ còn 3 bó.</li>
            <li>Lô Dâu Tây hiện tại sẽ hết hạn sau 2 ngày, ưu tiên xuất trước.</li>
          </ul>
        </div>
      </div>

      {activeTab === "CHI_TIET" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Phần Trái: Thông tin chi tiết */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                Thông tin đơn hàng #{orderDetails.id}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <p className="text-gray-500 mb-1">Khách hàng</p>
                  <p className="font-medium text-gray-900">{orderDetails.customer}</p>
                  <p className="text-gray-600">{orderDetails.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Địa chỉ giao</p>
                  <p className="font-medium text-gray-900">{orderDetails.address}</p>
                </div>
                <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-500 mb-1 text-xs uppercase font-bold tracking-wider">Ghi chú của khách</p>
                  <p className="text-gray-800 italic">"{orderDetails.notes}"</p>
                </div>
              </div>

              <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Danh sách sản phẩm</h3>
              <div className="space-y-3">
                {orderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <PackageSearch size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Kho còn: <span className={item.stock < item.qty ? "text-red-500 font-bold" : "text-green-600 font-bold"}>{item.stock}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">x{item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right pt-4 border-t border-gray-100">
                <p className="text-gray-500 text-sm">Tổng tiền thanh toán</p>
                <p className="text-2xl font-bold text-blue-600">{orderDetails.total.toLocaleString()}đ</p>
              </div>
            </div>
          </div>

          {/* Phần Phải: Bảng điều khiển */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4 border-b pb-2">Bảng Điều Khiển</h2>
              
              {/* Luồng 1: Chờ xác nhận */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg mb-4">
                    <strong>Bước 1:</strong> Vui lòng kiểm tra tồn kho và xác nhận đơn.
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Xác nhận Đơn (Đủ hàng)
                  </button>
                  <button className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-amber-600 font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                    <AlertTriangle size={20} />
                    Liên hệ khách (Thiếu hàng)
                  </button>
                  <button className="w-full py-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                    <XCircle size={20} />
                    Hủy đơn & Hoàn tiền
                  </button>
                </div>
              )}

              {/* Luồng 2: Quét nhặt hàng */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-lg mb-4 line-clamp-3">
                    <strong>Bước 2:</strong> Vui lòng lấy máy quét hoặc dùng camera để quét mã kiện hàng nhặt.
                  </div>
                  
                  {/* Giả lập quét barcode */}
                  <div className="space-y-2 mb-4">
                    {orderDetails.items.map(item => {
                      const isScanned = scannedItems.includes(item.id);
                      return (
                        <div key={item.id} className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${isScanned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`} onClick={() => handleScan(item.id)}>
                          <span className={`text-sm ${isScanned ? 'text-green-700 font-bold' : 'text-gray-600'}`}>{item.name}</span>
                          {isScanned ? <CheckCircle size={18} className="text-green-500" /> : <QrCode size={18} className="text-gray-400" />}
                        </div>
                      )
                    })}
                  </div>

                  <button 
                    onClick={() => setStep(3)}
                    disabled={scannedItems.length < orderDetails.items.length}
                    className={`w-full py-3 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${scannedItems.length === orderDetails.items.length ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    <PackageCheck size={20} />
                    Xong & Đóng Gói
                  </button>
                </div>
              )}

              {/* Luồng 3: Giao vận */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-purple-50 text-purple-800 text-sm p-3 rounded-lg mb-4">
                    <strong>Bước 3:</strong> Chọn đối tác vận chuyển và điền mã tracking.
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị vận chuyển</label>
                      <select className="w-full border-gray-200 rounded-lg bg-gray-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option>-- Chọn đơn vị --</option>
                        <option>Viettel Post</option>
                        <option>Giao Hàng Tiết Kiệm (GHTK)</option>
                        <option>Ahamove (Giao Hỏa Tốc)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã Vận Đơn (Tracking ID)</label>
                      <input type="text" placeholder="Nhập mã vào đây..." className="w-full border-gray-200 rounded-lg bg-gray-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>

                  <button className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Truck size={20} />
                    Chuyển sang "Đang Giao"
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      ) : (
        /* TAB ĐỔI TRẢ */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-600 border-b pb-2">
            <RefreshCcw size={20} /> Yêu Cầu Đổi / Trả Hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Khách hàng yêu cầu</p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-2">
                <p><strong>Lý do:</strong> Nông sản bị dập nát trong quá trình vận chuyển.</p>
                <p><strong>Sản phẩm:</strong> Dâu tây Đà Lạt (1 Khay 500g)</p>
                <p><strong>Số tiền hoàn:</strong> Tối đa 150.000đ</p>
                <div>
                  <strong>Ảnh minh chứng:</strong>
                  <div className="mt-2 w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                    [Ảnh rỗng]
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-6">
              <p className="text-sm text-gray-600 mb-2">Đánh giá và xử lý yêu cầu:</p>
              <button onClick={() => toast.success("Đã gửi yc hoàn tiền lên Admin")} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                <CheckCircle size={20} /> Chấp nhận & Trình Admin hoàn tiền
              </button>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <textarea className="w-full p-2 border border-gray-300 rounded text-sm mb-2" placeholder="Lý do từ chối (Gửi thông báo đến khách)..." rows={2}></textarea>
                <button onClick={() => toast.error("Đã từ chối khách")} className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <XCircle size={18} /> Từ chối yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
