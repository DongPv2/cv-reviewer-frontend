import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAnalysis from "../hooks/useAnalysis";
import { exportPDF } from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import ScoreChart from "../components/ScoreChart";
import ScoreCard from "../components/ScoreCard";
import StatusBadge from "../components/StatusBadge";
import RecommendationList from "../components/RecommendationList";

/**
 * Kiểm tra lỗi có phải do session hết hạn / không tồn tại không.
 */
function isSessionExpiredError(message: string): boolean {
  return (
    message.includes("404") ||
    message.includes("không tồn tại") ||
    message.includes("hết hạn")
  );
}

export default function DashboardPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { report, status, error, isLoading } = useAnalysis(sessionId ?? null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // --- PDF Export ---
  async function handleExportPDF() {
    if (!sessionId) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const blob = await exportPDF(sessionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-report-${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Xuất PDF thất bại. Vui lòng thử lại.";
      setExportError(message);
    } finally {
      setIsExporting(false);
    }
  }

  // --- 1. Loading state ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <LoadingOverlay message="Đang phân tích CV, vui lòng chờ..." />
        </div>
      </div>
    );
  }

  // --- 2. Error state ---
  if (error || status === "error") {
    const errorMessage = error ?? "Đã xảy ra lỗi trong quá trình phân tích.";
    const isExpired = isSessionExpiredError(errorMessage);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          {/* Banner lỗi session hết hạn — style đặc biệt */}
          {isExpired ? (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">⏰</span>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-amber-800 mb-1">
                    Phiên làm việc đã hết hạn
                  </h2>
                  <p className="text-sm text-amber-700 mb-4">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    Upload CV mới
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Banner lỗi thông thường */
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">⚠️</span>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-red-800 mb-1">
                    Phân tích thất bại
                  </h2>
                  <p className="text-sm text-red-700 mb-4">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Upload CV mới
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 3. Complete state with report ---
  if (status === "complete" && report) {
    const { scores, recommendations } = report;
    const hasMatchScore =
      scores.match_score !== null && scores.match_score !== undefined;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kết quả phân tích CV</h1>
              <p className="text-sm text-gray-500 mt-1">
                Session:{" "}
                <span className="font-mono text-gray-700">{sessionId}</span>
              </p>
            </div>

            {/* Overall status badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Đánh giá tổng thể:</span>
              <StatusBadge classification={scores.overall_classification} />
            </div>
          </div>

          {/* Score Chart — full width */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Biểu đồ điểm số
            </h2>
            <ScoreChart scores={scores} criteriaScores={report.criteria_scores} />
          </section>

          {/* Score Cards grid */}
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">
              Chi tiết điểm số
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ScoreCard
                label="Kỹ năng"
                score={scores.skill_score}
              />
              <ScoreCard
                label="Cấu trúc"
                score={scores.structure_score}
              />
              <ScoreCard
                label="Nội dung"
                score={scores.content_score}
              />
              <ScoreCard
                label="Tổng thể"
                score={scores.overall_score}
                classification={scores.overall_classification}
              />
              {hasMatchScore && (
                <ScoreCard
                  label="Phù hợp với JD"
                  score={scores.match_score}
                  classification={scores.match_classification}
                />
              )}
            </div>
          </section>

          {/* Recommendations */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Đề xuất cải thiện
            </h2>
            <RecommendationList recommendations={recommendations} />
          </section>

          {/* Actions */}
          <section className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* PDF Export button */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isExporting ? (
                <>
                  <span
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  Đang xuất...
                </>
              ) : (
                <>
                  <span aria-hidden="true">📄</span>
                  Tải xuống PDF
                </>
              )}
            </button>

            {/* Upload mới */}
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Upload CV mới
            </button>
          </section>

          {/* Export error */}
          {exportError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
              <span className="text-red-500 text-sm" aria-hidden="true">✕</span>
              <div className="flex-1">
                <p className="text-sm text-red-700">{exportError}</p>
                <button
                  onClick={handleExportPDF}
                  className="mt-1 text-xs text-red-600 underline hover:text-red-800 focus:outline-none"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 4. Fallback: pending/analyzing (không nên hiển thị lâu) ---
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <LoadingOverlay message="Đang chờ kết quả phân tích..." />
      </div>
    </div>
  );
}
