import React from 'react';
import { HiOutlineInbox } from 'react-icons/hi2';
import { Icon } from './Icon';

interface EmptyStateProps {
  message: string;
  colSpan: number;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, colSpan }) => (
  <tr>
    <td colSpan={colSpan} style={{ textAlign: 'center', padding: '48px 12px', color: 'var(--text-secondary)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <Icon icon={HiOutlineInbox} size={40} />
        <span style={{ fontSize: '14px' }}>{message}</span>
      </div>
    </td>
  </tr>
);

export default EmptyState;
