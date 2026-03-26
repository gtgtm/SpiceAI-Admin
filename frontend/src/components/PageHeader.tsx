import React from 'react';
import { HiArrowPath } from 'react-icons/hi2';
import { Icon } from './Icon';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  lastRefresh?: Date;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, lastRefresh, isRefreshing, onRefresh, actions }) => {
  const timeAgo = lastRefresh
    ? `Updated ${Math.round((Date.now() - lastRefresh.getTime()) / 1000)}s ago`
    : '';

  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <span className="date-label">{subtitle}</span>}
        {lastRefresh && (
          <span
            className="date-label"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: subtitle ? '12px' : '0', cursor: onRefresh ? 'pointer' : 'default' }}
            onClick={onRefresh}
          >
            <Icon icon={HiArrowPath} size={12} className={isRefreshing ? 'spin' : ''} />
            {timeAgo}
          </span>
        )}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{actions}</div>}
    </div>
  );
};

export default PageHeader;
