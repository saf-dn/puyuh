import { NavLink, Outlet } from 'react-router-dom';
import { Bird, Wallet, BarChart3, Egg } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout-container">

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
          to="/production" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Egg size={24} />
          <span>Produksi</span>
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
