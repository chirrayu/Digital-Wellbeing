function renderAnalytics() {
  const a = MOCK.analytics;
  document.getElementById('analytics-content').innerHTML = `
    <div style="margin-bottom:22px;">
      <div style="font-size:11px;font-weight:700;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Insights</div>
      <h1 style="font-family:'Syne',sans-serif;font-size:26px;font-weight:800;letter-spacing:-.4px;">Analytics</h1>
    </div>

    <!-- KPI row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;">
      ${[
        {l:'Total Violations',v:MOCK.stats.violations,c:'var(--danger)',d:'↑ 23% this week'},
        {l:'Takedowns Sent',v:a.takedownsSent,c:'var(--orange)',d:a.takedownsSuccess+' successful'},
        {l:'Revenue Protected',v:'$2.4M',c:'var(--ok)',d:'↑ $140K today'},
        {l:'Est. Revenue Loss',v:formatCurrency(a.revenueLoss),c:'var(--warn)',d:'Across all platforms'},
      ].map(k => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-left:2px solid ${k.c};border-radius:var(--r);padding:16px;">
        <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">${k.l}</div>
        <div style="font-size:28px;font-weight:900;color:${k.c};font-family:'Syne',sans-serif;">${k.v}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:4px;">${k.d}</div>
      </div>`).join('')}
    </div>

    <div class="grid-6040" style="margin-bottom:16px;">
      <!-- Violations Chart -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📈 Violations This Week</span>
          <span style="font-size:11px;color:var(--text3);">Daily breakdown</span>
        </div>
        <div style="position:relative;height:180px;">
          <canvas id="violChart" style="width:100%;height:100%;"></canvas>
        </div>
      </div>

      <!-- Platform Breakdown -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🎯 Platform Split</span>
        </div>
        <div style="position:relative;height:160px;display:flex;align-items:center;justify-content:center;">
          <canvas id="pieChart" style="max-width:160px;max-height:160px;"></canvas>
          <div id="pieLegend" style="margin-left:16px;"></div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Top Pirated Content -->
      <div class="card">
        <div class="card-title" style="margin-bottom:14px;">🔥 Most Pirated Content</div>
        ${a.topContent.map((c,i) => `
        <div style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <div>
              <span style="font-size:11px;font-weight:700;color:${i===0?'var(--danger)':i===1?'var(--warn)':'var(--text3)'};">  #${i+1}</span>
              <span style="font-size:13px;font-weight:500;margin-left:6px;">${c.name}</span>
            </div>
            <span style="font-size:12px;color:var(--text3);">${c.count} copies</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="score-bar" style="flex:1;"><div class="score-fill ${i<2?'high':'mid'}" style="width:${(c.count/a.topContent[0].count)*100}%"></div></div>
            <span style="font-size:11px;color:var(--danger);font-weight:600;">-${formatCurrency(c.loss)}</span>
          </div>
        </div>`).join('')}
      </div>

      <!-- Takedown Stats -->
      <div class="card">
        <div class="card-title" style="margin-bottom:14px;">📊 Takedown Effectiveness</div>
        <div style="text-align:center;margin-bottom:16px;">
          <div style="font-size:48px;font-weight:900;color:var(--ok);font-family:'Syne',sans-serif;">${Math.round((a.takedownsSuccess/a.takedownsSent)*100)}%</div>
          <div style="font-size:12px;color:var(--text3);">Success Rate</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            {l:'Sent',v:a.takedownsSent,max:a.takedownsSent,c:'var(--orange)'},
            {l:'Accepted',v:a.takedownsSuccess,max:a.takedownsSent,c:'var(--ok)'},
            {l:'Pending',v:a.takedownsSent-a.takedownsSuccess-2,max:a.takedownsSent,c:'var(--warn)'},
            {l:'Rejected',v:2,max:a.takedownsSent,c:'var(--danger)'},
          ].map(r => `
          <div>
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;"><span>${r.l}</span><span style="font-weight:600;color:${r.c};">${r.v}</span></div>
            <div class="score-bar"><div style="height:100%;border-radius:2px;background:${r.c};width:${(r.v/r.max)*100}%;transition:width 0.8s;"></div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  `;
  drawViolationsChart();
  drawPieChart();
}

function drawViolationsChart() {
  const canvas = document.getElementById('violChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.parentElement.offsetWidth;
  const H = 180;
  canvas.width = W; canvas.height = H;
  const data = MOCK.analytics.violationsOverTime;
  const labels = MOCK.analytics.labels;
  const max = Math.max(...data);
  const pad = { t:10, r:10, b:30, l:30 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  for (let i=0;i<=4;i++) { const y=pad.t+cH-(cH/4*i); ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+cW,y);ctx.stroke(); }

  // Bars
  const bW = (cW/data.length)*0.6;
  data.forEach((v,i) => {
    const x = pad.l + (cW/data.length)*i + (cW/data.length)*0.2;
    const bH = (v/max)*cH;
    const y = pad.t+cH-bH;
    const grad = ctx.createLinearGradient(0,y,0,y+bH);
    grad.addColorStop(0,'rgba(255,92,53,0.9)');
    grad.addColorStop(1,'rgba(255,92,53,0.15)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect?ctx.roundRect(x,y,bW,bH,3):ctx.rect(x,y,bW,bH);
    ctx.fill();
    // Label
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter';ctx.textAlign='center';
    ctx.fillText(labels[i],x+bW/2,H-8);
    ctx.fillStyle='rgba(255,255,255,0.8)';
    ctx.fillText(v,x+bW/2,y-4);
  });
}

function drawPieChart() {
  const canvas = document.getElementById('pieChart');
  const legend = document.getElementById('pieLegend');
  if (!canvas||!legend) return;
  canvas.width=160; canvas.height=160;
  const ctx=canvas.getContext('2d');
  const data=MOCK.analytics.platforms;
  const colors=['#ef4444','#06b6d4','#e2e8f0','#e1306c'];
  const entries=Object.entries(data);
  const total=entries.reduce((s,[,v])=>s+v,0);
  let start=-(Math.PI/2);
  const cx=80,cy=80,r=60,ri=35;
  entries.forEach(([k,v],i) => {
    const slice=(v/total)*Math.PI*2;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,start,start+slice);ctx.closePath();
    ctx.fillStyle=colors[i];ctx.fill();
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,ri,start,start+slice);ctx.closePath();
    ctx.fillStyle='#111217';ctx.fill();
    start+=slice;
  });
  legend.innerHTML=entries.map(([k,v],i)=>`
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;font-size:12px;">
      <div style="width:10px;height:10px;border-radius:2px;background:${colors[i]};flex-shrink:0;"></div>
      <span style="color:var(--text3);">${k}</span>
      <span style="font-weight:600;margin-left:auto;">${v}%</span>
    </div>`).join('');
}
