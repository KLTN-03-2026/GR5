import toast from "react-hot-toast";

export function showError(message: string, title?: string) {
  toast.error(message, {
    duration: 5000,
    position: "top-center",
    style: {
      maxWidth: 420,
      padding: "16px 20px",
      borderRadius: 12,
      background: "#fff",
      border: "1px solid #fecaca",
      boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
      fontSize: 13,
      color: "#374151",
      fontWeight: 500,
    },
    iconTheme: { primary: "#dc2626", secondary: "#fef2f2" },
  });
}

export function showSuccess(message: string) {
  toast.success(message, {
    duration: 4000,
    position: "top-center",
    style: {
      maxWidth: 420,
      padding: "16px 20px",
      borderRadius: 12,
      background: "#fff",
      border: "1px solid #bbf7d0",
      boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
      fontSize: 13,
      color: "#374151",
      fontWeight: 500,
    },
    iconTheme: { primary: "#16a34a", secondary: "#f0fdf4" },
  });
}

export function showWarning(message: string) {
  toast(message, {
    duration: 5000,
    position: "top-center",
    icon: "⚠️",
    style: {
      maxWidth: 420,
      padding: "16px 20px",
      borderRadius: 12,
      background: "#fff",
      border: "1px solid #fde68a",
      boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
      fontSize: 13,
      color: "#374151",
      fontWeight: 500,
    },
  });
}

export function showInfo(message: string) {
  toast(message, {
    duration: 4000,
    position: "top-center",
    icon: "ℹ️",
    style: {
      maxWidth: 420,
      padding: "16px 20px",
      borderRadius: 12,
      background: "#fff",
      border: "1px solid #bfdbfe",
      boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
      fontSize: 13,
      color: "#374151",
      fontWeight: 500,
    },
  });
}
