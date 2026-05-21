import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchNDVI, getMockNDVI } from '../services/api';

const ndviColor = v => {
  if (v >= 0.6) return '#00e676';
  if (v >= 0.45) return '#8bc34a';
  if (v >= 0.3) return '#ffa726';
  return '#ef5350';
};

const StatCard = ({ label, value, unit, color, sub }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '16px 20px', flex: 1, minWidth: 140,
  }}>
    <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}<span style={{ fontSize: 14, color: 'var(--text-secondary)', marginLeft: 4 }}>{unit}</span></div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</div>}
  </div>
);

export default function AgroMonitor() {
  const [data, setData] = useState(getMockNDVI());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [source, setSource] = useState('Mock');

  useEffect(() => {
    fetchNDVI().then(res => {
      setData(res.data || getMockNDVI());
      setSource(res.source || 'Mock');
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, []);

  const avg = data.reduce((s, d) => s + d.ndvi, 0) / data.length;
  const healthy = data.filter(d => d.ndvi >= 0.5).length;
  const stressed = data.filter(d => d.ndvi < 0.35).length;
  const totalArea = data.reduce((s, d) => s + d.area, 0);

  return (
    <div style={{ padding: 28, flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#00e676', marginBottom: 4 }}>🌾 Agro Monitor</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>O'zbekiston viloyatlari bo'yicha NDVI (ekin sog'liqi) tahlili</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: source.includes('Mock') ? '#ffa726' : '#00e676', boxShadow: `0 0 8px ${source.includes('Mock') ? '#ffa726' : '#00e676'}` }} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{source}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="O'RT. NDVI" value={avg.toFixed(2)} color={ndviColor(avg)} sub="O'zbekiston bo'yicha" />
        <StatCard label="SOG'LOM MAYDON" value={healthy} unit={`/${data.length}`} color="#00e676" sub="viloyat NDVI ≥ 0.5" />
        <StatCard label="STRESSLI MAYDON" value={stressed} unit="viloyat" color="#ef5350" sub="NDVI < 0.35" />
        <StatCard label="UMUMIY MAYDON" value={(totalArea / 1000).toFixed(0)} unit="ming ga" color="#29b6f6" sub="monitoring ostida" />
      </div>

      {/* NDVI Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['≥ 0.60', '#00e676', "A'lo"], ['0.45–0.60', '#8bc34a', "Yaxshi"], ['0.30–0.45', '#ffa726', "O'rtacha"], ['< 0.30', '#ef5350', "Yomon"]].map(([range, color, label]) => (
          <div key={range} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{range} — {label}</span>
          </div>
        ))}
      </div>

      {/* Chart + Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Bar chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16 }}>NDVI — VILOYATLAR BO'YICHA</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" domain={[0, 1]} tick={{ fill: '#7a99b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#7a99b8', fontSize: 10 }} width={100} />
              <Tooltip
                contentStyle={{ background: '#0d1318', border: '1px solid #1e2d3d', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e8f0fe' }}
                formatter={(v) => [v.toFixed(3), 'NDVI']}
              />
              <Bar dataKey="ndvi" radius={[0, 4, 4, 0]}>
                {data.map((entry, i) => <Cell key={i} fill={ndviColor(entry.ndvi)} opacity={selected === entry.name ? 1 : 0.75} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, overflowY: 'auto', maxHeight: 380 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12 }}>BATAFSIL MA'LUMOT</div>
          {data.sort((a, b) => b.ndvi - a.ndvi).map((d, i) => (
            <div
              key={d.name}
              onClick={() => setSelected(selected === d.name ? null : d.name)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: 6, marginBottom: 2, cursor: 'pointer',
                background: selected === d.name ? `${ndviColor(d.ndvi)}18` : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 16, fontFamily: 'var(--font-mono)' }}>{i + 1}</span>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: ndviColor(d.ndvi), flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{d.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: ndviColor(d.ndvi), fontWeight: 700 }}>{d.ndvi.toFixed(3)}</span>
                <span style={{ fontSize: 10, color: d.trend > 0 ? '#00e676' : '#ef5350', fontFamily: 'var(--font-mono)' }}>
                  {d.trend > 0 ? '▲' : '▼'}{Math.abs(d.trend).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentinel image placeholder */}
      <div style={{ marginTop: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12 }}>SENTINEL-2 NDVI XARITA — O'ZBEKISTON</div>
        <div style={{
          height: 200, borderRadius: 8, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(135deg, #0a2010 0%, #0d3020 40%, #1a4030 70%, #0d2818 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8
        }}>
          <div style={{ fontSize: 32 }}>🛰️</div>
          <div style={{ fontSize: 12, color: '#00e676', fontFamily: 'var(--font-mono)' }}>Sentinel Hub Process API</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>NDVI composite — O'zbekiston — {new Date().toLocaleDateString()}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Deploy qilgandan so'ng haqiqiy satellite rasm yuklanadi</div>
        </div>
      </div>
    </div>
  );
}
