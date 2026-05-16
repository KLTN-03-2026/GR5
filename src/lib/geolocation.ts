export interface GeoResponse {
  success: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  error?: string;
  errorCode?: number;
}

export async function getCurrentPosition(): Promise<GeoResponse> {
  if (!navigator.geolocation) {
    return { success: false, error: "Trình duyệt không hỗ trợ GPS", errorCode: 0 };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          success: true,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Vui lòng cấp quyền vị trí để chấm công",
          2: "Không thể xác định vị trí. Kiểm tra GPS",
          3: "Hết thời gian xác định vị trí",
        };
        resolve({
          success: false,
          error: messages[err.code] || "Lỗi GPS không xác định",
          errorCode: err.code,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
