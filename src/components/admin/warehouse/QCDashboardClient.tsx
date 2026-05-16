"use client";

import { useEffect, useState } from "react";
import { 
  ClipboardCheck, BadgeCheck, AlertTriangle, PackageOpen, 
  Printer, Camera, Clock, Truck, FileText, ChevronRight, Filter, SortDesc, CheckCircle
} from "lucide-react";

export default function QCDashboardClient() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("WAITING_FOR_QC");
  
  // State for Decision Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [decisionType, setDecisionType] = useState<"ACCEPT_ALL" | "PARTIAL_ACCEPT" | "REJECT_ALL" | null>(null);
  
  // Form state
  const [damagedQty, setDamagedQty] = useState<number | ''>('');
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  // Helper
  const [now, setNow] = useState(new Date());

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/admin/warehouse/qc/tasks");
      const json = await res.json();
      if (json.success) setTasks(json.tasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadTasks(); 
    const timer = setInterval(() => setNow(new Date()), 60000); // Cập nhật thời gian chờ mỗi phút
    return () => clearInterval(timer);
  }, []);

  const handleStartTask = async (id: number) => {
    await fetch(`/api/admin/warehouse/qc/tasks/${id}/start`, { method: "PUT" });
    loadTasks();
    setActiveTab("QC_IN_PROGRESS");
  };

  const handleUploadEvidence = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/warehouse/upload/evidence", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) setEvidenceUrl(data.url);
    } catch (e) {
      alert("Upload thất bại");
    }
  };

  const submitDecision = async () => {
    if (!selectedTask || !decisionType) return;
    
    if (decisionType === 'PARTIAL_ACCEPT' && (damagedQty === '' || damagedQty <= 0)) {
      return alert("Vui lòng nhập số lượng lỗi hợp lệ!");
    }
    if ((decisionType === 'PARTIAL_ACCEPT' || decisionType === 'REJECT_ALL') && !reason) {
      return alert("Vui lòng nhập lý do từ chối!");
    }

    await fetch(`/api/admin/warehouse/qc/tasks/${selectedTask.id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: decisionType, 
        damagedQty: damagedQty === '' ? 0 : damagedQty, 
        reason, 
        evidenceUrl 
      })
    });
    
    setModalOpen(false);
    setSelectedTask(null);
    setDecisionType(null);
    setDamagedQty('');
    setReason("");
    setEvidenceUrl("");
    loadTasks();
    setActiveTab("DONE");
  };

  const openDecisionModal = (task: any) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const getWaitTime = (updatedAt: string) => {
    const diff = Math.floor((now.getTime() - new Date(updatedAt).getTime()) / 60000);
    if (diff < 60) return `${diff} phút`;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}p`;
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(t => t.trang_thai === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            Hàng Đợi QC
          </h1>
          <p className="text-slate-500 mt-1">Danh sách lô hàng cần kiểm định chất lượng, ưu tiên theo thời gian chờ.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab("WAITING_FOR_QC")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'WAITING_FOR_QC' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Chờ Kiểm Định ({tasks.filter(t => t.trang_thai === 'WAITING_FOR_QC').length})
          </button>
          <button 
            onClick={() => setActiveTab("QC_IN_PROGRESS")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'QC_IN_PROGRESS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Đang Kiểm Định ({tasks.filter(t => t.trang_thai === 'QC_IN_PROGRESS').length})
          </button>
          <button 
            onClick={() => setActiveTab("DONE")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'DONE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Đã Xử Lý ({tasks.filter(t => t.trang_thai === 'DONE').length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-700">Bộ lọc ưu tiên</span>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-1">
              <SortDesc size={14}/> Chờ lâu nhất
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Đang tải dữ liệu...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-16 text-center">
            <ClipboardCheck size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Không có công việc nào</h3>
            <p className="text-slate-500">Khu vực này hiện đang trống.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map(task => {
              const po = task.chi_tiet_nhap.phieu_nhap_kho;
              const product = task.chi_tiet_nhap.bien_the_san_pham.san_pham;
              const variant = task.chi_tiet_nhap.bien_the_san_pham;
              const qty = task.chi_tiet_nhap.so_luong_thuc_nhan;
              const waitTime = getWaitTime(task.ngay_cap_nhat);
              const hasNotes = task.chi_tiet_nhap.ly_do_lech;
              const unit = variant.don_vi_tinh || 'kg';

              return (
                <div key={task.id} className="p-5 hover:bg-slate-50 transition flex flex-col lg:flex-row gap-6 lg:items-center">
                  
                  {/* Cột Ưu tiên & Thời gian chờ */}
                  <div className="lg:w-32 flex-shrink-0 flex flex-row lg:flex-col items-center lg:items-start gap-2 lg:gap-1">
                    {activeTab === 'WAITING_FOR_QC' ? (
                      <>
                        <div className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-md text-xs border border-amber-100">
                          <Clock size={12}/> Chờ {waitTime}
                        </div>
                      </>
                    ) : activeTab === 'DONE' ? (
                       <div className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-md">Hoàn tất</div>
                    ) : (
                       <div className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded-md">Đang xử lý</div>
                    )}
                  </div>

                  {/* Cột Thông tin Sản phẩm */}
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 text-lg mb-1">{product.ten_san_pham}</div>
                    <div className="text-sm text-slate-500 font-medium flex flex-wrap gap-x-4 gap-y-1 mb-2">
                      <span>Mã: {variant.ma_sku}</span>
                      <span>Quy cách: {variant.ten_bien_the}</span>
                    </div>
                    {hasNotes && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                        <AlertTriangle size={12}/> Ghi chú lúc nhận: {hasNotes}
                      </div>
                    )}
                  </div>

                  {/* Cột NCC & PO */}
                  <div className="lg:w-48 text-sm space-y-1">
                    <div className="flex items-center gap-2 text-slate-700 font-medium line-clamp-1" title={po.nha_cung_cap?.ten_ncc}>
                      <Truck size={14} className="text-slate-400 shrink-0"/> {po.nha_cung_cap?.ten_ncc || 'Không rõ NCC'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <FileText size={14} className="text-slate-400 shrink-0"/> PO-{(po.id).toString().padStart(4, '0')}
                    </div>
                  </div>

                  {/* Cột Số lượng */}
                  <div className="lg:w-28 text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Cần Kiểm</div>
                    <div className="text-xl font-extrabold text-slate-800">{qty} <span className="text-xs font-medium text-slate-500">{unit}</span></div>
                  </div>

                  {/* Cột Thao tác */}
                  <div className="lg:w-40 flex flex-col gap-2">
                    {activeTab === 'WAITING_FOR_QC' && (
                      <button 
                        onClick={() => handleStartTask(task.id)}
                        className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 shadow-sm transition">
                        Nhận Việc
                      </button>
                    )}
                    {activeTab === 'QC_IN_PROGRESS' && (
                      <button 
                        onClick={() => openDecisionModal(task)}
                        className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 shadow-sm transition">
                        Chốt Quyết Định
                      </button>
                    )}
                    {activeTab === 'DONE' && (
                      <div className="w-full text-center">
                        <div className={`text-xs font-bold px-2 py-1.5 rounded-lg mb-2 ${
                          task.ket_qua_qc === 'ACCEPT_ALL' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                          task.ket_qua_qc === 'REJECT_ALL' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {task.ket_qua_qc === 'ACCEPT_ALL' ? 'PASS' : task.ket_qua_qc === 'REJECT_ALL' ? 'REJECT' : 'PASS MỘT PHẦN'}
                        </div>
                        {task.ket_qua_qc !== 'REJECT_ALL' && (
                          <button className="w-full border border-slate-200 text-slate-700 bg-white rounded-lg py-1.5 text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1.5 shadow-sm">
                            <Printer size={14}/> In Tem
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DECISION MODAL */}
      {modalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Quyết Định Kiểm Định</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">PO-{(selectedTask.chi_tiet_nhap.ma_phieu_nhap).toString().padStart(4, '0')} • {selectedTask.chi_tiet_nhap.bien_the_san_pham.san_pham.ten_san_pham}</p>
              </div>
              <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-center shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Tổng SL</div>
                <div className="font-extrabold text-slate-800">{selectedTask.chi_tiet_nhap.so_luong_thuc_nhan}</div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setDecisionType("ACCEPT_ALL")}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${decisionType === 'ACCEPT_ALL' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}>
                  <BadgeCheck size={32} />
                  <span className="text-xs font-extrabold">PASS TOÀN BỘ</span>
                </button>
                <button 
                  onClick={() => setDecisionType("PARTIAL_ACCEPT")}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${decisionType === 'PARTIAL_ACCEPT' ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}>
                  <PackageOpen size={32} />
                  <span className="text-xs font-extrabold text-center">TÁCH LÔ<br/><span className="font-medium text-[10px]">(Pass 1 phần)</span></span>
                </button>
                <button 
                  onClick={() => setDecisionType("REJECT_ALL")}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${decisionType === 'REJECT_ALL' ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}>
                  <AlertTriangle size={32} />
                  <span className="text-xs font-extrabold">FAIL TOÀN BỘ</span>
                </button>
              </div>

              {decisionType === "PARTIAL_ACCEPT" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Số lượng HỎNG / TỪ CHỐI</label>
                  <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-2 shadow-inner focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                    <input
                      type="number"
                      min={1}
                      placeholder="0"
                      value={damagedQty}
                      onChange={(e) => { const v = e.target.value.replace(/^-/, ''); if (v === '' || Number(v) >= 1) setDamagedQty(v === '' ? '' : Number(v)); }}
                      onKeyDown={(e) => { if ((e.key === '-' || e.key === 'e') && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                      className="w-full text-xl font-extrabold text-slate-800 bg-transparent outline-none px-2"
                    />
                  </div>
                </div>
              )}

              {(decisionType === "PARTIAL_ACCEPT" || decisionType === "REJECT_ALL") && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-rose-600 uppercase mb-1 block">Lý do từ chối (Bắt buộc)</label>
                    <select 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white focus:border-blue-500 font-medium">
                      <option value="">-- Chọn lý do --</option>
                      <option value="Hàng thối rữa/nấm mốc">Hàng thối rữa/nấm mốc</option>
                      <option value="Sai quy cách kích thước/trọng lượng">Sai quy cách kích thước/trọng lượng</option>
                      <option value="Không đủ giấy tờ VSATTP">Không đủ giấy tờ VSATTP</option>
                      <option value="Bao bì dập nát nghiêm trọng, rách nát">Bao bì dập nát nghiêm trọng, rách nát</option>
                      <option value="Chất lượng không đạt (mùi, vị, màu)">Chất lượng không đạt (mùi, vị, màu)</option>
                    </select>
                  </div>
                  <div>
                    <label className={`flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border border-dashed font-bold text-sm transition ${evidenceUrl ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                      {evidenceUrl ? <><CheckCircle size={18}/> Đã tải ảnh bằng chứng</> : <><Camera size={18} /> Upload ảnh bằng chứng</>}
                      <input 
                        type="file" accept="image/*" className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) handleUploadEvidence(e.target.files[0]); }}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => {
                  setModalOpen(false);
                  setDecisionType(null);
                  setDamagedQty('');
                  setReason('');
                }}
                className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition">
                Hủy bỏ
              </button>
              <button 
                onClick={submitDecision}
                disabled={!decisionType}
                className="px-8 py-3 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                Xác Nhận & Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
