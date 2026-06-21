import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import './HODDashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const HODDashboard = ({ isSidebarOpen, userId }) => {
  const [issueStats, setIssueStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
    onHold: 0,
    escalated: 0,
    closed: 0,
    total: 0,
  });

  const [userDepartment, setUserDepartment] = useState('');
  const [resolutionData, setResolutionData] = useState({ labels: [], values: [] });

  const fetchCountByStatus = async (status) => {
    try {
      const response = await fetch(`https://localhost:44328/api/ManageLogs/CountLogsByStatus/${status}`);
      const data = await response.json();
      return data.isSuccess ? data.result : 0;
    } catch (err) {
      console.error(`Error fetching ${status} count`, err);
      return 0;
    }
  };

  const fetchRecentUserDepartment = async (userId) => {
    try {
      const response = await fetch(`https://localhost:44328/api/ManageLogs/RecentDepartment/${userId}`);
      const data = await response.json();
      return data.isSuccess ? data.result : 'N/A';
    } catch (err) {
      console.error("Error fetching recent department", err);
      return 'N/A';
    }
  };

  const fetchResolutionTimes = async () => {
    try {
      const response = await fetch(`https://localhost:44328/api/TechnicianPerformance/GetAverageResolutionTime`);
      const data = await response.json();

      if (Array.isArray(data)) {
        const labels = data.map((item) => item.name);
        const values = data.map((item) => parseFloat(item.resolutionTime));
        setResolutionData({ labels, values });
      }
    } catch (error) {
      console.error("Error fetching resolution time data", error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          pending,
          inProgress,
          resolved,
          onHold,
          escalated,
          closed,
          userDept,
        ] = await Promise.all([
          fetchCountByStatus("Pending"),
          fetchCountByStatus("InProgress"),
          fetchCountByStatus("Resolved"),
          fetchCountByStatus("OnHold"),
          fetchCountByStatus("Escalated"),
          fetchCountByStatus("Closed"),
          fetchRecentUserDepartment(userId),
        ]);

        setIssueStats({
          pending,
          inProgress,
          resolved,
          onHold,
          escalated,
          closed,
          total: pending + inProgress + resolved + onHold + escalated + closed,
        });

        setUserDepartment(userDept);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      }
    };

    fetchDashboardData();
    fetchResolutionTimes();
  }, [userId]);

  const barData = {
    labels: resolutionData.labels,
    datasets: [
      {
        label: 'Average Resolution Time (days)',
        data: resolutionData.values,
        backgroundColor: '#2FB00F',
      },
    ],
  };

  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.2)' },
      },
      x: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.2)' },
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'white' },
      },
      tooltip: { bodyColor: 'white' },
    },
  };

  const pieData = {
    labels: ['Resolved', 'Pending', 'In Progress', 'On Hold', 'Escalated', 'Closed'],
    datasets: [
      {
        label: '# of Issues',
        data: [
          issueStats.resolved,
          issueStats.pending,
          issueStats.inProgress,
          issueStats.onHold,
          issueStats.escalated,
          issueStats.closed,
        ],
        backgroundColor: ['#2FB00F', '#D01E1E', '#B08D0F', '#0C4643', '#861657', '#005F73'],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        labels: { color: 'white' },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const value = context.parsed;
            const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
        bodyColor: 'white',
      },
    },
  };

  return (
    <div className={`dashboard-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <h1>Welcome, ADMIN!</h1>

      <div className="overview">
        <div className="stats-card">
          <h3>All Issues</h3>
          <p>{issueStats.total}</p>
        </div>
        <div className="stats-card">
          <h3>Open Issues</h3>
          <p>{issueStats.pending + issueStats.onHold + issueStats.inProgress}</p>
        </div>
        <div className="stats-card">
          <h3>Closed Issues</h3>
          <p>{issueStats.closed}</p>
        </div>
        <div className="stats-card">
            <h3>Escalated issues</h3>
            <p>{issueStats.escalated}</p>
          </div>
      </div>

      <div className="charts">
        <div className="bar-chart">
          <h3>Average Resolution Time</h3>
          <Bar data={barData} options={barOptions} />
        </div>

        <div className="pie-chart">
          <h3>Issue Summary</h3>
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
