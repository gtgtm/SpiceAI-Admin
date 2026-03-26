import React from 'react';
import type { Appointment } from '../types';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { HiOutlineUser, HiOutlineBuildingOffice, HiOutlinePhone, HiOutlineClock, HiOutlineCalendarDays, HiOutlineMapPin } from 'react-icons/hi2';
import { Icon } from './Icon';

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
}

const formatTime = (dt: string) =>
  new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });

const formatDate = (dt: string) =>
  new Date(dt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

const Row: React.FC<{ icon: any; label: string; value: string | null | undefined }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <Icon icon={icon} size={18} className="detail-icon" />
      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '14px' }}>{value}</div>
      </div>
    </div>
  );
};

const AppointmentDetailModal: React.FC<Props> = ({ appointment, onClose }) => {
  if (!appointment) return null;
  const a = appointment;

  return (
    <Modal isOpen={!!appointment} onClose={onClose} title="Appointment Details" width="480px">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--spice-red), var(--spice-yellow))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 700, color: '#fff',
        }}>
          {a.visitor_name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>{a.visitor_name}</div>
          {a.visitor_company && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{a.visitor_company}</div>}
        </div>
        <StatusBadge status={a.status} size="md" />
      </div>

      <Row icon={HiOutlineUser} label="Host Employee" value={a.employee_name} />
      <Row icon={HiOutlineCalendarDays} label="Date" value={formatDate(a.date)} />
      <Row icon={HiOutlineClock} label="Time" value={`${formatTime(a.start_time)} - ${formatTime(a.end_time)}`} />
      <Row icon={HiOutlineMapPin} label="Meeting Room" value={a.meeting_room} />
      <Row icon={HiOutlinePhone} label="Phone" value={a.visitor_phone} />
      <Row icon={HiOutlineBuildingOffice} label="Purpose" value={a.visitor_purpose} />

      {a.badge_number && (
        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Badge Number</span>
          <span className="badge-number" style={{ fontSize: '16px' }}>{a.badge_number}</span>
        </div>
      )}

      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <span>Created via: {a.created_via?.replace('_', ' ')}</span>
        <span>{a.notes ? `Note: ${a.notes}` : ''}</span>
      </div>
    </Modal>
  );
};

export default AppointmentDetailModal;
