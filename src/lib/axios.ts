import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Định nghĩa kiểu dữ liệu trả về mặc định từ API (tùy chỉnh theo format backend của bạn sau này)
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- REQUEST INTERCEPTOR ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage (chỉ chạy trên Client)
    // Nếu gọi API ở Server Components, bạn sẽ cần truyền token qua cookies() của Next.js
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR ---
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về thẳng data để lúc gọi API không cần phải .data.data nữa
    return response.data;
  },
  (error: AxiosError<ApiResponse>) => {
    // Xử lý lỗi global ở đây
    if (error.response) {
      const status = error.response.status;

      // Xử lý hết hạn token (401 Unauthorized)
      if (status === 401) {
        console.error('Token hết hạn hoặc không hợp lệ. Đang đăng xuất...');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          // Có thể tự động redirect về trang login: 
          // window.location.href = '/login';
        }
      }

      // Xử lý lỗi không có quyền truy cập (403 Forbidden)
      if (status === 403) {
        console.error('Bạn không có quyền thực hiện hành động này.');
      }
      
      // Có thể dùng thư viện toast (như sonner hoặc react-toastify) để show thông báo lỗi ở đây
    } else if (error.request) {
      console.error('Lỗi mạng: Không thể kết nối tới server.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;