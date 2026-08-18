import React from 'react';
import {
  Activity,
  Sliders,
  TrendingUp,
  Radio,
  MapPin,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  junctions,
  selectedJunctionId,
  onSelectJunction,
  isConnected,
}) {
  // Group junctions by corridor
  const wardhaJunctions = junctions.filter(
    (j) =>
      j.junction_id.startsWith('NGP_J01') ||
      j.junction_id.startsWith('NGP_J02') ||
      j.junction_id.startsWith('NGP_J03') ||
      j.junction_id.startsWith('NGP_J04') ||
      j.junction_id.startsWith('NGP_J05') ||
      j.junction_id.startsWith('NGP_J10')
  );

  const vnitJunctions = junctions.filter(
    (j) =>
      j.junction_id.startsWith('NGP_J06') ||
      j.junction_id.startsWith('NGP_J07') ||
      j.junction_id.startsWith('NGP_J08') ||
      j.junction_id.startsWith('NGP_J09')
  );

  return (
    <header className="navbar glass-navbar">
      {/* Brand & City Identification */}
      <div className="nav-left">
        <div className="brand-badge">
          <span className="brand-name">GATI</span>
          <span className="brand-version">v2.0</span>
        </div>
        <div className="brand-info">
          <div className="brand-headline">
            Traffic Intelligence Platform
          </div>
          <div className="brand-subtext">
            <MapPin size={11} className="text-blue" /> Nagpur Smart City ICCC • 10 Active Intersections
          </div>
        </div>
      </div>

      {/* 3-Panel View Switcher Tabs */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          <Activity size={15} />
          <span>1. Live Perception & Signal</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'command' ? 'active' : ''}`}
          onClick={() => setActiveTab('command')}
        >
          <Sliders size={15} />
          <span>2. Command & Governance</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'predictive' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictive')}
        >
          <TrendingUp size={15} />
          <span>3. Predictive Risk & AI</span>
        </button>
      </nav>

      {/* Junction Selector Dropdown & Live Connection Status */}
      <div className="nav-right">
        {/* Dynamic Grouped Junction Selector */}
        <div className="junction-select-wrapper">
          <select
            className="nav-junction-select"
            value={selectedJunctionId}
            onChange={(e) => onSelectJunction(e.target.value)}
          >
            <optgroup label="🏢 VNIT & Gayatri Nagar IT Park Corridor">
              {vnitJunctions.map((j) => (
                <option key={j.junction_id} value={j.junction_id}>
                  {j.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="🛣️ Wardha Road Arterial Corridor">
              {wardhaJunctions.map((j) => (
                <option key={j.junction_id} value={j.junction_id}>
                  {j.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Live Network Health Status */}
        <div className="status-pill">
          <span className={`pulse-indicator ${isConnected ? 'online' : 'reconnecting'}`} />
          <span className="status-text">
            {isConnected ? 'LIVE EDGE' : 'CONNECTING...'}
          </span>
        </div>
      </div>
    </header>
  );
}
