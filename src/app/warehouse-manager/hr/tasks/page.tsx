"use client";

import { useEffect, useState } from "react";

type Task = {
  id: number;
  tieu_de: string;
  mo_ta: string;
  trang_thai: "TODO" | "IN_PROGRESS" | "DONE";
  han_hoan_thanh: string | null;
  nguoi_dung: { ho_so_nguoi_dung: { ho_ten: string } };
};

const COLUMNS = [
  {
    id: "TODO",
    title: "Cần làm",
    color: "bg-gray-100 border-gray-200 text-gray-700",
  },
  {
    id: "IN_PROGRESS",
    title: "Đang làm",
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    id: "DONE",
    title: "Hoàn thành",
    color: "bg-green-50 border-green-200 text-green-700",
  },
];

export default function KanbanBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  const fetchTasks = async () => {
    const res = await fetch("/api/task");
    const result = await res.json();
    if (result.success) setTasks(result.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // --- LOGIC KÉO THẢ (DRAG & DROP) ---
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Cần thiết để cho phép Drop
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    // Cập nhật UI ngay lập tức để tạo cảm giác mượt mà (Optimistic UI)
    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggedTaskId ? { ...t, trang_thai: newStatus as any } : t,
      ),
    );

    // Gọi API cập nhật ngầm
    await fetch(`/api/task/${draggedTaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trang_thai: newStatus }),
    });
    setDraggedTaskId(null);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kanban Giao Việc</h1>
          <p className="text-gray-500">
            Quản lý và theo dõi tiến độ công việc nhân viên
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium shadow-sm hover:bg-blue-700">
          + Giao việc mới
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">
          Đang tải bảng công việc...
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex-1 min-w-[300px] border rounded-xl flex flex-col ${col.color}`}
            >
              <div className="p-4 border-b border-inherit font-bold flex justify-between items-center">
                {col.title}
                <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm">
                  {tasks.filter((t) => t.trang_thai === col.id).length}
                </span>
              </div>

              <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {tasks
                  .filter((t) => t.trang_thai === col.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-bold text-gray-800 mb-1">
                        {task.tieu_de}
                      </h4>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {task.mo_ta}
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        <div className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {task.nguoi_dung?.ho_so_nguoi_dung?.ho_ten ||
                            "Unassigned"}
                        </div>
                        {task.han_hoan_thanh && (
                          <div className="text-red-500 font-medium">
                            {new Date(task.han_hoan_thanh).toLocaleDateString(
                              "vi-VN",
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
