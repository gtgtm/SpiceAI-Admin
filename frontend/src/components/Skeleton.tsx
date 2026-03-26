import React from 'react';

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, var(--bg-input) 25%, rgba(255,255,255,0.06) 50%, var(--bg-input) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: '6px',
};

export const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '14px 12px' }}>
        <div style={{ ...shimmerStyle, height: '14px', width: i === 0 ? '60%' : '80%' }} />
      </td>
    ))}
  </tr>
);

export const SkeletonTable: React.FC<{ cols: number; rows?: number }> = ({ cols, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} cols={cols} />
    ))}
  </>
);

export const SkeletonCard: React.FC = () => (
  <div className="stat-card" style={{ opacity: 0.6 }}>
    <div style={{ ...shimmerStyle, width: '48px', height: '48px', borderRadius: '12px' }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ ...shimmerStyle, height: '24px', width: '60px' }} />
      <div style={{ ...shimmerStyle, height: '12px', width: '100px' }} />
    </div>
  </div>
);
