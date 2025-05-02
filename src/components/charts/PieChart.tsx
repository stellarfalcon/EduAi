import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full">No data available</div>;
  }

  // Convert string values to numbers if needed
  const processedData = data.map(item => ({
    name: item.name,
    value: typeof item.value === 'string' ? parseInt(item.value) : item.value
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [
            `${value} users`,
            'Count'
          ]}
        />
        <Legend verticalAlign="bottom" height={36} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChart; 