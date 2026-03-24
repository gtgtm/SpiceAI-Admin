import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', icon: '📊', label: 'Dashboard' },
  { to: '/appointments', icon: '📅', label: 'Appointments' },
  { to: '/employees', icon: '👥', label: 'Employees' },
  { to: '/visitors', icon: '🪪', label: 'Visitor Log' },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">S</div>
        <span>SpiceAI Admin</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: 18 }}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0) || 'A'}</div>
          <span>{user?.name || 'Admin'}</span>
        </div>
        <button onClick={logout} className="logout-btn" title="Logout">⏻</button>
      </div>
    </div>
  );
};

export default Sidebar;
