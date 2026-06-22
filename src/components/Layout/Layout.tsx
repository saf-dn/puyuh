import { NavLink, Outlet } from 'react-router-dom';
import { Bird, Wallet, BarChart3 } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout-container">
      {/* Mobile Header */}
      <header className="mobile-header glass-panel">
        <h1 className="text-gradient">NexPuyuh</h1>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation for Mobile / Sidebar for Desktop */}
      <nav className="bottom-nav glass-panel">
        <NavLink 
          to="/puyuh" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Bird size={24} />
          <span>Kandang</span>
        </NavLink>

        <NavLink 
          to="/finance" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Wallet size={24} />
          <span>Keuangan</span>
        </NavLink>

        <NavLink 
          to="/summary" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={24} />
          <span>Ringkasan</span>
        </NavLink>
      </nav>
    </div>
  );
}
