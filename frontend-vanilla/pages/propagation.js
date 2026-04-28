let graphAnimFrame = null;
let timelineVal = 100;

function renderPropagation() {
  document.getElementById('propagation-content').innerHTML = `
    <div style="margin-bottom:20px;">
      <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">Propagation Graph</h1>
      <p style="color:var(--text3);font-size:13px;">Visualize how stolen content spreads across the internet</p>
    </div>

    <div class="grid-70-30" style="height:calc(100vh - 180px);align-items:start;">
      <!-- Graph Canvas -->
      <div class="card" style="height:100%;display:flex;flex-direction:column;">
        <div class="card-header">
          <div>
            <span class="card-title">🌍 Content Spread Map — IPL Final Highlights</span>
            <div style="font-size:11px;color:var(--text3);margin-top:2px;">9 nodes • 8 edges • Viral propagation detected</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="btn-secondary" style="padding:5px 10px;font-size:11px;" onclick="resetGraphView()">↺ Reset View</button>
          </div>
        </div>
        <!-- Timeline -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:0 4px;">
          <span style="font-size:11px;color:var(--text3);">Timeline</span>
          <input type="range" id="timelineSlider" min="0" max="100" value="100" style="flex:1;accent-color:var(--primary);" oninput="updateTimeline(this.value)" />
          <span id="timelineLabel" style="font-size:11px;color:var(--text2);min-width:60px;text-align:right;">Now</span>
        </div>
        <div style="flex:1;position:relative;border-radius:10px;overflow:hidden;background:var(--bg);">
          <canvas id="graphCanvas" style="width:100%;height:100%;cursor:grab;"></canvas>
          <!-- Legend -->
          <div style="position:absolute;bottom:12px;left:12px;background:rgba(17,18,23,0.9);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:11px;">
            <div style="font-weight:600;margin-bottom:6px;color:var(--text2);">Legend</div>
            ${[
              {c:'#6366f1',l:'Original Upload'},
              {c:'#ef4444',l:'Primary Violator'},
              {c:'#f59e0b',l:'Secondary Share'},
              {c:'#94a3b8',l:'Tertiary Spread'},
            ].map(x=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;"><div style="width:10px;height:10px;border-radius:50%;background:${x.c};"></div>${x.l}</div>`).join('')}
          </div>
          <!-- Stats overlay -->
          <div style="position:absolute;top:12px;right:12px;background:rgba(17,18,23,0.9);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:11px;">
            <div style="color:var(--danger);font-weight:700;font-size:16px;">8 copies</div>
            <div style="color:var(--text3);">detected</div>
            <div style="color:var(--warning);font-weight:700;font-size:16px;margin-top:6px;">3 layers</div>
            <div style="color:var(--text3);">deep</div>
          </div>
        </div>
      </div>

      <!-- Side panel -->
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="card">
          <div class="card-title" style="margin-bottom:12px;">📊 Spread Stats</div>
          ${[
            {l:'Original Upload',v:'SportsPlusTV',c:'var(--primary)'},
            {l:'First Violation',v:'2 hours ago',c:'var(--danger)'},
            {l:'Total Copies',v:'8 accounts',c:'var(--warning)'},
            {l:'Reach (est.)',v:'2.4M views',c:'var(--cyan)'},
            {l:'Revenue Impact',v:'-$84,000',c:'var(--danger)'},
          ].map(s=>`
          <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px;">
            <span style="color:var(--text3);">${s.l}</span>
            <span style="font-weight:600;color:${s.c};">${s.v}</span>
          </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-title" style="margin-bottom:12px;">🔗 Propagation Chain</div>
          <div style="font-size:12px;">
            ${MOCK.propagation.filter(n=>n.type!=='tertiary').map((n,i)=>`
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;">
              <div style="width:8px;height:8px;border-radius:50%;background:${n.type==='origin'?'var(--primary)':n.type==='violator'?'var(--danger)':'var(--warning)'};flex-shrink:0;"></div>
              <span style="color:var(--text);">${n.label.replace('\n',' ')}</span>
            </div>
            ${n.children?.length?`<div style="margin-left:16px;font-size:10px;color:var(--text3);">↓ ${n.children.length} re-share(s)</div>`:''}`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-title" style="margin-bottom:10px;">⚡ Actions</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button class="btn-danger" style="width:100%;" onclick="showToast('Takedowns sent to all nodes','danger')">🚫 Takedown All Nodes</button>
            <button class="btn-warning" style="width:100%;" onclick="showToast('Report generated','warning')">📋 Export Report</button>
            <button class="btn-secondary" style="width:100%;" onclick="showToast('Flagged for manual review','success')">👁 Flag for Review</button>
          </div>
        </div>
      </div>
    </div>
  `;
  setTimeout(drawGraph, 50);
}

function updateTimeline(val) {
  timelineVal = parseInt(val);
  const label = val == 100 ? 'Now' : val > 75 ? '6h ago' : val > 50 ? '12h ago' : val > 25 ? '1d ago' : '2d ago';
  document.getElementById('timelineLabel').textContent = label;
  drawGraph();
}

function resetGraphView() { document.getElementById('timelineSlider').value = 100; updateTimeline(100); }

function drawGraph() {
  const canvas = document.getElementById('graphCanvas');
  if (!canvas) return;
  const W = canvas.parentElement.offsetWidth;
  const H = canvas.parentElement.offsetHeight || 400;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const visibleCount = Math.ceil((timelineVal / 100) * MOCK.propagation.length);
  const visible = MOCK.propagation.slice(0, Math.max(1, visibleCount));
  const visibleIds = new Set(visible.map(n => n.id));

  const nodeColors = { origin:'#6366f1', violator:'#ef4444', secondary:'#f59e0b', tertiary:'#94a3b8' };
  const nodeGlows = { origin:'rgba(99,102,241,0.4)', violator:'rgba(239,68,68,0.4)', secondary:'rgba(245,158,11,0.3)', tertiary:'rgba(148,163,184,0.2)' };

  // Compute positions
  const positions = {};
  MOCK.propagation.forEach(n => {
    positions[n.id] = { x: n.x * W, y: n.y * H };
  });

  ctx.clearRect(0, 0, W, H);

  // Draw edges
  MOCK.propagation.forEach(n => {
    if (!visibleIds.has(n.id)) return;
    (n.children||[]).forEach(cId => {
      if (!visibleIds.has(cId)) return;
      const p = positions[n.id], q = positions[cId];
      const grad = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
      grad.addColorStop(0, 'rgba(99,102,241,0.5)');
      grad.addColorStop(1, 'rgba(239,68,68,0.3)');
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      // Bezier curve
      const mx = (p.x+q.x)/2, my = (p.y+q.y)/2 - 20;
      ctx.quadraticCurveTo(mx, my, q.x, q.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4,4]);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrow
      const angle = Math.atan2(q.y-my, q.x-mx);
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(angle);
      ctx.fillStyle = 'rgba(239,68,68,0.6)';
      ctx.beginPath();
      ctx.moveTo(0,0);ctx.lineTo(-8,-4);ctx.lineTo(-8,4);ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  });

  // Draw nodes
  visible.forEach(n => {
    const {x,y} = positions[n.id];
    const color = nodeColors[n.type];
    const glow = nodeGlows[n.type];
    const r = n.type==='origin'?20:n.type==='violator'?15:n.type==='secondary'?12:9;

    // Glow
    const radGrad = ctx.createRadialGradient(x,y,0,x,y,r*2.5);
    radGrad.addColorStop(0, glow);
    radGrad.addColorStop(1, 'transparent');
    ctx.beginPath();ctx.arc(x,y,r*2.5,0,Math.PI*2);ctx.fillStyle=radGrad;ctx.fill();

    // Node circle
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle=color;ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1.5;ctx.stroke();

    // Label
    const lines = n.label.split('\n');
    ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.font=`bold ${n.type==='origin'?11:10}px Inter`;
    ctx.textAlign='center';
    lines.forEach((l,i) => ctx.fillText(l, x, y+r+14+(i*12)));
  });
}
