import React, { useState, useEffect } from 'react';
import { Camera, Activity, AlertCircle, ShieldAlert, Cpu, Eye, ArrowUpRight, Gauge, MapPin, Layers } from 'lucide-react';

export default function LiveJunctionView({ junction, telemetry, signalTiming }) {
  const [selectedCam, setSelectedCam] = useState('APP_NORTH');
  const [viewMode, setViewMode] = useState('junction_4way'); // 'junction_4way' or 'single_cam'
  const [playbackTime, setPlaybackTime] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x (Slow/Clear), 2x, 4x, 8x

  // Smooth, readable simulation animation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaybackTime((prev) => (prev + speedMultiplier * 0.9) % 20000);
    }, 35);
    return () => clearInterval(timer);
  }, [speedMultiplier]);

  const approaches = junction?.approaches || [];
  const approachesData = telemetry?.approaches || {};
  const signal = signalTiming?.recommended || telemetry?.signal || {};
  
  // Dynamic alternating signal phases for rapid presentation demonstration
  const simulatedPhaseTick = Math.floor((playbackTime / 400)) % 2;
  const currentPhaseId = signalTiming?.current?.phase_id || (simulatedPhaseTick === 0 ? 1 : 2);
  const currentPhase = junction?.phases?.find((p) => p.phase_id === currentPhaseId) || {
    name: currentPhaseId === 1 ? 'Phase 1: North-South Arterial' : 'Phase 2: East-West Collector',
    phase_id: currentPhaseId,
    active_approaches: currentPhaseId === 1 ? ['APP_NORTH', 'APP_SOUTH'] : ['APP_EAST', 'APP_WEST'],
  };

  const isNorthSouthGreen = currentPhaseId === 1;
  const isEastWestGreen = currentPhaseId === 2;

  const activeCam = approaches.find((a) => a.id === selectedCam) || approaches[0] || {
    id: 'APP_NORTH',
    name: 'Wardha Road (Northbound)',
    lanes: 3,
  };

  const APPROACH_DEFAULT_TELEMETRY = {
    APP_NORTH: {
      total_pcu: 21.5,
      queue_length_m: 129.0,
      avg_speed_kmh: 34.2,
      vehicle_counts: { two_wheeler: 14, auto_rickshaw: 4, car: 9, bus: 2, truck: 0 },
      emergency: false,
    },
    APP_SOUTH: {
      total_pcu: 18.2,
      queue_length_m: 109.2,
      avg_speed_kmh: 29.5,
      vehicle_counts: { two_wheeler: 11, auto_rickshaw: 3, car: 7, bus: 1, truck: 1 },
      emergency: false,
    },
    APP_EAST: {
      total_pcu: 26.8,
      queue_length_m: 160.8,
      avg_speed_kmh: 16.4,
      vehicle_counts: { two_wheeler: 18, auto_rickshaw: 12, car: 5, bus: 0, truck: 1 },
      emergency: false,
    },
    APP_WEST: {
      total_pcu: 8.5,
      queue_length_m: 51.0,
      avg_speed_kmh: 28.0,
      vehicle_counts: { two_wheeler: 9, auto_rickshaw: 2, car: 3, bus: 0, truck: 0 },
      emergency: false,
    },
  };

  const currentApproachTelemetry = approachesData[selectedCam] || APPROACH_DEFAULT_TELEMETRY[selectedCam] || APPROACH_DEFAULT_TELEMETRY.APP_NORTH;
  const pcuVal = Number(currentApproachTelemetry.total_pcu ?? 0);
  const queueVal = Number(currentApproachTelemetry.queue_length_m ?? (pcuVal * 6.0));
  const speedVal = Number(currentApproachTelemetry.avg_speed_kmh ?? 20.0);

  // Simulated bounding box tracks with realistic dense Indian traffic across full width
  const APPROACH_SPECIFIC_TRACKS = {
    APP_NORTH: [
      { id: 101, class: 'bus', label: '🚌 Volvo City Bus #101', bbox: [45, 20, 100, 120], speed: 28.0, pcu: 3.0 },
      { id: 102, class: 'car', label: '🚗 White Swift #102', bbox: [170, 140, 75, 70], speed: 36.5, pcu: 1.0 },
      { id: 103, class: 'car', label: '🚙 Creta SUV #103', bbox: [290, 60, 85, 80], speed: 34.0, pcu: 1.0 },
      { id: 104, class: 'two_wheeler', label: '🏍 Pulsar 220 #104', bbox: [160, 250, 36, 50], speed: 42.0, pcu: 0.5 },
      { id: 105, class: 'two_wheeler', label: '🛵 Activa 6G #105', bbox: [270, 240, 35, 48], speed: 32.5, pcu: 0.5 },
      { id: 106, class: 'auto_rickshaw', label: '🛺 CNG Auto #106', bbox: [390, 180, 62, 65], speed: 25.0, pcu: 0.8 },
      { id: 107, class: 'car', label: '🚗 Honda City #107', bbox: [210, 10, 78, 72], speed: 38.0, pcu: 1.0 },
      { id: 108, class: 'two_wheeler', label: '🏍 Royal Enfield #108', bbox: [80, 280, 38, 52], speed: 35.0, pcu: 0.5 },
      { id: 109, class: 'auto_rickshaw', label: '🛺 Passenger Auto #109', bbox: [480, 130, 60, 62], speed: 24.0, pcu: 0.8 },
      { id: 110, class: 'two_wheeler', label: '🛵 Jupiter 125 #110', bbox: [550, 240, 35, 46], speed: 30.0, pcu: 0.5 },
      { id: 111, class: 'car', label: '🚗 Baleno #111', bbox: [320, 220, 74, 68], speed: 33.0, pcu: 1.0 },
      { id: 112, class: 'truck', label: '🚚 Tata Ace Mini #112', bbox: [430, 40, 75, 85], speed: 22.0, pcu: 1.5 },
    ],
    APP_SOUTH: [
      { id: 201, class: 'truck', label: '🚛 Ashok Leyland Truck #201', bbox: [50, 10, 105, 135], speed: 22.5, pcu: 3.0 },
      { id: 202, class: 'bus', label: '🚌 MSRTC State Bus #202', bbox: [180, 70, 95, 125], speed: 26.0, pcu: 3.0 },
      { id: 203, class: 'car', label: '🚗 Red Nexon #203', bbox: [300, 160, 78, 72], speed: 35.0, pcu: 1.0 },
      { id: 204, class: 'two_wheeler', label: '🏍 Hero Splendor #204', bbox: [150, 260, 36, 50], speed: 30.0, pcu: 0.5 },
      { id: 205, class: 'auto_rickshaw', label: '🛺 Nagpur Auto #205', bbox: [420, 190, 62, 66], speed: 23.5, pcu: 0.8 },
      { id: 206, class: 'car', label: '🚗 Ertiga Cab #206', bbox: [270, 30, 82, 75], speed: 32.0, pcu: 1.0 },
      { id: 207, class: 'two_wheeler', label: '🏍 TVS Apache #207', bbox: [90, 240, 36, 50], speed: 38.0, pcu: 0.5 },
      { id: 208, class: 'two_wheeler', label: '🛵 Access 125 #208', bbox: [370, 250, 35, 48], speed: 29.0, pcu: 0.5 },
      { id: 209, class: 'car', label: '🚗 Hyundai i20 #209', bbox: [470, 80, 76, 70], speed: 34.0, pcu: 1.0 },
      { id: 210, class: 'two_wheeler', label: '🏍 Shine 125 #210', bbox: [540, 230, 35, 46], speed: 28.0, pcu: 0.5 },
      { id: 211, class: 'auto_rickshaw', label: '🛺 Shared Auto #211', bbox: [120, 180, 60, 64], speed: 21.0, pcu: 0.8 },
    ],
    APP_EAST: [
      { id: 301, class: 'auto_rickshaw', label: '🛺 Green CNG Auto #301', bbox: [60, 120, 60, 65], speed: 16.0, pcu: 0.8 },
      { id: 302, class: 'auto_rickshaw', label: '🛺 Yellow City Auto #302', bbox: [170, 170, 60, 65], speed: 14.5, pcu: 0.8 },
      { id: 303, class: 'auto_rickshaw', label: '🛺 Station Shared Auto #303', bbox: [280, 90, 62, 68], speed: 17.0, pcu: 0.8 },
      { id: 304, class: 'car', label: '🚕 Airport Taxi #304', bbox: [380, 40, 75, 70], speed: 19.0, pcu: 1.0 },
      { id: 305, class: 'two_wheeler', label: '🛵 Swiggy Delivery 2W #305', bbox: [130, 240, 36, 48], speed: 22.0, pcu: 0.5 },
      { id: 306, class: 'truck', label: '🚚 Market Mini-Truck #306', bbox: [490, 20, 85, 95], speed: 13.5, pcu: 1.5 },
      { id: 307, class: 'auto_rickshaw', label: '🛺 Cargo Auto #307', bbox: [230, 240, 60, 65], speed: 15.0, pcu: 0.8 },
      { id: 308, class: 'two_wheeler', label: '🏍 Zomato Courier #308', bbox: [340, 220, 36, 48], speed: 23.0, pcu: 0.5 },
      { id: 309, class: 'car', label: '🚗 White WagonR #309', bbox: [200, 10, 72, 68], speed: 18.0, pcu: 1.0 },
      { id: 310, class: 'two_wheeler', label: '🛵 Electric Scooter #310', bbox: [440, 240, 34, 46], speed: 20.0, pcu: 0.5 },
      { id: 311, class: 'auto_rickshaw', label: '🛺 Metro Feeder Auto #311', bbox: [530, 160, 60, 64], speed: 14.0, pcu: 0.8 },
    ],
    APP_WEST: [
      { id: 401, class: 'two_wheeler', label: '🏍 Classic 350 #401', bbox: [70, 190, 40, 55], speed: 28.0, pcu: 0.5 },
      { id: 402, class: 'two_wheeler', label: '🛵 Ola S1 Pro #402', bbox: [180, 220, 35, 48], speed: 30.0, pcu: 0.5 },
      { id: 403, class: 'two_wheeler', label: '🏍 Yamaha FZ #403', bbox: [290, 180, 38, 52], speed: 32.0, pcu: 0.5 },
      { id: 404, class: 'car', label: '🚗 Nexon EV #404', bbox: [390, 80, 80, 75], speed: 33.0, pcu: 1.0 },
      { id: 405, class: 'auto_rickshaw', label: '🛺 Smart Auto #405', bbox: [490, 130, 60, 65], speed: 22.0, pcu: 0.8 },
      { id: 406, class: 'car', label: '🚗 Honda Amaze #406', bbox: [140, 20, 76, 70], speed: 31.0, pcu: 1.0 },
      { id: 407, class: 'two_wheeler', label: '🛵 TVS Ntorq #407', bbox: [230, 260, 35, 48], speed: 29.0, pcu: 0.5 },
      { id: 408, class: 'two_wheeler', label: '🏍 KTM Duke 200 #408', bbox: [350, 240, 36, 50], speed: 36.0, pcu: 0.5 },
      { id: 409, class: 'car', label: '🚗 Maruti Brezza #409', bbox: [460, 30, 80, 74], speed: 30.0, pcu: 1.0 },
      { id: 410, class: 'auto_rickshaw', label: '🛺 Clean Air Auto #410', bbox: [530, 220, 58, 62], speed: 21.0, pcu: 0.8 },
    ],
  };

  const simulatedTracks = APPROACH_SPECIFIC_TRACKS[selectedCam] || APPROACH_SPECIFIC_TRACKS.APP_NORTH;

  // Real-time dynamic oscillating traffic metrics as vehicles pass
  const dynamicShift = Math.sin(playbackTime / 15) * 3.5;
  const displayQueue = Math.max(12, Math.round(queueVal + dynamicShift * 2.5));
  const displayVolume = Math.max(2, Math.round(pcuVal + dynamicShift * 0.8));
  const displaySpeed = Math.max(14, Math.round(speedVal + Math.cos(playbackTime / 12) * 2.0));

  return (
    <div className="panel-container">
      {/* ─── Top Signal Phase & Real-Time Status HUD ─── */}
      <div className="hud-banner">
        <div className="hud-signal-group">
          <div className="traffic-signal-box">
            <div className={`signal-bulb red ${telemetry?.signal?.signal_state === 'ALL_RED' ? 'active' : ''}`} />
            <div className={`signal-bulb amber ${telemetry?.signal?.signal_state === 'AMBER' ? 'active' : ''}`} />
            <div className={`signal-bulb green ${telemetry?.signal?.signal_state !== 'ALL_RED' && telemetry?.signal?.signal_state !== 'AMBER' ? 'active' : ''}`} />
          </div>
          <div>
            <div className="hud-eyebrow">CURRENT GREEN LIGHT DIRECTION</div>
            <div className="hud-title">
              Phase {currentPhase.phase_id}: {currentPhase.name}
            </div>
          </div>
        </div>

        <div className="hud-stats-group">
          <div className="hud-stat-item">
            <span className="stat-label">Green Light Timer</span>
            <span className="stat-value highlight">
              {signalTiming?.recommended?.elapsed_green_sec || telemetry?.signal?.elapsed_green_sec || '18.0'}s
            </span>
          </div>
          <div className="hud-stat-item">
            <span className="stat-label">Signal Mode</span>
            <span className="stat-badge max-pressure">
              {signalTiming?.override_active ? 'POLICE MANUAL LOCK' : 'AUTO-AI (Adjusts to Rush)'}
            </span>
          </div>
          <div className="hud-stat-item">
            <span className="stat-label">Signal Box Safety</span>
            <span className="stat-badge safe" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              🟢 Safe & Protected
            </span>
          </div>
          <div className="hud-stat-item">
            <span className="stat-label">Device Health</span>
            <span className="stat-value text-blue" style={{ fontSize: '13px', fontWeight: 600 }}>
              Normal (48.5°C • 8W)
            </span>
          </div>
        </div>
      </div>

      {/* ─── Main 2-Column Grid: Live AI Camera (Left) + Queue Monitor (Right) ─── */}
      <div className="grid-2col">
        {/* Left Column: Live CCTV Camera / 4-Way Junction Intersection View */}
        <div className="card live-cam-card glass-panel" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', backgroundColor: '#090d16' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div className="card-title-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={18} className="text-blue" />
              <span className="card-title" style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                Live AI Perception & Signals ({junction?.name || 'Nagpur Junction'})
              </span>
            </div>

            {/* View Mode Switcher: 4-Way Junction vs Single Cam */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', background: '#0f172a', padding: '2px', borderRadius: '7px', border: '1px solid #1e293b' }}>
                <button
                  onClick={() => setViewMode('junction_4way')}
                  style={{
                    background: viewMode === 'junction_4way' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                    color: viewMode === 'junction_4way' ? '#38bdf8' : '#94a3b8',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🚦 4-Way Junction (All Signals)
                </button>
                <button
                  onClick={() => setViewMode('single_cam')}
                  style={{
                    background: viewMode === 'single_cam' ? 'rgba(14, 165, 233, 0.25)' : 'transparent',
                    color: viewMode === 'single_cam' ? '#38bdf8' : '#94a3b8',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  📹 Single Approach Zoom
                </button>
              </div>

              {/* Speed Multiplier Toolbar */}
              <div style={{ display: 'flex', background: '#0f172a', padding: '2px', borderRadius: '7px', border: '1px solid #1e293b', gap: '2px' }}>
                {[1, 2, 4, 8].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    style={{
                      background: speedMultiplier === s ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                      color: speedMultiplier === s ? '#34d399' : '#64748b',
                      border: 'none',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {s}x{s >= 4 ? ' ⚡' : ''}
                  </button>
                ))}
              </div>

              <span className="badge-pill pulse-badge" style={{ fontSize: '10.5px', padding: '3px 8px' }}>
                <span className="pulse-dot" /> LIVE 60 FPS
              </span>
            </div>
          </div>

          {/* If Single Cam mode: Show Camera Channel Tabs */}
          {viewMode === 'single_cam' && (
            <div className="camera-tabs" style={{ marginBottom: '10px' }}>
              {approaches.map((app) => (
                <button
                  key={app.id}
                  className={`cam-tab-btn ${selectedCam === app.id ? 'active' : ''}`}
                  onClick={() => setSelectedCam(app.id)}
                >
                  {app.direction || 'Approach'}: {(app.name || app.id).split('(')[0]}
                  {approachesData[app.id]?.emergency && (
                    <ShieldAlert size={13} className="text-red" style={{ marginLeft: 4 }} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ─── VIEW 1: FULL 4-WAY JUNCTION OVERVIEW (ALL SIGNALS & APPROACHES) ─── */}
          {viewMode === 'junction_4way' ? (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '560px',
                minHeight: '540px',
                backgroundColor: '#070b14',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              {/* 4-Way Road Carriageway Canvas */}
              <svg viewBox="0 0 600 540" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                {/* Background Asphalt */}
                <rect x="0" y="0" width="600" height="540" fill="#0b1120" />

                {/* Vertical Road (North <-> South) */}
                <rect x="230" y="0" width="140" height="540" fill="#131b2e" />
                <line x1="300" y1="0" x2="300" y2="200" stroke="#f8fafc" strokeWidth="2" strokeDasharray="6,6" opacity="0.4" />
                <line x1="300" y1="340" x2="300" y2="540" stroke="#f8fafc" strokeWidth="2" strokeDasharray="6,6" opacity="0.4" />

                {/* Horizontal Road (West <-> East) */}
                <rect x="0" y="200" width="600" height="140" fill="#131b2e" />
                <line x1="0" y1="270" x2="230" y2="270" stroke="#f8fafc" strokeWidth="2" strokeDasharray="6,6" opacity="0.4" />
                <line x1="370" y1="270" x2="600" y2="270" stroke="#f8fafc" strokeWidth="2" strokeDasharray="6,6" opacity="0.4" />

                {/* Center Yellow Hatched Box Junction (Do Not Block) */}
                <rect x="230" y="200" width="140" height="140" fill="#17223b" stroke="#eab308" strokeWidth="2" />
                <line x1="230" y1="200" x2="370" y2="340" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
                <line x1="370" y1="200" x2="230" y2="340" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
                <text x="300" y="274" fill="#fbbf24" fontSize="10.5" fontWeight="bold" textAnchor="middle" opacity="0.9">
                  MAX-PRESSURE BOX
                </text>

                {/* Stop Lines (White Solid) */}
                {/* North Stopline */}
                <line x1="230" y1="200" x2="300" y2="200" stroke="#ffffff" strokeWidth="4" />
                {/* South Stopline */}
                <line x1="300" y1="340" x2="370" y2="340" stroke="#ffffff" strokeWidth="4" />
                {/* West Stopline */}
                <line x1="230" y1="270" x2="230" y2="340" stroke="#ffffff" strokeWidth="4" />
                {/* East Stopline */}
                <line x1="370" y1="200" x2="370" y2="270" stroke="#ffffff" strokeWidth="4" />

                {/* Direction Arrows */}
                <path d="M 265,150 L 265,170 M 260,165 L 265,170 L 270,165" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.7" />
                <path d="M 335,390 L 335,370 M 330,375 L 335,370 L 340,375" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.7" />
                <path d="M 160,305 L 180,305 M 175,300 L 180,305 L 175,310" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.7" />
                <path d="M 440,235 L 420,235 M 425,230 L 420,235 L 425,240" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.7" />
              </svg>

              {/* ─── 4 CORNER SIGNAL HUD BADGES (NON-OBSTRUCTING) ─── */}
              {/* NORTH-WEST CORNER: NORTH APPROACH SIGNAL */}
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  backgroundColor: 'rgba(3, 7, 18, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1.5px solid ${isNorthSouthGreen ? '#10b981' : '#ef4444'}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isNorthSouthGreen ? '0 0 16px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(239, 68, 68, 0.3)',
                  zIndex: 10,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: isNorthSouthGreen ? '#1e293b' : '#ef4444' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: isNorthSouthGreen ? '#10b981' : '#1e293b' }} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>NORTH (Wardha Rd)</div>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: isNorthSouthGreen ? '#34d399' : '#f87171' }}>
                    {isNorthSouthGreen ? '🟢 GREEN (Flowing)' : '🔴 RED (Queued)'} • {approachesData.APP_NORTH?.total_pcu || 21} PCU
                  </div>
                </div>
              </div>

              {/* NORTH-EAST CORNER: EAST APPROACH SIGNAL */}
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  backgroundColor: 'rgba(3, 7, 18, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1.5px solid ${isEastWestGreen ? '#10b981' : '#ef4444'}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isEastWestGreen ? '0 0 16px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(239, 68, 68, 0.3)',
                  zIndex: 10,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: isEastWestGreen ? '#1e293b' : '#ef4444' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: isEastWestGreen ? '#10b981' : '#1e293b' }} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>EAST (Station/Central Ave)</div>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: isEastWestGreen ? '#34d399' : '#f87171' }}>
                    {isEastWestGreen ? '🟢 GREEN (Flowing)' : '🔴 RED (Queued)'} • {approachesData.APP_EAST?.total_pcu || 26} PCU
                  </div>
                </div>
              </div>

              {/* SOUTH-WEST CORNER: WEST APPROACH SIGNAL */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  left: '14px',
                  backgroundColor: 'rgba(3, 7, 18, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1.5px solid ${isEastWestGreen ? '#10b981' : '#ef4444'}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isEastWestGreen ? '0 0 16px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(239, 68, 68, 0.3)',
                  zIndex: 10,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: isEastWestGreen ? '#1e293b' : '#ef4444' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: isEastWestGreen ? '#10b981' : '#1e293b' }} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>WEST (VNIT/Maharajbagh)</div>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: isEastWestGreen ? '#34d399' : '#f87171' }}>
                    {isEastWestGreen ? '🟢 GREEN (Flowing)' : '🔴 RED (Queued)'} • {approachesData.APP_WEST?.total_pcu || 8} PCU
                  </div>
                </div>
              </div>

              {/* SOUTH-EAST CORNER: SOUTH APPROACH SIGNAL */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  right: '14px',
                  backgroundColor: 'rgba(3, 7, 18, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1.5px solid ${isNorthSouthGreen ? '#10b981' : '#ef4444'}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isNorthSouthGreen ? '0 0 16px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(239, 68, 68, 0.25)',
                  zIndex: 10,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: isNorthSouthGreen ? '#1e293b' : '#ef4444' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: isNorthSouthGreen ? '#10b981' : '#1e293b' }} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>SOUTH (Airport/IT Park)</div>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: isNorthSouthGreen ? '#34d399' : '#f87171' }}>
                    {isNorthSouthGreen ? '🟢 GREEN (Flowing)' : '🔴 RED (Queued)'} • {approachesData.APP_SOUTH?.total_pcu || 18} PCU
                  </div>
                </div>
              </div>

              {/* ─── DENSE MOVING REAL-TIME VEHICLES (ALL 4 APPROACHES) ─── */}
              {/* === NORTH APPROACH (Moving Downwards) === */}
              {/* N1: Swift Car */}
              <div
                style={{
                  position: 'absolute',
                  left: '245px',
                  top: isNorthSouthGreen
                    ? `${((playbackTime * 2.2) % 600) - 30}px`
                    : `${Math.min(160, 40 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isNorthSouthGreen ? 'none' : 'top 0.4s ease-out',
                  fontSize: '17px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🚗</span>
                <span style={{ fontSize: '8px', color: '#38bdf8', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Swift #102
                </span>
              </div>

              {/* N2: Auto Rickshaw */}
              <div
                style={{
                  position: 'absolute',
                  left: '275px',
                  top: isNorthSouthGreen
                    ? `${(((playbackTime * 2.0) + 140) % 600) - 30}px`
                    : `${Math.min(125, 20 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isNorthSouthGreen ? 'none' : 'top 0.4s ease-out',
                  fontSize: '17px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🛺</span>
                <span style={{ fontSize: '8px', color: '#fbbf24', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Auto #106
                </span>
              </div>

              {/* N3: Two-Wheeler Activa */}
              <div
                style={{
                  position: 'absolute',
                  left: '255px',
                  top: isNorthSouthGreen
                    ? `${(((playbackTime * 2.6) + 280) % 600) - 30}px`
                    : `${Math.min(90, 5 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isNorthSouthGreen ? 'none' : 'top 0.4s ease-out',
                  fontSize: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🛵</span>
                <span style={{ fontSize: '8px', color: '#34d399', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Activa #105
                </span>
              </div>

              {/* N4: Volvo Bus */}
              <div
                style={{
                  position: 'absolute',
                  left: '275px',
                  top: isNorthSouthGreen
                    ? `${(((playbackTime * 1.8) + 420) % 600) - 30}px`
                    : `${Math.min(50, -20 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isNorthSouthGreen ? 'none' : 'top 0.4s ease-out',
                  fontSize: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🚌</span>
                <span style={{ fontSize: '8px', color: '#a78bfa', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Volvo #101
                </span>
              </div>

              {/* === SOUTH APPROACH (Moving Upwards) === */}
              {/* S1: Creta SUV */}
              <div
                style={{
                  position: 'absolute',
                  left: '310px',
                  bottom: isNorthSouthGreen
                    ? `${((playbackTime * 2.2) % 600) - 30}px`
                    : `${Math.min(160, 40 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isNorthSouthGreen ? 'none' : 'bottom 0.4s ease-out',
                  fontSize: '17px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🚙</span>
                <span style={{ fontSize: '8px', color: '#38bdf8', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Creta #203
                </span>
              </div>

              {/* S2: Shared Auto */}
              <div
                style={{
                  position: 'absolute',
                  left: '340px',
                  bottom: isNorthSouthGreen
                    ? `${(((playbackTime * 2.0) + 140) % 600) - 30}px`
                    : `${Math.min(125, 20 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isNorthSouthGreen ? 'none' : 'bottom 0.4s ease-out',
                  fontSize: '17px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🛺</span>
                <span style={{ fontSize: '8px', color: '#fbbf24', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Auto #205
                </span>
              </div>

              {/* S3: Pulsar Bike */}
              <div
                style={{
                  position: 'absolute',
                  left: '320px',
                  bottom: isNorthSouthGreen
                    ? `${(((playbackTime * 2.5) + 280) % 600) - 30}px`
                    : `${Math.min(90, 5 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isNorthSouthGreen ? 'none' : 'bottom 0.4s ease-out',
                  fontSize: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🏍️</span>
                <span style={{ fontSize: '8px', color: '#34d399', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Pulsar #207
                </span>
              </div>

              {/* S4: Delivery Mini-Truck */}
              <div
                style={{
                  position: 'absolute',
                  left: '340px',
                  bottom: isNorthSouthGreen
                    ? `${(((playbackTime * 1.9) + 420) % 600) - 30}px`
                    : `${Math.min(50, -20 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isNorthSouthGreen ? 'none' : 'bottom 0.4s ease-out',
                  fontSize: '17px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🚚</span>
                <span style={{ fontSize: '8px', color: '#f97316', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Tata Ace #201
                </span>
              </div>

              {/* === WEST APPROACH (Moving Left to Right) === */}
              {/* W1: Royal Enfield Bike */}
              <div
                style={{
                  position: 'absolute',
                  top: '280px',
                  left: isEastWestGreen
                    ? `${((playbackTime * 2.4) % 650) - 30}px`
                    : `${Math.min(185, 80 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isEastWestGreen ? 'none' : 'left 0.4s ease-out',
                  fontSize: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🏍️</span>
                <span style={{ fontSize: '8px', color: '#34d399', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Enfield #401
                </span>
              </div>

              {/* W2: Ola Electric Scooter */}
              <div
                style={{
                  position: 'absolute',
                  top: '310px',
                  left: isEastWestGreen
                    ? `${(((playbackTime * 2.3) + 140) % 650) - 30}px`
                    : `${Math.min(150, 45 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isEastWestGreen ? 'none' : 'left 0.4s ease-out',
                  fontSize: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🛵</span>
                <span style={{ fontSize: '8px', color: '#38bdf8', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Ola S1 #402
                </span>
              </div>

              {/* W3: Nexon EV Car */}
              <div
                style={{
                  position: 'absolute',
                  top: '285px',
                  left: isEastWestGreen
                    ? `${(((playbackTime * 2.0) + 280) % 650) - 30}px`
                    : `${Math.min(115, 10 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isEastWestGreen ? 'none' : 'left 0.4s ease-out',
                  fontSize: '17px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🚗</span>
                <span style={{ fontSize: '8px', color: '#a855f7', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Nexon #404
                </span>
              </div>

              {/* W4: Passenger Auto */}
              <div
                style={{
                  position: 'absolute',
                  top: '310px',
                  left: isEastWestGreen
                    ? `${(((playbackTime * 2.1) + 420) % 650) - 30}px`
                    : `${Math.min(80, -25 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isEastWestGreen ? 'none' : 'left 0.4s ease-out',
                  fontSize: '17px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🛺</span>
                <span style={{ fontSize: '8px', color: '#fbbf24', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Auto #405
                </span>
              </div>

              {/* === EAST APPROACH (Moving Right to Left) === */}
              {/* E1: Yellow Taxi */}
              <div
                style={{
                  position: 'absolute',
                  top: '210px',
                  right: isEastWestGreen
                    ? `${((playbackTime * 2.2) % 650) - 30}px`
                    : `${Math.min(185, 80 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isEastWestGreen ? 'none' : 'right 0.4s ease-out',
                  fontSize: '17px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🚕</span>
                <span style={{ fontSize: '8px', color: '#f59e0b', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Taxi #304
                </span>
              </div>

              {/* E2: CNG Auto */}
              <div
                style={{
                  position: 'absolute',
                  top: '235px',
                  right: isEastWestGreen
                    ? `${(((playbackTime * 2.0) + 140) % 650) - 30}px`
                    : `${Math.min(150, 45 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isEastWestGreen ? 'none' : 'right 0.4s ease-out',
                  fontSize: '17px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🛺</span>
                <span style={{ fontSize: '8px', color: '#fbbf24', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Auto #301
                </span>
              </div>

              {/* E3: Swiggy 2W Delivery */}
              <div
                style={{
                  position: 'absolute',
                  top: '210px',
                  right: isEastWestGreen
                    ? `${(((playbackTime * 2.5) + 280) % 650) - 30}px`
                    : `${Math.min(115, 10 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isEastWestGreen ? 'none' : 'right 0.4s ease-out',
                  fontSize: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🛵</span>
                <span style={{ fontSize: '8px', color: '#f97316', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  Delivery #305
                </span>
              </div>

              {/* E4: White WagonR */}
              <div
                style={{
                  position: 'absolute',
                  top: '235px',
                  right: isEastWestGreen
                    ? `${(((playbackTime * 2.1) + 420) % 650) - 30}px`
                    : `${Math.min(80, -25 + ((playbackTime * 0.4) % 15))}px`,
                  transition: isEastWestGreen ? 'none' : 'right 0.4s ease-out',
                  fontSize: '17px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <span>🚗</span>
                <span style={{ fontSize: '8px', color: '#38bdf8', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
                  WagonR #309
                </span>
              </div>
            </div>
          ) : (
            /* ─── VIEW 2: SINGLE CCTV APPROACH ZOOM VIEW ─── */
            <div className="video-viewport">
              {/* Background Grid & Road Lanes */}
              <div className="road-carriageway">
                <div className="lane-divider divider-1" />
                <div className="lane-divider divider-2" />
                <div className="lane-divider divider-3" />
                <div className="stopline-marker">
                  <span className="stopline-text">TRAFFIC STOP LINE</span>
                </div>
              </div>

              {/* Live Bounding Box Detections Overlay */}
              {simulatedTracks.map((trk) => {
                const yOffset = ((trk.bbox[1] + playbackTime * (trk.speed / 14.0) * 2.0) % 540);
                return (
                  <div
                    key={trk.id}
                    className={`detection-box box-${trk.class}`}
                    style={{
                      left: `${trk.bbox[0]}px`,
                      top: `${yOffset}px`,
                      width: `${trk.bbox[2]}px`,
                      height: `${trk.bbox[3]}px`,
                      transition: 'top 0.1s linear',
                    }}
                  >
                    <div className="detection-tag">
                      {trk.label} | {trk.speed} km/h
                    </div>
                  </div>
                );
              })}

              {/* Approach Queue Length & PCU Metric Overlay */}
              <div className="feed-hud-overlay">
                <div className="overlay-metric">
                  <span className="metric-label">Viewing Direction:</span>
                  <span className="metric-val" style={{ color: '#38bdf8' }}>{activeCam.name || activeCam.id}</span>
                </div>
                <div className="overlay-metric">
                  <span className="metric-label">Traffic Line:</span>
                  <span className="metric-val highlight">
                    {displayQueue} meters long
                  </span>
                </div>
                <div className="overlay-metric">
                  <span className="metric-label">Traffic Volume:</span>
                  <span className="metric-val">{displayVolume} vehicles</span>
                </div>
                <div className="overlay-metric">
                  <span className="metric-label">Average Speed:</span>
                  <span className="metric-val">{displaySpeed} km/h</span>
                </div>
              </div>

              {/* Emergency Vehicle Alert Banner on Feed */}
              {currentApproachTelemetry.emergency && (
                <div className="feed-emergency-banner">
                  <ShieldAlert size={18} /> 🚨 EMERGENCY AMBULANCE DETECTED — TURNING GREEN
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Per-Approach PCU & Queue Length Breakdown */}
        <div className="card approaches-card">
          <div className="card-header">
            <div className="card-title-group">
              <Activity size={18} className="text-green" />
              <span className="card-title">Real-Time Traffic Count (All 4 Roads)</span>
            </div>
            <span className="sub-caption">Auto-Adjusts Signals</span>
          </div>

          <div className="approaches-list">
            {approaches.map((app) => {
              const data = approachesData[app.id] || {
                total_pcu: 0,
                queue_length_m: 0,
                avg_speed_kmh: 0,
                vehicle_counts: {},
                emergency: false,
              };
              const isPhaseActive = currentPhase?.active_approaches?.includes(app.id);
              const queueLength = data.queue_length_m || data.total_pcu * 6.0;
              const pressure = signalTiming?.recommended?.pressures?.[app.id] || data.total_pcu;

              return (
                <div
                  key={app.id}
                  className={`approach-metric-card ${isPhaseActive ? 'phase-green' : 'phase-red'} ${selectedCam === app.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCam(app.id)}
                >
                  <div className="approach-header">
                    <div className="approach-name-group">
                      <span className={`phase-dot ${isPhaseActive ? 'green' : 'red'}`} />
                      <div>
                        <div className="approach-title">{app.name}</div>
                        <div className="approach-dir-tag">
                          {app.direction} • {app.lanes} Road Lanes
                        </div>
                      </div>
                    </div>
                    <div className="phase-indicator-pill">
                      {isPhaseActive ? '🟢 GREEN (Moving)' : '🔴 RED (Waiting)'}
                    </div>
                  </div>

                  <div className="approach-metrics-grid">
                    <div className="metric-box">
                      <span className="m-label">Vehicles Waiting</span>
                      <span className="m-val">{Number(data.total_pcu ?? 0).toFixed(0)}</span>
                    </div>
                    <div className="metric-box">
                      <span className="m-label">Line Length</span>
                      <span className="m-val highlight">{Number(queueLength ?? 0).toFixed(0)}m</span>
                    </div>
                    <div className="metric-box">
                      <span className="m-label">Flow Speed</span>
                      <span className="m-val">{Number(data.avg_speed_kmh ?? 20).toFixed(0)} km/h</span>
                    </div>
                    <div className="metric-box">
                      <span className="m-label">Rush Priority</span>
                      <span className="m-val text-blue">{Number(pressure ?? 0).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Vehicle Class Composition Chips */}
                  <div className="vehicle-class-chips">
                    <span className="v-chip">🏍 {data.vehicle_counts?.two_wheeler || 0} Bikes</span>
                    <span className="v-chip">🛺 {data.vehicle_counts?.auto_rickshaw || 0} Autos</span>
                    <span className="v-chip">🚗 {data.vehicle_counts?.car || 0} Cars</span>
                    <span className="v-chip">🚌 {data.vehicle_counts?.bus || 0} Buses</span>
                    <span className="v-chip">🚛 {data.vehicle_counts?.truck || 0} Trucks</span>
                  </div>

                  {/* Progress Bar for Queue Capacity */}
                  <div className="queue-bar-track">
                    <div
                      className={`queue-bar-fill ${queueLength > 80 ? 'danger' : queueLength > 40 ? 'warning' : 'safe'}`}
                      style={{ width: `${Math.min(100, (queueLength / 120) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
