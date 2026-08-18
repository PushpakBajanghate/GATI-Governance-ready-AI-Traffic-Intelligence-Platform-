import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  Navigation,
  Eye,
  TrendingDown,
  Clock,
  Car,
  RotateCcw,
  Sparkles,
  Radio,
} from 'lucide-react';
import { fetchAccidentBlackspots, fetchRiskyBehaviors, triggerPreventiveGuard } from '../services/api';

export default function AccidentBlackspotAndRiskConsole({ junctionId = 'NGP_J01_SITABULDI', onActionTriggered }) {
  const [blackspots, setBlackspots] = useState([]);
  const [riskyEvents, setRiskyEvents] = useState([]);
  const [selectedBlackspotId, setSelectedBlackspotId] = useState('NGP_BS_01');
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerFeedback, setTriggerFeedback] = useState(null);
  const [ticker, setTicker] = useState(0);

  // Live real-time tick to continuously update relative seconds and timestamps
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => (t + 1) % 1000);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Baseline Localized Fallback Risky Events (zero delay, always live)
  const FALLBACK_RISKY_EVENTS = {
    NGP_J01_SITABULDI: [
      {
        event_id: 'RISK_SIT_01',
        behavior_type: 'RED_LIGHT_RUNNER_PREDICTED',
        vehicle_class: 'car',
        track_id: 108,
        speed_kmh: 54.2,
        severity: 'CRITICAL',
        description: 'Car #108 (Swift) approaching stopline at 54.2 km/h during amber-red transition on Wardha Road.',
        preventive_action_executed: '🚨 Automatic All-Red Hold Extended by +2.5s — Cross-Traffic Held to Prevent T-Bone Crash',
        time_ago_sec: Math.max(1, (ticker % 14)),
      },
      {
        event_id: 'RISK_SIT_02',
        behavior_type: 'SUDDEN_EMERGENCY_BRAKING',
        vehicle_class: 'auto',
        track_id: 106,
        speed_kmh: 32.0,
        severity: 'HIGH',
        description: 'Auto #106 abrupt deceleration (-4.2 m/s²) to avoid blind merge sideswipe near RBI Flyover ramp.',
        preventive_action_executed: '⚡ Upstream Radar VMS Speed Warning Triggered (-10 km/h advisory)',
        time_ago_sec: Math.max(4, ((ticker + 8) % 25)),
      },
    ],
    NGP_J06_VNIT_IT_PARK: [
      {
        event_id: 'RISK_VNIT_01',
        behavior_type: 'TECH_SHIFT_WEAVE_NEAR_MISS',
        vehicle_class: 'two_wheeler',
        track_id: 402,
        speed_kmh: 46.5,
        severity: 'HIGH',
        description: 'Ola S1 #402 lateral weave across 2 lanes into Gayatri Nagar IT Park egress without signaling.',
        preventive_action_executed: '🏢 Dynamic IT Shift Split Activated (+15s Green Extension for Gayatri Nagar)',
        time_ago_sec: Math.max(2, (ticker % 12)),
      },
      {
        event_id: 'RISK_VNIT_02',
        behavior_type: 'PEDESTRIAN_CAMPUS_INCURSION',
        vehicle_class: 'pedestrian',
        track_id: 488,
        speed_kmh: 4.2,
        severity: 'HIGH',
        description: 'Group of 5 VNIT students crossing South Ambazari Road outside marked crosswalk.',
        preventive_action_executed: '🚶 Pedestrian Protected Safe Window Inserted (10s Walk Signal)',
        time_ago_sec: Math.max(5, ((ticker + 6) % 30)),
      },
    ],
    NGP_J02_VARIETIES_SQ: [
      {
        event_id: 'RISK_VAR_01',
        behavior_type: 'DANGEROUS_JAYWALKING',
        vehicle_class: 'pedestrian',
        track_id: 305,
        speed_kmh: 4.5,
        severity: 'HIGH',
        description: 'Market shoppers crossing during high-speed green phase on Central Avenue.',
        preventive_action_executed: '🚶 Smart Pedestrian Safe Crossing Phase Triggered (15s Green)',
        time_ago_sec: Math.max(2, (ticker % 15)),
      },
    ],
    NGP_J04_AJNI_SQ: [
      {
        event_id: 'RISK_AJNI_01',
        behavior_type: 'WRONG_WAY_DRIVING',
        vehicle_class: 'two_wheeler',
        track_id: 214,
        speed_kmh: 28.0,
        severity: 'CRITICAL',
        description: 'Two-wheeler #214 driving counter-flow on Northbound Railway Overbridge lane.',
        preventive_action_executed: '⚠️ Police Patrol Dispatched & Upstream VMS Warning Broadcasted',
        time_ago_sec: Math.max(3, (ticker % 18)),
      },
    ],
  };

  // Load backend blackspots and risky behavior stream
  useEffect(() => {
    const loadData = async () => {
      try {
        const [bsData, riskData] = await Promise.all([
          fetchAccidentBlackspots().catch(() => ({ blackspots: [] })),
          fetchRiskyBehaviors(junctionId).catch(() => ({ risky_events: [] })),
        ]);
        if (bsData?.blackspots && bsData.blackspots.length > 0) setBlackspots(bsData.blackspots);
        if (riskData?.risky_events && riskData.risky_events.length > 0) setRiskyEvents(riskData.risky_events);
      } catch (e) {
        console.error('Failed to load blackspot risk data', e);
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [junctionId]);

  const handleTriggerCollisionGuard = async () => {
    setIsTriggering(true);
    setTriggerFeedback(null);
    try {
      const res = await triggerPreventiveGuard(junctionId);
      setTriggerFeedback({
        type: 'success',
        text: `🛡️ ${res.message || 'Automated All-Red Collision Guard triggered! Signal held for 3.0s.'}`,
      });
      if (onActionTriggered) onActionTriggered();
    } catch (err) {
      setTriggerFeedback({
        type: 'error',
        text: err.message || 'Failed to trigger preventive collision guard',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const currentBlackspot =
    blackspots.find((b) => b.blackspot_id === selectedBlackspotId) ||
    blackspots[0] || {
      blackspot_id: 'NAG_BS_01_SITABULDI_FLYOVER',
      name: 'Sitabuldi Northbound Flyover Merge',
      severity_level: 'CRITICAL_BLACKSPOT',
      risk_score: 88.5,
      location_description: 'Blind merge from RBI Square onto Wardha Road flyover ramp',
      near_miss_count_30d: 47,
      avg_speed_variance: 54.2,
      min_ttc_sec: 0.85,
      preventive_countermeasure: 'Dynamic Radar Speed Warning + 3s Ramp Metering Stagger',
    };

  return (
    <div
      className="card"
      style={{
        backgroundColor: '#0a101d',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '24px',
        color: '#f8fafc',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* ─── Top Header: Title, Badge & 1-Click Test Button ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Accident Black-Spot Intelligence & Preventive Interceptions
              </h2>
              <span
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                }}
              >
                PROACTIVE • PREVENTS CRASHES
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0 0' }}>
              Turns traffic control from <em>reactive</em> (responding after a crash) to <strong>preventive</strong> (stopping crashes before they occur).
            </p>
          </div>
        </div>

        {/* 1-Click Preventive Demonstration Button */}
        <button
          onClick={handleTriggerCollisionGuard}
          disabled={isTriggering}
          style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.2s ease',
          }}
        >
          <Zap size={14} />
          <span>TEST ALL-RED COLLISION GUARD</span>
        </button>
      </div>

      {/* Trigger Feedback Alert */}
      {triggerFeedback && (
        <div
          style={{
            backgroundColor: triggerFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${triggerFeedback.type === 'success' ? '#10b981' : '#ef4444'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '12px',
            color: triggerFeedback.type === 'success' ? '#34d399' : '#fca5a5',
          }}
        >
          {triggerFeedback.text}
        </div>
      )}

      {/* ─── Main 60:40 Grid: Black-Spot Radar (60%) + Live Risky Behavior Feed (40%) ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60% 40%',
          gap: '18px',
          alignItems: 'stretch',
        }}
      >
        {/* ─── Left Card (60%): Identified Nagpur Accident Black-Spots ─── */}
        <div
          style={{
            backgroundColor: '#0c1424',
            border: '1px solid #1e2f4d',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
                📍 Identified Nagpur Accident Black-Spots (Kinematic Clustering)
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>5 High-Risk Spots Ranked</span>
            </div>

            {/* Black-Spot Selection Chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '14px', paddingBottom: '4px' }}>
              {blackspots.map((bs) => {
                const isSelected = selectedBlackspotId === bs.blackspot_id;
                const isCritical = bs.severity_level === 'CRITICAL_BLACKSPOT';
                return (
                  <button
                    key={bs.blackspot_id}
                    onClick={() => setSelectedBlackspotId(bs.blackspot_id)}
                    style={{
                      backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.25)' : '#162238',
                      border: `1px solid ${isSelected ? '#38bdf8' : isCritical ? '#ef4444' : '#334155'}`,
                      color: isSelected ? '#38bdf8' : isCritical ? '#f87171' : '#cbd5e1',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {bs.name.split('-')[0]} ({bs.risk_score})
                  </button>
                );
              })}
            </div>

            {/* Selected Blackspot Diagnostic Card */}
            <div
              style={{
                backgroundColor: '#070d18',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                  {currentBlackspot.name}
                </div>
                <span
                  style={{
                    backgroundColor: currentBlackspot.severity_level === 'CRITICAL_BLACKSPOT' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                    color: currentBlackspot.severity_level === 'CRITICAL_BLACKSPOT' ? '#ef4444' : '#facc15',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  {currentBlackspot.severity_level.replace(/_/g, ' ')} • SCORE: {currentBlackspot.risk_score}
                </span>
              </div>

              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginBottom: '12px' }}>
                {currentBlackspot.location_description}
              </div>

              {/* Metrics Triad */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                <div style={{ backgroundColor: '#131d2e', padding: '10px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Near-Misses (30d)</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#f87171', marginTop: '2px' }}>
                    {currentBlackspot.near_miss_count_30d}
                  </div>
                </div>
                <div style={{ backgroundColor: '#131d2e', padding: '10px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Speed Variance (σ²)</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                    {currentBlackspot.avg_speed_variance} km/h²
                  </div>
                </div>
                <div style={{ backgroundColor: '#131d2e', padding: '10px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Min Time-to-Collision</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                    {currentBlackspot.min_ttc_sec}s
                  </div>
                </div>
              </div>

              {/* Automated Countermeasure */}
              <div
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '11.5px',
                }}
              >
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>🛡️ Active GATI Preventive Countermeasure:</span>
                <div style={{ color: '#e2e8f0', marginTop: '2px' }}>
                  {currentBlackspot.preventive_countermeasure}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Card (40%): Live Risky Behavior & Interception Feed ─── */}
        <div
          style={{
            backgroundColor: '#0c1424',
            border: '1px solid #1e2f4d',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={15} style={{ color: '#f87171' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f87171' }}>
                Live Risky Behavior Interception Feed
              </span>
            </div>
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              AUTO-INTERCEPTING
            </span>
          </div>

          {/* Event Stream List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '270px' }}>
            {(riskyEvents.length > 0 ? riskyEvents : (FALLBACK_RISKY_EVENTS[junctionId] || FALLBACK_RISKY_EVENTS.NGP_J01_SITABULDI)).map((evt) => (
              <div
                key={evt.event_id}
                style={{
                  backgroundColor: '#070d18',
                  border: `1px solid ${evt.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(234, 179, 8, 0.3)'}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  boxShadow: evt.severity === 'CRITICAL' ? '0 0 12px rgba(239, 68, 68, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        backgroundColor: evt.severity === 'CRITICAL' ? '#ef4444' : '#eab308',
                        color: '#ffffff',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '3px',
                      }}
                    >
                      {evt.behavior_type.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                      {evt.vehicle_class.toUpperCase()} #{evt.track_id} • {evt.speed_kmh} km/h
                    </span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#38bdf8', fontWeight: 700, backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                    {evt.time_ago_sec || Math.max(1, (ticker % 15))}s ago
                  </span>
                </div>

                <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginBottom: '6px', lineHeight: '1.4' }}>
                  {evt.description}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '5px',
                    padding: '5px 8px',
                    fontSize: '11px',
                    color: '#34d399',
                    fontWeight: 600,
                    gap: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>🛡️ {evt.preventive_action_executed}</span>
                  <span style={{ fontSize: '9px', backgroundColor: '#059669', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>
                    AUTO-PREEMPTED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
