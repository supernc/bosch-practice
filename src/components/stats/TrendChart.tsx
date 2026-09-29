import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ExamRecord } from '../../types';

interface TrendChartProps {
  examHistory: ExamRecord[];
}

export default function TrendChart({ examHistory }: TrendChartProps) {
  const data = examHistory.map((record, i) => ({
    name: `第${i + 1}次`,
    score: record.score,
    date: new Date(record.startTime).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-text-muted text-sm">
        暂无模考记录
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: '#8B949E', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#8B949E', fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#21283B',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#E6EDF3',
          }}
        />
        <ReferenceLine y={70} stroke="#F85149" strokeDasharray="5 5" label={{ value: '及格线 70', fill: '#F85149', fontSize: 10 }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#006EFF"
          strokeWidth={2}
          dot={{ fill: '#006EFF', r: 4 }}
          activeDot={{ r: 6, fill: '#58A6FF' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
