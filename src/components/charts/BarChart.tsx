import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: Array<{
    [key: string]: string | number;
  }>;
  keys: string[];
  indexBy: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, keys, indexBy }) => {
  const chartData = {
    labels: data.map(item => item[indexBy]),
    datasets: keys.map((key, index) => ({
      label: key,
      data: data.map(item => item[key]),
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',  // Blue
        'rgba(16, 185, 129, 0.7)',  // Green
        'rgba(245, 158, 11, 0.7)',  // Yellow
        'rgba(239, 68, 68, 0.7)',   // Red
        'rgba(139, 92, 246, 0.7)',  // Purple
      ][index],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)',
      ][index],
      borderWidth: 1,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart; 