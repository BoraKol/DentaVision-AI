import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { RiskProfile } from '../../core/domain/entities/AnalysisResult';

interface RiskChartProps {
  data: RiskProfile;
}

const RiskChart: React.FC<RiskChartProps> = ({ data }) => {
  const chartData = [
    { subject: 'Caries Risk', A: data.caries, fullMark: 100 },
    { subject: 'Perio Risk', A: data.perio, fullMark: 100 },
    { subject: 'Oral Cancer', A: data.oralCancer, fullMark: 100 },
    { subject: 'Hygiene', A: 100 - data.hygiene, fullMark: 100 }, // Invert hygiene (High score = bad hygiene for risk chart)
    { subject: 'Diet Risk', A: data.diet, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Patient Risk"
            dataKey="A"
            stroke="#0d9488"
            fill="#14b8a6"
            fillOpacity={0.5}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskChart;