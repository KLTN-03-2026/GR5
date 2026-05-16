export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Chạy check hết hạn khi server khởi động, sau đó mỗi 24h
    const runCheckExpiry = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
        const secret = process.env.CRON_SECRET;
        if (!secret) return;

        const res = await fetch(`${baseUrl}/api/cron/check-expiry`, {
          headers: { "x-cron-secret": secret },
        });
        const data = await res.json();
        console.log("[CRON] Check expiry:", data.message || data.error);
      } catch (e: any) {
        console.log("[CRON] Check expiry failed:", e.message);
      }
    };

    // Delay 10s sau khi server start để đảm bảo routes đã sẵn sàng
    setTimeout(runCheckExpiry, 10000);
    // Lặp lại mỗi 24h
    setInterval(runCheckExpiry, 24 * 60 * 60 * 1000);
  }
}
