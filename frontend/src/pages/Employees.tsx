import React, { useEffect, useState, useCallback } from 'react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getDepartments } from '../api/endpoints';
import type { Employee } from '../types';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi2';
import { Icon } from '../components/Icon';
import toast from 'react-hot-toast';

const emptyForm: Partial<Employee> = { name: '', email: '', phone: '', department: '', designation: '', floor: '', is_active: true };

const deptColors: Record<string, string> = {
  Technology: '#3b82f6', 'Human Resources': '#ec4899', Finance: '#22c55e',
  Operations: '#f59e0b', Marketing: '#8b5cf6', Legal: '#6366f1',
};

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Partial<Employee>>(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filterDept) params.department = filterDept;
    const [empRes, deptRes] = await Promise.all([getEmployees(params), getDepartments()]);
    setEmployees(empRes.data);
    setDepartments(deptRes.data);
    setLoading(false);
  }, [search, filterDept]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { lastRefresh, isRefreshing, refresh } = useAutoRefresh(fetchData);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (e: React.MouseEvent, emp: Employee) => { e.stopPropagation(); setEditing(emp); setForm(emp); setModalOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateEmployee(editing.id, form);
        toast.success('Employee updated');
      } else {
        await createEmployee(form);
        toast.success('Employee added');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving employee');
    }
  };

  const handleDelete = async (e: React.MouseEvent, emp: Employee) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${emp.name}? This will also delete their appointments.`)) return;
    try {
      await deleteEmployee(emp.id);
      toast.success('Employee deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page">
      <PageHeader
        title={`Employees (${employees.length})`}
        lastRefresh={lastRefresh}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon icon={HiOutlinePlus} size={16} /> Add Employee
          </button>
        }
      />

      <div className="filters">
        <div className="search-box">
          <Icon icon={HiOutlineMagnifyingGlass} size={16} />
          <input placeholder="Search name, email, department..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Department</th><th>Designation</th><th>Floor</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTable cols={8} rows={6} />
            ) : employees.length === 0 ? (
              <EmptyState message="No employees found" colSpan={8} />
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className={!emp.is_active ? 'inactive-row' : ''}>
                  <td><strong>{emp.name}</strong></td>
                  <td>{emp.email}</td>
                  <td>{emp.phone || '—'}</td>
                  <td><span className="dept-badge" style={{ backgroundColor: deptColors[emp.department] || '#888' }}>{emp.department}</span></td>
                  <td>{emp.designation || '—'}</td>
                  <td>{emp.floor || '—'}</td>
                  <td><span className={`badge ${emp.is_active ? 'green' : 'gray'}`}>{emp.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="actions">
                    <button className="icon-btn" onClick={(e) => openEdit(e, emp)} title="Edit">
                      <Icon icon={HiOutlinePencilSquare} size={16} />
                    </button>
                    <button className="icon-btn danger" onClick={(e) => handleDelete(e, emp)} title="Delete">
                      <Icon icon={HiOutlineTrash} size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Employee' : 'Add Employee'}>
        <div className="form-grid">
          <div className="form-group">
            <label>Name *</label>
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Department *</label>
            <input value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })} list="dept-list" required />
            <datalist id="dept-list">{departments.map((d) => <option key={d} value={d} />)}</datalist>
          </div>
          <div className="form-group">
            <label>Designation</label>
            <input value={form.designation || ''} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Floor</label>
            <input value={form.floor || ''} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          </div>
          <div className="form-group checkbox-group">
            <label><input type="checkbox" checked={form.is_active !== false} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;
