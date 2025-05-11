import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',  // Blue
          'rgba(16, 185, 129, 0.7)',  // Green
          'rgba(245, 158, 11, 0.7)',  // Yellow
          'rgba(239, 68, 68, 0.7)',   // Red
          'rgba(139, 92, 246, 0.7)',  // Purple
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-full">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart; 