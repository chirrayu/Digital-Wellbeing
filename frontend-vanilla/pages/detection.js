function renderDetection() {
  document.getElementById('detection-content').innerHTML = `
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:22px;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="font-size:11px;font-weight:700;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Monitoring</div>
        <h1 style="font-family:'Syne',sans-serif;font-size:26px;font-weight:800;letter-spacing:-.4px;">Live Detection Feed</h1>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="display:flex;align-items:center;gap:6px;background:var(--ok-glow);border:1px solid rgba(34,197,94,.15);padding:6px 12px;border-radius:6px;font-size:12px;color:var(--ok);font-weight:700;">
          <span class="status-dot pulse"></span> AI Engine Active
        </div>
        <select id="platformFilter" onchange="renderDetection()" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--text);font-size:13px;outline:none;">
          <option value="">All Platforms</option>
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="x">X</option>
          <option value="instagram">Instagram</option>
        </select>
      </div>
    </div>

    <!-- Stats row -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
      <div style="background:var(--bg2);border:1px solid var(--border);border-left:2px solid var(--danger);border-radius:var(--r);padding:16px;">
        <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;margin-bottom:8px;">VIOLATIONS</div>
        <div style="font-size:28px;font-weight:900;color:var(--danger);font-family:'Syne',sans-serif;">${MOCK.detectionFeed.filter(d=>d.status==='violation').length}</div>
      </div>
      <div style="background:var(--bg2);border:1px solid var(--border);border-left:2px solid var(--warn);border-radius:var(--r);padding:16px;">
        <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;margin-bottom:8px;">NEEDS REVIEW</div>
        <div style="font-size:28px;font-weight:900;color:var(--warn);font-family:'Syne',sans-serif;">${MOCK.detectionFeed.filter(d=>d.status==='review').length}</div>
      </div>
      <div style="background:var(--bg2);border:1px solid var(--border);border-left:2px solid var(--ok);border-radius:var(--r);padding:16px;">
        <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;margin-bottom:8px;">AUTHORIZED</div>
        <div style="font-size:28px;font-weight:900;color:var(--ok);font-family:'Syne',sans-serif;">${MOCK.detectionFeed.filter(d=>d.status==='authorized').length}</div>
      </div>
    </div>

    <div class="grid-70-30" style="align-items:start;">
      <div>
        <div class="card-title" style="margin-bottom:12px;">Detection Stream</div>
        <div id="detectionList">
          ${buildDetectionList()}
        </div>
      </div>

      <!-- Pipeline -->
      <div>
        <div class="card" style="margin-bottom:16px;">
          <div class="card-title" style="margin-bottom:14px;">Detection Pipeline</div>
          ${[
            {icon:'○', label:'Internet Scan', status:'Running', color:'var(--ok)'},
            {icon:'○', label:'AI Matching', status:'Running', color:'var(--ok)'},
            {icon:'○', label:'Rights Check', status:'Running', color:'var(--ok)'},
            {icon:'○', label:'Alert Engine', status:'Standby', color:'var(--warn)'},
          ].map(s => `
          <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);">
            <div style="width:6px;height:6px;border-radius:50%;background:${s.color};flex-shrink:0;"></div>
            <span style="flex:1;font-size:13px;font-weight:500;">${s.label}</span>
            <span style="font-size:10px;font-weight:700;color:${s.color};letter-spacing:.5px;">${s.status.toUpperCase()}</span>
          </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-title" style="margin-bottom:14px;">Threshold Settings</div>
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;"><span>Violation Threshold</span><span style="color:var(--danger);font-weight:600;">85%</span></div>
            <input type="range" min="50" max="99" value="85" style="width:100%;accent-color:var(--danger);" oninput="this.previousElementSibling.lastElementChild.textContent=this.value+'%'"/>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;"><span>Review Threshold</span><span style="color:var(--warning);font-weight:600;">65%</span></div>
            <input type="range" min="30" max="84" value="65" style="width:100%;accent-color:var(--warning);" oninput="this.previousElementSibling.lastElementChild.textContent=this.value+'%'"/>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildDetectionList() {
  const filter = document.getElementById('platformFilter')?.value || '';
  const items = filter ? MOCK.detectionFeed.filter(d => d.platform === filter) : MOCK.detectionFeed;
  return items.map(d => {
    const sc = scoreClass(d.similarity);
    const statusColor = d.status==='violation'?'var(--danger)':d.status==='review'?'var(--warning)':'var(--success)';
    return `
    <div class="detection-item" id="det-${d.id}">
      <div class="detection-thumb">${d.thumb}</div>
      <div class="detection-info">
        <div class="detection-title">${d.title}</div>
        <div class="detection-meta">
          ${platformPill(d.platform)}
          <span>${d.channel}</span>
          <span>🕐 ${d.time}</span>
        </div>
        <div style="margin-top:6px;"><span class="badge ${d.status}">${d.status==='violation'?'❌ Violation':d.status==='review'?'⚠️ Review':'✅ Authorized'}</span></div>
      </div>
      <div class="detection-score">
        <div class="score-pct ${sc}">${d.similarity}%</div>
        <div style="font-size:10px;color:var(--text3);">match</div>
        <div class="score-bar" style="width:60px;margin-top:4px;"><div class="score-fill ${sc}" style="width:${d.similarity}%"></div></div>
        <button onclick="escalateViolation('${d.id}')" style="margin-top:8px;font-size:10px;padding:4px 8px;background:var(--danger-glow);color:var(--danger);border:1px solid rgba(239,68,68,0.2);border-radius:6px;cursor:pointer;font-weight:600;">Escalate</button>
      </div>
    </div>`;
  }).join('');
}

function escalateViolation(id) {
  const item = MOCK.detectionFeed.find(d => d.id === id);
  if (item) {
    item.status = 'violation';
    MOCK.stats.violations++;
    renderDetection();
  }
}
