import type { Recommendation, RecommendationCategory } from '../types';

interface RecommendationListProps {
  recommendations: Recommendation[];
}

const categoryStyles: Record<RecommendationCategory, string> = {
  'Kỹ năng': 'bg-blue-100 text-blue-700',
  'Cấu trúc': 'bg-purple-100 text-purple-700',
  'Nội dung': 'bg-green-100 text-green-700',
  'Phù hợp với công việc': 'bg-orange-100 text-orange-700',
};

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <p className="text-gray-400 text-sm italic py-4">Không có đề xuất nào.</p>
    );
  }

  const sorted = [...recommendations].sort((a, b) => a.priority - b.priority);

  return (
    <ol className="flex flex-col gap-3">
      {sorted.map((rec, index) => (
        <li
          key={index}
          className="flex items-start gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3 shadow-sm"
        >
          {/* Priority number */}
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center mt-0.5">
            {rec.priority}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {/* Category chip */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  categoryStyles[rec.category] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {rec.category}
              </span>

              {/* Title */}
              <span className="text-sm font-semibold text-gray-800">{rec.title}</span>
            </div>

            {/* Action */}
            <p className="text-xs text-gray-500 leading-relaxed">{rec.action}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
