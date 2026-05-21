import React, { useState, useEffect } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import AgroMonitor from './modules/AgroMonitor';
import KadastrMonitor from './modules/KadastrMonitor';
import HeatMap from './modules/HeatMap';
import WasteDetector from './modules/WasteDetector';
import SeismicMonitor from './modules/SeismicMonitor';

const modules = {
  agro: AgroMonitor,
  kadastr: KadastrMonitor,
  heat: HeatMap,
  waste: WasteDetector,
  seismic: SeismicMonitor,
};

const moduleColors = {
  agro: '#00e676',
  kadastr: '#29b6f6',
  heat: '#ffa726',
  waste: '#ab47bc',
  seismic: '#ef5350',
};

export default function App() {
  const [active, setActive] = useState('agro');
  const [time, setTime] = useState(new Date());
  const [alerts] = useState([
    { type: 'seismic', msg: 'M4.2 zilzila — Surxondaryo', color: '#ef5350' },
    { type: 'kadastr', msg: '680 ga noqonuniy yer — Qoraqalpog\'iston', color: '#29b6f6' },
    { type: 'waste', msg: 'Kimyoviy chiqindi aniqlandi — Samarqand', color: '#ab47bc' },
  ]);
  const [alertIdx, setAlertIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAlertIdx(i => (i + 1) % alerts.length), 4000);
    return () => clearInterval(t);
  }, [alerts.length]);

  const ActiveModule = modules[active];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top bar */}
      <header style={{
        height: 48, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', flexShrink: 0, zIndex: 100,
      }}>
        {/* Live alerts ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, flexShrink: 0 }}>LIVE ALERT</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: alerts[alertIdx].color, boxShadow: `0 0 6px ${alerts[alertIdx].color}`, animation: 'pulse 1s infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: alerts[alertIdx].color, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
              {alerts[alertIdx].msg}
            </span>
          </div>
        </div>

        {/* Center — satellite orbit indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
            UZ · {time.toUTCString().slice(17, 25)} UTC
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['S2A', 'S2B', 'MOD', 'VRS'].map(sat => (
              <span key={sat} style={{
                fontSize: 9, padding: '2px 7px', borderRadius: 4,
                background: '#00e67618', border: '1px solid #00e67640',
                color: '#00e676', fontFamily: 'var(--font-mono)', letterSpacing: 1
              }}>{sat}</span>
            ))}
          </div>
        </div>

        {/* Right — user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>AgroSat UZ</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>@agrosatuz · NASA EDL</div>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `linear-gradient(135deg, ${moduleColors[active]} 0%, #29b6f6 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
          }}>🛰️</div>
        </div>
      </header>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active={active} onSelect={setActive} />
        <main style={{
          flex: 1, overflowY: 'auto',
          borderLeft: `2px solid ${moduleColors[active]}`,
          transition: 'border-color 0.3s',
        }}>
          <ActiveModule />
        </main>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
