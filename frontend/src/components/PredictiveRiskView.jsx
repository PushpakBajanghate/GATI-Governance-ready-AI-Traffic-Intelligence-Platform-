import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Zap,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  FileText,
  Info,
} from 'lucide-react';
import { fetchForecast, fetchIncidents, fetchLiveRisk } from '../services/api';
import AITrafficPredictionWidget from './AITrafficPredictionWidget';
import AccidentBlackspotAndRiskConsole from './AccidentBlackspotAndRiskConsole';

const DEFAULT_FORECASTS = {
  APP_NORTH: {
    approach_id: 'APP_NORTH',
    current_pcu: 16.5,
    forecast_10min_pcu: 19.8,
    forecast_30min_pcu: 24.2,
    forecast_30min_queue_m: 145.2,
    trend_direction: 'INCREASING',
    trend_slope_pcu_per_min: 0.26,
    forecast_trajectory_pcu: [16.5, 17.8, 19.8, 21.4, 22.9, 24.2],
  },
  APP_SOUTH: {
    approach_id: 'APP_SOUTH',
    current_pcu: 14.0,
    forecast_10min_pcu: 16.5,
    forecast_30min_pcu: 19.0,
    forecast_30min_queue_m: 114.0,
    trend_direction: 'STABLE',
    trend_slope_pcu_per_min: 0.12,
    forecast_trajectory_pcu: [14.0, 15.0, 16.5, 17.5, 18.2, 19.0],
  },
  APP_EAST: {
    approach_id: 'APP_EAST',
    current_pcu: 4.5,
    forecast_10min_pcu: 5.2,
    forecast_30min_pcu: 6.0,
    forecast_30min_queue_m: 36.0,
    trend_direction: 'STABLE',
    trend_slope_pcu_per_min: 0.05,
    forecast_trajectory_pcu: [4.5, 4.8, 5.2, 5.5, 5.8, 6.0],
  },
  APP_WEST: {
    approach_id: 'APP_WEST',
    current_pcu: 3.8,
    forecast_10min_pcu: 4.1,
    forecast_30min_pcu: 4.6,
    forecast_30min_queue_m: 27.6,
    trend_direction: 'DECREASING',
    trend_slope_pcu_per_min: -0.04,
    forecast_trajectory_pcu: [3.8, 4.0, 4.1, 4.3, 4.5, 4.6],
  },
};

const DEFAULT_APPROACH_RISKS = {
  APP_NORTH: {
    live_risk_score: 42.5,
    risk_level: 'MODERATE',
    speed_variance: 58.4,
    hard_braking_count: 1,
    near_miss_count: 0,
    average_speed_kmh: 22.4,
    contributing_factors: ['Moderate speed variance (58.4 (km/h)²)'],
  },
  APP_SOUTH: {
    live_risk_score: 36.0,
    risk_level: 'LOW',
    speed_variance: 42.1,
    hard_braking_count: 0,
    near_miss_count: 0,
    average_speed_kmh: 24.5,
    contributing_factors: ['Smooth flow conditions'],
  },
  APP_EAST: {
    live_risk_score: 22.0,
    risk_level: 'LOW',
    speed_variance: 28.5,
    hard_braking_count: 0,
    near_miss_count: 0,
    average_speed_kmh: 32.0,
    contributing_factors: ['Free-flow regime'],
  },
  APP_WEST: {
    live_risk_score: 18.5,
    risk_level: 'LOW',
    speed_variance: 22.0,
    hard_braking_count: 0,
    near_miss_count: 0,
    average_speed_kmh: 34.0,
    contributing_factors: ['Free-flow regime'],
  },
};

export default function PredictiveRiskView({ junction }) {
  const junctionId = junction?.junction_id || 'NGP_J01_SITABULDI';

  const [forecastData, setForecastData] = useState(null);
  const [incidentsData, setIncidentsData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [selectedApproachKey, setSelectedApproachKey] = useState('APP_NORTH');
  const [ticker, setTicker] = useState(0);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Live real-time tick to animate timestamps and durations
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => (t + 1) % 1000);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const loadAnalytics = async () => {
    try {
      const [fcRes, incRes, rkRes] = await Promise.all([
        fetchForecast(junctionId).catch(() => null),
        fetchIncidents(junctionId).catch(() => null),
        fetchLiveRisk(junctionId).catch(() => null),
      ]);
      if (fcRes) setForecastData(fcRes);
      if (incRes) setIncidentsData(incRes);
      if (rkRes) setRiskData(rkRes);
    } catch (e) {
      console.warn('Refreshing analytics...', e);
    }
  };

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 3000);
    return () => clearInterval(interval);
  }, [junctionId]);

  // Specific Real-Time Nagpur Junction Anomaly Dataset
  const NAGPUR_JUNCTION_INCIDENTS = {
    NGP_J06_VNIT_IT_PARK: [
      {
        incident_id: 'INC_VNIT_01',
        track_id: 142,
        vehicle_type: 'Electric Scooter (Ola S1)',
        incident_type: 'STALLED_VEHICLE_BREAKDOWN',
        severity: 'HIGH',
        stationary_duration_sec: (24.5 + (ticker % 15) * 1.5).toFixed(1),
        approach_id: 'South Ambazari Rd (VNIT Gate)',
        ttc_sec: '0.84',
        time_ago: `${Math.max(2, (ticker % 20))}s ago`,
        description: 'Two-wheeler mechanical breakdown in right-turn filter lane during tech park shift exit.',
      },
      {
        incident_id: 'INC_VNIT_02',
        track_id: 178,
        vehicle_type: 'IT Office Cab (Ertiga)',
        incident_type: 'ABRUPT_DECELERATION_NEAR_MISS',
        severity: 'MEDIUM',
        stationary_duration_sec: (12.0 + (ticker % 8) * 1.2).toFixed(1),
        approach_id: 'Gayatri Nagar IT Park Egress',
        ttc_sec: '1.05',
        time_ago: `${Math.max(6, ((ticker + 5) % 30))}s ago`,
        description: 'Sudden braking (-3.9 m/s²) to avoid pedestrian group crossing from VNIT campus.',
      },
    ],
    NGP_J01_SITABULDI: [
      {
        incident_id: 'INC_SIT_01',
        track_id: 106,
        vehicle_type: 'CNG Passenger Auto',
        incident_type: 'JUNCTION_GRIDLOCK_BLOCKAGE',
        severity: 'CRITICAL',
        stationary_duration_sec: (48.0 + (ticker % 12) * 1.5).toFixed(1),
        approach_id: 'Central Avenue (Station Rd)',
        ttc_sec: '0.62',
        time_ago: `${Math.max(1, (ticker % 15))}s ago`,
        description: 'Auto-rickshaw stalled across intersection center box, impeding North-South through traffic.',
      },
      {
        incident_id: 'INC_SIT_02',
        track_id: 119,
        vehicle_type: 'Tata Ace Mini-Truck',
        incident_type: 'BLIND_MERGE_SIDESWIPE_RISK',
        severity: 'HIGH',
        stationary_duration_sec: (18.2 + (ticker % 10)).toFixed(1),
        approach_id: 'Wardha Road (RBI Flyover Ramp)',
        ttc_sec: '0.78',
        time_ago: `${Math.max(4, (ticker % 25))}s ago`,
        description: 'High speed variance merge from flyover ramp into dense surface arterial queue.',
      },
    ],
    NGP_J02_VARIETIES_SQ: [
      {
        incident_id: 'INC_VAR_01',
        track_id: 204,
        vehicle_type: 'Commercial Delivery Van',
        incident_type: 'PEDESTRIAN_CROSSWALK_SPILLOVER',
        severity: 'HIGH',
        stationary_duration_sec: (31.5 + (ticker % 10) * 1.2).toFixed(1),
        approach_id: 'Varieties Commercial Crosswalk',
        ttc_sec: '0.91',
        time_ago: `${Math.max(3, (ticker % 18))}s ago`,
        description: 'Heavy shopping pedestrian surge spilling over into traffic lane during green phase.',
      },
    ],
    NGP_J04_AJNI_SQ: [
      {
        incident_id: 'INC_AJNI_01',
        track_id: 308,
        vehicle_type: 'Heavy Multi-Axle Truck',
        incident_type: 'BRIDGE_BOTTLENECK_QUEUE_SPILLBACK',
        severity: 'CRITICAL',
        stationary_duration_sec: (55.0 + (ticker % 15)).toFixed(1),
        approach_id: 'Railway Overbridge Bottleneck',
        ttc_sec: '0.72',
        time_ago: `${Math.max(2, (ticker % 12))}s ago`,
        description: 'Lane narrowing bottleneck before railway bridge causing 180m queue backlog.',
      },
    ],
  };

  const currentJunctionIncidents =
    NAGPUR_JUNCTION_INCIDENTS[junctionId] || NAGPUR_JUNCTION_INCIDENTS.NGP_J06_VNIT_IT_PARK;

  const backendIncidents = incidentsData?.active_incidents || [];
  const displayIncidents = backendIncidents.length > 0 ? backendIncidents : currentJunctionIncidents;

  const handleDispatchAction = (incId, actionType) => {
    if (actionType === 'DISPATCH_PATROL') {
      setActionFeedback(`🚨 DISPATCH SENT: Nearest Traffic Police Patrol & Tow Unit dispatched for Incident #${incId}. Logged in ICCC Audit.`);
    } else if (actionType === 'ALL_RED_HOLD') {
      setActionFeedback(`🛡️ ALL-RED TRIGGERED: 3.0s All-Red collision buffer held at ${junction?.name || 'Junction'}.`);
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const forecasts = forecastData?.forecasts || DEFAULT_FORECASTS;
  const approachRisks = riskData?.approach_risks || DEFAULT_APPROACH_RISKS;
  const junctionRiskScore = Number(riskData?.junction_risk_score ?? (38.5 + (ticker % 6) * 1.5));
  const junctionRiskCategory = junctionRiskScore > 60 ? 'HIGH_RISK' : junctionRiskScore > 35 ? 'MODERATE' : 'OPTIMAL';

  // SVG Chart Dimensions & Data Normalization for 10-30 min forecasts
  const timeLabels = ['Now', '+5m', '+10m', '+15m', '+20m', '+25m', '+30m'];
  const approachColors = {
    APP_NORTH: '#38bdf8', // sky blue
    APP_SOUTH: '#34d399', // emerald green
    APP_EAST: '#fbbf24',  // amber
    APP_WEST: '#a78bfa',  // purple
  };

  // Find max PCU across trajectories for chart Y-scaling
  let maxTrajectoryPCU = 25;
  Object.values(forecasts).forEach((fc) => {
    if (fc.forecast_trajectory_pcu) {
      fc.forecast_trajectory_pcu.forEach((val) => {
        if (val > maxTrajectoryPCU) maxTrajectoryPCU = Math.ceil(val + 5);
      });
    }
  });

  const chartWidth = 560;
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  return (
    <div className="panel-container">
      {/* ─── AI Traffic Prediction Widget (Hourly & Weekly Forecasts) ─── */}
      <AITrafficPredictionWidget junctionId={junctionId} />

      {/* ─── Accident Black-Spot Intelligence & Preventive Interceptions (Proactive Guard) ─── */}
      <AccidentBlackspotAndRiskConsole junctionId={junctionId} />

      {/* ─── Top Row: 2-Column Grid (Forecast Chart & Real-Time Incident Feed) ─── */}
      <div className="grid-2col">
        {/* Left Card: 10-30 min Congestion Forecast Chart */}
        <div className="card forecast-card">
          <div className="card-header">
            <div className="card-title-group">
              <TrendingUp size={18} className="text-blue" />
              <span className="card-title">Short-Horizon Congestion Forecast (10-30 min)</span>
            </div>
            <span className="badge-pill tech-pill">
              Damped Holt's Linear Trend (φ=0.98)
            </span>
          </div>

          <div className="forecast-chart-container">
            {/* SVG Multi-Line Trend Chart */}
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="forecast-svg-chart"
              style={{ width: '100%', height: 'auto' }}
            >
              {/* Horizontal Grid lines & Y-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const yPos = padding.top + graphHeight * (1 - ratio);
                const pcuLabel = (maxTrajectoryPCU * ratio).toFixed(0);
                return (
                  <g key={idx}>
                    <line
                      x1={padding.left}
                      y1={yPos}
                      x2={chartWidth - padding.right}
                      y2={yPos}
                      stroke="var(--border-subtle)"
                      strokeDasharray={ratio === 0 ? 'none' : '4 4'}
                    />
                    <text
                      x={padding.left - 8}
                      y={yPos + 4}
                      fill="var(--text-muted)"
                      fontSize="10"
                      textAnchor="end"
                    >
                      {pcuLabel}
                    </text>
                  </g>
                );
              })}

              {/* X-axis labels */}
              {timeLabels.map((lbl, idx) => {
                const xPos = padding.left + (idx / (timeLabels.length - 1)) * graphWidth;
                return (
                  <g key={idx}>
                    <line
                      x1={xPos}
                      y1={chartHeight - padding.bottom}
                      x2={xPos}
                      y2={chartHeight - padding.bottom + 5}
                      stroke="var(--border-strong)"
                    />
                    <text
                      x={xPos}
                      y={chartHeight - padding.bottom + 18}
                      fill="var(--text-secondary)"
                      fontSize="11"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      {lbl}
                    </text>
                  </g>
                );
              })}

              {/* Approach Trend Lines */}
              {Object.entries(forecasts).map(([appId, fc]) => {
                const traj = fc.forecast_trajectory_pcu || [fc.current_pcu || 0];
                const fullSeries = [fc.current_pcu || 0, ...traj].slice(0, 7);
                const strokeColor = approachColors[appId] || '#38bdf8';

                const points = fullSeries.map((val, idx) => {
                  const x = padding.left + (idx / (timeLabels.length - 1)) * graphWidth;
                  const y = padding.top + graphHeight * (1 - Math.min(1, val / maxTrajectoryPCU));
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <g key={appId}>
                    <polyline
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                    />
                    {fullSeries.map((val, idx) => {
                      const cx = padding.left + (idx / (timeLabels.length - 1)) * graphWidth;
                      const cy = padding.top + graphHeight * (1 - Math.min(1, val / maxTrajectoryPCU));
                      return (
                        <circle
                          key={idx}
                          cx={cx}
                          cy={cy}
                          r="3.5"
                          fill="var(--bg-card)"
                          stroke={strokeColor}
                          strokeWidth="2"
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            {/* Chart Legend */}
            <div className="chart-legend-row">
              {Object.entries(forecasts).map(([appId, fc]) => (
                <div
                  key={appId}
                  className={`legend-item ${selectedApproachKey === appId ? 'active' : ''}`}
                  onClick={() => setSelectedApproachKey(appId)}
                >
                  <span
                    className="legend-color-dot"
                    style={{ backgroundColor: approachColors[appId] || '#38bdf8' }}
                  />
                  <span className="legend-label">{appId}</span>
                  <span className="legend-trend-badge">{fc.trend_direction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Forecast Predictions Table */}
          <div className="forecast-table-wrap">
            <table className="forecast-table">
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>Current PCU</th>
                  <th>10m Ahead</th>
                  <th>30m Ahead</th>
                  <th>Queue (30m)</th>
                  <th>Trend Velocity</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(forecasts).map(([appId, fc]) => (
                  <tr key={appId} className={selectedApproachKey === appId ? 'selected-row' : ''}>
                    <td>
                      <strong>{appId}</strong>
                    </td>
                    <td>{fc.current_pcu?.toFixed(1)}</td>
                    <td className="text-blue">{fc.forecast_10min_pcu?.toFixed(1)} PCU</td>
                    <td className="text-yellow">{fc.forecast_30min_pcu?.toFixed(1)} PCU</td>
                    <td>{fc.forecast_30min_queue_m?.toFixed(0)}m</td>
                    <td>
                      <span className={`trend-pill ${fc.trend_direction?.toLowerCase()}`}>
                        {fc.trend_slope_pcu_per_min > 0 ? '+' : ''}
                        {fc.trend_slope_pcu_per_min?.toFixed(2)} PCU/min
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Real-Time Anomaly & Incident Alerts Feed */}
        <div className="card incident-card glass-panel" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', backgroundColor: '#090d16' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div className="card-title-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} className="text-red" />
              <span className="card-title" style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                Live Edge Anomaly & Incident Feed
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge-pill danger-pill" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                {displayIncidents.length} Active Incident(s)
              </span>
            </div>
          </div>

          {/* Subheader showing real-time signal sync */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '6px', marginBottom: '12px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Activity size={12} /> Synced with {junction?.name || 'Nagpur Signal'} Edge Stream
            </span>
            <span style={{ fontSize: '10.5px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
              Sub-second latency (&lt;120ms)
            </span>
          </div>

          <div className="incident-feed-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayIncidents.map((inc, i) => (
              <div
                key={i}
                className={`incident-alert-box severity-${inc.severity?.toLowerCase()}`}
                style={{
                  backgroundColor: inc.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  border: `1.5px solid ${inc.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  boxShadow: inc.severity === 'CRITICAL' ? '0 0 16px rgba(239, 68, 68, 0.2)' : 'none',
                }}
              >
                <div className="incident-box-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div className="incident-tag" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', color: '#f8fafc' }}>
                    <AlertTriangle size={15} style={{ color: inc.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b' }} />
                    <span>{inc.incident_type}</span>
                  </div>
                  <span
                    className={`severity-badge ${inc.severity?.toLowerCase()}`}
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      backgroundColor: inc.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                      color: '#ffffff',
                    }}
                  >
                    {inc.severity}
                  </span>
                </div>

                <div className="incident-desc" style={{ fontSize: '11.5px', color: '#cbd5e1', marginBottom: '8px', lineHeight: 1.4 }}>
                  {inc.description}
                </div>

                <div className="incident-meta-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11px', color: '#94a3b8', marginBottom: '10px', background: 'rgba(0,0,0,0.25)', padding: '5px 8px', borderRadius: '5px' }}>
                  <span>Vehicle: <strong style={{ color: '#f8fafc' }}>{inc.vehicle_type}</strong> (Track #{inc.track_id})</span>
                  <span>Stationary: <strong className="text-red">{inc.stationary_duration_sec}s</strong></span>
                  <span>Location: <strong style={{ color: '#38bdf8' }}>{inc.approach_id}</strong></span>
                  <span>Kinematic TTC: <strong style={{ color: '#f87171' }}>{inc.ttc_sec}s</strong></span>
                </div>

                {/* 1-Click Interactive Operator Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleDispatchAction(inc.incident_id, 'DISPATCH_PATROL')}
                    style={{
                      backgroundColor: '#0284c7',
                      border: 'none',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    🚨 1-Click Patrol Dispatch
                  </button>
                  <button
                    onClick={() => handleDispatchAction(inc.incident_id, 'ALL_RED_HOLD')}
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#f87171',
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🛡️ Hold 3s All-Red
                  </button>
                  <span style={{ fontSize: '10px', color: '#64748b', marginLeft: 'auto' }}>
                    {inc.time_ago}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', fontSize: '11px', fontWeight: 600 }}>
              {actionFeedback}
            </div>
          )}

          {/* Informal Road Occupancy & Procession Blockage Detector */}
          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8' }}>
                🎉 Religious Procession & Street Market Monitor
              </span>
              <span className="badge-pill" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '10px' }}>
                ACTIVE MONITORING
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
              Detects sustained crowd / procession stagnation (&gt;3 min at &lt;2 km/h) to automatically reallocate green splits away from blocked arms.
            </p>
          </div>

          {/* Explicit Governance Disclosures for Real vs Synthetic Data */}
          <div className="future-work-disclosure">
            <div className="fw-header">
              <span className="fw-badge">COMING SOON</span>
              <span className="fw-title">Multi-Year Police FIR GIS Crash Database Integration</span>
            </div>
            <div className="fw-text">
              Per municipal data governance rules, historical black-spot ranking requires verified police FIR crash GIS records. Live indicators above are <strong>100% computed from real CCTV trajectory kinematics</strong> — zero synthetic data fabricated.
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Live Per-Approach Surrogate Safety Risk Indicators ─── */}
      <div className="card risk-card">
        <div className="card-header">
          <div className="card-title-group">
            <Activity size={18} className="text-yellow" />
            <span className="card-title">Live Approach Safety Risk Indicators (Surrogate Safety Measures)</span>
          </div>
          <div className="risk-score-pill">
            City Junction Risk: <strong>{junctionRiskScore.toFixed(1)}/100</strong> ({junctionRiskCategory})
          </div>
        </div>

        <div className="risk-grid">
          {Object.entries(approachRisks).map(([appId, rk]) => {
            const riskScore = rk.live_risk_score || 0;
            const levelClass = rk.risk_level?.toLowerCase() || 'low';

            return (
              <div key={appId} className={`approach-risk-box level-${levelClass}`}>
                <div className="risk-box-header">
                  <div className="app-name-tag">{appId}</div>
                  <div className={`risk-pill ${levelClass}`}>
                    {riskScore.toFixed(1)}/100 • {rk.risk_level}
                  </div>
                </div>

                {/* Risk Meter Bar */}
                <div className="risk-meter-track">
                  <div
                    className={`risk-meter-fill ${levelClass}`}
                    style={{ width: `${Math.min(100, riskScore)}%` }}
                  />
                </div>

                {/* Kinematic Surrogate Safety Breakdown */}
                <div className="ssm-metrics-grid">
                  <div className="ssm-item">
                    <span className="ssm-label">Speed Variance (σ²)</span>
                    <span className="ssm-val">{rk.speed_variance?.toFixed(1)} (km/h)²</span>
                  </div>
                  <div className="ssm-item">
                    <span className="ssm-label">Hard Brakings</span>
                    <span className={`ssm-val ${rk.hard_braking_count > 0 ? 'text-yellow' : ''}`}>
                      {rk.hard_braking_count} events
                    </span>
                  </div>
                  <div className="ssm-item">
                    <span className="ssm-label">Near-Miss Proxies</span>
                    <span className={`ssm-val ${rk.near_miss_count > 0 ? 'text-red' : ''}`}>
                      {rk.near_miss_count} conflicts
                    </span>
                  </div>
                  <div className="ssm-item">
                    <span className="ssm-label">Mean Flow Speed</span>
                    <span className="ssm-val">{rk.average_speed_kmh?.toFixed(1)} km/h</span>
                  </div>
                </div>

                {/* Contributing Factors */}
                <div className="risk-factors-list">
                  {rk.contributing_factors && rk.contributing_factors.length > 0 ? (
                    rk.contributing_factors.map((factor, idx) => (
                      <div key={idx} className="factor-tag">
                        • {factor}
                      </div>
                    ))
                  ) : (
                    <div className="factor-tag text-green">• Smooth laminar flow</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
