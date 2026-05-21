import React, { useState } from 'react';
import { getMockWaste } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const statusConfig = {
  'Yangi': { color: '#ef5350', bg: '#ef535022' },
  'Tekshirilmoqda': { color: '#ffa726', bg: '#ffa72622' },
  'Xavfli': { color: '#ab47bc', bg: '#ab47bc22' },
  'Bartaraf etildi': { color: '#00e676', bg: '#00e67622' },
};

const typeColors = ['#ab47bc', '#ef5350', '#ffa726', '#29b6f6', '#00e676'];

export default function WasteDetector() {
  const data = getMockWaste();
  const [selected, setSelected] = useState(null);

  const byType = Object.entries(
    data.reduce((acc, d) => { acc[d.type] = (acc[d.type] || 0) + 1; return acc; }, {})
  ).map(([name, value], i) => ({ name, value, color: typeColors[i % typeColors.length] }));

  const totalVolume = data.reduce((s, d) => s + d.volume, 0);

  return (
    <div style={{ padding: 28, flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#ab47bc', marginBottom: 4 }}>♻️ Chiqindi Deteksiya</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sentinel-2 sun'iy yo'ldosh orqali noqonuniy chiqindi tashlashni aniqlash</p>
        </div>
        <div style={{ padding: '6px 14px', background: '#ab47bc22', border: '1px solid #ab47bc', borderRadius: 20, fontSize: 12, color: '#ab47bc', fontFamily: 'var(--font-mono)' }}>
          {data.filter(d => d.status === 'Yangi' || d.status === 'Xavfli').length} AKTIV
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: "JAMI ANIQLANGAN", value: data.length, color: '#ab47bc', unit: 'ta' },
          { label: "UMUMIY HAJM", value: totalVolume, color: '#ef5350', unit: 'm³' },
          { label: "XAVFLI", value: data.filter(d => d.status === 'Xavfli').length, color: '#ffa726', unit: 'ta' },
          { label: "BARTARAF ETILDI", value: data.filter(d => d.status === 'Bartaraf etildi').length, color: '#00e676', unit: 'ta' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, minWidth: 130, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}<span style={{ fontSize: 12, marginLeft: 4, color: 'var(--text-secondary)' }}>{s.unit}</span></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, marginBottom: 20 }}>
        {/* Pie chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12 }}>CHIQINDI TURLARI</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byType} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {byType.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0d1318', border: '1px solid #1e2d3d', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          {byType.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: t.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.name}</span>
              <span style={{ fontSize: 11, color: t.color, marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{t.value}</span>
            </div>
          ))}
        </div>

        {/* List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1 }}>ANIQLANGANLAR RO'YXATI</div>
          {data.map(item => {
            const cfg = statusConfig[item.status] || { color: '#7a99b8', bg: 'transparent' };
            const isSelected = selected === item.id;
            return (
              <div key={item.id} onClick={() => setSelected(isSelected ? null : item.id)}
                style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: isSelected ? cfg.bg : 'transparent', transition: 'background 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.id}</span>
                    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 10, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}` }}>{item.status}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{item.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <span style={{ fontSize: 12, color: '#ab47bc', fontFamily: 'var(--font-mono)' }}>{item.volume} m³</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.date}</span>
                  </div>
                </div>
                {isSelected && (
                  <div style={{ marginTop: 10, padding: 10, background: '#0a1520', borderRadius: 8, display: 'flex', gap: 20 }}>
                    <div><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Koordinata</span><br/><span style={{ fontSize: 12, color: '#ab47bc', fontFamily: 'var(--font-mono)' }}>{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</span></div>
                    <div><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Hajm</span><br/><span style={{ fontSize: 12, color: '#ef5350', fontFamily: 'var(--font-mono)' }}>{item.volume} m³</span></div>
                    <div style={{ marginLeft: 'auto' }}>
                      <button style={{ padding: '5px 14px', background: '#ab47bc22', border: '1px solid #ab47bc', borderRadius: 6, color: '#ab47bc', fontSize: 11, cursor: 'pointer' }}>Hisobot →</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
