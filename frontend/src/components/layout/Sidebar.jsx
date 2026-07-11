import React from 'react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/rooms', label: 'Rooms', icon: '🏠' },
  { path: '/tenants', label: 'Tenants', icon: '👥' },
  { path: '/room-rentals', label: 'Room Rentals', icon: '🔑' },
  { path: '/rental-members', label: 'Rental Members', icon: '👤' },
  { path: '/contract-files', label: 'Contract Files', icon: '📁' },
  { path: '/utility-rates', label: 'Utility Rates', icon: '⚡' },
  { path: '/meter-readings', label: 'Meter Readings', icon: '📟' },
  { path: '/invoices', label: 'Invoices', icon: '📄' },
  { path: '/payments', label: 'Payments', icon: '💳' },
  { path: '/maintenance', label: 'Maintenance Requests', icon: '🛠️' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span style={{ fontSize: '1.5rem' }}>🏢</span>
        <span className="sidebar-logo-text">Room Rental</span>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path} className="sidebar-item">
            <NavLink
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        © 2026 Admin Panel
      </div>
    </aside>
  );
}
