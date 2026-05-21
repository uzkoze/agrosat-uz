import React, { useState } from 'react';
import { getMockSeismic } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const magColor = m => {
  if (m >= 4.0) return '#ef5350';
  if (m >= 3.0) return '#ffa726';
  if (m >= 2.0) return '#ffee58';
  return '#29b6f6';
};

const magLabel = m => {
  if (m >= 4.0) return 'Kuchli';
  if (m >= 3.0) return "O'rtacha";
  if (m >= 2.0) return 'Kuchsiz';
  return 'Mikro';
};

export default function SeismicMonitor() {
  const data = getMockSeismic();
  const [selected, setSelected] = useState(null);

  const maxMag = Math.max(...data.map(d => d.magnitude));
  const alerts = data.filter(d => d.alert);
  const avgDepth = (data.reduce((s, d) => s + d.depth, 0) / data.length).toFixed(1);

  // Timeline data
  const timeline = [...data].sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
    date: d.date.slice(5),
    magnitude: d.magnitude,
    region: d.region,
  }));

  return (
    <div style={{ padding: 28, flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#ef5350', marginBottom: 4 }}>📡 Yer Monitor</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>InSAR va seysmik sensorlar — yer deformatsiyasi va zilzila monitoringi</p>
        </div>
        {alerts.length > 0 && (
          <div style={{ padding: '6px 14px', background: '#ef535022', border: '1px solid #ef5350', borderRadius: 20, fontSize: 12, color: '#ef5350', fontFamily: 'var(--font-mono)', animation: 'pulse 2s infinite' }}>
            ⚠ {alerts.length} OGOHLANTIRISH
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: "JAMI HODISA", value: data.length, color: '#ef5350', unit: 'ta (7 kun)' },
          { label: "MAX MAGNITUD", value: maxMag.toFixed(1), color: magColor(maxMag), unit: 'M' },
          { label: "O'RT. CHUQURLIK", value: avgDepth, color: '#29b6f6', unit: 'km' },
          { label: "OGOHLANTIRISHLAR", value: alerts.length, color: '#ffa726', unit: 'ta' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, minWidth: 130, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}<span style={{ fontSize: 11, marginLeft: 4, color: 'var(--text-secondary)' }}>{s.unit}</span></div>
          </div>
        ))}
      </div>

      {/* Timeline chart */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16 }}>MAGNITUD VAQT GRAFIGI</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timeline} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fill: '#7a99b8', fontSize: 10 }} />
            <YAxis domain={[0, 5]} tick={{ fill: '#7a99b8', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#0d1318', border: '1px solid #1e2d3d', borderRadius: 8, fontSize: 11 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div style={{ background: '#0d1318', border: '1px solid #1e2d3d', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ color: magColor(d.magnitude), fontWeight: 700 }}>M {d.magnitude}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.region} · {d.date}</div>
                  </div>
                );
              }}
            />
            <ReferenceLine y={3} stroke="#ffa72644" strokeDasharray="4 4" label={{ value: 'Xavf chegarasi M3', fill: '#ffa726', fontSize: 10 }} />
            <ReferenceLine y={4} stroke="#ef535044" strokeDasharray="4 4" label={{ value: 'Kuchli M4', fill: '#ef5350', fontSize: 10 }} />
            <Line type="monotone" dataKey="magnitude" stroke="#ef5350" strokeWidth={2} dot={{ fill: '#ef5350', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Events list */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1 }}>SEYSMIK HODISALAR</div>
        {[...data].sort((a, b) => b.magnitude - a.magnitude).map((item, i) => {
          const color = magColor(item.magnitude);
          const isSelected = selected === i;
          return (
            <div key={i} onClick={() => setSelected(isSelected ? null : i)}
              style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: isSelected ? `${color}18` : item.alert ? '#ef535008' : 'transparent', transition: 'background 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {item.alert && <span style={{ fontSize: 14 }}>⚠️</span>}
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, background: `${color}22`, border: `1px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>M{item.magnitude}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.region}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{magLabel(item.magnitude)} · Chuqurlik: {item.depth} km</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.date}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{item.lat.toFixed(3)}°N {item.lng.toFixed(3)}°E</div>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 10, padding: 10, background: '#0a1520', borderRadius: 8, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Magnitud</span><br/><span style={{ fontSize: 14, color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>M {item.magnitude}</span></div>
                  <div><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Chuqurlik</span><br/><span style={{ fontSize: 14, color: '#29b6f6', fontFamily: 'var(--font-mono)' }}>{item.depth} km</span></div>
                  <div><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Koordinata</span><br/><span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</span></div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 10, background: `${color}22`, color, border: `1px solid ${color}` }}>{magLabel(item.magnitude)}</span>
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
