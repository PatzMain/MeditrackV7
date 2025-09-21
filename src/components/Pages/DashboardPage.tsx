import React, { useState, useEffect, useCallback } from 'react';
import { patientService, consultationService, inventoryService } from '../../services/supabaseService';
import './DashboardPage.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeCases: 0,
    todayAppointments: 0,
    criticalAlerts: 0
  });
  const [patientTrends, setPatientTrends] = useState<any[]>([]);
  const [consultationsChartData, setConsultationsChartData] = useState<any[]>([]);
  const [inventoryStatusData, setInventoryStatusData] = useState<any[]>([]);
  const [patientDemographicsData, setPatientDemographicsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const patients = await patientService.getPatients();
      const consultations = await consultationService.getConsultations();
      const inventory = await inventoryService.getAllItems();
      const lowStockItems = inventory.filter((item: any) => item.stock_quantity <= item.minimum_stock_level);

      const consultationsData = await consultationService.getConsultationsLast7Days();
      setConsultationsChartData(consultationsData);

      const inventoryStatus = await inventoryService.getInventoryStatus();
      setInventoryStatusData(inventoryStatus);

      const patientDemographics = await patientService.getPatientDemographics();
      setPatientDemographicsData(patientDemographics);

      const today = new Date().toISOString().split('T')[0];
      const todayConsultations = consultations.filter((c: any) =>
        c.consultation_date.startsWith(today)
      );

      setStats({
        totalPatients: patients.length,
        activeCases: consultations.length,
        todayAppointments: todayConsultations.length,
        criticalAlerts: lowStockItems.length
      });

      const weekTrends = generateWeeklyTrends(patients);
      setPatientTrends(weekTrends);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const generateWeeklyTrends = (patients: any[]) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trends = days.map(day => ({
      day,
      count: Math.floor(Math.random() * 15) + 5
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
      title: 'Total Patients',
      value: stats.totalPatients.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7001C21.7033 16.046 20.9066 15.5902 20 15.4" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 3.13C16.9066 3.28984 17.7033 3.74595 18.2094 4.39993C18.7155 5.05392 19 5.86447 19 6.7C19 7.53553 18.7155 8.34608 18.2094 9.00007C17.7033 9.65405 16.9066 10.1102 16 10.27" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Active Cases',
      value: stats.activeCases.toString(),
      change: '+8%',
      changeType: 'positive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Appointments Today',
      value: stats.todayAppointments.toString(),
      change: stats.todayAppointments > 0 ? '+' + stats.todayAppointments : '0',
      changeType: stats.todayAppointments > 0 ? 'positive' : 'neutral',
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
      change: stats.criticalAlerts > 0 ? 'Low Stock Items' : 'All Good',
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
            <h3>Patient Registration Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={patientTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h3>Consultations (Last 7 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={consultationsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="consultations" fill="#82ca9d" />
            </BarChart>
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

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Patient Demographics</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={patientDemographicsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                <Cell fill="#8884d8" />
                <Cell fill="#82ca9d" />
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
