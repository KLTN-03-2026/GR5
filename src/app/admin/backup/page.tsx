"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  DatabaseBackup,
  Download,
  Trash2,
  RotateCcw,
  Plus,
  Loader2,
  HardDrive,
  Clock,
  AlertTriangle,
  Cloud,
  CloudUpload,
  CloudOff,
} from "lucide-react";

interface BackupFile {
  filename: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  type: "auto" | "manual" | "pre-restore";
}

interface CloudFile {
  filename: string;
  size: number;
  sizeFormatted: string;
  modTime: string;
}

interface BackupSummary {
  total: number;
  totalSizeFormatted: string;
  lastBackup: string | null;
}

export default function AdminBackupPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [cloudAvailable, setCloudAvailable] = useState(false);
  const [uploadToCloud, setUploadToCloud] = useState(false);
  const [summary, setSummary] = useState<BackupSummary>({
    total: 0,
    totalSizeFormatted: "0 B",
    lastBackup: null,
  });
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void}>({isOpen: false, title: "", message: "", onConfirm: () => {}});

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/backup");
      const data = await res.json();
      if (res.ok) {
        setBackups(data.backups || []);
        setSummary(data.summary || { total: 0, totalSizeFormatted: "0 B", lastBackup: null });
      } else {
        toast.error(data.error || "Không thể tải danh sách backup");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const fetchCloudFiles = async () => {
    try {
      setCloudLoading(true);
      const res = await fetch("/api/admin/backup/cloud");
      const data = await res.json();
      if (res.ok) {
        setCloudFiles(data.data || []);
        setCloudAvailable(true);
      } else {
        setCloudAvailable(false);
      }
    } catch {
      setCloudAvailable(false);
    } finally {
      setCloudLoading(false);
    }
  };

  const handleUploadToCloud = async (filename: string) => {
    try {
      setUploadingFile(filename);
      const res = await fetch("/api/admin/backup/cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Đã upload "${filename}" lên Google Drive`);
        fetchCloudFiles();
      } else {
        toast.error(data.error || "Upload thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setUploadingFile(null);
    }
  };

  useEffect(() => {
    fetchBackups();
    fetchCloudFiles();
  }, []);

  const handleCreate = async () => {
    try {
      setCreating(true);
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadToCloud }),
      });
      const data = await res.json();
      if (res.ok) {
        const cloudMsg = data.data?.cloudStatus === "success"
          ? " + đã upload cloud"
          : data.data?.cloudStatus === "failed"
            ? " (upload cloud thất bại)"
            : "";
        toast.success(`Tạo bản sao lưu thành công${cloudMsg}`);
        fetchBackups();
        if (uploadToCloud) fetchCloudFiles();
      } else {
        toast.error(data.error || "Không thể tạo backup");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (filename: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xoá bản sao lưu",
      message: `Bạn có chắc muốn xoá bản sao lưu "${filename}"?`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/admin/backup/${filename}`, { method: "DELETE" });
          const data = await res.json();
          if (res.ok) {
            toast.success("Đã xoá bản sao lưu");
            fetchBackups();
          } else {
            toast.error(data.error || "Không thể xoá backup");
          }
        } catch {
          toast.error("Lỗi kết nối server");
        }
      },
    });
  };

  const handleDownload = (filename: string) => {
    window.open(`/api/admin/backup/${filename}`, "_blank");
  };

  const handleRestore = (filename: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Khôi phục dữ liệu",
      message: "Dữ liệu hiện tại sẽ bị ghi đè. Hệ thống sẽ tạo bản sao lưu trước khi khôi phục. Tiếp tục?",
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          setRestoring(true);
          const res = await fetch("/api/admin/backup/restore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename }),
          });
          const data = await res.json();
          if (res.ok) {
            toast.success("Khôi phục dữ liệu thành công");
            fetchBackups();
          } else {
            toast.error(data.error || "Không thể khôi phục backup");
          }
        } catch {
          toast.error("Lỗi kết nối server");
        } finally {
          setRestoring(false);
        }
      },
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Chưa có";
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "auto":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Tự động
          </span>
        );
      case "manual":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Thủ công
          </span>
        );
      case "pre-restore":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Pre-restore
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Không rõ
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1D9E75]/10 rounded-lg">
            <DatabaseBackup className="w-6 h-6 text-[#1D9E75]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Sao lưu & Khôi phục</h1>
            <p className="text-sm text-gray-500">Quản lý bản sao lưu dữ liệu hệ thống</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {cloudAvailable && (
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={uploadToCloud}
                onChange={(e) => setUploadToCloud(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#1D9E75] focus:ring-[#1D9E75]"
              />
              <Cloud className="w-4 h-4" />
              Upload cloud
            </label>
          )}
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1D9E75] text-white rounded-lg font-semibold text-sm hover:bg-[#178a64] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Sao lưu ngay
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DatabaseBackup className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng backup</p>
              <p className="text-2xl font-bold text-gray-800">{summary.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <HardDrive className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dung lượng</p>
              <p className="text-2xl font-bold text-gray-800">{summary.totalSizeFormatted}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Lần backup gần nhất</p>
              <p className="text-lg font-bold text-gray-800">{formatDate(summary.lastBackup)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Danh sách bản sao lưu</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#1D9E75]" />
            <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
          </div>
        ) : backups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <AlertTriangle className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">Chưa có bản sao lưu nào</p>
            <p className="text-xs text-gray-400 mt-1">
              Nhấn &quot;Sao lưu ngay&quot; để tạo bản sao lưu đầu tiên
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tên file
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dung lượng
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {backups.map((backup) => (
                  <tr key={backup.filename} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">{backup.filename}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{backup.sizeFormatted}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(backup.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">{getTypeBadge(backup.type)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(backup.filename)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Tải xuống"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {cloudAvailable && (
                          <button
                            onClick={() => handleUploadToCloud(backup.filename)}
                            disabled={uploadingFile === backup.filename}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 transition-colors disabled:opacity-50"
                            title="Upload lên Google Drive"
                          >
                            {uploadingFile === backup.filename ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CloudUpload className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleRestore(backup.filename)}
                          disabled={restoring}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                          title="Khôi phục"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(backup.filename)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Xoá"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cloud Backup Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-cyan-600" />
            <h2 className="text-sm font-semibold text-gray-800">Google Drive</h2>
          </div>
          {cloudAvailable && (
            <button
              onClick={fetchCloudFiles}
              disabled={cloudLoading}
              className="text-xs text-gray-500 hover:text-[#1D9E75] transition-colors"
            >
              {cloudLoading ? "Đang tải..." : "Làm mới"}
            </button>
          )}
        </div>

        {!cloudAvailable ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <CloudOff className="w-10 h-10 mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">Cloud backup chưa sẵn sàng</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md text-center">
              Cài rclone và cấu hình remote &quot;gdrive&quot; để sử dụng.
              Chạy: <code className="bg-gray-100 px-1.5 py-0.5 rounded">rclone config</code>
            </p>
          </div>
        ) : cloudLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
            <span className="ml-2 text-sm text-gray-500">Đang tải từ cloud...</span>
          </div>
        ) : cloudFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Cloud className="w-10 h-10 mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">Chưa có file nào trên cloud</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tên file
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dung lượng
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ngày upload
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cloudFiles.map((file) => (
                  <tr key={file.filename} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">{file.filename}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{file.sizeFormatted}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(file.modTime)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmText="Xác nhận"
        cancelText="Huỷ"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
