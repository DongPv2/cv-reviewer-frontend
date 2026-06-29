import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import CriteriaBuilder from "../components/CriteriaBuilder";
import JobDescriptionInput from "../components/JobDescriptionInput";
import { useCriteria } from "../hooks/useCriteria";
import { createSession } from "../api/client";

export default function UploadPage() {
  const navigate = useNavigate();
  const { criteria, toggle, add, remove, checkedLabels } = useCriteria();

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isSubmitDisabled = !file || isUploading || jobDescription.length > 5000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file as File);

      if (jobDescription.trim()) {
        formData.append("job_description", jobDescription.trim());
      }

      if (checkedLabels.length > 0) {
        formData.append("criteria", JSON.stringify(checkedLabels));
      }

      const result = await createSession(formData);
      navigate(`/dashboard/${result.session_id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi không xác định. Vui lòng thử lại."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Đánh giá CV của bạn</h1>
          <p className="mt-2 text-gray-500">
            Tải lên CV, chọn tiêu chí và nhận phân tích chi tiết từ AI.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8 space-y-6"
          noValidate
        >
          {/* 1. File uploader */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              CV của bạn <span className="text-red-500">*</span>
            </label>
            <FileUploader onFileSelect={setFile} disabled={isUploading} />
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* 2. Job Description */}
          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
            disabled={isUploading}
          />

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* 3. Criteria */}
          <CriteriaBuilder
            criteria={criteria}
            onToggle={toggle}
            onAdd={add}
            onRemove={remove}
            disabled={isUploading}
          />

          {/* Inline error */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={[
              "w-full rounded-xl px-6 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
              isSubmitDisabled
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
            ].join(" ")}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang tải lên...
              </span>
            ) : (
              "Phân tích CV"
            )}
          </button>

          {!file && !isUploading && (
            <p className="text-center text-xs text-gray-400">
              Bạn cần chọn file CV trước khi gửi.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
