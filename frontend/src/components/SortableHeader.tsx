import React from 'react';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi2';
import { Icon } from './Icon';
import type { SortDirection } from '../hooks/useSort';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentKey: string;
  direction: SortDirection;
  onSort: (key: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ label, sortKey, currentKey, direction, onSort }) => {
  const isActive = sortKey === currentKey;

  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {label}
        <span style={{ display: 'inline-flex', flexDirection: 'column', opacity: isActive ? 1 : 0.3, lineHeight: 0 }}>
          <Icon icon={HiChevronUp} size={10} />
          <Icon icon={HiChevronDown} size={10} />
        </span>
      </span>
    </th>
  );
};

export default SortableHeader;
