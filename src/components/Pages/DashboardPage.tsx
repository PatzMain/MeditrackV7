import React, { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../../services/supabaseService';
import './DashboardPage.css';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalCategories: 0,
    criticalAlerts: 0
  });
  const [inventoryTrends, setInventoryTrends] = useState<any[]>([]);
  const [inventoryStatusData, setInventoryStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const inventory = await inventoryService.getAllItems();
      const lowStockItems = inventory.filter((item: any) => item.stock_quantity <= item.minimum_stock_level);

      const inventoryStatus = await inventoryService.getInventoryStatus();
      setInventoryStatusData(inventoryStatus);

      // Get unique categories
      const categories = Array.from(new Set(inventory.map((item: any) => item.classification)));

      setStats({
        totalItems: inventory.length,
        lowStockItems: lowStockItems.length,
        totalCategories: categories.length,
        criticalAlerts: lowStockItems.length
      });

      const weekTrends = generateWeeklyTrends();
      setInventoryTrends(weekTrends);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const generateWeeklyTrends = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trends = days.map(day => ({
      day,
      count: Math.floor(Math.random() * 20) + 10
    }));
    return trends;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-message">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems.toString(),
      change: `${stats.totalCategories} categories`,
      changeType: 'positive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <rect x="7" y="7" width="3" height="9" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="7" width="3" height="5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems.toString(),
      change: stats.lowStockItems > 0 ? 'Needs attention' : 'All good',
      changeType: stats.lowStockItems > 0 ? 'warning' : 'positive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Categories',
      value: stats.totalCategories.toString(),
      change: 'Organized',
      changeType: 'positive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Critical Alerts',
      value: stats.criticalAlerts.toString(),
      change: stats.criticalAlerts > 0 ? 'Requires action' : 'All Good',
      changeType: stats.criticalAlerts > 0 ? 'warning' : 'positive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="17" r="1" fill="currentColor"/>
        </svg>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening at your facility today.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h3>Inventory Usage Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={inventoryTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Inventory Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={inventoryStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                <Cell fill="#82ca9d" />
                <Cell fill="#ffc658" />
                <Cell fill="#ff8042" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
