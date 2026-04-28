// ── Mock Data ──────────────────────────────────────────────
const MOCK = {
  stats: { assets: 1284, violations: 47, monitored: 3, revenueProtected: 2.4 },

  recentAlerts: [
    { id:1, type:'danger', msg:'Viral spread: IPL Final highlights', time:'2m ago' },
    { id:2, type:'warning', msg:'New violation: TikTok 94% match', time:'8m ago' },
    { id:3, type:'danger', msg:'Takedown pending on YouTube', time:'15m ago' },
    { id:4, type:'success', msg:'Content secured: Match highlights', time:'1h ago' },
  ],

  contentAssets: [
    { id:'SS-001', name:'IPL Final Highlights 2024', sport:'Cricket', event:'IPL Final', owner:'SportsPlusTV', region:'IN,UK', status:'secured', fingerprint:'fp_a1b2c3', size:'1.2 GB', uploaded:'2h ago' },
    { id:'SS-002', name:'FIFA WC Quarter Final', sport:'Football', event:'World Cup 2024', owner:'SportsPlusTV', region:'Global', status:'secured', fingerprint:'fp_d4e5f6', size:'2.1 GB', uploaded:'1d ago' },
    { id:'SS-003', name:'Wimbledon Finals Day', sport:'Tennis', event:'Wimbledon', owner:'SportsPlusTV', region:'EU,US', status:'secured', fingerprint:'fp_g7h8i9', size:'890 MB', uploaded:'3d ago' },
  ],

  detectionFeed: [
    { id:'DT-001', title:'IPL Final 2024 Highlights Full HD', platform:'youtube', channel:'CricketFanatic99', similarity:97, time:'1 min ago', thumb:'🎬', status:'violation' },
    { id:'DT-002', title:'FIFA Quarter Final Amazing Goals', platform:'tiktok', channel:'@sportslover', similarity:89, time:'4 min ago', thumb:'⚽', status:'violation' },
    { id:'DT-003', title:'Wimbledon Best Moments', platform:'x', channel:'@TennisWorld', similarity:76, time:'9 min ago', thumb:'🎾', status:'review' },
    { id:'DT-004', title:'Cricket Highlights Evening Show', platform:'instagram', channel:'cricketguru', similarity:65, time:'14 min ago', thumb:'🏏', status:'review' },
    { id:'DT-005', title:'Sports Roundup Week 12', platform:'youtube', channel:'GlobalSports', similarity:41, time:'18 min ago', thumb:'🏆', status:'authorized' },
  ],

  violations: [
    { id:'VL-001', original:'IPL Final Highlights 2024', detected:'IPL Final 2024 Full HD Highlights', platform:'youtube', link:'youtube.com/watch?v=xxx', uploader:'CricketFanatic99', severity:97, status:'violation', region:'IN', found:'2 min ago' },
    { id:'VL-002', original:'FIFA WC Quarter Final', detected:'FIFA Quarter Final Amazing Goals', platform:'tiktok', link:'tiktok.com/@sportslover/video/123', uploader:'@sportslover', severity:89, status:'violation', region:'Global', found:'5 min ago' },
    { id:'VL-003', original:'Wimbledon Finals Day', detected:'Wimbledon Best Moments', platform:'x', link:'x.com/TennisWorld/status/456', uploader:'@TennisWorld', severity:76, status:'review', region:'EU', found:'10 min ago' },
    { id:'VL-004', original:'IPL Final Highlights 2024', detected:'Cricket Highlights HD', platform:'instagram', link:'instagram.com/p/abc', uploader:'cricketguru', severity:62, status:'review', region:'IN', found:'22 min ago' },
    { id:'VL-005', original:'Wimbledon Finals Day', detected:'Tennis Finals Extended', platform:'youtube', link:'youtube.com/watch?v=yyy', uploader:'TennisFan22', severity:91, status:'violation', region:'US', found:'35 min ago' },
  ],

  analytics: {
    violationsOverTime: [12,18,9,24,31,22,47],
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    platforms: { YouTube:52, TikTok:28, X:12, Instagram:8 },
    topContent: [
      { name:'IPL Final Highlights 2024', count:18, loss:120000 },
      { name:'FIFA WC Quarter Final', count:12, loss:85000 },
      { name:'Wimbledon Finals Day', count:9, loss:63000 },
      { name:'Cricket Highlights Reel', count:6, loss:42000 },
    ],
    revenueLoss: 310000,
    takedownsSent: 31,
    takedownsSuccess: 24,
  },

  propagation: [
    { id:'origin', label:'Original Upload\n(SportsPlusTV)', x:0.5, y:0.1, type:'origin', children:['a','b'] },
    { id:'a', label:'User A\n@CricFan', x:0.25, y:0.35, type:'violator', children:['c','d'] },
    { id:'b', label:'User B\n@SportLover', x:0.75, y:0.35, type:'violator', children:['e'] },
    { id:'c', label:'User C\n@TVClips', x:0.1, y:0.6, type:'secondary', children:['f'] },
    { id:'d', label:'User D\n@HighlightHub', x:0.35, y:0.65, type:'secondary', children:[] },
    { id:'e', label:'User E\n@GlobalSport', x:0.65, y:0.65, type:'secondary', children:['g','h'] },
    { id:'f', label:'User F\n@Cricket24', x:0.1, y:0.88, type:'tertiary', children:[] },
    { id:'g', label:'User G\n@Viral', x:0.58, y:0.88, type:'tertiary', children:[] },
    { id:'h', label:'User H\n@SportVault', x:0.78, y:0.88, type:'tertiary', children:[] },
  ]
};
