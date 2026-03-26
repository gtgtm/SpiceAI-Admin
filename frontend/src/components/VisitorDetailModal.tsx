import React from 'react';
import type { Visitor } from '../types';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { HiOutlineUser, HiOutlineBuildingOffice, HiOutlinePhone, HiOutlineEnvelope, HiOutlineClock } from 'react-icons/hi2';
import { Icon } from './Icon';

interface Props {
  visitor: Visitor | null;
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

const VisitorDetailModal: React.FC<Props> = ({ visitor, onClose }) => {
  if (!visitor) return null;
  const v = visitor;

  return (
    <Modal isOpen={!!visitor} onClose={onClose} title="Visitor Details" width="480px">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--spice-red), var(--spice-yellow))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 700, color: '#fff',
        }}>
          {v.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>{v.name}</div>
          {v.company && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{v.company}</div>}
        </div>
        <StatusBadge status={v.status} size="md" />
      </div>

      <Row icon={HiOutlineUser} label="Host" value={v.host_employee?.name} />
      <Row icon={HiOutlineBuildingOffice} label="Purpose" value={v.purpose} />
      <Row icon={HiOutlinePhone} label="Phone" value={v.phone} />
      <Row icon={HiOutlineEnvelope} label="Email" value={v.email} />
      <Row icon={HiOutlineClock} label="Check-in" value={`${formatDate(v.check_in_time)} at ${formatTime(v.check_in_time)}`} />
      {v.check_out_time && <Row icon={HiOutlineClock} label="Check-out" value={formatTime(v.check_out_time)} />}

      {v.badge_number && (
        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Badge Number</span>
          <span className="badge-number" style={{ fontSize: '16px' }}>{v.badge_number}</span>
        </div>
      )}
    </Modal>
  );
};

export default VisitorDetailModal;
