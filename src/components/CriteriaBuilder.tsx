import { useState, useRef } from "react";
import type { Criterion } from "../hooks/useCriteria";

interface CriteriaBuilderProps {
  criteria: Criterion[];
  onToggle: (id: string) => void;
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export default function CriteriaBuilder({
  criteria,
  onToggle,
  onAdd,
  onRemove,
  disabled = false,
}: CriteriaBuilderProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd(input);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const checkedCount = criteria.filter((c) => c.checked).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Label + counter */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Tiêu chí tuyển chọn
        </label>
        <span className="text-xs text-gray-400">
          {checkedCount} / {criteria.length} đã chọn
        </span>
      </div>

      {/* Criteria list */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 max-h-60 overflow-y-auto">
        {criteria.length === 0 && (
          <p className="px-4 py-3 text-sm text-gray-400 italic">
            Chưa có tiêu chí nào. Thêm tiêu chí bên dưới.
          </p>
        )}
        {criteria.map((c) => (
          <div
            key={c.id}
            className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
              disabled ? "opacity-60" : "hover:bg-gray-50"
            }`}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              id={`criterion-${c.id}`}
              checked={c.checked}
              onChange={() => !disabled && onToggle(c.id)}
              disabled={disabled}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
            />

            {/* Label */}
            <label
              htmlFor={`criterion-${c.id}`}
              className={`flex-1 text-sm select-none ${
                c.checked ? "text-gray-800 font-medium" : "text-gray-400 line-through"
              } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              {c.label}
            </label>

            {/* Remove button */}
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(c.id)}
                aria-label={`Xóa tiêu chí "${c.label}"`}
                className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add new criterion */}
      {!disabled && (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Thêm tiêu chí mới (Enter để thêm)..."
            maxLength={100}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!input.trim()}
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Thêm
          </button>
        </div>
      )}

      {checkedCount === 0 && criteria.length > 0 && (
        <p className="text-xs text-amber-500">
          Chưa chọn tiêu chí nào — CV sẽ được đánh giá theo tiêu chí chung.
        </p>
      )}
    </div>
  );
}
