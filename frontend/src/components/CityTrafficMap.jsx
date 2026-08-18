import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Maximize2, Minimize2, RotateCcw, Layers, Cpu, ShieldAlert, Sparkles, Activity } from 'lucide-react';

export default function CityTrafficMap({
  junctions,
  selectedJunctionId,
  onSelectJunction,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylinesRef = useRef([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCorridorFilter, setActiveCorridorFilter] = useState('ALL'); // 'ALL' | 'WARDHA' | 'VNIT'

  // Exact GPS Coordinates for Nagpur Smart City Wardha Road & VNIT IT Park Tech Corridors
  const NAGPUR_ALL_JUNCTIONS = [
    // --- Corridor 1: Wardha Road Arterial Corridor ---
    {
      id: 'NGP_J01_SITABULDI',
      name: 'Sitabuldi Interchange',
      shortName: 'Sitabuldi',
      corridor: 'WARDHA',
      corridorName: 'Wardha Road Arterial',
      lat: 21.1458,
      lng: 79.0882,
      traffic: '38 Vehicles (21.5 PCU)',
      signal: 'GREEN (32s)',
      color: '#10b981',
      description: 'Major Commercial Interchange • Central Ave & Wardha Rd',
    },
    {
      id: 'NGP_J02_VARIETIES_SQ',
      name: 'Varieties Square',
      shortName: 'Varieties Sq',
      corridor: 'WARDHA',
      corridorName: 'Wardha Road Arterial',
      lat: 21.1415,
      lng: 79.0835,
      traffic: '22 Vehicles (15.2 PCU)',
      signal: 'RED (14s)',
      color: '#ef4444',
      description: 'Commercial Shopping Arterial (+450m from Sitabuldi)',
    },
    {
      id: 'NGP_J03_RAHATE_COLONY',
      name: 'Rahate Colony Square',
      shortName: 'Rahate Colony',
      corridor: 'WARDHA',
      corridorName: 'Wardha Road Arterial',
      lat: 21.1298,
      lng: 79.0765,
      traffic: '19 Vehicles (13.8 PCU)',
      signal: 'GREEN (28s)',
      color: '#10b981',
      description: 'Hospital & Medical Hub Junction (+1050m)',
    },
    {
      id: 'NGP_J04_AJNI_SQ',
      name: 'Ajni Square',
      shortName: 'Ajni Sq',
      corridor: 'WARDHA',
      corridorName: 'Wardha Road Arterial',
      lat: 21.1185,
      lng: 79.0712,
      traffic: '34 Vehicles (24.0 PCU)',
      signal: 'RED (22s)',
      color: '#ef4444',
      description: 'Railway Station & Flyover Bottleneck (+1850m)',
    },
    {
      id: 'NGP_J05_CHHATRAPATI_SQ',
      name: 'Chhatrapati Square',
      shortName: 'Chhatrapati Sq',
      corridor: 'WARDHA',
      corridorName: 'Wardha Road Arterial',
      lat: 21.1072,
      lng: 79.0628,
      traffic: '21 Vehicles (16.4 PCU)',
      signal: 'GREEN (35s)',
      color: '#10b981',
      description: 'Outer Ring Rd & Airport Expressway (+2800m)',
    },
    {
      id: 'NGP_J10_AIRPORT_T_POINT',
      name: 'Nagpur Airport T-Point / MIHAN',
      shortName: 'Airport T-Point',
      corridor: 'WARDHA',
      corridorName: 'Wardha Road Arterial',
      lat: 21.0920,
      lng: 79.0550,
      traffic: '18 Vehicles (14.2 PCU)',
      signal: 'GREEN (40s)',
      color: '#10b981',
      description: 'International Airport & MIHAN SEZ Gateway',
    },

    // --- Corridor 2: VNIT & Gayatri Nagar IT Park Tech Corridor ---
    {
      id: 'NGP_J06_VNIT_IT_PARK',
      name: 'VNIT Gate & Gayatri Nagar IT Park',
      shortName: 'VNIT IT Park',
      corridor: 'VNIT',
      corridorName: 'VNIT Tech Corridor',
      lat: 21.1235,
      lng: 79.0515,
      traffic: '32 Vehicles (22.8 PCU)',
      signal: 'GREEN (30s)',
      color: '#10b981',
      description: 'VNIT Main Gate & Gayatri Nagar Tech Park Hub',
      highlight: true,
    },
    {
      id: 'NGP_J07_MATE_SQUARE',
      name: 'Mate Square & Subhash Nagar',
      shortName: 'Mate Square',
      corridor: 'VNIT',
      corridorName: 'VNIT Tech Corridor',
      lat: 21.1278,
      lng: 79.0582,
      traffic: '26 Vehicles (18.1 PCU)',
      signal: 'RED (18s)',
      color: '#ef4444',
      description: 'Ambazari North & VNIT North Gate Crossing',
    },
    {
      id: 'NGP_J08_LAXMI_NAGAR',
      name: 'Laxmi Nagar & Bajaj Nagar',
      shortName: 'Laxmi Nagar',
      corridor: 'VNIT',
      corridorName: 'VNIT Tech Corridor',
      lat: 21.1248,
      lng: 79.0684,
      traffic: '24 Vehicles (17.5 PCU)',
      signal: 'GREEN (26s)',
      color: '#10b981',
      description: 'Tech Hub Arterial connecting VNIT to Wardha Rd',
    },
    {
      id: 'NGP_J09_SHANKAR_NAGAR',
      name: 'Shankar Nagar Square (Dharampeth)',
      shortName: 'Shankar Nagar',
      corridor: 'VNIT',
      corridorName: 'VNIT Tech Corridor',
      lat: 21.1390,
      lng: 79.0610,
      traffic: '30 Vehicles (20.4 PCU)',
      signal: 'GREEN (34s)',
      color: '#10b981',
      description: 'West High Court Rd & Dharampeth Commercial Hub',
    },
  ];

  // Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.1250, 79.0680], // Centered over Nagpur Wardha & VNIT corridors
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark Matter Map Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Corridor 1 Polyline: Wardha Road (Blue)
    const wardhaPoints = NAGPUR_ALL_JUNCTIONS.filter((j) => j.corridor === 'WARDHA').map((j) => [j.lat, j.lng]);
    const wardhaPolyline = L.polyline(wardhaPoints, {
      color: '#0ea5e9',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(map);

    // Corridor 2 Polyline: VNIT & IT Park Tech Corridor (Emerald)
    const vnitSequence = [
      NAGPUR_ALL_JUNCTIONS.find((j) => j.id === 'NGP_J09_SHANKAR_NAGAR'),
      NAGPUR_ALL_JUNCTIONS.find((j) => j.id === 'NGP_J07_MATE_SQUARE'),
      NAGPUR_ALL_JUNCTIONS.find((j) => j.id === 'NGP_J06_VNIT_IT_PARK'),
      NAGPUR_ALL_JUNCTIONS.find((j) => j.id === 'NGP_J08_LAXMI_NAGAR'),
      NAGPUR_ALL_JUNCTIONS.find((j) => j.id === 'NGP_J03_RAHATE_COLONY'),
    ].filter(Boolean).map((j) => [j.lat, j.lng]);

    const vnitPolyline = L.polyline(vnitSequence, {
      color: '#10b981',
      weight: 4,
      opacity: 0.85,
      dashArray: '6, 6',
    }).addTo(map);

    polylinesRef.current = [wardhaPolyline, vnitPolyline];

    // Add Junction Markers
    NAGPUR_ALL_JUNCTIONS.forEach((j) => {
      const isSelected = j.id === selectedJunctionId;
      const isGreen = j.signal.includes('GREEN');
      const isVNIT = j.id === 'NGP_J06_VNIT_IT_PARK';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            width: ${isVNIT ? '34px' : '28px'};
            height: ${isVNIT ? '34px' : '28px'};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              position: absolute;
              width: ${isSelected || isVNIT ? '36px' : '22px'};
              height: ${isSelected || isVNIT ? '36px' : '22px'};
              border-radius: 50%;
              background: ${isGreen ? 'rgba(16, 185, 129, 0.28)' : 'rgba(239, 68, 68, 0.28)'};
              border: ${isSelected ? '2px solid #38bdf8' : isVNIT ? '2px solid #10b981' : 'none'};
              animation: pulse 2s infinite;
            "></div>
            <div style="
              width: ${isVNIT ? '16px' : '13px'};
              height: ${isVNIT ? '16px' : '13px'};
              border-radius: 50%;
              background: ${isGreen ? '#10b981' : '#ef4444'};
              border: 2px solid #ffffff;
              box-shadow: 0 0 12px ${isGreen ? '#10b981' : '#ef4444'};
            "></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([j.lat, j.lng], { icon: customIcon }).addTo(map);
      marker.bindTooltip(
        `<div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px 6px;">
          <div style="font-weight: 700; color: #f8fafc; font-size: 12px; margin-bottom: 2px;">
            ${j.name} ${isVNIT ? '🏢⚡ (IT Park Hub)' : ''}
          </div>
          <div style="font-size: 11px; color: ${j.color}; font-weight: 600;">
            ${j.signal} • <span style="color: #94a3b8;">${j.traffic}</span>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            ${j.description}
          </div>
        </div>`,
        { direction: 'top', offset: [0, -12], className: 'map-tooltip' }
      );

      marker.on('click', () => {
        onSelectJunction(j.id);
      });

      markersRef.current[j.id] = marker;
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update selected junction pan & marker highlight
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const selected = NAGPUR_ALL_JUNCTIONS.find((j) => j.id === selectedJunctionId);
    if (selected) {
      mapInstanceRef.current.panTo([selected.lat, selected.lng], { animate: true, duration: 0.8 });
    }
  }, [selectedJunctionId]);

  // Handle Container Resize with ResizeObserver & isExpanded
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  }, [isExpanded]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetCorridor = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([21.1250, 79.0680], 13, { animate: true });
    }
  };

  const handleLocateSelected = () => {
    if (!mapInstanceRef.current) return;
    const selected = NAGPUR_ALL_JUNCTIONS.find((j) => j.id === selectedJunctionId);
    if (selected) {
      mapInstanceRef.current.setView([selected.lat, selected.lng], 16, { animate: true, duration: 1.0 });
      if (markersRef.current[selected.id]) {
        markersRef.current[selected.id].openTooltip();
      }
    }
  };

  const filteredJunctions = NAGPUR_ALL_JUNCTIONS.filter((j) => {
    if (activeCorridorFilter === 'WARDHA') return j.corridor === 'WARDHA';
    if (activeCorridorFilter === 'VNIT') return j.corridor === 'VNIT';
    return true;
  });

  return (
    <div
      className="card glass-panel"
      style={{
        padding: '14px 18px',
        marginBottom: 0,
        backgroundColor: '#090d16',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* Sleek Header with Corridor Filter Chips & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={16} style={{ color: '#38bdf8' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                Nagpur City Real GIS Map (10 Intersections)
              </span>
              <span style={{ fontSize: '10.5px', padding: '2px 7px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600 }}>
                ⚡ VNIT IT Park Active
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Wardha Road Arterial & Gayatri Nagar IT Park Tech Corridors
            </div>
          </div>
        </div>

        {/* Corridor Filter Switcher & Map Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Corridor Filters */}
          <div style={{ display: 'flex', background: '#0f172a', padding: '2px', borderRadius: '7px', border: '1px solid #1e293b' }}>
            <button
              onClick={() => setActiveCorridorFilter('ALL')}
              style={{
                background: activeCorridorFilter === 'ALL' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: activeCorridorFilter === 'ALL' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                padding: '4px 9px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All (10)
            </button>
            <button
              onClick={() => setActiveCorridorFilter('WARDHA')}
              style={{
                background: activeCorridorFilter === 'WARDHA' ? 'rgba(14, 165, 233, 0.2)' : 'transparent',
                color: activeCorridorFilter === 'WARDHA' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                padding: '4px 9px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Wardha Rd (6)
            </button>
            <button
              onClick={() => setActiveCorridorFilter('VNIT')}
              style={{
                background: activeCorridorFilter === 'VNIT' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: activeCorridorFilter === 'VNIT' ? '#34d399' : '#94a3b8',
                border: 'none',
                padding: '4px 9px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🏢 VNIT & IT Park (4)
            </button>
          </div>

          {/* Action Toolbar: Locate Selected, Zoom & Reset */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {/* Locate Selected Button */}
            <button
              onClick={handleLocateSelected}
              title="Locate Selected Junction on Map"
              style={{
                backgroundColor: 'rgba(14, 165, 233, 0.2)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                padding: '0 9px',
                height: '26px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)',
              }}
            >
              <MapPin size={12} /> Locate Selected
            </button>

            <button
              onClick={handleZoomIn}
              title="Zoom In"
              style={{
                backgroundColor: '#131d2e',
                border: '1px solid #1e293b',
                color: '#f8fafc',
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              style={{
                backgroundColor: '#131d2e',
                border: '1px solid #1e293b',
                color: '#f8fafc',
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              −
            </button>
            <button
              onClick={handleResetCorridor}
              title="Center Corridor"
              style={{
                backgroundColor: '#131d2e',
                border: '1px solid #1e293b',
                color: '#38bdf8',
                padding: '0 8px',
                height: '26px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RotateCcw size={11} /> Reset
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Compact View' : 'Expand Map'}
              style={{
                backgroundColor: isExpanded ? 'rgba(56, 189, 248, 0.15)' : '#131d2e',
                border: `1px solid ${isExpanded ? '#38bdf8' : '#1e293b'}`,
                color: isExpanded ? '#38bdf8' : '#cbd5e1',
                padding: '0 8px',
                height: '26px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              {isExpanded ? 'Compact' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Real Map Container - Aligned Height */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: isExpanded ? '440px' : '280px',
          minHeight: '280px',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          transition: 'height 0.3s ease',
          backgroundColor: '#070d18',
          flex: 1,
          position: 'relative',
        }}
      />

      {/* Quick Jump Chips for all 10 Intersections */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '10px',
          overflowX: 'auto',
          paddingBottom: '3px',
        }}
      >
        <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', fontWeight: 600 }}>Jump:</span>
        {filteredJunctions.map((j) => {
          const isSelected = selectedJunctionId === j.id;
          const isGreen = j.signal.includes('GREEN');
          const isVNIT = j.id === 'NGP_J06_VNIT_IT_PARK';

          return (
            <button
              key={j.id}
              onClick={() => onSelectJunction(j.id)}
              style={{
                backgroundColor: isSelected
                  ? 'rgba(14, 165, 233, 0.25)'
                  : isVNIT
                  ? 'rgba(16, 185, 129, 0.12)'
                  : '#111827',
                border: `1px solid ${
                  isSelected ? '#38bdf8' : isVNIT ? '#10b981' : 'rgba(255, 255, 255, 0.08)'
                }`,
                color: isSelected ? '#38bdf8' : isVNIT ? '#34d399' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: isSelected || isVNIT ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  width: '6.5px',
                  height: '6.5px',
                  borderRadius: '50%',
                  backgroundColor: isGreen ? '#10b981' : '#ef4444',
                  boxShadow: `0 0 6px ${isGreen ? '#10b981' : '#ef4444'}`,
                }}
              />
              {j.shortName}
              {isVNIT && <span style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '4px', background: '#047857', color: '#fff' }}>TECH</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
