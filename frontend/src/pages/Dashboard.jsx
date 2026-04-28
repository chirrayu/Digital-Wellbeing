import { MOCK } from '../data';
import { formatCurrency, PlatformPill, StatusBadge } from '../utils';

export default function Dashboard({ stats, violations, navigate }) {
  return (
    <>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'22px', gap:'12px', flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:'11px', fontWeight:700, color:'var(--text3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px'}}>Control Tower</div>
          <h1 style={{fontFamily:"'Syne',sans-serif", fontSize:'26px', fontWeight:800, lineHeight:1.1, letterSpacing:'-.4px'}}>Content Protection<br/>Overview</h1>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <button className="btn-secondary" onClick={() => navigate('analytics')}>Analytics</button>
          <button className="btn-primary" onClick={() => navigate('upload')}>+ Upload Content</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card orange">
          <div className="stat-label">Protected Assets</div>
          <div className="stat-value">{stats.assets.toLocaleString()}</div>
          <div className="stat-delta up">+12 this week</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Active Violations</div>
          <div className="stat-value" style={{color:'var(--danger)'}}>{stats.violations}</div>
          <div className="stat-delta down">+8 last hour</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Platforms Tracked</div>
          <div className="stat-value" style={{color:'var(--blue)'}}>4</div>
          <div className="stat-delta up" style={{color:'var(--ok)'}}>All systems live</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Revenue Protected</div>
          <div className="stat-value" style={{color:'var(--ok)'}}>$2.4M</div>
          <div className="stat-delta up">+$140K today</div>
        </div>
      </div>

      {/* Monitoring bar */}
      <div style={{background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'14px 18px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <span className="status-dot pulse"></span>
          <div>
            <span style={{fontWeight:700, fontSize:'13px'}}>Monitoring Active</span>
            <span style={{color:'var(--text3)', fontSize:'12px', marginLeft:'10px'}}>— AI engine scanning continuously</span>
          </div>
        </div>
        <div style={{display:'flex', gap:'20px'}}>
          {['YouTube','TikTok','X','Instagram'].map(p=>(
          <div key={p} style={{textAlign:'center'}}>
            <div style={{fontSize:'11px', color:'var(--text3)'}}>{p}</div>
            <div style={{fontSize:'10px', color:'var(--ok)', fontWeight:700, marginTop:'1px'}}>LIVE</div>
          </div>))}
        </div>
      </div>

      <div className="grid-6040" style={{marginBottom:'16px'}}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Violations</span>
            <button className="btn-secondary" onClick={() => navigate('violations')} style={{padding:'4px 10px', fontSize:'11px'}}>View all</button>
          </div>
          <table className="data-table">
            <thead><tr><th>Content</th><th>Platform</th><th>Match</th><th>Status</th></tr></thead>
            <tbody>
              {violations.slice(0,4).map(v=>(
              <tr key={v.id}>
                <td>
                  <div style={{fontWeight:600, fontSize:'12px'}}>{v.original}</div>
                  <div style={{fontSize:'10px', color:'var(--text3)'}}>{v.found}</div>
                </td>
                <td><PlatformPill p={v.platform} /></td>
                <td><span style={{fontWeight:800, fontFamily:"'Syne',sans-serif", fontSize:'14px', color:v.severity>=85?'var(--danger)':v.severity>=65?'var(--warn)':'var(--ok)'}}>{v.severity}%</span></td>
                <td><StatusBadge status={v.status} /></td>
              </tr>))}
            </tbody>
          </table>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <div className="card">
            <div className="card-title" style={{marginBottom:'12px'}}>Quick Actions</div>
            <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
              <button className="btn-primary" style={{width:'100%', textAlign:'left'}} onClick={() => navigate('upload')}>Upload & Protect Content</button>
              <button className="btn-secondary" style={{width:'100%', textAlign:'left'}} onClick={() => navigate('violations')}>Review Violations</button>
              <button className="btn-secondary" style={{width:'100%', textAlign:'left'}} onClick={() => navigate('detection')}>Live Detection Feed</button>
              <button className="btn-secondary" style={{width:'100%', textAlign:'left'}} onClick={() => navigate('propagation')}>Propagation Graph</button>
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{marginBottom:'12px'}}>Trending Pirated</div>
            {MOCK.analytics.topContent.map((c,i)=>(
            <div key={i} style={{display:'flex', alignItems:'center', gap:'8px', padding:'7px 0', borderBottom:'1px solid var(--border)'}}>
              <div style={{width:'18px', fontSize:'11px', fontWeight:800, color:i===0?'var(--danger)':i===1?'var(--warn)':'var(--text3)'}}>{i+1}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:'12px', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.name}</div>
                <div style={{fontSize:'10px', color:'var(--text3)'}}>{c.count} copies &mdash; {formatCurrency(c.loss)} loss</div>
              </div>
            </div>))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{marginBottom:'14px'}}>Platform Breakdown</div>
          {Object.entries(MOCK.analytics.platforms).map(([p,v])=>(
          <div key={p} style={{marginBottom:'11px'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'4px'}}>
              <span style={{color:'var(--text2)'}}>{p}</span>
              <span style={{fontWeight:700, fontFamily:"'Syne',sans-serif"}}>{v}%</span>
            </div>
            <div className="score-bar"><div className={`score-fill ${v>40?'high':v>20?'mid':'low'}`} style={{width:`${v}%`}}></div></div>
          </div>))}
        </div>
        <div className="card">
          <div className="card-title" style={{marginBottom:'14px'}}>Week Summary</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
            {[
              {l:'Takedowns Sent',v:MOCK.analytics.takedownsSent,c:'var(--orange)'},
              {l:'Successful',v:MOCK.analytics.takedownsSuccess,c:'var(--ok)'},
              {l:'Pending Review',v:8,c:'var(--warn)'},
              {l:'Revenue Saved',v:formatCurrency(MOCK.analytics.revenueLoss),c:'var(--blue)'},
            ].map((x,i)=>(
            <div key={i} style={{background:'var(--bg3)', borderRadius:'8px', padding:'13px'}}>
              <div style={{fontSize:'10px', color:'var(--text3)', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.5px'}}>{x.l}</div>
              <div style={{fontSize:'22px', fontWeight:900, color:x.c, fontFamily:"'Syne',sans-serif"}}>{x.v}</div>
            </div>))}
          </div>
        </div>
      </div>
    </>
  );
}
