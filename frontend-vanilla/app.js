// ── App Core ─────────────────────────────────────────────────
let currentPage = 'dashboard';
let sidebarOpen = true;

function navigate(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show target
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');

  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });

  // Update breadcrumb
  const labels = { dashboard:'Dashboard', upload:'Upload Content', detection:'Live Detection', violations:'Violations', analytics:'Analytics', propagation:'Propagation Graph' };
  document.getElementById('breadcrumb').textContent = labels[page] || page;

  currentPage = page;

  // Render page content
  const renderers = { dashboard: renderDashboard, upload: renderUpload, detection: renderDetection, violations: renderViolations, analytics: renderAnalytics, propagation: renderPropagation };
  if (renderers[page]) renderers[page]();

  // Close alerts
  document.getElementById('alertDropdown').classList.remove('open');
}

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  document.getElementById('sidebar').classList.toggle('collapsed', !sidebarOpen);
  document.getElementById('mainContent').classList.toggle('full', !sidebarOpen);
}

function toggleAlerts() {
  document.getElementById('alertDropdown').classList.toggle('open');
}

// Close alerts on outside click
document.addEventListener('click', (e) => {
  const drop = document.getElementById('alertDropdown');
  const bell = document.getElementById('alertBell');
  if (drop.classList.contains('open') && !drop.contains(e.target) && !bell.contains(e.target)) {
    drop.classList.remove('open');
  }
});

// Live counters animation
function startLiveCounters() {
  // Occasionally bump violation count
  setInterval(() => {
    if (Math.random() < 0.3) {
      MOCK.stats.violations++;
      const el = document.getElementById('live-violations');
      if (el) {
        el.textContent = MOCK.stats.violations;
        el.parentElement.style.color = '#ef4444';
        setTimeout(() => el.parentElement.style.color = '', 500);
      }
      // Add to detection feed occasionally
      if (Math.random() < 0.5) addLiveDetection();
    }
  }, 5000);
}

function addLiveDetection() {
  const platforms = ['youtube','tiktok','x'];
  const thumbs = ['🎬','⚽','🏏','🎾','🏆','🏅'];
  const titles = ['Sports Highlights Reel','Match Day Recap','Epic Goals Compilation','Best Moments HD','Live Sports Clips'];
  const item = {
    id: 'DT-NEW-' + Date.now(),
    title: titles[Math.floor(Math.random()*titles.length)],
    platform: platforms[Math.floor(Math.random()*platforms.length)],
    channel: '@user' + Math.floor(Math.random()*9999),
    similarity: 70 + Math.floor(Math.random()*28),
    time: 'Just now',
    thumb: thumbs[Math.floor(Math.random()*thumbs.length)],
    status: 'violation'
  };
  MOCK.detectionFeed.unshift(item);
  if (MOCK.detectionFeed.length > 12) MOCK.detectionFeed.pop();
  if (currentPage === 'detection') renderDetection();
}

function formatCurrency(n) {
  if (n >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + (n/1e3).toFixed(0) + 'K';
  return '$' + n;
}

function scoreClass(s) {
  if (s >= 85) return 'high';
  if (s >= 65) return 'mid';
  return 'low';
}

function platformPill(p) {
  const icons = { youtube:'▶', tiktok:'♪', x:'𝕏', instagram:'📷' };
  return `<span class="platform-pill ${p}">${icons[p]||'•'} ${p.charAt(0).toUpperCase()+p.slice(1)}</span>`;
}
