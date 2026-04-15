"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date()); // Khởi tạo ở client để tránh lỗi hydration mismatch
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentTime) return null; // Placeholder khi đang load

  return (
    <div className="text-right">
      <div className="text-sm font-medium text-gray-500">
        {currentTime.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
      <div className="text-3xl font-mono font-bold text-blue-600">
        {currentTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>
    </div>
  );
}
