"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Dataset = {
  label: string;
  values: number[];
};

type AdminLineChartProps = {
  labels: string[];
  datasets: Dataset[];
};

export default function AdminLineChart({
  labels,
  datasets,
}: AdminLineChartProps) {
  const data = {
    labels,
    datasets: datasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.values,
      tension: 0.3,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: datasets.length > 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}