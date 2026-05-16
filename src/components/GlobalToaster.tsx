"use client";

import { Toaster } from "react-hot-toast";

export function GlobalToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          maxWidth: 420,
          padding: "14px 18px",
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 500,
          color: "#374151",
          background: "#fff",
          boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
        },
        success: {
          style: { border: "1px solid #bbf7d0" },
          iconTheme: { primary: "#16a34a", secondary: "#f0fdf4" },
        },
        error: {
          duration: 5000,
          style: { border: "1px solid #fecaca" },
          iconTheme: { primary: "#dc2626", secondary: "#fef2f2" },
        },
      }}
    />
  );
}
