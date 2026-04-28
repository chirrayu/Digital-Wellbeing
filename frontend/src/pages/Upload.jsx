import { useState, useRef } from 'react';
import { MOCK } from '../data';

export default function Upload({ navigate, setStats }) {
  const [step, setStep] = useState(0); // 0=idle, 1,2,3,4=processing, 5=done
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag');
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const startProcessing = () => {
    setStep(1);
    let currentStep = 1;
    const interval = setInterval(() => {
      currentStep++;
      setStep(currentStep);
      if (currentStep >= 5) {
        clearInterval(interval);
        setStats(prev => ({ ...prev, assets: prev.assets + 1 }));
      }
    }, 1200);
  };

  const resetUpload = () => {
    setStep(0);
    setFile(null);
  };

  return (
    <div style={{maxWidth:'760px', margin:'0 auto'}}>
      <h1 style={{fontSize:'22px', fontWeight:800, marginBottom:'4px'}}>Upload & Protect Content</h1>
      <p style={{color:'var(--text3)', fontSize:'13px', marginBottom:'24px'}}>Secure your media with AI fingerprinting and watermarking</p>

      {/* Steps indicator */}
      <div style={{display:'flex', alignItems:'center', marginBottom:'28px'}}>
        {['Upload File','Generate Fingerprint','Embed Watermark','Registry'].map((s,i) => {
          const active = step > 0 && step >= i + 1;
          const done = step > i + 1;
          return (
            <div key={i} style={{display:'flex', alignItems:'center', flex:1}}>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                <div className="step-circle" style={{
                  width:'30px', height:'30px', borderRadius:'50%', 
                  background: done ? 'var(--ok)' : active ? 'var(--orange)' : 'var(--bg4)', 
                  borderColor: done ? 'var(--ok)' : active ? 'var(--orange)' : 'var(--border2)',
                  color: (active || done) ? '#fff' : 'inherit'
                }}>
                  {done ? '✓' : (i+1)}
                </div>
                <div style={{fontSize:'10px', color:'var(--text3)', marginTop:'4px', whiteSpace:'nowrap'}}>{s}</div>
              </div>
              {i < 3 && (
                <div style={{
                  flex:1, height:'2px', marginBottom:'14px', transition:'all 0.4s',
                  background: done ? 'var(--ok)' : 'var(--border)'
                }}></div>
              )}
            </div>
          );
        })}
      </div>

      {step === 0 && (
        <>
          <div 
            className="upload-zone" 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag'); }}
            onDragLeave={e => e.currentTarget.classList.remove('drag')}
            onDrop={handleDrop}
            style={file ? {borderColor:'var(--ok)', background:'var(--ok-glow)'} : {}}
          >
            {file ? (
              <>
                <div style={{fontSize:'32px'}}>✅</div>
                <div style={{fontWeight:600, margin:'8px 0'}}>{file.name}</div>
                <div style={{fontSize:'12px', color:'var(--text3)'}}>{(file.size/1e6).toFixed(1)} MB — Ready to secure</div>
              </>
            ) : (
              <>
                <div className="upload-icon" style={{fontSize:'48px', marginBottom:'12px'}}>🎬</div>
                <div className="upload-title">Drop your video or image here</div>
                <div className="upload-sub">Supports MP4, MOV, MKV, JPG, PNG — up to 10 GB</div>
                <button className="btn-primary" style={{marginTop:'16px'}} onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>Choose File</button>
              </>
            )}
            <input type="file" ref={fileInputRef} style={{display:'none'}} accept="video/*,image/*" onChange={e => setFile(e.target.files[0])} />
          </div>

          <div className="card" style={{marginTop:'16px'}}>
            <div className="card-title" style={{marginBottom:'16px'}}>Content Metadata</div>
            <div className="grid-2" style={{gap:'12px'}}>
              <div>
                <label style={{fontSize:'12px', color:'var(--text3)', display:'block', marginBottom:'6px'}}>Content Name *</label>
                <input type="text" placeholder="e.g. IPL Final Highlights 2024" style={{width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'8px', padding:'9px 12px', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'inherit'}} />
              </div>
              <div>
                <label style={{fontSize:'12px', color:'var(--text3)', display:'block', marginBottom:'6px'}}>Sport / Category *</label>
                <select style={{width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'8px', padding:'9px 12px', color:'var(--text)', fontSize:'13px', outline:'none'}}>
                  <option>Cricket</option><option>Football</option><option>Tennis</option><option>Other</option>
                </select>
              </div>
            </div>
            <div style={{marginTop:'16px', display:'flex', gap:'10px', justifyContent:'flex-end'}}>
              <button className="btn-secondary" onClick={resetUpload}>Reset</button>
              <button className="btn-primary" onClick={startProcessing} disabled={!file}>🔒 Secure Content</button>
            </div>
          </div>
        </>
      )}

      {step > 0 && step < 5 && (
        <div className="card" style={{marginTop:'16px'}}>
          <div style={{marginBottom:'12px', fontWeight:600}}>
            {step === 1 ? 'Uploading file to secure servers...' : 
             step === 2 ? 'Generating perceptual fingerprint (DCT hash)...' : 
             step === 3 ? 'Embedding invisible watermark...' : 
             'Registering in Content Registry...'}
          </div>
          <div style={{background:'var(--bg3)', borderRadius:'999px', height:'8px', overflow:'hidden', marginBottom:'8px'}}>
            <div style={{height:'100%', borderRadius:'999px', background:'var(--orange)', width:`${step * 25}%`, transition:'width 0.8s ease'}}></div>
          </div>
          <div style={{fontSize:'12px', color:'var(--text3)', textAlign:'right'}}>{step * 25}%</div>
        </div>
      )}

      {step === 5 && (
        <div className="card" style={{marginTop:'16px', borderColor:'rgba(34,197,94,0.3)', background:'rgba(34,197,94,0.05)'}}>
          <div style={{textAlign:'center', padding:'16px 0'}}>
            <div style={{fontSize:'56px', marginBottom:'12px'}}>🛡️</div>
            <div style={{fontSize:'20px', fontWeight:800, color:'var(--ok)', marginBottom:'6px'}}>Content Secured!</div>
            <div style={{color:'var(--text3)', fontSize:'13px', marginBottom:'20px'}}>{file?.name || 'Content'} is now protected and being monitored.</div>
            
            <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
              <button className="btn-primary" onClick={resetUpload}>Upload Another</button>
              <button className="btn-secondary" onClick={() => navigate('detection')}>View Detection Feed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
