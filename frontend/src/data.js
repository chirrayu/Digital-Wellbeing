// ── Mock Data ──────────────────────────────────────────────
export const MOCK = {
  stats: { assets: 0, violations: 0, monitored: 0, revenueProtected: 0 },

  recentAlerts: [],

  contentAssets: [],

  detectionFeed: [],

  violations: [],

  analytics: {
    violationsOverTime: [0, 0, 0, 0, 0, 0, 0],
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    platforms: { YouTube:0, TikTok:0, X:0, Instagram:0 },
    topContent: [],
    revenueLoss: 0,
    takedownsSent: 0,
    takedownsSuccess: 0,
  },

  propagation: []
};
