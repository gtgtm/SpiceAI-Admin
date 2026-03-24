import React, { useEffect, useState } from 'react';
import { getAppointments, updateAppointmentStatus, deleteAppointment, createAppointment, getEmployees } from '../api/endpoints';
import type { Appointment, Employee } from '../types';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  scheduled: '#3b82f6', confirmed: '#22c55e', in_progress: '#f59e0b',
  completed: '#6b7280', cancelled: '#ef4444', rescheduled: '#8b5cf6', no_show: '#dc2626',
};

const statuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'];

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), per_page: '20' };
    if (!showAll) params.date = date;
    if (filterStatus) params.status = filterStatus;
    if (search) params.search = search;
    const res = await getAppointments(params);
    setAppointments(res.data.data);
    setTotalPages(res.data.last_page);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [date, filterStatus, search, page, showAll]);
  useEffect(() => { getEmployees().then((r) => setEmployees(r.data)); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (apt: Appointment) => {
    if (!window.confirm(`Delete appointment for ${apt.visitor_name}?`)) return;
    try {
      await deleteAppointment(apt.id);
      toast.success('Appointment deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleCreate = async () => {
    try {
      await createAppointment({
        ...form,
        date: form.date,
        start_time: `${form.date} ${form.start_time}:00`,
        end_time: `${form.date} ${form.end_time}:00`,
        created_via: 'manual',
      });
      toast.success('Appointment created');
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error creating appointment');
    }
  };

  const formatTime = (dt: string) => new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (dt: string) => new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Appointments</h1>
        <button className="btn btn-primary" onClick={() => { setForm({ date: date, status: 'scheduled' }); setModalOpen(true); }}>
          + New Appointment
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          🔍
          <input placeholder="Search visitor, company, employee..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="filter-group">
          📅
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} disabled={showAll} />
        </div>
        <label className="toggle-label">
          <input type="checkbox" checked={showAll} onChange={(e) => { setShowAll(e.target.checked); setPage(1); }} /> All dates
        </label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {statuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Visitor</th><th>Company</th><th>Employee</th><th>Date</th><th>Time</th><th>Room</th><th>Badge</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>
                  <strong>{a.visitor_name}</strong>
                  {a.visitor_phone && <><br /><small>{a.visitor_phone}</small></>}
                </td>
                <td>{a.visitor_company || '—'}</td>
                <td>{a.employee_name}</td>
                <td>{formatDate(a.date)}</td>
                <td>{formatTime(a.start_time)} – {formatTime(a.end_time)}</td>
                <td>{a.meeting_room || '—'}</td>
                <td>{a.badge_number || '—'}</td>
                <td>
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                    className="status-select"
                    style={{ borderColor: statusColors[a.status] }}
                  >
                    {statuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </td>
                <td className="actions">
                  <button className="icon-btn danger" onClick={() => handleDelete(a)} title="Delete">🗑️</button>
                </td>
              </tr>
            ))}
            {!loading && appointments.length === 0 && <tr><td colSpan={9} className="empty">No appointments found</td></tr>}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Appointment" width="550px">
        <div className="form-grid">
          <div className="form-group">
            <label>Visitor Name *</label>
            <input value={form.visitor_name || ''} onChange={(e) => setForm({ ...form, visitor_name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Company</label>
            <input value={form.visitor_company || ''} onChange={(e) => setForm({ ...form, visitor_company: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Purpose</label>
            <input value={form.visitor_purpose || ''} onChange={(e) => setForm({ ...form, visitor_purpose: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Visitor Phone</label>
            <input value={form.visitor_phone || ''} onChange={(e) => setForm({ ...form, visitor_phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Employee *</label>
            <select value={form.employee_id || ''} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required>
              <option value="">Select employee</option>
              {employees.filter((e) => e.is_active).map((e) => (
                <option key={e.id} value={e.id}>{e.name} — {e.department}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={form.date || ''} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Start Time *</label>
            <input type="time" value={form.start_time || ''} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>End Time *</label>
            <input type="time" value={form.end_time || ''} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Meeting Room</label>
            <input value={form.meeting_room || ''} onChange={(e) => setForm({ ...form, meeting_room: e.target.value })} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate}>Create Appointment</button>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
