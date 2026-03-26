import React, { useEffect, useState, useCallback } from 'react';
import { getVisitors, checkoutVisitor, deleteVisitor, updateVisitor } from '../api/endpoints';
import type { Visitor } from '../types';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import VisitorDetailModal from '../components/VisitorDetailModal';
import { SkeletonTable } from '../components/Skeleton';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { HiOutlineMagnifyingGlass, HiOutlineArrowRightOnRectangle, HiOutlineTrash } from 'react-icons/hi2';
import { Icon } from '../components/Icon';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  checked_in: '#22c55e', waiting: '#f59e0b', in_meeting: '#3b82f6',
  checked_out: '#6b7280', cancelled: '#ef4444',
};

const visitorStatuses = ['checked_in', 'waiting', 'in_meeting', 'checked_out', 'cancelled'];

const Visitors: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [todayOnly, setTodayOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), per_page: '20' };
    if (todayOnly) params.today = 'true';
    if (search) params.search = search;
    if (filterStatus) params.status = filterStatus;
    const res = await getVisitors(params);
    setVisitors(res.data.data);
    setTotalPages(res.data.last_page);
    setLoading(false);
  }, [search, filterStatus, todayOnly, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { lastRefresh, isRefreshing, refresh } = useAutoRefresh(fetchData);

  const handleCheckout = async (e: React.MouseEvent, v: Visitor) => {
    e.stopPropagation();
    try {
      await checkoutVisitor(v.id);
      toast.success(`${v.name} checked out`);
      fetchData();
    } catch { toast.error('Failed to checkout'); }
  };

  const handleStatusChange = async (e: React.MouseEvent, v: Visitor, newStatus: string) => {
    e.stopPropagation();
    try {
      await updateVisitor(v.id, { status: newStatus as any });
      toast.success(`Status updated`);
      fetchData();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (e: React.MouseEvent, v: Visitor) => {
    e.stopPropagation();
    if (!window.confirm(`Delete visitor record for ${v.name}?`)) return;
    try {
      await deleteVisitor(v.id);
      toast.success('Record deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const formatTime = (dt: string) => new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const formatDate = (dt: string) => new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

  return (
    <div className="page">
      <PageHeader
        title="Visitor Log"
        lastRefresh={lastRefresh}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        actions={
          <label className="toggle-label">
            <input type="checkbox" checked={todayOnly} onChange={(e) => { setTodayOnly(e.target.checked); setPage(1); }} /> Today Only
          </label>
        }
      />

      <div className="filters">
        <div className="search-box">
          <Icon icon={HiOutlineMagnifyingGlass} size={16} />
          <input placeholder="Search name, company, badge, phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {visitorStatuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Badge</th><th>Name</th><th>Company</th><th>Purpose</th><th>Phone</th><th>Host</th><th>Check-in</th><th>Check-out</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTable cols={10} rows={6} />
            ) : visitors.length === 0 ? (
              <EmptyState message="No visitors found" colSpan={10} />
            ) : (
              visitors.map((v) => (
                <tr key={v.id} className="clickable-row" onClick={() => setSelectedVisitor(v)}>
                  <td><span className="badge-number">{v.badge_number || '—'}</span></td>
                  <td><strong>{v.name}</strong>{v.email && <><br/><small>{v.email}</small></>}</td>
                  <td>{v.company || '—'}</td>
                  <td>{v.purpose || '—'}</td>
                  <td>{v.phone || '—'}</td>
                  <td>{v.host_employee?.name || '—'}</td>
                  <td>{formatDate(v.check_in_time)} {formatTime(v.check_in_time)}</td>
                  <td>{v.check_out_time ? formatTime(v.check_out_time) : '—'}</td>
                  <td>
                    <select
                      value={v.status}
                      onChange={(e) => handleStatusChange(e as any, v, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="status-select"
                      style={{ borderColor: statusColors[v.status] }}
                    >
                      {visitorStatuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="actions">
                    {v.status !== 'checked_out' && v.status !== 'cancelled' && (
                      <button className="icon-btn" onClick={(e) => handleCheckout(e, v)} title="Check Out">
                        <Icon icon={HiOutlineArrowRightOnRectangle} size={16} />
                      </button>
                    )}
                    <button className="icon-btn danger" onClick={(e) => handleDelete(e, v)} title="Delete">
                      <Icon icon={HiOutlineTrash} size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
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

      <VisitorDetailModal visitor={selectedVisitor} onClose={() => setSelectedVisitor(null)} />
    </div>
  );
};

export default Visitors;
