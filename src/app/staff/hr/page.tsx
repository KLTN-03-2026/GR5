"use client";

import React, { useState } from "react";
import { CalendarDays, FileText, Send, Clock, MapPin, CheckCircle2 } from "lucide-react";

export default function StaffHRPage() {
  const [activeTab, setActiveTab] = useState("LICH_CA");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        <button
          onClick={() => setActiveTab("LICH_CA")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "LICH_CA" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <CalendarDays size={18} className={activeTab === "LICH_CA" ? "text-white" : "text-blue-500"} />
          Lịch Làm Việc Cá Nhân
        </button>
        <button
          onClick={() => setActiveTab("NGHI_PHEP")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "NGHI_PHEP" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FileText size={18} className={activeTab === "NGHI_PHEP" ? "text-white" : "text-green-500"} />
          Đơn Xin Nghỉ Phép
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LỊCH CA */}
        {activeTab === "LICH_CA" && (
          <div className="col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Lịch biểu tuần này <span className="font-normal text-gray-500 text-sm ml-2">(12/04/2026 - 18/04/2026)</span>
                </h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md">Tuần trước</button>
                  <button className="px-3 py-1.5 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">Tuần này</button>
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md">Tuần tới</button>
                </div>
              </div>

              {/* Lịch kiểu Google Calendar (Grid 7 cột) */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                {/* Headers */}
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
                  <div key={day} className={`bg-white p-3 text-center border-b border-gray-200 ${idx === 2 ? 'relative' : ''}`}>
                    {idx === 2 && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>}
                    <span className={`text-xs font-medium uppercase ${idx === 2 ? 'text-blue-600' : 'text-gray-500'}`}>{day}</span>
                    <span className={`block text-xl font-bold mt-1 ${idx === 2 ? 'text-blue-700' : 'text-gray-900'}`}>{12 + idx}</span>
                  </div>
                ))}

                {/* Day Columns */}
                {/* Thứ 2 */}
                <div className="bg-green-50/20 min-h-[300px] p-2 space-y-2">
                  <div className="bg-white border-l-4 border-l-green-500 border-y border-r border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <p className="font-bold text-gray-800 text-sm mb-1">Ca Sáng</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> 06:00 - 14:00</p>
                    <div className="mt-2 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded inline-block">
                      ✓ Đã chấm (05:55)
                    </div>
                  </div>
                </div>

                {/* Thứ 3 */}
                <div className="bg-green-50/20 min-h-[300px] p-2 space-y-2">
                  <div className="bg-white border-l-4 border-l-green-500 border-y border-r border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <p className="font-bold text-gray-800 text-sm mb-1">Ca Chiều</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> 14:00 - 22:00</p>
                    <div className="mt-2 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded inline-block">
                      ✓ Đã chấm (13:50)
                    </div>
                  </div>
                </div>

                {/* Thứ 4 (Hôm nay) */}
                <div className="bg-blue-50/30 min-h-[300px] p-2 space-y-2 relative border-x border-blue-100">
                  <div className="absolute top-10 left-0 w-full h-px bg-red-400">
                    <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <div className="bg-white border-l-4 border-l-blue-500 border-y border-r border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative z-10 mt-6 ring-2 ring-blue-500/20">
                    <p className="font-bold text-gray-800 text-sm mb-1">Ca Sáng</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> 06:00 - 14:00</p>
                    <div className="mt-2 text-[11px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded inline-block">
                      Đang làm việc
                    </div>
                  </div>
                </div>

                {/* Thứ 5 */}
                <div className="bg-white min-h-[300px] p-2 space-y-2">
                  <div className="bg-white border border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-70">
                    <div className="w-full h-1 bg-gray-300 rounded-t-sm absolute top-0 left-0"></div>
                    <p className="font-bold text-gray-600 text-sm mb-1 mt-1">Ca Tối</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> 22:00 - 06:00</p>
                  </div>
                </div>

                {/* Thứ 6 */}
                <div className="bg-white min-h-[300px] p-2 flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-400">Nghỉ (OFF)</p>
                </div>

                {/* Thứ 7 */}
                <div className="bg-white min-h-[300px] p-2 space-y-2">
                   <div className="bg-white border border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-70">
                    <p className="font-bold text-gray-600 text-sm mb-1">Ca Sáng</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> 06:00 - 14:00</p>
                  </div>
                </div>

                {/* CN */}
                <div className="bg-white min-h-[300px] p-2 flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-400">Nghỉ (OFF)</p>
                </div>

              </div>
              
              {/* Box Quy định */}
              <div className="mt-6 bg-blue-600 rounded-xl p-6 text-white shadow-sm relative overflow-hidden flex items-center gap-6">
                <Clock size={64} className="opacity-20 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-100 mb-1 text-lg">Quy định chấm công</h3>
                  <p className="text-sm leading-relaxed text-blue-50 mb-3">
                    Việc chấm công được thực hiện hoàn toàn tự động bằng Facial Recognition tại cửa kho. Thiết bị Kiosk hoạt động độc lập và tự động đồng bộ kết quả (Đã Chấm / Vắng / Trễ) vào lịch biểu này của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NGHỈ PHÉP */}
        {activeTab === "NGHI_PHEP" && (
          <>
            <div className="col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 object-contain">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Mẫu Form Đơn Xin Nghỉ</h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại Nghỉ</label>
                      <select className="w-full border-gray-200 rounded-lg bg-gray-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option>Nghỉ Phép Năm (Có Lương)</option>
                        <option>Nghỉ Bệnh</option>
                        <option>Nghỉ Việc Riêng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phép năm còn lại</label>
                      <div className="w-full border-gray-200 rounded-lg bg-green-50 p-2.5 text-sm font-bold text-green-700 text-center">
                        5 ngày
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                      <input type="date" className="w-full border-gray-200 rounded-lg bg-gray-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                      <input type="date" className="w-full border-gray-200 rounded-lg bg-gray-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lý do chi tiết</label>
                    <textarea rows={3} className="w-full border-gray-200 rounded-lg bg-gray-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-400" placeholder="Trình bày lý do xin nghỉ của bạn..."></textarea>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                      <Send size={16} />
                      Gửi Lên Trưởng Bộ Phận
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Lịch sử nghỉ phép</h3>
                <div className="space-y-3">
                  <div className="border border-gray-100 p-3 rounded-lg text-sm">
                    <p className="font-semibold text-gray-800">Nghỉ Việc Riêng (1 ngày)</p>
                    <p className="text-gray-500 mt-0.5">Ngày: 05/04/2026</p>
                    <span className="inline-block mt-2 bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-xs">Đã duyệt</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
