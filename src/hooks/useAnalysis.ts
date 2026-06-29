import { useState, useEffect, useRef } from "react";
import { getSession } from "../api/client";
import type { AnalysisReport, SessionStatus } from "../types";

/**
 * Custom hook để poll trạng thái phân tích CV từ backend.
 *
 * - Poll mỗi 3 giây khi status === "analyzing"
 * - Dừng poll khi status === "complete" | "error"
 * - Retry với exponential backoff khi poll thất bại (tối đa 3 lần)
 * - Cleanup timeout khi unmount hoặc sessionId thay đổi
 */
function useAnalysis(sessionId: string | null): {
  report: AnalysisReport | null;
  status: SessionStatus["status"] | null;
  error: string | null;
  isLoading: boolean;
} {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [status, setStatus] = useState<SessionStatus["status"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Ref để giữ timeout ID — dùng để cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref để tránh set state sau khi unmount hoặc sessionId đã đổi
  const activeRef = useRef<boolean>(false);

  useEffect(() => {
    // Không có sessionId → reset về trạng thái rỗng, không làm gì
    if (!sessionId) {
      setReport(null);
      setStatus(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Đánh dấu effect này còn active
    activeRef.current = true;
    setIsLoading(true);
    setError(null);
    setReport(null);
    setStatus(null);

    /**
     * Kiểm tra xem message lỗi có phải là session hết hạn / không tồn tại không.
     */
    function isSessionExpiredError(message: string): boolean {
      return (
        message.includes("404") ||
        message.includes("không tồn tại") ||
        message.includes("hết hạn")
      );
    }

    /**
     * Lên lịch poll tiếp theo sau `delayMs` milliseconds.
     * Nếu effect không còn active thì bỏ qua.
     */
    function scheduleNext(delayMs: number, attempt: number): void {
      timeoutRef.current = setTimeout(() => {
        if (activeRef.current) {
          poll(attempt);
        }
      }, delayMs);
    }

    /**
     * Gọi getSession và xử lý kết quả / lỗi.
     * `attempt` — số lần retry đã thực hiện (0 = lần đầu tiên sau lần poll bình thường)
     */
    async function poll(attempt: number = 0): Promise<void> {
      try {
        const session = await getSession(sessionId!);

        if (!activeRef.current) return;

        setStatus(session.status);
        setReport(session.report);

        if (session.status === "complete") {
          setIsLoading(false);
          return; // Dừng polling
        }

        if (session.status === "error") {
          setError(session.error ?? "Đã xảy ra lỗi trong quá trình phân tích.");
          setIsLoading(false);
          return; // Dừng polling
        }

        // status === "analyzing" | "pending" → tiếp tục poll sau 3 giây
        scheduleNext(3000, 0);
      } catch (err) {
        if (!activeRef.current) return;

        const message = err instanceof Error ? err.message : String(err);

        // Session hết hạn → dừng ngay, không retry
        if (isSessionExpiredError(message)) {
          setError("Phiên làm việc đã hết hạn. Vui lòng upload lại CV.");
          setIsLoading(false);
          return;
        }

        // Còn retry → exponential backoff: 3 * 2^attempt ms
        if (attempt < 3) {
          const delay = 3000 * Math.pow(2, attempt);
          scheduleNext(delay, attempt + 1);
        } else {
          // Hết retry → báo lỗi
          setError(message || "Không thể kết nối đến máy chủ. Vui lòng thử lại.");
          setIsLoading(false);
        }
      }
    }

    // Fetch lần đầu ngay khi mount / sessionId thay đổi
    poll(0);

    // Cleanup: huỷ timeout, đánh dấu effect không còn active
    return () => {
      activeRef.current = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [sessionId]);

  return { report, status, error, isLoading };
}

export default useAnalysis;
