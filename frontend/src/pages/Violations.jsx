import { useState } from 'react';
import { PlatformPill, StatusBadge } from '../utils';

export default function Violations({ violations, setViolations }) {
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const markViolation = (id) => {
    setViolations(prev => prev.map(v => v.id === id ? { ...v, status: 'violation' } : v));
    showToast('Marked as violation', 'danger');
  };

  const sendTakedown = (id) => {
    showToast('Takedown notice sent securely', 'warn');
  };

  const ignoreViolation = (id) => {
    setViolations(prev => prev.map(v => v.id === id ? { ...v, status: 'authorized' } : v));
    showToast('Added to allowed list', 'ok');
  };

  const sendAllTakedowns = () => {
    showToast('All takedown notices dispatched!', 'ok');
  };

  const exportViolations = () => {
    showToast('Report exported as CSV', 'ok');
  };

  const vCounts = {
    all: violations.length,
    violation: violations.filter(v=>v.status==='violation').length,
    review: violations.filter(v=>v.status==='review').length,
    authorized: violations.filter(v=>v.status==='authorized').length,
  };

  const displayList = filter === 'all' ? violations : violations.filter(v => v.status === filter);

  return (
    <>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px'}}>
        <div>
          <div style={{fontSize:'11px', fontWeight:700, color:'var(--text3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px'}}>Enforcement</div>
          <h1 style={{fontFamily:"'Syne',sans-serif", fontSize:'26px', fontWeight:800, letterSpacing:'-.4px'}}>Violation Management</h1>
          <p style={{color:'var(--text3)', fontSize:'12px', marginTop:'3px'}}>{violations.length} active cases</p>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <button className="btn-danger" onClick={sendAllTakedowns}>Send All Takedowns</button>
          <button className="btn-secondary" onClick={exportViolations}>Export CSV</button>
        </div>
      </div>

      <div style={{display:'flex', gap:'8px', marginBottom:'20px', overflowX:'auto'}}>
        <button className={`filter-btn ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>All Cases ({vCounts.all})</button>
        <button className={`filter-btn ${filter==='violation'?'active':''}`} onClick={()=>setFilter('violation')}>Violations ({vCounts.violation})</button>
        <button className={`filter-btn ${filter==='review'?'active':''}`} onClick={()=>setFilter('review')}>Review ({vCounts.review})</button>
        <button className={`filter-btn ${filter==='authorized'?'active':''}`} onClick={()=>setFilter('authorized')}>Authorized ({vCounts.authorized})</button>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        {displayList.map(v => (
          <div key={v.id} className="violation-card">
            <div className="vc-body">
              <div className="vc-half">
                <div className="vc-label">ORIGINAL CONTENT</div>
                <div className="vc-vid"><div className="vc-play"></div></div>
                <div style={{fontWeight:600, fontSize:'14px', marginBottom:'2px'}}>{v.original}</div>
                <div style={{fontSize:'11px', color:'var(--text3)'}}>ID: {v.id}</div>
              </div>
              
              <div className="vc-center">
                <div style={{color:'var(--orange)', fontSize:'18px', marginBottom:'4px'}}>⚡</div>
                <div style={{fontSize:'10px', color:'var(--text3)', fontWeight:700}}>vs</div>
                <div style={{fontSize:'22px', fontWeight:800, color:v.severity>=85?'var(--danger)':v.severity>=65?'var(--warn)':'var(--ok)', fontFamily:"'Syne',sans-serif", marginTop:'4px'}}>{v.severity}%</div>
                <div style={{fontSize:'10px', color:'var(--text3)'}}>similarity</div>
              </div>

              <div className="vc-half">
                <div className="vc-label" style={{color:'var(--danger)'}}>DETECTED COPY</div>
                <div className="vc-vid suspicious"><div className="vc-play"></div></div>
                <div style={{fontWeight:600, fontSize:'14px', marginBottom:'2px'}}>{v.found}</div>
                <div style={{fontSize:'11px', color:'var(--text3)'}}>{v.uploader}</div>
              </div>
            </div>

            <div className="vc-meta">
              <PlatformPill p={v.platform} />
              <StatusBadge status={v.status} />
              <span style={{fontSize:'11px', color:v.region==='Global'?'#3b82f6':'var(--text)'}}>🌍 {v.region}</span>
              <span style={{fontSize:'11px', color:'var(--text3)'}}>🕐 {v.time}</span>
              <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:'6px'}}>
                <div className="score-bar" style={{width:'80px', flex: 'none'}}><div className={`score-fill ${v.severity>=85?'high':v.severity>=65?'mid':'low'}`} style={{width:`${v.severity}%`}}></div></div>
                <span style={{fontSize:'11px', fontWeight:600, color:v.severity>=85?'var(--danger)':v.severity>=65?'var(--warn)':'var(--ok)'}}>{v.severity}%</span>
              </div>
            </div>

            <div className="vc-actions">
              <button className="btn-danger" onClick={() => markViolation(v.id)}>Mark Violation</button>
              <button className="btn-warn" onClick={() => sendTakedown(v.id)}>Send Takedown</button>
              <button className="btn-ok" onClick={() => ignoreViolation(v.id)}>Allow</button>
              <a href={`https://${v.link}`} target="_blank" rel="noreferrer" style={{marginLeft:'auto', fontSize:'11px', color:'var(--text2)', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px'}}>View Source ↗</a>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="toast" style={{
          position:'fixed', bottom:'22px', right:'22px', background:'var(--bg2)', 
          border:'1px solid var(--border2)', padding:'11px 16px', borderRadius:'var(--r)', 
          fontSize:'13px', fontWeight:600, zIndex:9999, 
          borderLeft:`2px solid var(--${toast.type})`
        }}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
