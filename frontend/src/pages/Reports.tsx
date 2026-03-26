import React, { useEffect, useState, useCallback } from 'react';
import { getReportStats, downloadReportCsv } from '../api/endpoints';
import PageHeader from '../components/PageHeader';
import { SkeletonCard } from '../components/Skeleton';
import { Icon } from '../components/Icon';
import {
  HiOutlineCalendarDays, HiOutlineIdentification, HiOutlineClock,
  HiOutlineArrowTrendingUp, HiOutlineArrowDownTray, HiOutlineChartBar,
} from 'react-icons/hi2';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';

// --- Types ---
interface Summary {
  total_appointments: number;
  total_visitors: number;
  avg_appointments_per_day: number;
  avg_visitors_per_day: number;
  completion_rate: number;
  cancellation_rate: number;
  no_show_rate: number;
  avg_visit_duration_min: number;
  busiest_hour: string | null;
}

interface ReportData {
  summary: Summary;
  daily_trend: { date: string; appointments: number; visitors: number }[];
  status_breakdown: Record<string, number>;
  created_via: Record<string, number>;
  top_employees: { name: string; total: number; completed: number; cancelled: number; no_show: number }[];
  top_companies: Record<string, number>;
  department_breakdown: Record<string, number>;
  hourly_heatmap: Record<string, number>;
  visitor_type: { returning: number; first_time: number };
}

// --- Color maps ---
const statusColors: Record<string, string> = {
  scheduled: '#3b82f6', confirmed: '#22c55e', in_progress: '#f59e0b',
  completed: '#6b7280', cancelled: '#ef4444', rescheduled: '#8b5cf6', no_show: '#dc2626',
};

const pieColors = ['#ED1C24', '#FFD100', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// --- Presets ---
const getPresetRange = (preset: string): [string, string] => {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  switch (preset) {
    case 'today': return [fmt(today), fmt(today)];
    case 'week': {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      return [fmt(start), fmt(today)];
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return [fmt(start), fmt(today)];
    }
    case '30days': {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return [fmt(start), fmt(today)];
    }
    default: return [fmt(new Date(today.getFullYear(), today.getMonth(), 1)), fmt(today)];
  }
};

// --- Custom tooltip ---
const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
          <span>{p.name}:</span><strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// --- Heatmap cell ---
const HeatmapCell: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const opacity = max > 0 ? Math.max(0.08, value / max) : 0.08;
  return (
    <div style={{
      width: '100%', height: '28px', borderRadius: '4px',
      backgroundColor: `rgba(237, 28, 36, ${opacity})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '10px', fontWeight: 600,
      color: value > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
    }}>
      {value > 0 ? value : ''}
    </div>
  );
};

const Reports: React.FC = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState('30days');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const [f, t] = getPresetRange('30days');
    setFromDate(f);
    setToDate(t);
  }, []);

  const fetchData = useCallback(async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    try {
      const res = await getReportStats({ from: fromDate, to: toDate });
      setData(res.data);
    } catch { }
    setLoading(false);
  }, [fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePreset = (p: string) => {
    setPreset(p);
    const [f, t] = getPresetRange(p);
    setFromDate(f);
    setToDate(t);
  };

  const handleExport = async (type: string) => {
    try {
      await downloadReportCsv(type, fromDate, toDate);
    } catch {
      // toast could be added here
    }
  };

  // --- Derived chart data ---
  const statusPieData = data ? Object.entries(data.status_breakdown).map(([name, value]) => ({ name: name.replace('_', ' '), value })) : [];
  const createdViaPieData = data ? Object.entries(data.created_via).map(([name, value]) => ({ name: name.replace('_', ' '), value })) : [];
  const visitorTypePieData = data ? [
    { name: 'First-time', value: data.visitor_type.first_time },
    { name: 'Returning', value: data.visitor_type.returning },
  ] : [];
  const companyBarData = data ? Object.entries(data.top_companies).map(([name, count]) => ({ name, count })) : [];
  const deptBarData = data ? Object.entries(data.department_breakdown).map(([name, count]) => ({ name, count })) : [];

  // Heatmap: hours 8-18, days 0-6
  const heatmapHours = Array.from({ length: 11 }, (_, i) => i + 8);
  const heatmapMax = data ? Math.max(1, ...Object.values(data.hourly_heatmap)) : 1;

  // Trend label formatter
  const formatTrendDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="page">
      <PageHeader
        title="Reports"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => handleExport('appointments')}>
              <Icon icon={HiOutlineArrowDownTray} size={16} /> Appointments CSV
            </button>
            <button className="btn btn-secondary" onClick={() => handleExport('visitors')}>
              <Icon icon={HiOutlineArrowDownTray} size={16} /> Visitors CSV
            </button>
          </div>
        }
      />

      {/* Date Range Filters */}
      <div className="filters" style={{ marginBottom: '24px' }}>
        {['today', 'week', 'month', '30days'].map((p) => (
          <button
            key={p}
            className={`btn ${preset === p ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handlePreset(p)}
            style={{ textTransform: 'capitalize' }}
          >
            {p === '30days' ? 'Last 30 Days' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'Today'}
          </button>
        ))}
        <div className="filter-group">
          <Icon icon={HiOutlineCalendarDays} size={16} />
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPreset('custom'); }} />
          <span style={{ color: 'var(--text-secondary)' }}>to</span>
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPreset('custom'); }} />
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="stat-grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
      ) : data && (
        <div className="stat-grid">
          <div className="stat-card red">
            <div className="stat-icon"><Icon icon={HiOutlineCalendarDays} size={24} /></div>
            <div className="stat-info">
              <span className="stat-value">{data.summary.total_appointments}</span>
              <span className="stat-label">Total Appointments ({data.summary.avg_appointments_per_day}/day)</span>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon"><Icon icon={HiOutlineIdentification} size={24} /></div>
            <div className="stat-info">
              <span className="stat-value">{data.summary.total_visitors}</span>
              <span className="stat-label">Total Visitors ({data.summary.avg_visitors_per_day}/day)</span>
            </div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon"><Icon icon={HiOutlineArrowTrendingUp} size={24} /></div>
            <div className="stat-info">
              <span className="stat-value">{data.summary.completion_rate}%</span>
              <span className="stat-label">Completion Rate</span>
            </div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-icon"><Icon icon={HiOutlineClock} size={24} /></div>
            <div className="stat-info">
              <span className="stat-value">{data.summary.avg_visit_duration_min}m</span>
              <span className="stat-label">Avg Visit Duration {data.summary.busiest_hour && `| Peak: ${data.summary.busiest_hour}`}</span>
            </div>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Rate Cards */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px' }}>
              <div style={{ width: '8px', height: '40px', borderRadius: '4px', backgroundColor: '#ef4444' }} />
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{data.summary.cancellation_rate}%</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cancellation Rate</div>
              </div>
            </div>
            <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px' }}>
              <div style={{ width: '8px', height: '40px', borderRadius: '4px', backgroundColor: '#dc2626' }} />
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{data.summary.no_show_rate}%</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No-Show Rate</div>
              </div>
            </div>
            <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px' }}>
              <div style={{ width: '8px', height: '40px', borderRadius: '4px', backgroundColor: '#22c55e' }} />
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{data.visitor_type.returning}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Returning Visitors</div>
              </div>
            </div>
            <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px' }}>
              <div style={{ width: '8px', height: '40px', borderRadius: '4px', backgroundColor: '#3b82f6' }} />
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{data.visitor_type.first_time}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>First-Time Visitors</div>
              </div>
            </div>
          </div>

          {/* Daily Trend Line Chart */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>Daily Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.daily_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tickFormatter={formatTrendDate} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="appointments" stroke="#ED1C24" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="visitors" stroke="#FFD100" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Charts Row */}
          <div className="card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {/* Status Breakdown */}
            <div className="card">
              <h3>Appointment Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusPieData.map((entry, i) => (
                      <Cell key={i} fill={statusColors[entry.name.replace(' ', '_')] || pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                {statusPieData.map((entry, i) => (
                  <span key={i} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColors[entry.name.replace(' ', '_')] || pieColors[i % pieColors.length] }} />
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>

            {/* Created Via */}
            <div className="card">
              <h3>Created Via</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={createdViaPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {createdViaPieData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                {createdViaPieData.map((entry, i) => (
                  <span key={i} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: pieColors[i % pieColors.length] }} />
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>

            {/* Visitor Type */}
            <div className="card">
              <h3>Visitor Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={visitorTypePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    <Cell fill="#3b82f6" />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} /> First-time ({data.visitor_type.first_time})
                </span>
                <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Returning ({data.visitor_type.returning})
                </span>
              </div>
            </div>
          </div>

          {/* Bar Charts Row */}
          <div className="card-grid" style={{ marginTop: '24px' }}>
            {/* Top Companies */}
            <div className="card">
              <h3>Top Visiting Companies</h3>
              {companyBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={companyBarData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={100} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" fill="#FFD100" radius={[0, 4, 4, 0]} barSize={16} name="Visits" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No company data</div>
              )}
            </div>

            {/* Department Breakdown */}
            <div className="card">
              <h3>Visits by Department</h3>
              {deptBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={deptBarData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={120} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} name="Appointments" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No department data</div>
              )}
            </div>
          </div>

          {/* Heatmap */}
          <div className="card" style={{ marginTop: '24px' }}>
            <h3>Busiest Hours (Heatmap)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '60px', fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'left', border: 'none', background: 'none' }}></th>
                    {heatmapHours.map((h) => (
                      <th key={h} style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'center', padding: '4px', border: 'none', background: 'none' }}>
                        {h}:00
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayLabels.map((day, dayIdx) => (
                    <tr key={day}>
                      <td style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, padding: '2px 8px 2px 0', border: 'none' }}>{day}</td>
                      {heatmapHours.map((h) => {
                        const val = data.hourly_heatmap[`${dayIdx}-${h}`] || 0;
                        return (
                          <td key={h} style={{ padding: '2px', border: 'none' }}>
                            <HeatmapCell value={val} max={heatmapMax} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee Performance Table */}
          <div className="card" style={{ marginTop: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon icon={HiOutlineChartBar} size={18} /> Employee Performance
            </h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Total</th>
                    <th>Completed</th>
                    <th>Cancelled</th>
                    <th>No-Show</th>
                    <th>Completion %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_employees.length > 0 ? data.top_employees.map((emp, i) => {
                    const completionPct = emp.total > 0 ? Math.round((emp.completed / emp.total) * 100) : 0;
                    return (
                      <tr key={i}>
                        <td><strong>{emp.name}</strong></td>
                        <td>{emp.total}</td>
                        <td style={{ color: '#22c55e' }}>{emp.completed}</td>
                        <td style={{ color: '#ef4444' }}>{emp.cancelled}</td>
                        <td style={{ color: '#dc2626' }}>{emp.no_show}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: '3px', width: `${completionPct}%`,
                                backgroundColor: completionPct >= 70 ? '#22c55e' : completionPct >= 40 ? '#f59e0b' : '#ef4444',
                              }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '36px' }}>{completionPct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={6} className="empty">No employee data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
