import React from 'react';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  // Appointment statuses
  scheduled:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Scheduled' },
  confirmed:   { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Confirmed' },
  in_progress: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'In Progress' },
  completed:   { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'Completed' },
  cancelled:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Cancelled' },
  rescheduled: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', label: 'Rescheduled' },
  no_show:     { color: '#dc2626', bg: 'rgba(220,38,38,0.12)', label: 'No Show' },
  // Visitor statuses
  checked_in:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Checked In' },
  waiting:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Waiting' },
  in_meeting:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'In Meeting' },
  checked_out: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'Checked Out' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = statusConfig[status] || { color: '#888', bg: 'rgba(136,136,136,0.12)', label: status };
  const padding = size === 'md' ? '5px 14px' : '3px 10px';
  const fontSize = size === 'md' ? '12px' : '11px';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding,
      borderRadius: '20px',
      fontSize,
      fontWeight: 600,
      color: config.color,
      backgroundColor: config.bg,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: config.color,
      }} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
