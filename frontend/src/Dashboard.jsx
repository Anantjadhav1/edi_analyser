// src/Dashboard.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function Dashboard({ results }) {
  // Don't show the dashboard if there are no results
  if (results.length === 0) {
    return null;
  }

  // 1. Count the occurrences of each message type
  const messageTypeCounts = results.reduce((acc, result) => {
    acc[result.messageType] = (acc[result.messageType] || 0) + 1;
    return acc;
  }, {});

  // 2. Prepare the data for the pie chart
  const chartData = {
    labels: Object.keys(messageTypeCounts),
    datasets: [
      {
        label: 'Message Types',
        data: Object.values(messageTypeCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Dashboard</h2>
      <div style={{ width: '250px', margin: 'auto' }}>
        <Pie data={chartData} />
      </div>
    </div>
  );
}