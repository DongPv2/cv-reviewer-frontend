import type { OverallClassification, MatchClassification } from '../types';
import StatusBadge from './StatusBadge';

interface ScoreCardProps {
  label: string;
  score: number | null;
  classification?: OverallClassification | MatchClassification | null;
}

export default function ScoreCard({ label, score, classification }: ScoreCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</span>

      <div className="flex items-end justify-between gap-2">
        {score !== null && score !== undefined ? (
          <span className="text-3xl font-bold text-gray-900">{score}</span>
        ) : (
          <span className="text-sm text-gray-400 italic">Không có dữ liệu</span>
        )}

        {score !== null && score !== undefined && (
          <span className="text-sm text-gray-400 mb-1">/ 100</span>
        )}
      </div>

      {classification !== undefined && (
        <div className="mt-1">
          <StatusBadge classification={classification ?? null} />
        </div>
      )}
    </div>
  );
}
