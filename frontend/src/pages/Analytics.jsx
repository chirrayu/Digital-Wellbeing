import { useEffect, useRef } from 'react';
import { MOCK } from '../data';
import { formatCurrency } from '../utils';

export default function Analytics({ stats }) {
  const violChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    // Violations Chart
    const c1 = violChartRef.current;
    if (c1) {
      const ctx = c1.getContext('2d');
      const W = c1.parentElement.offsetWidth;
      const H = 180;
      c1.width = W; c1.height = H;
      const data = MOCK.analytics.violationsOverTime;
      const labels = MOCK.analytics.labels;
      const max = Math.max(...data);
      const pad = { t:10, r:10, b:30, l:30 };
      const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;

      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
      for (let i=0; i<=4; i++) { 
        const y = pad.t + cH - (cH/4*i); 
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l+cW, y); ctx.stroke(); 
      }

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
        if (ctx.roundRect) ctx.roundRect(x,y,bW,bH,3); else ctx.rect(x,y,bW,bH);
        ctx.fill();
        
        ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px Inter'; ctx.textAlign='center';
        ctx.fillText(labels[i], x+bW/2, H-8);
        ctx.fillStyle='rgba(255,255,255,0.8)';
        ctx.fillText(v, x+bW/2, y-4);
      });
    }

    // Pie Chart
    const c2 = pieChartRef.current;
    if (c2) {
      const ctx = c2.getContext('2d');
      c2.width = 160; c2.height = 160;
      const data = MOCK.analytics.platforms;
      const colors = ['#ef4444','#06b6d4','#e2e8f0','#e1306c'];
      const entries = Object.entries(data);
      const total = entries.reduce((s,[,v])=>s+v,0);
      let start = -(Math.PI/2);
      const cx=80, cy=80, r=60, ri=35;

      ctx.clearRect(0,0,160,160);
      entries.forEach(([,v],i) => {
        const slice = (v/total)*Math.PI*2;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,start,start+slice); ctx.closePath();
        ctx.fillStyle = colors[i]; ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,ri,start,start+slice); ctx.closePath();
        ctx.fillStyle = '#111217'; ctx.fill();
        start += slice;
      });
    }
  }, []);

  const a = MOCK.analytics;
  const colors = ['#ef4444','#06b6d4','#e2e8f0','#e1306c'];

  return (
    <>
      <div style={{marginBottom:'22px'}}>
        <div style={{fontSize:'11px', fontWeight:700, color:'var(--text3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px'}}>Insights</div>
        <h1 style={{fontFamily:"'Syne',sans-serif", fontSize:'26px', fontWeight:800, letterSpacing:'-.4px'}}>Analytics</h1>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'20px'}}>
        {[
          {l:'Total Violations',v:stats.violations,c:'var(--danger)',d:'↑ 23% this week'},
          {l:'Takedowns Sent',v:a.takedownsSent,c:'var(--orange)',d:a.takedownsSuccess+' successful'},
          {l:'Revenue Protected',v:'$2.4M',c:'var(--ok)',d:'↑ $140K today'},
          {l:'Est. Revenue Loss',v:formatCurrency(a.revenueLoss),c:'var(--warn)',d:'Across all platforms'},
        ].map((k,i) => (
        <div key={i} style={{background:'var(--bg2)', border:'1px solid var(--border)', borderLeft:`2px solid ${k.c}`, borderRadius:'var(--r)', padding:'16px'}}>
          <div style={{fontSize:'10px', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'8px'}}>{k.l}</div>
          <div style={{fontSize:'28px', fontWeight:900, color:k.c, fontFamily:"'Syne',sans-serif"}}>{k.v}</div>
          <div style={{fontSize:'11px', color:'var(--text3)', marginTop:'4px'}}>{k.d}</div>
        </div>))}
      </div>

      <div className="grid-6040" style={{marginBottom:'16px'}}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Violations This Week</span>
            <span style={{fontSize:'10px', color:'var(--text3)', fontWeight:600, letterSpacing:'.5px'}}>DAILY</span>
          </div>
          <div style={{position:'relative', height:'180px'}}>
            <canvas ref={violChartRef} style={{width:'100%', height:'100%'}}></canvas>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Platform Split</span>
          </div>
          <div style={{position:'relative', height:'160px', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <canvas ref={pieChartRef} style={{maxWidth:'160px', maxHeight:'160px'}}></canvas>
            <div style={{marginLeft:'16px'}}>
              {Object.entries(MOCK.analytics.platforms).map(([k,v],i) => (
                <div key={k} style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px', fontSize:'12px'}}>
                  <div style={{width:'10px', height:'10px', borderRadius:'2px', background:colors[i], flexShrink:0}}></div>
                  <span style={{color:'var(--text3)'}}>{k}</span>
                  <span style={{fontWeight:600, marginLeft:'auto'}}>{v}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{marginBottom:'14px'}}>Most Pirated Content</div>
          {a.topContent.map((c,i) => (
          <div key={i} style={{marginBottom:'14px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px'}}>
              <div>
                <span style={{fontSize:'11px', fontWeight:700, color:i===0?'var(--danger)':i===1?'var(--warn)':'var(--text3)'}}>#{i+1}</span>
                <span style={{fontSize:'13px', fontWeight:500, marginLeft:'6px'}}>{c.name}</span>
              </div>
              <span style={{fontSize:'12px', color:'var(--text3)'}}>{c.count} copies</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <div className="score-bar" style={{flex:1}}><div className={`score-fill ${i<2?'high':'mid'}`} style={{width:`${(c.count/a.topContent[0].count)*100}%`}}></div></div>
              <span style={{fontSize:'11px', color:'var(--danger)', fontWeight:600}}>-{formatCurrency(c.loss)}</span>
            </div>
          </div>))}
        </div>

        <div className="card">
          <div className="card-title" style={{marginBottom:'14px'}}>Takedown Effectiveness</div>
          <div style={{textAlign:'center', marginBottom:'16px'}}>
            <div style={{fontSize:'48px', fontWeight:900, color:'var(--ok)', fontFamily:"'Syne',sans-serif"}}>{Math.round((a.takedownsSuccess/a.takedownsSent)*100)}%</div>
            <div style={{fontSize:'12px', color:'var(--text3)'}}>Success Rate</div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {[
              {l:'Sent',v:a.takedownsSent,max:a.takedownsSent,c:'var(--orange)'},
              {l:'Accepted',v:a.takedownsSuccess,max:a.takedownsSent,c:'var(--ok)'},
              {l:'Pending',v:a.takedownsSent-a.takedownsSuccess-2,max:a.takedownsSent,c:'var(--warn)'},
              {l:'Rejected',v:2,max:a.takedownsSent,c:'var(--danger)'},
            ].map((r,i) => (
            <div key={i}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'3px'}}><span>{r.l}</span><span style={{fontWeight:600, color:r.c}}>{r.v}</span></div>
              <div className="score-bar"><div style={{height:'100%', borderRadius:'2px', background:r.c, width:`${(r.v/r.max)*100}%`, transition:'width 0.8s'}}></div></div>
            </div>))}
          </div>
        </div>
      </div>
    </>
  );
}
