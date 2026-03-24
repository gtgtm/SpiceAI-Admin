import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../api/endpoints';
import type { DashboardStats } from '../types';

const statusColors: Record<string, string> = {
  scheduled: '#3b82f6', confirmed: '#22c55e', in_progress: '#f59e0b',
  completed: '#6b7280', cancelled: '#ef4444', no_show: '#dc2626',
  checked_in: '#22c55e', waiting: '#f59e0b', in_meeting: '#3b82f6', checked_out: '#6b7280',
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((r) => { setStats(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (!stats) return null;

  const formatTime = (dt: string) => new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <span className="date-label">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card red">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.appointments.total}</span>
            <span className="stat-label">Today's Appointments</span>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🪪</div>
          <div className="stat-info">
            <span className="stat-value">{stats.visitors.total}</span>
            <span className="stat-label">Today's Visitors</span>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.employees.active}</span>
            <span className="stat-label">Active Employees</span>
          </div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <span className="stat-value">{stats.visitors.checked_in + stats.visitors.in_meeting}</span>
            <span className="stat-label">Currently In Office</span>
          </div>
        </div>
      </div>

      {/* Appointment Status Breakdown */}
      <div className="card-grid">
        <div className="card">
          <h3>Appointment Status</h3>
          <div className="status-bars">
            {Object.entries(stats.appointments).filter(([k]) => k !== 'total').map(([key, val]) => (
              <div key={key} className="status-bar-row">
                <span className="status-label">{key.replace('_', ' ')}</span>
                <div className="status-bar-track">
                  <div className="status-bar-fill" style={{
                    width: `${stats.appointments.total ? (val / stats.appointments.total) * 100 : 0}%`,
                    backgroundColor: statusColors[key] || '#888',
                  }} />
                </div>
                <span className="status-count">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Visitor Status</h3>
          <div className="status-bars">
            {Object.entries(stats.visitors).filter(([k]) => k !== 'total').map(([key, val]) => (
              <div key={key} className="status-bar-row">
                <span className="status-label">{key.replace('_', ' ')}</span>
                <div className="status-bar-track">
                  <div className="status-bar-fill" style={{
                    width: `${stats.visitors.total ? (val / stats.visitors.total) * 100 : 0}%`,
                    backgroundColor: statusColors[key] || '#888',
                  }} />
                </div>
                <span className="status-count">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-grid">
        <div className="card">
          <h3>Recent Appointments</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Visitor</th><th>Employee</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {stats.recent_appointments.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.visitor_name}</strong><br/><small>{a.visitor_company}</small></td>
                    <td>{a.employee_name}</td>
                    <td>{formatTime(a.start_time)}</td>
                    <td><span className="badge" style={{ backgroundColor: statusColors[a.status] }}>{a.status}</span></td>
                  </tr>
                ))}
                {stats.recent_appointments.length === 0 && <tr><td colSpan={4} className="empty">No appointments today</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Recent Visitors</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Visitor</th><th>Badge</th><th>Check-in</th><th>Status</th></tr></thead>
              <tbody>
                {stats.recent_visitors.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.name}</strong><br/><small>{v.company}</small></td>
                    <td>{v.badge_number}</td>
                    <td>{formatTime(v.check_in_time)}</td>
                    <td><span className="badge" style={{ backgroundColor: statusColors[v.status] }}>{v.status.replace('_', ' ')}</span></td>
                  </tr>
                ))}
                {stats.recent_visitors.length === 0 && <tr><td colSpan={4} className="empty">No visitors today</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="all-time-stats">
        <span>All Time: <strong>{stats.all_time.total_appointments}</strong> appointments &middot; <strong>{stats.all_time.total_visitors}</strong> visitors &middot; <strong>{stats.employees.total}</strong> employees</span>
      </div>
    </div>
  );
};

export default Dashboard;
