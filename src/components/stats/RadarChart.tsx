import { Radar, RadarChart as ReRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface RadarChartProps {
  data: { name: string; value: number; fullMark: number }[];
}

export default function RadarChart({ data }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ReRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="name"
          tick={{ fill: '#8B949E', fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#484F58', fontSize: 10 }}
        />
        <Radar
          name="掌握度"
          dataKey="value"
          stroke="#006EFF"
          fill="#006EFF"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
