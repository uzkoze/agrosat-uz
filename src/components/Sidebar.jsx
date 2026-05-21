import React from 'react';

const modules = [
  { id: 'agro', icon: '🌾', label: 'Agro Monitor', sub: 'Ekin NDVI tahlili', color: '#00e676' },
  { id: 'kadastr', icon: '🗺️', label: 'Kadastr', sub: 'Noqonuniy yer', color: '#29b6f6' },
  { id: 'heat', icon: '🌡️', label: 'Issiqlik Xarita', sub: 'Urban heat islands', color: '#ffa726' },
  { id: 'waste', icon: '♻️', label: 'Chiqindi', sub: 'Tashlash deteksiya', color: '#ab47bc' },
  { id: 'seismic', icon: '📡', label: 'Yer Monitor', sub: 'Seysmik faollik', color: '#ef5350' },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #00e676 0%, #29b6f6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>🛰️</div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 1 }}>AGROSAT</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 2 }}>UZBEKISTAN</div>
          </div>
        </div>
      </div>

      {/* Satellite status */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: '#0a1520' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 6 }}>LIVE STATUS</div>
        {[
          { name: 'Sentinel-2', status: 'online', color: '#00e676' },
          { name: 'MODIS Terra', status: 'online', color: '#00e676' },
          { name: 'VIIRS SNPP', status: 'syncing', color: '#ffa726' },
        ].map(s => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{s.name}</span>
          </div>
        ))}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, padding: '4px 10px 8px' }}>MODULLAR</div>
        {modules.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 10px', marginBottom: 2, borderRadius: 8, border: 'none',
              background: active === m.id ? `${m.color}18` : 'transparent',
              borderLeft: active === m.id ? `2px solid ${m.color}` : '2px solid transparent',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (active !== m.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { if (active !== m.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{m.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: active === m.id ? m.color : 'var(--text-primary)' }}>{m.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.sub}</div>
            </div>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {new Date().toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>NASA · Sentinel-Hub · FIRMS</div>
      </div>
    </aside>
  );
}
