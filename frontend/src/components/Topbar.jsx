import { Menu, Search, Bell, X } from 'lucide-react';
import { MOCK } from '../data';

export default function Topbar({ toggleSidebar, toggleAlerts, alertsOpen, currentPage, navigate }) {
  const labels = { 
    dashboard: 'Dashboard', 
    upload: 'Upload Content', 
    detection: 'Live Detection', 
    violations: 'Violations', 
    analytics: 'Analytics', 
    propagation: 'Propagation Graph' 
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <Menu size={20} />
          </button>
          <div className="breadcrumb">{labels[currentPage] || currentPage}</div>
        </div>
        <div className="topbar-right">
          <div className="search-bar">
            <Search size={16} />
            <input type="text" placeholder="Search content, violations..." />
          </div>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); toggleAlerts(); }}>
            <Bell size={18} />
            <span className="bell-badge">5</span>
          </button>
          <button className="btn-primary" onClick={() => navigate('upload')}>+ Upload</button>
        </div>
      </header>

      {/* Alert Dropdown */}
      <div className={`alert-dropdown ${alertsOpen ? 'open' : ''}`}>
        <div className="alert-header">
          <span>Notifications</span>
          <button onClick={toggleAlerts}><X size={14} /></button>
        </div>
        <div className="alert-list">
          {MOCK.recentAlerts.map(a => (
            <div key={a.id} className={`alert-item ${a.type}`}>
              <div className="alert-dot"></div>
              <div>
                <strong>{a.msg.split(':')[0]}</strong><br/>
                <small>{a.msg.split(':')[1]}</small>
              </div>
              <span className="alert-time">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
