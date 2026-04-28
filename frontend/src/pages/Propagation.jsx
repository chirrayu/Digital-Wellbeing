import { useEffect, useState, useRef } from 'react';
import { MOCK } from '../data';

export default function Propagation() {
  const [sliderVal, setSliderVal] = useState(0);
  const [playing, setPlaying] = useState(true);
  const canvasRef = useRef(null);
  const nodes = MOCK.networkNodes;
  const maxTime = Math.max(...nodes.map(n => n.time));
  const sliderRef = useRef(sliderVal);
  const playingRef = useRef(playing);

  useEffect(() => {
    sliderRef.current = sliderVal;
  }, [sliderVal]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const W = canvas.parentElement.offsetWidth;
    const H = 400;
    canvas.width = W;
    canvas.height = H;
    
    const cx = W / 2;
    const cy = H / 2;
    let t = 0;

    const renderGraph = () => {
      ctx.fillStyle = '#141316';
      ctx.fillRect(0, 0, W, H);
      
      const currentSlider = sliderRef.current;
      const visibleNodes = nodes.filter(n => n.time <= currentSlider);

      // Grid background
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
      for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

      // Draw edges
      ctx.lineWidth = 1.5;
      visibleNodes.forEach(n => {
        if (n.id === 'root') return;
        const parent = visibleNodes.find(p => p.id === n.parent);
        if (parent) {
          ctx.beginPath();
          ctx.moveTo(cx + parent.x, cy + parent.y);
          ctx.lineTo(cx + n.x, cy + n.y);
          
          const grad = ctx.createLinearGradient(cx + parent.x, cy + parent.y, cx + n.x, cy + n.y);
          grad.addColorStop(0, 'rgba(34,197,94,0.3)');
          grad.addColorStop(1, n.type === 'pirate' ? 'rgba(244,63,94,0.4)' : 'rgba(245,158,11,0.4)');
          ctx.strokeStyle = grad;
          ctx.stroke();
          
          // Data packet animation
          if (playingRef.current) {
            const prog = (t % 100) / 100;
            const px = (cx + parent.x) + (n.x - parent.x) * prog;
            const py = (cy + parent.y) + (n.y - parent.y) * prog;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = n.type === 'pirate' ? '#f43f5e' : '#f59e0b';
            ctx.fill();
          }
        }
      });

      // Draw nodes
      visibleNodes.forEach(n => {
        ctx.beginPath();
        const r = n.id === 'root' ? 14 : n.size;
        ctx.arc(cx + n.x, cy + n.y, r, 0, Math.PI * 2);
        
        if (n.id === 'root') {
          ctx.fillStyle = '#22c55e';
          ctx.shadowColor = 'rgba(34,197,94,0.5)';
          ctx.shadowBlur = 15;
        } else if (n.type === 'pirate') {
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = 'rgba(244,63,94,0.3)';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = 'rgba(245,158,11,0.3)';
          ctx.shadowBlur = 10;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Label
        if (n.size > 5 || n.id === 'root') {
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.font = n.id === 'root' ? 'bold 12px Inter' : '10px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(n.label, cx + n.x, cy + n.y + r + 14);
        }
      });

      // Radar sweep on root
      if (playingRef.current) {
        ctx.beginPath();
        ctx.arc(cx, cy, 30 + (t % 150), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34,197,94,${max(0, 1 - (t % 150) / 150)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      t++;
      requestAnimationFrame(renderGraph);
    };

    function max(a, b) { return a > b ? a : b; }

    const animId = requestAnimationFrame(renderGraph);
    return () => cancelAnimationFrame(animId);
  }, []); // Only run once on mount

  // Handle playing state
  useEffect(() => {
    let interval;
    if (playing) {
      interval = setInterval(() => {
        setSliderVal(prev => {
          if (prev >= maxTime) return 0;
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [playing, maxTime]);

  return (
    <>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'22px', flexWrap:'wrap', gap:'12px'}}>
        <div>
          <div style={{fontSize:'11px', fontWeight:700, color:'var(--text3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px'}}>Network Analysis</div>
          <h1 style={{fontFamily:"'Syne',sans-serif", fontSize:'26px', fontWeight:800, letterSpacing:'-.4px'}}>Propagation Graph</h1>
        </div>
        <div style={{display:'flex', gap:'12px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'12px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--ok)'}}></div> Original</div>
          <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'12px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--warn)'}}></div> Unknown Source</div>
          <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'12px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--danger)'}}></div> Confirmed Piracy</div>
        </div>
      </div>

      <div className="card" style={{padding:'0', overflow:'hidden', position:'relative'}}>
        <div style={{position:'absolute', top:'20px', left:'20px', zIndex:10}}>
          <div style={{fontSize:'14px', fontWeight:600}}>Content Spread Over Time</div>
          <div style={{fontSize:'12px', color:'var(--text3)'}}>Live visualization of source tree</div>
        </div>
        
        <div style={{position:'absolute', top:'20px', right:'20px', zIndex:10, background:'rgba(0,0,0,0.5)', padding:'8px 12px', borderRadius:'8px', border:'1px solid var(--border)'}}>
          <div style={{fontSize:'10px', color:'var(--text3)', textTransform:'uppercase'}}>Nodes Tracked</div>
          <div style={{fontSize:'20px', fontWeight:800, fontFamily:"'Syne',sans-serif"}}>{nodes.filter(n=>n.time<=sliderVal).length}</div>
        </div>

        <canvas ref={canvasRef} style={{width:'100%', display:'block'}}></canvas>

        <div style={{position:'absolute', bottom:'0', left:'0', right:'0', padding:'20px', background:'linear-gradient(to top, rgba(20,19,22,1), rgba(20,19,22,0))', display:'flex', alignItems:'center', gap:'16px'}}>
          <button className="btn-secondary" onClick={() => setPlaying(!playing)} style={{width:'40px', padding:'0', display:'flex', justifyContent:'center', alignItems:'center'}}>
            {playing ? '⏸' : '▶'}
          </button>
          <input 
            type="range" 
            min="0" max={maxTime} 
            value={sliderVal} 
            onChange={(e) => {
              setSliderVal(parseInt(e.target.value));
              setPlaying(false);
            }} 
            style={{flex:1, accentColor:'var(--orange)'}} 
          />
          <span style={{fontSize:'12px', fontWeight:600, width:'40px', textAlign:'right'}}>T+{sliderVal}</span>
        </div>
      </div>
    </>
  );
}
