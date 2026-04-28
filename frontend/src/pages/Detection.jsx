import { useState } from 'react';
import { scoreClass, PlatformPill, StatusBadge } from '../utils';

export default function Detection({ feed, stats, setStats, setFeed }) {
  const [filter, setFilter] = useState('');

  const displayFeed = filter ? feed.filter(d => d.platform === filter) : feed;

  const escalateViolation = (id) => {
    setFeed(prev => prev.map(item => item.id === id ? { ...item, status: 'violation' } : item));
    setStats(prev => ({ ...prev, violations: prev.violations + 1 }));
  };

  return (
    <>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'22px', flexWrap:'wrap', gap:'12px'}}>
        <div>
          <div style={{fontSize:'11px', fontWeight:700, color:'var(--text3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px'}}>Monitoring</div>
          <h1 style={{fontFamily:"'Syne',sans-serif", fontSize:'26px', fontWeight:800, letterSpacing:'-.4px'}}>Live Detection Feed</h1>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'6px', background:'var(--ok-glow)', border:'1px solid rgba(34,197,94,.15)', padding:'6px 12px', borderRadius:'6px', fontSize:'12px', color:'var(--ok)', fontWeight:700}}>
            <span className="status-dot pulse"></span> AI Engine Active
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'8px', padding:'7px 12px', color:'var(--text)', fontSize:'13px', outline:'none'}}>
            <option value="">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="x">X</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'20px'}}>
        <div style={{background:'var(--bg2)', border:'1px solid var(--border)', borderLeft:'2px solid var(--danger)', borderRadius:'var(--r)', padding:'16px'}}>
          <div style={{fontSize:'10px', fontWeight:700, color:'var(--text3)', letterSpacing:'.8px', marginBottom:'8px'}}>VIOLATIONS</div>
          <div style={{fontSize:'28px', fontWeight:900, color:'var(--danger)', fontFamily:"'Syne',sans-serif"}}>{feed.filter(d=>d.status==='violation').length}</div>
        </div>
        <div style={{background:'var(--bg2)', border:'1px solid var(--border)', borderLeft:'2px solid var(--warn)', borderRadius:'var(--r)', padding:'16px'}}>
          <div style={{fontSize:'10px', fontWeight:700, color:'var(--text3)', letterSpacing:'.8px', marginBottom:'8px'}}>NEEDS REVIEW</div>
          <div style={{fontSize:'28px', fontWeight:900, color:'var(--warn)', fontFamily:"'Syne',sans-serif"}}>{feed.filter(d=>d.status==='review').length}</div>
        </div>
        <div style={{background:'var(--bg2)', border:'1px solid var(--border)', borderLeft:'2px solid var(--ok)', borderRadius:'var(--r)', padding:'16px'}}>
          <div style={{fontSize:'10px', fontWeight:700, color:'var(--text3)', letterSpacing:'.8px', marginBottom:'8px'}}>AUTHORIZED</div>
          <div style={{fontSize:'28px', fontWeight:900, color:'var(--ok)', fontFamily:"'Syne',sans-serif"}}>{feed.filter(d=>d.status==='authorized').length}</div>
        </div>
      </div>

      <div className="grid-7030" style={{alignItems:'start'}}>
        <div>
          <div className="card-title" style={{marginBottom:'12px'}}>Detection Stream</div>
          <div>
            {displayFeed.map(d => {
              const sc = scoreClass(d.similarity);
              return (
                <div key={d.id} className="detection-item">
                  <div className="detection-thumb">{d.thumb}</div>
                  <div style={{flex:1}}>
                    <div className="detection-title">{d.title}</div>
                    <div className="detection-meta">
                      <PlatformPill p={d.platform} />
                      <span>{d.channel}</span>
                      <span>🕐 {d.time}</span>
                    </div>
                    <div style={{marginTop:'6px'}}><StatusBadge status={d.status} /></div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className={`score-pct ${sc}`}>{d.similarity}%</div>
                    <div style={{fontSize:'10px', color:'var(--text3)'}}>match</div>
                    <div className="score-bar" style={{width:'60px', marginTop:'4px'}}><div className={`score-fill ${sc}`} style={{width:`${d.similarity}%`}}></div></div>
                    {d.status !== 'violation' && (
                      <button onClick={() => escalateViolation(d.id)} style={{marginTop:'8px', fontSize:'10px', padding:'4px 8px', background:'var(--danger-glow)', color:'var(--danger)', border:'1px solid rgba(244,63,94,.2)', borderRadius:'6px', cursor:'pointer', fontWeight:600}}>Escalate</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="card" style={{marginBottom:'16px'}}>
            <div className="card-title" style={{marginBottom:'14px'}}>Detection Pipeline</div>
            {[
              {icon:'○', label:'Internet Scan', status:'Running', color:'var(--ok)'},
              {icon:'○', label:'AI Matching', status:'Running', color:'var(--ok)'},
              {icon:'○', label:'Rights Check', status:'Running', color:'var(--ok)'},
              {icon:'○', label:'Alert Engine', status:'Standby', color:'var(--warn)'},
            ].map((s,i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:'10px', padding:'9px 0', borderBottom:'1px solid var(--border)'}}>
                <div style={{width:'6px', height:'6px', borderRadius:'50%', background:s.color, flexShrink:0}}></div>
                <span style={{flex:1, fontSize:'13px', fontWeight:500}}>{s.label}</span>
                <span style={{fontSize:'10px', fontWeight:700, color:s.color, letterSpacing:'.5px'}}>{s.status.toUpperCase()}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title" style={{marginBottom:'14px'}}>Threshold Settings</div>
            <div style={{marginBottom:'12px'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'6px'}}><span>Violation Threshold</span><span style={{color:'var(--danger)', fontWeight:600}}>85%</span></div>
              <input type="range" min="50" max="99" defaultValue="85" style={{width:'100%', accentColor:'var(--danger)'}} />
            </div>
            <div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'6px'}}><span>Review Threshold</span><span style={{color:'var(--warn)', fontWeight:600}}>65%</span></div>
              <input type="range" min="30" max="84" defaultValue="65" style={{width:'100%', accentColor:'var(--warn)'}} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
