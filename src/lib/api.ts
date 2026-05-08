import apiClient, { ApiResponse } from './axios';

// Bọc các method HTTP lại và ép kiểu trả về
export const api = {
  get: <T>(url: string, params?: object) => 
    apiClient.get<any, ApiResponse<T>>(url, { params }),

  post: <T>(url: string, data: object, config?: object) => 
    apiClient.post<any, ApiResponse<T>>(url, data, config),

  put: <T>(url: string, data: object, config?: object) => 
    apiClient.put<any, ApiResponse<T>>(url, data, config),

  patch: <T>(url: string, data: object, config?: object) => 
    apiClient.patch<any, ApiResponse<T>>(url, data, config),

  delete: <T>(url: string, config?: object) => 
    apiClient.delete<any, ApiResponse<T>>(url, config),
};