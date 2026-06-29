import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Scores } from '../types';

interface ScoreChartProps {
  scores: Scores;
  criteriaScores?: Record<string, number>;
}

const BASE_SCORES: { key: keyof Scores; label: string; color: string }[] = [
  { key: 'skill_score', label: 'Kỹ năng', color: '#3b82f6' },
  { key: 'structure_score', label: 'Cấu trúc', color: '#8b5cf6' },
  { key: 'content_score', label: 'Nội dung', color: '#10b981' },
  { key: 'overall_score', label: 'Tổng thể', color: '#f59e0b' },
  { key: 'match_score', label: 'Phù hợp JD', color: '#ef4444' },
];

// Bảng màu cho tiêu chí tùy chỉnh
const CRITERIA_COLORS = [
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#a855f7',
  '#14b8a6', '#eab308', '#6366f1', '#22c55e', '#fb923c',
];

export default function ScoreChart({ scores, criteriaScores = {} }: ScoreChartProps) {
  const baseData = BASE_SCORES.filter(
    ({ key }) => scores[key] !== null && scores[key] !== undefined
  ).map(({ key, label, color }) => ({
    label,
    score: scores[key] as number,
    color,
  }));

  const criteriaData = Object.entries(criteriaScores).map(([label, score], i) => ({
    label,
    score,
    color: CRITERIA_COLORS[i % CRITERIA_COLORS.length],
  }));

  const data = [...baseData, ...criteriaData];

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Chưa có dữ liệu điểm số.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 40, left: 10, bottom: 5 }}
        barSize={22}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickCount={6}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={160}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number) => [`${value} điểm`, 'Điểm']}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '13px',
          }}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
        />
        <Bar dataKey="score" radius={[0, 6, 6, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
