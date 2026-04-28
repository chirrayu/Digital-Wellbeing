export function formatCurrency(n) {
  if (n >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + (n/1e3).toFixed(0) + 'K';
  return '$' + n;
}

export function scoreClass(s) {
  if (s >= 85) return 'high';
  if (s >= 65) return 'mid';
  return 'low';
}

export function PlatformPill({ p }) {
  const icons = { youtube:'▶', tiktok:'♪', x:'𝕏', instagram:'📷' };
  return (
    <span className={`platform-pill ${p}`}>
      {icons[p]||'•'} {p.charAt(0).toUpperCase()+p.slice(1)}
    </span>
  );
}

export function StatusBadge({ status }) {
  let label = 'OK';
  if (status === 'violation') label = 'VIOLATION';
  if (status === 'review') label = 'REVIEW';
  if (status === 'authorized') label = 'AUTHORIZED';
  
  return (
    <span className={`badge ${status}`}>
      {label}
    </span>
  );
}
