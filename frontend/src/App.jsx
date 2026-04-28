import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Detection from './pages/Detection';
import Violations from './pages/Violations';
import Analytics from './pages/Analytics';
import Propagation from './pages/Propagation';
import { MOCK } from './data';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [stats, setStats] = useState(MOCK.stats);
  const [detectionFeed, setDetectionFeed] = useState(MOCK.detectionFeed);
  const [violations, setViolations] = useState(MOCK.violations);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleAlerts = () => setAlertsOpen(!alertsOpen);

  // Live counters simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        setStats(prev => ({ ...prev, violations: prev.violations + 1 }));
        
        if (Math.random() < 0.5) {
          const platforms = ['youtube', 'tiktok', 'x', 'instagram'];
          const thumbs = ['🎬', '⚽', '🏏', '🎾', '🏆', '🏅'];
          const titles = ['Sports Highlights Reel', 'Match Day Recap', 'Epic Goals Compilation', 'Best Moments HD', 'Live Sports Clips'];
          
          const newItem = {
            id: 'DT-NEW-' + Date.now(),
            title: titles[Math.floor(Math.random() * titles.length)],
            platform: platforms[Math.floor(Math.random() * platforms.length)],
            channel: '@user' + Math.floor(Math.random() * 9999),
            similarity: 70 + Math.floor(Math.random() * 28),
            time: 'Just now',
            thumb: thumbs[Math.floor(Math.random() * thumbs.length)],
            status: 'violation'
          };
          
          setDetectionFeed(prev => {
            const next = [newItem, ...prev];
            if (next.length > 12) next.pop();
            return next;
          });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard stats={stats} violations={violations} navigate={setCurrentPage} />;
      case 'upload': return <Upload navigate={setCurrentPage} setStats={setStats} />;
      case 'detection': return <Detection feed={detectionFeed} stats={stats} setStats={setStats} setFeed={setDetectionFeed} />;
      case 'violations': return <Violations violations={violations} setViolations={setViolations} />;
      case 'analytics': return <Analytics stats={stats} />;
      case 'propagation': return <Propagation />;
      default: return <Dashboard stats={stats} violations={violations} navigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <Sidebar 
        isOpen={sidebarOpen} 
        currentPage={currentPage} 
        navigate={setCurrentPage} 
        stats={stats} 
      />
      
      <main className={`main-content ${!sidebarOpen ? 'full' : ''}`} onClick={() => alertsOpen && setAlertsOpen(false)}>
        <Topbar 
          toggleSidebar={toggleSidebar} 
          toggleAlerts={toggleAlerts}
          alertsOpen={alertsOpen}
          currentPage={currentPage}
          navigate={setCurrentPage}
        />
        
        <div className="page active">
          {renderPage()}
        </div>
      </main>
    </>
  );
}

export default App;
