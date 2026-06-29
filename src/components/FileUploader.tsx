import { useRef, useState, useCallback } from "react";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"] as const;
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

function isValidFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  return (
    ACCEPTED_EXTENSIONS.includes(ext as (typeof ACCEPTED_EXTENSIONS)[number]) ||
    ACCEPTED_MIME_TYPES.includes(file.type)
  );
}

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  error?: string | null;
}

export default function FileUploader({
  onFileSelect,
  disabled = false,
  error,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!isValidFile(file)) {
        setLocalError(
          `Định dạng file không hợp lệ. Chỉ chấp nhận: ${ACCEPTED_EXTENSIONS.join(", ")}`
        );
        setSelectedFile(null);
        onFileSelect(null);
        return;
      }
      setLocalError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input value so the same file can be re-selected if needed
    e.target.value = "";
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setLocalError(null);
    onFileSelect(null);
  };

  const displayError = localError || error;

  const dropZoneBase =
    "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors duration-200 cursor-pointer select-none";

  const dropZoneVariant = disabled
    ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
    : isDragOver
    ? "border-blue-500 bg-blue-50"
    : displayError
    ? "border-red-400 bg-red-50 hover:bg-red-100"
    : selectedFile
    ? "border-green-400 bg-green-50 hover:bg-green-100"
    : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50";

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        role="button"
        aria-disabled={disabled}
        aria-label="Khu vực tải lên file CV"
        tabIndex={disabled ? -1 : 0}
        className={`${dropZoneBase} ${dropZoneVariant}`}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          disabled={disabled}
          onChange={handleInputChange}
          aria-hidden="true"
        />

        {selectedFile ? (
          <>
            {/* File icon */}
            <svg
              className="h-10 w-10 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-800">
                {selectedFile.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>

            {/* Remove button */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="mt-1 rounded-md px-3 py-1 text-xs font-medium text-red-600 ring-1 ring-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Xoá file đã chọn"
              >
                Xoá file
              </button>
            )}
          </>
        ) : (
          <>
            {/* Upload icon */}
            <svg
              className={`h-10 w-10 ${isDragOver ? "text-blue-500" : "text-gray-400"}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {isDragOver ? (
                  "Thả file vào đây"
                ) : (
                  <>
                    Kéo thả file vào đây, hoặc{" "}
                    <span className="text-blue-600 underline underline-offset-2">
                      nhấn để chọn file
                    </span>
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Định dạng hỗ trợ: PDF, DOCX, TXT
              </p>
            </div>
          </>
        )}
      </div>

      {/* Error message */}
      {displayError && (
        <p
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-sm text-red-600"
        >
          <svg
            className="h-4 w-4 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          {displayError}
        </p>
      )}
    </div>
  );
}
