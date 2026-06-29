/**
 * TypeScript interfaces cho CV Reviewer.
 * Phải khớp chính xác với Pydantic models trong backend/models/schemas.py
 */

/**
 * Phân loại điểm tổng thể của CV.
 * Tương ứng với OverallClassification enum trong backend.
 */
export type OverallClassification =
  | "Cần cải thiện đáng kể"  // 0–49
  | "Cần cải thiện"           // 50–69
  | "Khá tốt"                 // 70–84
  | "Xuất sắc";               // 85–100

/**
 * Phân loại mức độ phù hợp với Job Description.
 * Tương ứng với MatchClassification enum trong backend.
 */
export type MatchClassification = "Thấp" | "Trung bình" | "Cao";

/**
 * Danh mục của từng đề xuất cải thiện.
 * Tương ứng với RecommendationCategory enum trong backend.
 */
export type RecommendationCategory =
  | "Kỹ năng"
  | "Cấu trúc"
  | "Nội dung"
  | "Phù hợp với công việc";

/**
 * Một đề xuất cải thiện CV cụ thể.
 * Tương ứng với Recommendation model trong backend.
 */
export interface Recommendation {
  category: RecommendationCategory;
  /** Mức độ ưu tiên, 1 là cao nhất */
  priority: number;
  /** Tiêu đề ngắn gọn của đề xuất */
  title: string;
  /** Hành động cụ thể người dùng cần thực hiện */
  action: string;
}

/**
 * Điểm số phân tích CV theo các tiêu chí.
 * Tương ứng với Scores model trong backend.
 */
export interface Scores {
  /** Điểm kỹ năng (0–100), null nếu chưa có dữ liệu */
  skill_score: number | null;
  /** Điểm cấu trúc (0–100), null nếu chưa có dữ liệu */
  structure_score: number | null;
  /** Điểm nội dung (0–100), null nếu chưa có dữ liệu */
  content_score: number | null;
  /** Điểm tổng thể (0–100), null nếu chưa có dữ liệu */
  overall_score: number | null;
  /** Điểm phù hợp với JD (0–100), null nếu không có JD */
  match_score: number | null;
  /** Phân loại tổng thể, null nếu chưa có dữ liệu */
  overall_classification: OverallClassification | null;
  /** Phân loại mức độ phù hợp, null nếu không có JD */
  match_classification: MatchClassification | null;
}

/**
 * Báo cáo phân tích CV đầy đủ.
 * Tương ứng với AnalysisReport model trong backend.
 */
export interface AnalysisReport {
  scores: Scores;
  /** Kỹ năng có trong JD nhưng thiếu trong CV */
  missing_skills: string[];
  /** Danh sách đề xuất cải thiện, tối đa 10 items, đã sắp xếp theo priority */
  recommendations: Recommendation[];
  /** True nếu phân tích có kèm theo Job Description */
  has_job_description: boolean;
  /** Điểm theo từng tiêu chí tuyển chọn */
  criteria_scores: Record<string, number>;
  /** Danh sách tiêu chí đã dùng */
  criteria: string[];
}

/**
 * Trạng thái và kết quả của một CV session.
 * Tương ứng với response từ GET /api/sessions/{session_id}.
 */
export interface SessionStatus {
  session_id: string;
  /** Trạng thái hiện tại của session */
  status: "pending" | "analyzing" | "complete" | "error";
  /** Kết quả phân tích, null khi chưa hoàn thành */
  report: AnalysisReport | null;
  /** Thông báo lỗi nếu status là 'error', null nếu không có lỗi */
  error: string | null;
}
