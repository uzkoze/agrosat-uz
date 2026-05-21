import React, { useState } from 'react';
import { getMockKadastr } from '../services/api';

const severityConfig = {
  critical: { color: '#ef5350', label: 'Kritik', bg: '#ef535022' },
  high: { color: '#ffa726', label: 'Yuqori', bg: '#ffa72622' },
  medium: { color: '#29b6f6', label: "O'rta", bg: '#29b6f622' },
  low: { color: '#00e676', label: 'Past', bg: '#00e67622' },
};

export default function KadastrMonitor() {
  const data = getMockKadastr();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? data : data.filter(d => d.severity === filter);
  const critical = data.filter(d => d.severity === 'critical').length;
  const high = data.filter(d => d.severity === 'high').length;

  return (
    <div style={{ padding: 28, flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#29b6f6', marginBottom: 4 }}>🗺️ Kadastr Monitor</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sun'iy yo'ldosh orqali noqonuniy yer foydalanishni aniqlash</p>
        </div>
        <div style={{ padding: '6px 14px', background: '#ef535022', border: '1px solid #ef5350', borderRadius: 20, fontSize: 12, color: '#ef5350', fontFamily: 'var(--font-mono)' }}>
          {critical + high} AKTIV XABAR
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.entries(severityConfig).map(([key, cfg]) => {
          const count = data.filter(d => d.severity === key).length;
          return (
            <div key={key} onClick={() => setFilter(filter === key ? 'all' : key)}
              style={{ flex: 1, minWidth: 120, background: filter === key ? cfg.bg : 'var(--bg-card)', border: `1px solid ${filter === key ? cfg.color : 'var(--border)'}`, borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>{cfg.label.toUpperCase()}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: cfg.color, fontFamily: 'var(--font-mono)' }}>{count}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>holat</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1 }}>ANIQLANGAN HOLATLAR ({filtered.length})</span>
          <button onClick={() => setFilter('all')} style={{ fontSize: 11, color: '#29b6f6', background: 'none', border: 'none', cursor: 'pointer' }}>
            {filter !== 'all' ? '× Filtrni tozalash' : ''}
          </button>
        </div>
        {filtered.map(item => {
          const cfg = severityConfig[item.severity];
          const isSelected = selected === item.id;
          return (
            <div key={item.id} onClick={() => setSelected(isSelected ? null : item.id)}
              style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: isSelected ? cfg.bg : 'transparent', transition: 'background 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.id}</span>
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 10, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}` }}>{cfg.label}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{item.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.area} ga</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.date}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.lat.toFixed(3)}°N {item.lng.toFixed(3)}°E</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, padding: 12, background: '#0a1520', borderRadius: 8, display: 'flex', gap: 24 }}>
                  <div><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Koordinata</span><br/><span style={{ fontSize: 12, color: '#29b6f6', fontFamily: 'var(--font-mono)' }}>{item.lat.toFixed(5)}, {item.lng.toFixed(5)}</span></div>
                  <div><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Maydon</span><br/><span style={{ fontSize: 12, color: cfg.color, fontFamily: 'var(--font-mono)' }}>{item.area} gektar</span></div>
                  <div><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Aniqlangan sana</span><br/><span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{item.date}</span></div>
                  <div style={{ marginLeft: 'auto' }}>
                    <button style={{ padding: '6px 16px', background: '#29b6f622', border: '1px solid #29b6f6', borderRadius: 6, color: '#29b6f6', fontSize: 11, cursor: 'pointer' }}>
                      Google Maps →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
