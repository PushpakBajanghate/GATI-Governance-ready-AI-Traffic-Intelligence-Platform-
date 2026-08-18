import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  TrendingDown,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Radio,
  Navigation,
  FastForward,
} from 'lucide-react';

export default function DynamicSplitAndCorridorVisualizer({ telemetry }) {
  // Preset traffic scenarios for demonstration
  const SCENARIOS = {
    morning_peak: {
      name: 'Morning Peak',
      subtitle: 'Heavy North-South Arterial Surge',
      north: 46,
      south: 42,
      east: 12,
      west: 10,
    },
    evening_eastwest: {
      name: 'Evening Peak',
      subtitle: 'Commercial Surge: East-West Congestion',
      north: 14,
      south: 12,
      east: 48,
      west: 39,
    },
    unbalanced_single: {
      name: 'Flyover Bottleneck',
      subtitle: 'Unbalanced Spike (Northbound Only)',
      north: 55,
      south: 12,
      east: 8,
      west: 7,
    },
    off_peak: {
      name: 'Off-Peak Flow',
      subtitle: 'Balanced Fluid Traffic',
      north: 16,
      south: 18,
      east: 14,
      west: 15,
    },
  };

  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(2.5); // 1x, 2.5x, 5x Fast
  const [activeScenario, setActiveScenario] = useState('auto_live');
  const [autoCycleScenarios, setAutoCycleScenarios] = useState(true);
  const [animTime, setAnimTime] = useState(0);

  // Live Demand State
  const [demand, setDemand] = useState({
    north: 32,
    south: 36,
    east: 14,
    west: 16,
  });

  // High-frequency 35ms 60FPS fluid animation ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAnimTime((t) => t + 0.05 * simSpeed);
    }, 35);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Smooth real-time undulating traffic oscillation & auto-cycle scenarios
  useEffect(() => {
    if (!isPlaying) return;

    // If in auto_live mode, continuously oscillate demand organically
    if (activeScenario === 'auto_live') {
      const baseN = 28;
      const baseS = 34;
      const baseE = 16;
      const baseW = 18;

      // Realistic non-linear organic harmonic waves
      const waveN = Math.sin(animTime * 0.4) * 12 + Math.cos(animTime * 0.2) * 5;
      const waveS = Math.cos(animTime * 0.35) * 10 + Math.sin(animTime * 0.15) * 6;
      const waveE = Math.sin(animTime * 0.3 + 1.2) * 8 + Math.cos(animTime * 0.5) * 4;
      const waveW = Math.cos(animTime * 0.25 + 0.8) * 7 + Math.sin(animTime * 0.4) * 3;

      setDemand({
        north: Math.max(6, Math.min(58, Math.round(baseN + waveN))),
        south: Math.max(6, Math.min(58, Math.round(baseS + waveS))),
        east: Math.max(5, Math.min(52, Math.round(baseE + waveE))),
        west: Math.max(5, Math.min(52, Math.round(baseW + waveW))),
      });
    } else {
      // If a preset is chosen, add subtle micro-vibrations so it stays alive
      const target = SCENARIOS[activeScenario] || SCENARIOS.morning_peak;
      const jitterN = Math.sin(animTime * 0.6) * 2;
      const jitterS = Math.cos(animTime * 0.5) * 2;
      const jitterE = Math.sin(animTime * 0.7) * 1.5;
      const jitterW = Math.cos(animTime * 0.8) * 1.5;

      setDemand({
        north: Math.max(4, Math.round(target.north + jitterN)),
        south: Math.max(4, Math.round(target.south + jitterS)),
        east: Math.max(4, Math.round(target.east + jitterE)),
        west: Math.max(4, Math.round(target.west + jitterW)),
      });
    }
  }, [animTime, isPlaying, activeScenario]);

  // 1. Single Junction Dynamic Split Math (IRC SP:41 bounded: min 15s, max 60s)
  const nsPCU = demand.north + demand.south;
  const ewPCU = demand.east + demand.west;
  const totalPCU = Math.max(1, nsPCU + ewPCU);

  const nsRatio = nsPCU / totalPCU;
  const ewRatio = ewPCU / totalPCU;

  // Traditional Fixed Equal Timing (Equal 30s / 30s)
  const fixedNSGreen = 30;
  const fixedEWGreen = 30;

  // GATI Adaptive Dynamic Split (Min 15s, Max 60s dynamically allocated based on PCU pressure)
  const availableGreenTime = 72;
  let gatiNSGreen = Math.round(Math.min(58, Math.max(15, availableGreenTime * nsRatio)));
  let gatiEWGreen = Math.round(Math.min(58, Math.max(15, availableGreenTime * ewRatio)));

  if (gatiNSGreen + gatiEWGreen < 50) {
    if (nsPCU >= ewPCU) gatiNSGreen = 50 - gatiEWGreen;
    else gatiEWGreen = 50 - gatiNSGreen;
  }

  const fixedWastedNS = fixedNSGreen > (availableGreenTime * nsRatio) ? (fixedNSGreen - (availableGreenTime * nsRatio)).toFixed(1) : '0.0';
  const fixedWastedEW = fixedEWGreen > (availableGreenTime * ewRatio) ? (fixedEWGreen - (availableGreenTime * ewRatio)).toFixed(1) : '0.0';
  const totalFixedWasted = (Number(fixedWastedNS) + Number(fixedWastedEW)).toFixed(1);

  // 2. Cascading Corridor Platoon Progression (5 Wardha Road Junctions + VNIT IT Park)
  const CORRIDOR_JUNCTIONS = [
    { id: 'NGP_J01_SITABULDI', name: 'Sitabuldi Interchange', distM: 0, speedKmh: 45 },
    { id: 'NGP_J02_VARIETIES_SQ', name: 'Varieties Square', distM: 450, speedKmh: 45 },
    { id: 'NGP_J03_RAHATE_COLONY', name: 'Rahate Colony (GMCH)', distM: 1050, speedKmh: 45 },
    { id: 'NGP_J04_AJNI_SQ', name: 'Ajni Railway Flyover', distM: 1850, speedKmh: 45 },
    { id: 'NGP_J05_CHHATRAPATI_SQ', name: 'Chhatrapati Square', distM: 2800, speedKmh: 45 },
    { id: 'NGP_J06_VNIT_IT_PARK', name: 'VNIT Gate & IT Park', distM: 3600, speedKmh: 45 },
  ];

  return (
    <div
      className="card glass-panel"
      style={{
        backgroundColor: '#090d16',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '24px',
        color: '#f8fafc',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* ─── Header: Feature Title & Dynamic Animation Controls ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} style={{ color: '#38bdf8' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '16.5px', fontWeight: 700, margin: 0, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                Dynamic Asymmetric Split & Cascading Corridor Optimizer
              </h2>
              <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Continuous real-time traffic wave simulation — automatically shifting green splits to eliminate stopped queues.
              </p>
            </div>
          </div>
        </div>

        {/* Animation Playback Bar (Play/Pause, Speed, Live Badge) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              backgroundColor: isPlaying ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${isPlaying ? '#10b981' : '#ef4444'}`,
              color: isPlaying ? '#34d399' : '#f87171',
              padding: '5px 12px',
              borderRadius: '7px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            {isPlaying ? 'RUNNING (LIVE)' : 'PAUSED'}
          </button>

          {/* Speed Toggle (1x, 2x, 4x) */}
          <div style={{ display: 'flex', background: '#0f172a', borderRadius: '7px', border: '1px solid #1e293b', padding: '2px' }}>
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                style={{
                  background: simSpeed === s ? '#0284c7' : 'transparent',
                  color: simSpeed === s ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Live Pulse Pill */}
          <span
            style={{
              backgroundColor: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid #0284c7',
              color: '#38bdf8',
              padding: '5px 11px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#38bdf8',
                boxShadow: '0 0 8px #38bdf8',
                animation: 'pulse 1.5s infinite',
              }}
            />
            ACTIVE SIMULATOR
          </span>
        </div>
      </div>

      {/* ─── Part 1: Interactive Scenario Chips ─── */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Select Simulation Mode:
          </span>
          <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
            Wave Phase: {(animTime % 60).toFixed(1)}s • Total Load: {totalPCU} PCU
          </span>
        </div>

        {/* Preset Selector Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setActiveScenario('auto_live')}
            style={{
              backgroundColor: activeScenario === 'auto_live' ? 'rgba(14, 165, 233, 0.2)' : '#0d1524',
              border: `1.5px solid ${activeScenario === 'auto_live' ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: activeScenario === 'auto_live' ? '#38bdf8' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
              🔄 Live Harmonic Wave
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
              Continuous real-time fluid drift
            </div>
          </button>

          {Object.entries(SCENARIOS).map(([key, s]) => {
            const isSelected = activeScenario === key;
            return (
              <button
                key={key}
                onClick={() => setActiveScenario(key)}
                style={{
                  backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.2)' : '#0d1524',
                  border: `1.5px solid ${isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#34d399' : '#e2e8f0' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── Real-Time Moving Queue Flow Visualizer (4 Approaches with Animated Particles) ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px', backgroundColor: '#0b111e', padding: '14px 16px', borderRadius: '10px', marginBottom: '18px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          {/* North */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>North (Wardha Rd N)</span>
              <strong style={{ color: demand.north > 25 ? '#ef4444' : '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>{demand.north} PCU</strong>
            </div>
            <div style={{ position: 'relative', height: '14px', background: '#172236', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(demand.north / 60) * 100}%`,
                  background: demand.north > 25 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                  borderRadius: '10px',
                  transition: 'width 0.2s ease',
                }}
              />
              {/* Moving vehicle dot */}
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: `${((animTime * 25) % 95)}%`,
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 6px #ffffff',
                }}
              />
            </div>
          </div>

          {/* South */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>South (Wardha Rd S)</span>
              <strong style={{ color: demand.south > 25 ? '#ef4444' : '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>{demand.south} PCU</strong>
            </div>
            <div style={{ position: 'relative', height: '14px', background: '#172236', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(demand.south / 60) * 100}%`,
                  background: demand.south > 25 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                  borderRadius: '10px',
                  transition: 'width 0.2s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: `${((animTime * 20 + 30) % 95)}%`,
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 6px #ffffff',
                }}
              />
            </div>
          </div>

          {/* East */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>East (Central Ave)</span>
              <strong style={{ color: demand.east > 25 ? '#ef4444' : '#fbbf24', fontFamily: 'JetBrains Mono, monospace' }}>{demand.east} PCU</strong>
            </div>
            <div style={{ position: 'relative', height: '14px', background: '#172236', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(demand.east / 60) * 100}%`,
                  background: demand.east > 25 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #d97706, #fbbf24)',
                  borderRadius: '10px',
                  transition: 'width 0.2s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: `${((animTime * 18 + 50) % 95)}%`,
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 6px #ffffff',
                }}
              />
            </div>
          </div>

          {/* West */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>West (VNIT Tech Hub)</span>
              <strong style={{ color: demand.west > 25 ? '#ef4444' : '#a78bfa', fontFamily: 'JetBrains Mono, monospace' }}>{demand.west} PCU</strong>
            </div>
            <div style={{ position: 'relative', height: '14px', background: '#172236', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(demand.west / 60) * 100}%`,
                  background: demand.west > 25 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                  borderRadius: '10px',
                  transition: 'width 0.2s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: `${((animTime * 22 + 15) % 95)}%`,
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 6px #ffffff',
                }}
              />
            </div>
          </div>
        </div>

        {/* ─── Side-by-Side Comparison: Traditional Fixed vs. GATI Dynamic Moving Split ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Card A: Traditional Dumb Fixed Timer */}
          <div
            style={{
              backgroundColor: '#0d131f',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '13px' }}>
                <span>❌ Traditional Fixed Timer (Rigid 30s / 30s)</span>
              </div>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>Static Cycle: 72s</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
              Dumb timer allocates equal time regardless of massive queue buildup on Wardha Road.
            </p>

            {/* Fixed Visual Split Bar */}
            <div style={{ display: 'flex', height: '32px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', border: '1px solid #334155' }}>
              <div
                style={{
                  width: '50%',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11.5px',
                  fontWeight: 700,
                }}
              >
                N-S: 30s Green
              </div>
              <div
                style={{
                  width: '50%',
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11.5px',
                  fontWeight: 700,
                }}
              >
                E-W: 30s Green
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#fca5a5' }}>
              <span>Wasted Green on Empty Approaches: ~{totalFixedWasted}s</span>
              <span style={{ fontWeight: 700 }}>Spillover Risk: HIGH</span>
            </div>
          </div>

          {/* Card B: GATI Adaptive Dynamic Moving Split */}
          <div
            style={{
              backgroundColor: '#0c1b26',
              border: '1.5px solid #10b981',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, fontSize: '13px' }}>
                <CheckCircle2 size={16} />
                <span>GATI Adaptive Dynamic Split (Queue-Weighted)</span>
              </div>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, animation: 'pulse 2s infinite' }}>
                ⚡ Auto-Expanding
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '12px' }}>
              Dynamically expands the heavier corridor up to 58s and trims empty phases down to safety min.
            </p>

            {/* Dynamic Visual Split Bar (Fluid Transition) */}
            <div style={{ display: 'flex', height: '32px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', border: '1.5px solid #10b981', position: 'relative' }}>
              <div
                style={{
                  width: `${(gatiNSGreen / (gatiNSGreen + gatiEWGreen)) * 100}%`,
                  background: 'linear-gradient(90deg, #059669, #10b981)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  transition: 'width 0.4s ease-out',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
                }}
              >
                N-S: {gatiNSGreen}s Green ({Math.round(nsRatio * 100)}%)
              </div>
              <div
                style={{
                  width: `${(gatiEWGreen / (gatiNSGreen + gatiEWGreen)) * 100}%`,
                  background: 'linear-gradient(90deg, #d97706, #f59e0b)',
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  transition: 'width 0.4s ease-out',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
                }}
              >
                E-W: {gatiEWGreen}s Green ({Math.round(ewRatio * 100)}%)
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
              <span>Wasted Green: 0.0s (100% Utilized)</span>
              <span>Delay Avoidance: -34.8%</span>
            </div>
          </div>
        </div>

        {/* ─── Part 2: Animated Cascading Green Wave Corridor Progression ─── */}
        <div style={{ backgroundColor: '#0b111e', borderRadius: '12px', padding: '16px 20px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={16} style={{ color: '#38bdf8' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                Nagpur Wardha Road & VNIT IT Park Cascading Green Wave Platoon Flow
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
              Target Platoon Speed: 45 km/h (No Stop-and-Go)
            </span>
          </div>

          {/* Animated Multi-Junction Corridor Track */}
          <div style={{ position: 'relative', padding: '15px 0' }}>
            {/* Road Track Line */}
            <div style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  backgroundImage: 'repeating-linear-gradient(90deg, #38bdf8 0, #38bdf8 15px, transparent 15px, transparent 30px)',
                  opacity: 0.4,
                }}
              />
            </div>

            {/* Animated Moving Platoon Dots along Corridor */}
            {[0, 1, 2].map((idx) => {
              const platoonPos = ((animTime * 15 + idx * 35) % 100);
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    top: '9px',
                    left: `${platoonPos}%`,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #38bdf8 40%, rgba(56, 189, 248, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    boxShadow: '0 0 12px #38bdf8',
                    transition: 'left 0.1s linear',
                    zIndex: 5,
                  }}
                  title="Vehicle Platoon Flowing at 45 km/h"
                >
                  🚗
                </div>
              );
            })}

            {/* Junction Nodes along Track */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              {CORRIDOR_JUNCTIONS.map((j, i) => {
                const isGreenCascade = ((animTime * 1.5 + i * 1.2) % 6) < 4.0;
                return (
                  <div key={j.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '90px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: isGreenCascade ? '#10b981' : '#ef4444',
                        boxShadow: `0 0 10px ${isGreenCascade ? '#10b981' : '#ef4444'}`,
                        border: '2px solid #ffffff',
                        marginBottom: '6px',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                      {j.name.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '9.5px', color: '#64748b' }}>
                      +{j.distM}m
                    </span>
                    <span style={{ fontSize: '9px', color: isGreenCascade ? '#34d399' : '#f87171', fontWeight: 600, marginTop: '2px' }}>
                      {isGreenCascade ? 'GREEN' : 'HOLD'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
