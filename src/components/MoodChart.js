// src/components/MoodChart.js
import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const MoodTrendChart = ({ checkins, timeframe = '7days' }) => {
  const processCheckins = () => {
    if (!checkins || checkins.length === 0) return { labels: [], datasets: [] };

    // Sort by timestamp
    const sortedCheckins = [...checkins].sort((a, b) => {
      const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp);
      const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp);
      return dateA - dateB;
    });

    // Group by day
    const dailyMoods = {};
    sortedCheckins.forEach(checkin => {
      const date = (checkin.timestamp?.toDate?.() || new Date(checkin.timestamp)).toLocaleDateString();
      if (!dailyMoods[date]) {
        dailyMoods[date] = [];
      }
      dailyMoods[date].push(checkin.mood);
    });

    // Calculate daily averages
    const labels = Object.keys(dailyMoods);
    const moodAverages = labels.map(date => {
      const moods = dailyMoods[date];
      return moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    });

    return {
      labels: labels.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Daily Mood Average',
        data: moodAverages,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1976d2',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y.toFixed(1);
            const emoji = value >= 4 ? '😄' : value >= 3 ? '😐' : value >= 2 ? '😕' : '😢';
            return `Mood: ${value}/5 ${emoji}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            const emojis = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
            return `${value} ${emojis[value] || ''}`;
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false
    }
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: 16
    }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>📈 Mood Trend</h4>
      {checkins && checkins.length > 0 ? (
        <Line data={processCheckins()} options={options} />
      ) : (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: '#666'
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <p>Start tracking your mood to see trends here</p>
        </div>
      )}
    </div>
  );
};

const MoodDistributionChart = ({ checkins }) => {
  const processDistribution = () => {
    if (!checkins || checkins.length === 0) return { labels: [], datasets: [] };

    const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    checkins.forEach(checkin => {
      if (checkin.mood >= 1 && checkin.mood <= 5) {
        moodCounts[checkin.mood]++;
      }
    });

    return {
      labels: ['😢 Very Low', '😕 Low', '😐 Neutral', '😊 Good', '😄 Great'],
      datasets: [{
        data: Object.values(moodCounts),
        backgroundColor: [
          '#f44336',
          '#ff9800',
          '#ffc107',
          '#4caf50',
          '#2e7d32'
        ],
        borderWidth: 0
      }]
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: 16,
      height: 300
    }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>🎯 Mood Distribution</h4>
      {checkins && checkins.length > 0 ? (
        <div style={{ height: 220 }}>
          <Doughnut data={processDistribution()} options={options} />
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: '#666'
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🍩</div>
          <p>Complete more check-ins to see distribution</p>
        </div>
      )}
    </div>
  );
};

const WeeklyProgressChart = ({ checkins }) => {
  const processWeeklyData = () => {
    if (!checkins || checkins.length === 0) return { labels: [], datasets: [] };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = new Array(7).fill(null);

    // Get current week's data
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    checkins.forEach(checkin => {
      const checkinDate = checkin.timestamp?.toDate?.() || new Date(checkin.timestamp);
      const daysDiff = Math.floor((checkinDate - startOfWeek) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < 7) {
        if (weeklyData[daysDiff] === null) {
          weeklyData[daysDiff] = [];
        }
        weeklyData[daysDiff].push(checkin.mood);
      }
    });

    // Calculate daily averages, null for days without data
    const processedData = weeklyData.map(dayMoods => {
      if (!dayMoods || dayMoods.length === 0) return null;
      return dayMoods.reduce((sum, mood) => sum + mood, 0) / dayMoods.length;
    });

    return {
      labels: weekDays,
      datasets: [{
        label: 'This Week',
        data: processedData,
        backgroundColor: processedData.map(value => {
          if (value === null) return '#f5f5f5';
          if (value >= 4) return '#4caf50';
          if (value >= 3) return '#ffc107';
          if (value >= 2) return '#ff9800';
          return '#f44336';
        }),
        borderColor: '#1976d2',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.parsed.y === null) return 'No check-in';
            const value = context.parsed.y.toFixed(1);
            const emoji = value >= 4 ? '😄' : value >= 3 ? '😐' : value >= 2 ? '😕' : '😢';
            return `Average: ${value}/5 ${emoji}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0.5,
        max: 5.5,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            if (value === 0.5 || value === 5.5) return '';
            const emojis = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
            return emojis[value] || value;
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: 16
    }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>📅 This Week's Progress</h4>
      {checkins && checkins.length > 0 ? (
        <Bar data={processWeeklyData()} options={options} />
      ) : (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: '#666'
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
          <p>Complete daily check-ins to track weekly progress</p>
        </div>
      )}
    </div>
  );
};

export { MoodTrendChart, MoodDistributionChart, WeeklyProgressChart };
