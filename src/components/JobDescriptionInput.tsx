const MAX_LENGTH = 5000;
const WARN_THRESHOLD = 4500;

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function JobDescriptionInput({
  value,
  onChange,
  disabled = false,
}: JobDescriptionInputProps) {
  const charCount = value.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isNearLimit = charCount > WARN_THRESHOLD;

  const counterColor = isOverLimit
    ? "text-red-600"
    : isNearLimit
    ? "text-amber-500"
    : "text-gray-400";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="job-description"
        className="text-sm font-medium text-gray-700"
      >
        Mô tả công việc
      </label>

      <textarea
        id="job-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Nhập mô tả công việc (tuỳ chọn)..."
        rows={6}
        className={[
          "w-full resize-y rounded-lg border px-3 py-2 text-sm text-gray-900",
          "placeholder:text-gray-400 focus:outline-none focus:ring-2",
          isOverLimit
            ? "border-red-400 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-300",
          disabled ? "cursor-not-allowed bg-gray-100 opacity-60" : "bg-white",
        ]
          .filter(Boolean)
          .join(" ")}
      />

      <div className="flex items-start justify-between gap-2">
        {isNearLimit && !isOverLimit ? (
          <p className="text-xs text-amber-500">
            Gần đến giới hạn ký tự. Vui lòng rút gọn nội dung.
          </p>
        ) : isOverLimit ? (
          <p className="text-xs text-red-600">
            Vượt quá giới hạn {MAX_LENGTH.toLocaleString()} ký tự.
          </p>
        ) : (
          <span />
        )}

        <span className={`ml-auto shrink-0 text-xs tabular-nums ${counterColor}`}>
          {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
