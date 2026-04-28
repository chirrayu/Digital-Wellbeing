function renderDashboard() {
  const s = MOCK.stats;
  document.getElementById('dashboard-content').innerHTML = `
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:22px;gap:12px;flex-wrap:wrap;">
      <div>
        <div style="font-size:11px;font-weight:700;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Control Tower</div>
        <h1 style="font-family:'Syne',sans-serif;font-size:26px;font-weight:800;line-height:1.1;letter-spacing:-.4px;">Content Protection<br>Overview</h1>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-secondary" onclick="navigate('analytics')">Analytics</button>
        <button class="btn-primary" onclick="navigate('upload')">+ Upload Content</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card orange">
        <div class="stat-label">Protected Assets</div>
        <div class="stat-value">${s.assets.toLocaleString()}</div>
        <div class="stat-delta up">+12 this week</div>
      </div>
      <div class="stat-card red">
        <div class="stat-label">Active Violations</div>
        <div class="stat-value" id="live-violations" style="color:var(--danger);">${s.violations}</div>
        <div class="stat-delta down">+8 last hour</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-label">Platforms Tracked</div>
        <div class="stat-value" style="color:var(--blue);">4</div>
        <div class="stat-delta up" style="color:var(--ok);">All systems live</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Revenue Protected</div>
        <div class="stat-value" style="color:var(--ok);">$2.4M</div>
        <div class="stat-delta up">+$140K today</div>
      </div>
    </div>

    <!-- Monitoring bar -->
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="status-dot pulse"></span>
        <div>
          <span style="font-weight:700;font-size:13px;">Monitoring Active</span>
          <span style="color:var(--text3);font-size:12px;margin-left:10px;">— AI engine scanning continuously</span>
        </div>
      </div>
      <div style="display:flex;gap:20px;">
        ${['YouTube','TikTok','X','Instagram'].map(p=>`
        <div style="text-align:center;">
          <div style="font-size:11px;color:var(--text3);">${p}</div>
          <div style="font-size:10px;color:var(--ok);font-weight:700;margin-top:1px;">LIVE</div>
        </div>`).join('')}
      </div>
    </div>

    <div class="grid-6040" style="margin-bottom:16px;">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Recent Violations</span>
          <button class="btn-secondary" onclick="navigate('violations')" style="padding:4px 10px;font-size:11px;">View all</button>
        </div>
        <table class="data-table">
          <thead><tr><th>Content</th><th>Platform</th><th>Match</th><th>Status</th></tr></thead>
          <tbody>
            ${MOCK.violations.slice(0,4).map(v=>`
            <tr>
              <td>
                <div style="font-weight:600;font-size:12px;">${v.original}</div>
                <div style="font-size:10px;color:var(--text3);">${v.found}</div>
              </td>
              <td>${platformPill(v.platform)}</td>
              <td><span style="font-weight:800;font-family:'Syne',sans-serif;font-size:14px;color:${v.severity>=85?'var(--danger)':v.severity>=65?'var(--warn)':'var(--ok)'};">${v.severity}%</span></td>
              <td><span class="badge ${v.status}">${v.status==='violation'?'VIOLATION':v.status==='review'?'REVIEW':'OK'}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="card">
          <div class="card-title" style="margin-bottom:12px;">Quick Actions</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <button class="btn-primary" style="width:100%;text-align:left;" onclick="navigate('upload')">Upload & Protect Content</button>
            <button class="btn-secondary" style="width:100%;text-align:left;" onclick="navigate('violations')">Review Violations</button>
            <button class="btn-secondary" style="width:100%;text-align:left;" onclick="navigate('detection')">Live Detection Feed</button>
            <button class="btn-secondary" style="width:100%;text-align:left;" onclick="navigate('propagation')">Propagation Graph</button>
          </div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px;">Trending Pirated</div>
          ${MOCK.analytics.topContent.map((c,i)=>`
          <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);">
            <div style="width:18px;font-size:11px;font-weight:800;color:${i===0?'var(--danger)':i===1?'var(--warn)':'var(--text3)'};">${i+1}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.name}</div>
              <div style="font-size:10px;color:var(--text3);">${c.count} copies &mdash; ${formatCurrency(c.loss)} loss</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title" style="margin-bottom:14px;">Platform Breakdown</div>
        ${Object.entries(MOCK.analytics.platforms).map(([p,v])=>`
        <div style="margin-bottom:11px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
            <span style="color:var(--text2);">${p}</span>
            <span style="font-weight:700;font-family:'Syne',sans-serif;">${v}%</span>
          </div>
          <div class="score-bar"><div class="score-fill ${v>40?'high':v>20?'mid':'low'}" style="width:${v}%"></div></div>
        </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:14px;">Week Summary</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${[
            {l:'Takedowns Sent',v:MOCK.analytics.takedownsSent,c:'var(--orange)'},
            {l:'Successful',v:MOCK.analytics.takedownsSuccess,c:'var(--ok)'},
            {l:'Pending Review',v:8,c:'var(--warn)'},
            {l:'Revenue Saved',v:formatCurrency(MOCK.analytics.revenueLoss),c:'var(--blue)'},
          ].map(x=>`
          <div style="background:var(--bg3);border-radius:8px;padding:13px;">
            <div style="font-size:10px;color:var(--text3);margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px;">${x.l}</div>
            <div style="font-size:22px;font-weight:900;color:${x.c};font-family:'Syne',sans-serif;">${x.v}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  `;
}
