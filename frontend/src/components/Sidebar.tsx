import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineChartBarSquare, HiOutlineCalendarDays, HiOutlineUserGroup, HiOutlineIdentification, HiOutlineDocumentChartBar, HiArrowRightOnRectangle } from 'react-icons/hi2';
import { Icon } from './Icon';

const links = [
  { to: '/', icon: HiOutlineChartBarSquare, label: 'Dashboard' },
  { to: '/appointments', icon: HiOutlineCalendarDays, label: 'Appointments' },
  { to: '/employees', icon: HiOutlineUserGroup, label: 'Employees' },
  { to: '/visitors', icon: HiOutlineIdentification, label: 'Visitor Log' },
  { to: '/reports', icon: HiOutlineDocumentChartBar, label: 'Reports' },
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
            <Icon icon={link.icon} size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0) || 'A'}</div>
          <span>{user?.name || 'Admin'}</span>
        </div>
        <button onClick={logout} className="logout-btn" title="Logout">
          <Icon icon={HiArrowRightOnRectangle} size={18} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
