let uploadState = 'idle'; // idle | uploading | processing | done
let uploadProgress = 0;
let uploadTimer = null;

function renderUpload() {
  document.getElementById('upload-content').innerHTML = `
    <div style="max-width:760px;margin:0 auto;">
      <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">Upload & Protect Content</h1>
      <p style="color:var(--text3);font-size:13px;margin-bottom:24px;">Secure your media with AI fingerprinting and watermarking</p>

      <!-- Steps -->
      <div style="display:flex;align-items:center;margin-bottom:28px;" id="uploadSteps">
        ${['Upload File','Generate Fingerprint','Embed Watermark','Registry'].map((s,i) => `
        <div style="display:flex;align-items:center;flex:1;">
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div class="step-circle" id="step-circle-${i}" style="width:30px;height:30px;border-radius:50%;background:var(--bg3);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;transition:all 0.4s;">${i+1}</div>
            <div style="font-size:10px;color:var(--text3);margin-top:4px;white-space:nowrap;">${s}</div>
          </div>
          ${i<3?`<div id="step-line-${i}" style="flex:1;height:2px;background:var(--border);margin-bottom:14px;transition:all 0.4s;"></div>`:''}
        </div>`).join('')}
      </div>

      <!-- Upload Zone -->
      <div id="uploadZoneWrap">
        <div class="upload-zone" id="uploadZone" onclick="triggerFileInput()" ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')" ondrop="handleDrop(event)">
          <div class="upload-icon">🎬</div>
          <div class="upload-title">Drop your video or image here</div>
          <div class="upload-sub">Supports MP4, MOV, MKV, JPG, PNG — up to 10 GB</div>
          <button class="btn-primary" style="margin-top:16px;" onclick="event.stopPropagation();triggerFileInput()">Choose File</button>
          <input type="file" id="fileInput" style="display:none" accept="video/*,image/*" onchange="startUpload(this)" />
        </div>
      </div>

      <!-- Metadata Form -->
      <div class="card" style="margin-top:16px;" id="metaForm">
        <div class="card-title" style="margin-bottom:16px;">Content Metadata</div>
        <div class="grid-2" style="gap:12px;">
          <div>
            <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:6px;">Content Name *</label>
            <input type="text" id="meta-name" placeholder="e.g. IPL Final Highlights 2024" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:13px;outline:none;font-family:inherit;" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'" />
          </div>
          <div>
            <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:6px;">Sport / Category *</label>
            <select id="meta-sport" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:13px;outline:none;">
              <option>Cricket</option><option>Football</option><option>Tennis</option><option>Basketball</option><option>Other</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:6px;">Event Name</label>
            <input type="text" id="meta-event" placeholder="e.g. IPL Final 2024" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:13px;outline:none;font-family:inherit;" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'" />
          </div>
          <div>
            <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:6px;">Rights Region</label>
            <select id="meta-region" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:13px;outline:none;">
              <option>Global</option><option>India (IN)</option><option>Europe (EU)</option><option>USA (US)</option><option>UK</option><option>Asia-Pacific</option>
            </select>
          </div>
        </div>
        <div style="margin-top:16px;display:flex;gap:10px;justify-content:flex-end;">
          <button class="btn-secondary" onclick="resetUpload()">Reset</button>
          <button class="btn-primary" id="secureBtn" onclick="startProcessing()">🔒 Secure Content</button>
        </div>
      </div>

      <!-- Progress -->
      <div class="card" id="progressCard" style="display:none;margin-top:16px;">
        <div id="progressBody"></div>
      </div>

      <!-- Success -->
      <div class="card" id="successCard" style="display:none;margin-top:16px;border-color:rgba(16,185,129,0.3);background:rgba(16,185,129,0.05);">
        <div id="successBody"></div>
      </div>
    </div>
  `;
}

function triggerFileInput() { document.getElementById('fileInput').click(); }
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('drag');
  const f = e.dataTransfer.files[0];
  if (f) showFileReady(f.name, f.size);
}
function startUpload(inp) {
  const f = inp.files[0];
  if (f) showFileReady(f.name, f.size);
}
function showFileReady(name, size) {
  const zone = document.getElementById('uploadZone');
  zone.innerHTML = `<div style="font-size:32px;">✅</div><div style="font-weight:600;margin:8px 0;">${name}</div><div style="font-size:12px;color:var(--text3);">${(size/1e6).toFixed(1)} MB — Ready to secure</div>`;
  zone.style.borderColor = 'var(--success)';
  zone.style.background = 'var(--success-glow)';
}

function startProcessing() {
  const name = document.getElementById('meta-name').value || 'Unnamed Content';
  document.getElementById('progressCard').style.display = 'block';
  document.getElementById('metaForm').style.display = 'none';
  document.getElementById('uploadZoneWrap').style.display = 'none';

  const steps = [
    { label:'Uploading file to secure servers...', pct:25, step:0 },
    { label:'Generating perceptual fingerprint (DCT hash)...', pct:50, step:1 },
    { label:'Embedding invisible watermark...', pct:75, step:2 },
    { label:'Registering in Content Registry...', pct:100, step:3 },
  ];
  let i = 0;
  const run = () => {
    if (i >= steps.length) { showSuccess(name); return; }
    const s = steps[i];
    // Update step circles
    for (let j=0;j<4;j++) {
      const c = document.getElementById('step-circle-'+j);
      if (!c) continue;
      if (j < s.step) { c.style.background='var(--success)';c.style.borderColor='var(--success)';c.style.color='#fff';c.textContent='✓'; }
      else if (j === s.step) { c.style.background='var(--primary)';c.style.borderColor='var(--primary)';c.style.color='#fff'; }
      if (j < s.step && j < 3) { const l=document.getElementById('step-line-'+j);if(l)l.style.background='var(--success)'; }
    }
    document.getElementById('progressBody').innerHTML = `
      <div style="margin-bottom:12px;font-weight:600;">${s.label}</div>
      <div style="background:var(--bg3);border-radius:999px;height:8px;overflow:hidden;margin-bottom:8px;">
        <div style="height:100%;border-radius:999px;background:linear-gradient(90deg,var(--primary),var(--cyan));width:${s.pct}%;transition:width 0.8s ease;"></div>
      </div>
      <div style="font-size:12px;color:var(--text3);text-align:right;">${s.pct}%</div>`;
    i++; setTimeout(run, 1200);
  };
  run();
}

function showSuccess(name) {
  const id = 'SS-' + String(MOCK.contentAssets.length+1).padStart(3,'0');
  const fp = 'fp_' + Math.random().toString(36).substr(2,6);
  MOCK.contentAssets.unshift({ id, name, sport: document.getElementById('meta-sport')?.value||'Cricket', event:'Custom Event', owner:'SportsPlusTV', region:'Global', status:'secured', fingerprint:fp, size:'—', uploaded:'Just now' });
  MOCK.stats.assets++;
  document.getElementById('progressCard').style.display = 'none';
  document.getElementById('successCard').style.display = 'block';
  document.getElementById('successBody').innerHTML = `
    <div style="text-align:center;padding:16px 0;">
      <div style="font-size:56px;margin-bottom:12px;">🛡️</div>
      <div style="font-size:20px;font-weight:800;color:var(--success);margin-bottom:6px;">Content Secured!</div>
      <div style="color:var(--text3);font-size:13px;margin-bottom:20px;">${name} is now protected and being monitored.</div>
      <div style="display:inline-grid;grid-template-columns:1fr 1fr;gap:12px;text-align:left;margin-bottom:20px;max-width:380px;width:100%;">
        <div style="background:var(--bg3);border-radius:8px;padding:12px;"><div style="font-size:10px;color:var(--text3);">Content ID</div><div style="font-weight:700;font-family:'JetBrains Mono',monospace;font-size:13px;margin-top:2px;">${id}</div></div>
        <div style="background:var(--bg3);border-radius:8px;padding:12px;"><div style="font-size:10px;color:var(--text3);">Fingerprint</div><div style="font-weight:700;font-family:'JetBrains Mono',monospace;font-size:13px;margin-top:2px;">${fp}</div></div>
        <div style="background:var(--bg3);border-radius:8px;padding:12px;"><div style="font-size:10px;color:var(--text3);">Watermark</div><div style="font-weight:700;color:var(--success);font-size:13px;margin-top:2px;">✅ Embedded</div></div>
        <div style="background:var(--bg3);border-radius:8px;padding:12px;"><div style="font-size:10px;color:var(--text3);">Monitoring</div><div style="font-weight:700;color:var(--success);font-size:13px;margin-top:2px;">🟢 Active</div></div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button class="btn-primary" onclick="resetUpload()">Upload Another</button>
        <button class="btn-secondary" onclick="navigate('detection')">View Detection Feed</button>
      </div>
    </div>`;
  // reset step circles to done
  for(let j=0;j<4;j++){const c=document.getElementById('step-circle-'+j);if(c){c.style.background='var(--success)';c.style.borderColor='var(--success)';c.style.color='#fff';c.textContent='✓';} if(j<3){const l=document.getElementById('step-line-'+j);if(l)l.style.background='var(--success)';}}
}

function resetUpload() { uploadState='idle'; renderUpload(); }
