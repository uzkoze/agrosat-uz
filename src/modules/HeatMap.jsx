import React, { useEffect, useState } from 'react';
import { fetchFIRMS } from '../services/api';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const heatColor = b => {
  if (b >= 380) return '#ef5350';
  if (b >= 340) return '#ffa726';
  if (b >= 310) return '#ffee58';
  return '#29b6f6';
};

export default function HeatMap() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    setLoading(true);
    fetchFIRMS(timeRange).then(data => { setPoints(data); setLoading(false); });
  }, [timeRange]);

  const high = points.filter(p => p.brightness >= 350).length;
  const medium = points.filter(p => p.brightness >= 310 && p.brightness < 350).length;
  const low = points.filter(p => p.brightness < 310).length;

  return (
    <div style={{ padding: 28, flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#ffa726', marginBottom: 4 }}>🌡️ Issiqlik Xarita</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>NASA FIRMS VIIRS — O'zbekistondagi issiqlik nuqtalari</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 3, 7].map(d => (
            <button key={d} onClick={() => setTimeRange(d)}
              style={{ padding: '6px 16px', borderRadius: 6, border: `1px solid ${timeRange === d ? '#ffa726' : 'var(--border)'}`, background: timeRange === d ? '#ffa72622' : 'transparent', color: timeRange === d ? '#ffa726' : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
              {d} kun
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: "JAMI NUQTALAR", value: points.length, color: '#ffa726', unit: 'ta' },
          { label: "YUQORI INTENSIV", value: high, color: '#ef5350', unit: 'ta' },
          { label: "O'RTA INTENSIV", value: medium, color: '#ffee58', unit: 'ta' },
          { label: "PAST INTENSIV", value: low, color: '#29b6f6', unit: 'ta' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>{loading ? '...' : s.value}<span style={{ fontSize: 12, marginLeft: 4, color: 'var(--text-secondary)' }}>{s.unit}</span></div>
          </div>
        ))}
      </div>

      {/* Scatter chart */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16 }}>GEOGRAFIK TAQSIMOT (Koordinatalar bo'yicha)</div>
        {loading ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Yuklanmoqda...</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <XAxis dataKey="lng" name="Uzunlik" type="number" domain={[55, 74]} tick={{ fill: '#7a99b8', fontSize: 10 }} label={{ value: 'Uzunlik °E', position: 'insideBottom', fill: '#3d5468', fontSize: 11 }} />
              <YAxis dataKey="lat" name="Kenglik" type="number" domain={[37, 46]} tick={{ fill: '#7a99b8', fontSize: 10 }} label={{ value: 'Kenglik °N', angle: -90, position: 'insideLeft', fill: '#3d5468', fontSize: 11 }} />
              <Tooltip
                cursor={false}
                contentStyle={{ background: '#0d1318', border: '1px solid #1e2d3d', borderRadius: 8, fontSize: 11 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{ background: '#0d1318', border: '1px solid #1e2d3d', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ color: '#ffa726', fontWeight: 600, marginBottom: 4 }}>{d.region || 'Noma\'lum'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Koordinata: {d.lat?.toFixed(3)}, {d.lng?.toFixed(3)}</div>
                      <div style={{ fontSize: 11, color: heatColor(d.brightness) }}>Harorat: {d.brightness?.toFixed(0)} K</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>FRP: {d.frp?.toFixed(1)} MW</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.date}</div>
                    </div>
                  );
                }}
              />
              <Scatter data={points} fill="#ffa726">
                {points.map((p, i) => <Cell key={i} fill={heatColor(p.brightness)} opacity={0.85} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend + list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12 }}>INTENSIVLIK SHKALASI</div>
          {[
            { range: '≥ 380 K', color: '#ef5350', label: 'Yuqori — yong\'in xavfi' },
            { range: '340–380 K', color: '#ffa726', label: 'Kuchli issiqlik' },
            { range: '310–340 K', color: '#ffee58', label: "O'rtacha issiqlik" },
            { range: '< 310 K', color: '#29b6f6', label: "Kuchsiz — normal" },
          ].map(item => (
            <div key={item.range} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}`, flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: item.color }}>{item.range}</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, overflowY: 'auto', maxHeight: 220 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12 }}>SO'NGGI HODISALAR</div>
          {points.sort((a, b) => b.brightness - a.brightness).slice(0, 8).map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: heatColor(p.brightness) }} />
                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{p.region || `${p.lat?.toFixed(2)}°N`}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: heatColor(p.brightness) }}>{p.brightness?.toFixed(0)}K</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
