import axios from "axios";
import type { SessionStatus } from "../types";

/**
 * Axios instance dùng chung cho toàn bộ API calls.
 * baseURL trỏ tới FastAPI backend chạy ở port 8000.
 */
const apiClient = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 60_000, // 60 giây — phù hợp với thời gian AI analysis
});

/**
 * Response interceptor: parse lỗi từ FastAPI HTTPException.
 * FastAPI trả về { detail: string } khi gặp HTTPException.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const detail = error.response.data.detail;
      if (detail) {
        return Promise.reject(new Error(String(detail)));
      }
    }
    // Fallback: dùng message gốc hoặc message mặc định
    const message =
      axios.isAxiosError(error) && error.message
        ? error.message
        : "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";
    return Promise.reject(new Error(message));
  }
);

/**
 * Tạo session mới bằng cách upload CV (và tuỳ chọn JD).
 * POST /api/sessions — multipart/form-data
 */
export async function createSession(
  formData: FormData
): Promise<{ session_id: string; status: string }> {
  const response = await apiClient.post<{ session_id: string; status: string }>(
    "/api/sessions",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

/**
 * Lấy trạng thái và kết quả phân tích của một session.
 * GET /api/sessions/{sessionId}
 */
export async function getSession(sessionId: string): Promise<SessionStatus> {
  const response = await apiClient.get<SessionStatus>(
    `/api/sessions/${sessionId}`
  );
  return response.data;
}

/**
 * Xuất báo cáo phân tích ra file PDF.
 * GET /api/sessions/{sessionId}/export — trả về Blob
 */
export async function exportPDF(sessionId: string): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/api/sessions/${sessionId}/export`,
    {
      responseType: "blob",
    }
  );
  return response.data;
}

/**
 * Xoá session và dữ liệu liên quan.
 * DELETE /api/sessions/{sessionId}
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/api/sessions/${sessionId}`);
}
