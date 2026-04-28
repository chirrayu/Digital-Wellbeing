let violationFilter = 'all';

function renderViolations() {
  document.getElementById('violations-content').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="font-size:11px;font-weight:700;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Enforcement</div>
        <h1 style="font-family:'Syne',sans-serif;font-size:26px;font-weight:800;letter-spacing:-.4px;">Violation Management</h1>
        <p style="color:var(--text3);font-size:12px;margin-top:3px;">${MOCK.violations.length} active cases</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-danger" onclick="sendAllTakedowns()">Send All Takedowns</button>
        <button class="btn-secondary" onclick="exportViolations()">Export CSV</button>
      </div>
    </div>

    <!-- Filter tabs -->
    <div style="display:flex;gap:6px;margin-bottom:20px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:5px;width:fit-content;">
      ${['all','violation','review','authorized'].map(f => `
      <button onclick="filterViolations('${f}')" id="vf-${f}" style="padding:6px 16px;border-radius:7px;font-size:12px;font-weight:600;border:none;cursor:pointer;transition:all 0.2s;background:${violationFilter===f?'var(--primary)':'transparent'};color:${violationFilter===f?'#fff':'var(--text3)'};">
        ${f==='all'?'All Cases':f==='violation'?'❌ Violations':f==='review'?'⚠️ Review':'✅ Authorized'}
        ${f==='all'?`(${MOCK.violations.length})`:f==='violation'?`(${MOCK.violations.filter(v=>v.status==='violation').length})`:f==='review'?`(${MOCK.violations.filter(v=>v.status==='review').length})`:'(0)'}
      </button>`).join('')}
    </div>

    <div id="violationsGrid" style="display:flex;flex-direction:column;gap:14px;">
      ${buildViolationCards()}
    </div>
  `;
}

function buildViolationCards() {
  const items = violationFilter==='all' ? MOCK.violations : MOCK.violations.filter(v=>v.status===violationFilter);
  if (!items.length) return `<div style="text-align:center;padding:48px;color:var(--text3);">No ${violationFilter} cases found</div>`;
  return items.map(v => {
    const thumbEmojis = {cricket:'🏏',football:'⚽',tennis:'🎾',default:'🎬'};
    const t = thumbEmojis[v.original.toLowerCase().includes('cricket')||v.original.toLowerCase().includes('ipl')?'cricket':v.original.toLowerCase().includes('fifa')?'football':v.original.toLowerCase().includes('wimbledon')?'tennis':'default'];
    const sc = scoreClass(v.severity);
    const regionColor = v.region==='Global'?'var(--cyan)':'var(--text3)';
    return `
    <div class="violation-card" id="vc-${v.id}">
      <div class="vc-top">
        <div>
          <div class="vc-label" style="color:var(--text3);">Original Content</div>
          <div class="vc-thumb">${t}</div>
          <div style="font-size:12px;font-weight:600;margin-top:6px;">${v.original}</div>
          <div style="font-size:11px;color:var(--text3);">ID: ${v.id}</div>
        </div>
        <div class="vc-vs">
          <div style="font-size:24px;margin-bottom:4px;">⚡</div>
          <div>vs</div>
          <div style="margin-top:8px;font-size:18px;font-weight:800;color:${sc==='high'?'var(--danger)':sc==='mid'?'var(--warning)':'var(--success)'};">${v.severity}%</div>
          <div style="font-size:10px;color:var(--text3);">similarity</div>
        </div>
        <div>
          <div class="vc-label" style="color:var(--danger);">Detected Copy</div>
          <div class="vc-thumb" style="border:2px solid ${sc==='high'?'var(--danger)':sc==='mid'?'var(--warning)':'var(--success)'};">${t}</div>
          <div style="font-size:12px;font-weight:600;margin-top:6px;">${v.detected}</div>
          <div style="font-size:11px;color:var(--text3);">${v.uploader}</div>
        </div>
      </div>
      <div class="vc-meta">
        ${platformPill(v.platform)}
        <span class="badge ${v.status}">${v.status==='violation'?'VIOLATION':v.status==='review'?'REVIEW':'AUTHORIZED'}</span>
        <span style="font-size:11px;color:${regionColor};">🌍 ${v.region}</span>
        <span style="font-size:11px;color:var(--text3);">🕐 ${v.found}</span>
        <div style="margin-left:auto;display:flex;align-items:center;gap:6px;">
          <div class="score-bar" style="width:80px;"><div class="score-fill ${sc}" style="width:${v.severity}%"></div></div>
          <span style="font-size:11px;font-weight:700;color:${sc==='high'?'var(--danger)':sc==='mid'?'var(--warning)':'var(--success)'};">${v.severity}%</span>
        </div>
      </div>
      <div class="vc-actions">
        <button class="btn-danger" onclick="markViolation('${v.id}')">🚫 Mark Violation</button>
        <button class="btn-warn" onclick="sendTakedown('${v.id}')">Send Takedown</button>
        <button class="btn-ok" onclick="ignoreViolation('${v.id}')">Allow</button>
        <a href="https://${v.link}" target="_blank" style="margin-left:auto;font-size:11px;color:var(--primary);text-decoration:none;display:flex;align-items:center;gap:4px;">🔗 View Source ↗</a>
      </div>
    </div>`;
  }).join('');
}

function filterViolations(f) {
  violationFilter = f;
  renderViolations();
}

function markViolation(id) {
  const v = MOCK.violations.find(x => x.id===id);
  if (v) { v.status='violation'; showToast('Marked as violation','danger'); renderViolations(); }
}
function sendTakedown(id) {
  showToast('Takedown notice sent ✓','success');
  const el = document.getElementById('vc-'+id);
  if (el) { el.style.opacity='0.4'; el.style.pointerEvents='none'; }
}
function ignoreViolation(id) {
  MOCK.violations = MOCK.violations.filter(v => v.id!==id);
  showToast('Case ignored / allowed','warning');
  renderViolations();
}
function sendAllTakedowns() { showToast('All takedown notices dispatched!','success'); }
function exportViolations() { showToast('Report exported as CSV','success'); }

function showToast(msg, type='ok') {
  const t = document.createElement('div');
  const colors = {ok:'var(--ok)',danger:'var(--danger)',warning:'var(--warn)',success:'var(--ok)'};
  t.className = 'toast';
  t.style.cssText = `position:fixed;bottom:22px;right:22px;background:var(--bg2);border:1px solid var(--border2);padding:11px 16px;border-radius:var(--r);font-size:13px;font-weight:600;z-index:9999;border-left:2px solid ${colors[type]||colors.ok};`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}
