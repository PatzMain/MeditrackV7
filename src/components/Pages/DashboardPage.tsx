import React, { useState, useEffect, useCallback } from 'react';
import './DashboardPage.css';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Line, BarChart, Bar, AreaChart, Area,
  ComposedChart, RadialBarChart, RadialBar
} from 'recharts';
import {
  dashboardService,
  type DashboardStats,
  type InventoryTrendData,
  type DepartmentComparisonData,
  type StatusDistributionData,
  type CategoryAnalysisData,
  type ActivityTrendData,
  type TopPerformingCategories,
  type ExpirationAnalysisData
} from '../../services/dashboardService';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiredItems: 0,
    maintenanceItems: 0,
    activeMedicalItems: 0,
    activeDentalItems: 0,
    totalCategories: 0,
    totalUsers: 0,
    criticalAlerts: 0,
    totalValue: 0
  });
  const [inventoryTrends, setInventoryTrends] = useState<InventoryTrendData[]>([]);
  const [departmentComparison, setDepartmentComparison] = useState<DepartmentComparisonData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistributionData[]>([]);
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysisData[]>([]);
  const [activityTrends, setActivityTrends] = useState<ActivityTrendData[]>([]);
  const [topCategories, setTopCategories] = useState<TopPerformingCategories[]>([]);
  const [expirationAnalysis, setExpirationAnalysis] = useState<ExpirationAnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7' | '30' | '90'>('30');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [statsData, trendsData, deptData, statusData, categoryData, activityData, topCategoriesData, expirationData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getInventoryTrends(parseInt(selectedTimeframe)),
        dashboardService.getDepartmentComparison(),
        dashboardService.getStatusDistribution(),
        dashboardService.getCategoryAnalysis(),
        dashboardService.getActivityTrends(parseInt(selectedTimeframe)),
        dashboardService.getTopPerformingCategories(),
        dashboardService.getExpirationAnalysis()
      ]);

      setStats(statsData);
      setInventoryTrends(trendsData);
      setDepartmentComparison(deptData);
      setStatusDistribution(statusData);
      setCategoryAnalysis(categoryData);
      setActivityTrends(activityData);
      setTopCategories(topCategoriesData);
      setExpirationAnalysis(expirationData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTimeframeChange = (timeframe: '7' | '30' | '90') => {
    setSelectedTimeframe(timeframe);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-message">Loading comprehensive dashboard analytics...</div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems.toLocaleString(),
      change: `${stats.totalCategories} categories`,
      changeType: 'neutral',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <rect x="7" y="7" width="3" height="9" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="7" width="3" height="5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Critical Alerts',
      value: stats.criticalAlerts.toString(),
      change: stats.criticalAlerts > 0 ? 'Requires action' : 'All systems normal',
      changeType: stats.criticalAlerts > 0 ? 'danger' : 'positive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="17" r="1" fill="currentColor"/>
        </svg>
      )
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems.toString(),
      change: `${stats.outOfStockItems} out of stock`,
      changeType: stats.lowStockItems > 0 ? 'warning' : 'positive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Expired Items',
      value: stats.expiredItems.toString(),
      change: `${stats.maintenanceItems} in maintenance`,
      changeType: stats.expiredItems > 0 ? 'danger' : 'positive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Medical Items',
      value: stats.activeMedicalItems.toString(),
      change: `${stats.activeDentalItems} dental items`,
      changeType: 'neutral',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Total Value',
      value: `$${stats.totalValue.toLocaleString()}`,
      change: `${stats.totalUsers} active users`,
      changeType: 'positive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Comprehensive inventory and operational insights</p>
        </div>
        <div className="header-controls">
          <div className="timeframe-selector">
            <label>Timeframe:</label>
            <div className="timeframe-buttons">
              {(['7', '30', '90'] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  className={`timeframe-btn ${selectedTimeframe === timeframe ? 'active' : ''}`}
                  onClick={() => handleTimeframeChange(timeframe)}
                >
                  {timeframe} days
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.changeType}`}>
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

      {/* Main Analytics Grid */}
      <div className="analytics-grid">
        {/* Inventory Trends */}
        <div className="dashboard-card span-2">
          <div className="card-header">
            <h3>Inventory Trends Over Time</h3>
            <span className="card-subtitle">Track inventory levels by department</span>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={inventoryTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Line type="monotone" dataKey="medical" stroke="#82ca9d" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="dental" stroke="#ffc658" strokeWidth={3} dot={{ r: 4 }} />
              <Bar dataKey="lowStock" fill="#ff8042" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Status Distribution</h3>
            <span className="card-subtitle">Current inventory status breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={statusDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} items`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Comparison */}
        <div className="dashboard-card span-2">
          <div className="card-header">
            <h3>Department Comparison</h3>
            <span className="card-subtitle">Compare inventory metrics across departments</span>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={departmentComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="active" fill="#10B981" name="Active" />
              <Bar dataKey="lowStock" fill="#F59E0B" name="Low Stock" />
              <Bar dataKey="outOfStock" fill="#EF4444" name="Out of Stock" />
              <Bar dataKey="expired" fill="#8B5CF6" name="Expired" />
              <Bar dataKey="maintenance" fill="#6B7280" name="Maintenance" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Analysis */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Category Analysis</h3>
            <span className="card-subtitle">Top categories by volume</span>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryAnalysis.slice(0, 8)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="category" width={80} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="medical" fill="#82ca9d" name="Medical" />
              <Bar dataKey="dental" fill="#ffc658" name="Dental" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Trends */}
        <div className="dashboard-card span-2">
          <div className="card-header">
            <h3>User Activity Trends</h3>
            <span className="card-subtitle">Track user actions and system usage</span>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={activityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="actions" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="users" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performing Categories */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Top Performing Categories</h3>
            <span className="card-subtitle">Highest utilization rates</span>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={topCategories}>
              <RadialBar dataKey="utilizationRate" cornerRadius={10} fill="#8884d8" />
              <Tooltip formatter={(value) => [`${value}%`, 'Utilization Rate']} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Expiration Analysis */}
        <div className="dashboard-card span-2">
          <div className="card-header">
            <h3>Expiration Analysis</h3>
            <span className="card-subtitle">Items expiring by timeframe</span>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={expirationAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timeframe" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'expiringItems') return [`${value} items`, 'Expiring Items'];
                  if (name === 'totalValue') return [`$${value.toLocaleString()}`, 'Total Value'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="expiringItems" fill="#ff8042" name="Items Count" />
              <Bar dataKey="totalValue" fill="#8884d8" name="Estimated Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats Summary */}
        <div className="dashboard-card summary-card">
          <div className="card-header">
            <h3>Quick Summary</h3>
            <span className="card-subtitle">Key insights at a glance</span>
          </div>
          <div className="summary-content">
            <div className="summary-item">
              <div className="summary-metric">{((stats.activeMedicalItems + stats.activeDentalItems) / stats.totalItems * 100).toFixed(1)}%</div>
              <div className="summary-label">Items Active</div>
            </div>
            <div className="summary-item">
              <div className="summary-metric">{(stats.criticalAlerts / stats.totalItems * 100).toFixed(1)}%</div>
              <div className="summary-label">Critical Rate</div>
            </div>
            <div className="summary-item">
              <div className="summary-metric">${(stats.totalValue / stats.totalItems).toFixed(0)}</div>
              <div className="summary-label">Avg Value/Item</div>
            </div>
            <div className="summary-item">
              <div className="summary-metric">{Math.ceil(stats.totalItems / stats.totalCategories)}</div>
              <div className="summary-label">Items/Category</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
