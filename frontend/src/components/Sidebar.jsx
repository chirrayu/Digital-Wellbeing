import { Shield, LayoutDashboard, UploadCloud, Activity, AlertTriangle, BarChart3, Network } from 'lucide-react';

export default function Sidebar({ isOpen, currentPage, navigate, stats }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'OVERVIEW' },
    { id: 'upload', label: 'Upload Content', icon: UploadCloud },
    { id: 'detection', label: 'Live Detection', icon: Activity, section: 'MONITORING', badge: 12 },
    { id: 'violations', label: 'Violations', icon: AlertTriangle, badge: stats.violations, danger: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'INSIGHTS' },
    { id: 'propagation', label: 'Propagation Graph', icon: Network },
  ];

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`} id="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Shield size={18} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="brand-name">ShieldStream</div>
          <div className="brand-sub">Protection Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <div key={item.id}>
            {item.section && <div className="nav-section-label">{item.section}</div>}
            <a 
              href={`#${item.id}`} 
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate(item.id); }}
            >
              <item.icon size={15} className="nav-icon" />
              {item.label}
              {item.badge !== undefined && (
                <span className={`nav-badge ${item.danger ? 'danger' : ''}`}>{item.badge}</span>
              )}
            </a>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="monitoring-status">
          <span className="status-dot pulse"></span>
          <span>Monitoring Active</span>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">SP</div>
          <div>
            <div className="user-name">Sports Plus</div>
            <div className="user-role">Rights Holder</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
