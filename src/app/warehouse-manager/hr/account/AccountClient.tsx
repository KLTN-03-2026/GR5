"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  KeyRound, ScanFace, ShieldCheck, Trash2, Eye, EyeOff,
  UserCircle, Loader2, X, AlertCircle, CheckCircle2,
} from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const FaceRegister = dynamic(() => import("@/components/FaceRegister"), { ssr: false });

interface Props {
  userId: number | null;
  userName: string;
  userEmail: string;
  userPhone: string;
}

type Section = "DOI_MAT_KHAU" | "FACE_ID";

export default function AccountClient({ userId, userName, userEmail, userPhone }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("DOI_MAT_KHAU");

  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [hasFaceData, setHasFaceData] = useState<boolean | null>(null);
  const [faceLoading, setFaceLoading] = useState(false);
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [faceMsg, setFaceMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void}>({isOpen: false, title: "", message: "", onConfirm: () => {}});

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("Mật khẩu mới phải ít nhất 6 ký tự");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPwSuccess(true);
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err: any) {
      setPwError(err.message ?? "Lỗi không xác định");
    } finally {
      setPwLoading(false);
    }
  };

  const fetchFaceStatus = useCallback(async () => {
    const res = await fetch("/api/user/face-data");
    const json = await res.json();
    if (json.success) setHasFaceData(json.hasFaceData);
  }, []);

  useEffect(() => {
    if (activeSection === "FACE_ID") fetchFaceStatus();
  }, [activeSection, fetchFaceStatus]);

  const handleFaceSuccess = async (descriptor: number[]) => {
    setShowFaceScanner(false);
    setFaceLoading(true);
    setFaceMsg(null);
    try {
      const res = await fetch("/api/user/face-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setFaceMsg({ type: "success", text: "Đã lưu dữ liệu khuôn mặt thành công!" });
      setHasFaceData(true);
    } catch (err: any) {
      setFaceMsg({ type: "error", text: err.message ?? "Lưu thất bại" });
    } finally {
      setFaceLoading(false);
    }
  };

  const handleDeleteFace = async () => {
    setConfirmDialog({
      isOpen: true,
      title: "Xóa dữ liệu FaceID",
      message: "Bạn chắc muốn xóa dữ liệu FaceID?",
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setFaceLoading(true);
        try {
          await fetch("/api/user/face-data", { method: "DELETE" });
          setHasFaceData(false);
          setFaceMsg({ type: "success", text: "Đã xóa dữ liệu FaceID" });
        } catch {
          setFaceMsg({ type: "error", text: "Xóa thất bại" });
        } finally {
          setFaceLoading(false);
        }
      },
    });
  };

  const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "DOI_MAT_KHAU", label: "Đổi mật khẩu", icon: KeyRound },
    { id: "FACE_ID", label: "FaceID", icon: ScanFace },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900 flex items-center gap-2">
            <UserCircle size={22} className="text-emerald-600" />
            Tài Khoản Cá Nhân
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý mật khẩu và bảo mật tài khoản</p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
          {userName?.[0]?.toUpperCase() || "T"}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-[15px]">{userName || "Thủ Kho"}</p>
          <p className="text-[13px] text-gray-500">{userEmail}</p>
          {userPhone && <p className="text-[12px] text-gray-400">{userPhone}</p>}
        </div>
        <div className="ml-auto px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-semibold border border-emerald-200">
          Thủ Kho
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-1.5 flex gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Đổi Mật Khẩu */}
      {activeSection === "DOI_MAT_KHAU" && (
        <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5 max-w-lg">
          <h2 className="text-[15px] font-semibold text-gray-800 mb-1">Đổi mật khẩu</h2>
          <p className="text-[12px] text-gray-400 mb-4 pb-3 border-b border-gray-100">Bảo vệ tài khoản với mật khẩu mạnh</p>

          {pwSuccess && (
            <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-[8px] px-4 py-3 text-[13px] font-medium">
              <CheckCircle2 size={16} /> Đổi mật khẩu thành công!
            </div>
          )}
          {pwError && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-[8px] px-4 py-3 text-[13px]">
              <AlertCircle size={16} className="mt-0.5" /> <span className="flex-1">{pwError}</span>
              <button onClick={() => setPwError(null)}><X size={14} /></button>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-[0.04em] mb-1.5">Mật khẩu hiện tại</label>
              <div className="flex items-center border border-gray-200 rounded-[8px] bg-white px-3 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500">
                <input type={showOld ? "text" : "password"} required value={pwForm.oldPassword} onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })} placeholder="••••••••" className="flex-1 bg-transparent py-2.5 text-[14px] outline-none" />
                <button type="button" onClick={() => setShowOld(!showOld)} className="text-gray-400 hover:text-gray-600">{showOld ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-[0.04em] mb-1.5">Mật khẩu mới</label>
              <div className="flex items-center border border-gray-200 rounded-[8px] bg-white px-3 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500">
                <input type={showNew ? "text" : "password"} required value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Ít nhất 6 ký tự" className="flex-1 bg-transparent py-2.5 text-[14px] outline-none" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600">{showNew ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-[0.04em] mb-1.5">Xác nhận mật khẩu mới</label>
              <div className="flex items-center border border-gray-200 rounded-[8px] bg-white px-3 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500">
                <input type={showConfirm ? "text" : "password"} required value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="Nhập lại" className="flex-1 bg-transparent py-2.5 text-[14px] outline-none" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
              {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                <p className="text-[11px] text-red-600 mt-1">Mật khẩu không khớp</p>
              )}
            </div>
            <button type="submit" disabled={pwLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-[8px] text-[14px] flex items-center justify-center gap-2 transition-colors">
              {pwLoading ? <><Loader2 size={15} className="animate-spin" /> Đang xử lý...</> : <><KeyRound size={15} /> Đổi mật khẩu</>}
            </button>
          </form>
        </div>
      )}

      {/* FaceID */}
      {activeSection === "FACE_ID" && (
        <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-5 max-w-lg">
          <h2 className="text-[15px] font-semibold text-gray-800 mb-1">Đăng nhập FaceID</h2>
          <p className="text-[12px] text-gray-400 mb-4 pb-3 border-b border-gray-100">Đăng nhập nhanh bằng nhận diện khuôn mặt</p>

          {faceMsg && (
            <div className={`mb-4 flex items-center gap-2 rounded-[8px] px-4 py-3 text-[13px] font-medium border ${
              faceMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {faceMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {faceMsg.text}
            </div>
          )}

          {hasFaceData === null ? (
            <div className="flex items-center justify-center py-8 text-gray-400 text-[13px]">
              <Loader2 size={16} className="animate-spin mr-2" /> Đang kiểm tra...
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`rounded-[8px] p-4 flex items-center gap-3 border ${
                hasFaceData ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
              }`}>
                <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center ${
                  hasFaceData ? "bg-emerald-100" : "bg-gray-200"
                }`}>
                  <ShieldCheck size={20} className={hasFaceData ? "text-emerald-600" : "text-gray-400"} />
                </div>
                <div>
                  <p className={`font-semibold text-[14px] ${hasFaceData ? "text-emerald-700" : "text-gray-600"}`}>
                    {hasFaceData ? "Đã đăng ký FaceID" : "Chưa đăng ký FaceID"}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {hasFaceData ? "Đăng nhập bằng khuôn mặt đã sẵn sàng." : "Đăng ký để đăng nhập không cần mật khẩu."}
                  </p>
                </div>
              </div>

              {showFaceScanner && (
                <FaceRegister onSuccess={handleFaceSuccess} onCancel={() => setShowFaceScanner(false)} />
              )}

              {!showFaceScanner && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setFaceMsg(null); setShowFaceScanner(true); }}
                    disabled={faceLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-[8px] text-[14px] flex items-center justify-center gap-2 transition-colors"
                  >
                    {faceLoading ? <><Loader2 size={15} className="animate-spin" /> Đang lưu...</> : <><ScanFace size={15} /> {hasFaceData ? "Cập nhật FaceID" : "Đăng ký khuôn mặt"}</>}
                  </button>
                  {hasFaceData && (
                    <button
                      onClick={handleDeleteFace}
                      disabled={faceLoading}
                      className="w-full bg-white border border-red-200 hover:bg-red-50 disabled:opacity-50 text-red-600 font-semibold py-2.5 rounded-[8px] text-[14px] flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 size={15} /> Xóa dữ liệu FaceID
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
