import type { OverallClassification, MatchClassification } from '../types';

interface StatusBadgeProps {
  classification: OverallClassification | MatchClassification | null;
}

const badgeStyles: Record<string, string> = {
  // OverallClassification
  'Xuất sắc': 'bg-green-100 text-green-800 border border-green-200',
  'Khá tốt': 'bg-blue-100 text-blue-800 border border-blue-200',
  'Cần cải thiện': 'bg-amber-100 text-amber-800 border border-amber-200',
  'Cần cải thiện đáng kể': 'bg-red-100 text-red-800 border border-red-200',
  // MatchClassification
  'Cao': 'bg-green-100 text-green-800 border border-green-200',
  'Trung bình': 'bg-amber-100 text-amber-800 border border-amber-200',
  'Thấp': 'bg-red-100 text-red-800 border border-red-200',
};

export default function StatusBadge({ classification }: StatusBadgeProps) {
  if (classification === null || classification === undefined) {
    return <span className="text-gray-400 text-sm">-</span>;
  }

  const style = badgeStyles[classification] ?? 'bg-gray-100 text-gray-600 border border-gray-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {classification}
    </span>
  );
}
