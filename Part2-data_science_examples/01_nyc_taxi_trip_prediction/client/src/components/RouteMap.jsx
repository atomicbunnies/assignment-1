import React, { useMemo } from 'react';
import { PRESET_LANDMARKS, projectGeoToSvg } from '../utils/landmarks';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';

export const RouteMap = ({
  pickupCoords,
  dropoffCoords,
  pickupName,
  dropoffName,
  onSelectLandmark
}) => {
  const width = 640;
  const height = 520;

  const pPos = useMemo(
    () => projectGeoToSvg(pickupCoords.lat, pickupCoords.lon, width, height),
    [pickupCoords]
  );
  const dPos = useMemo(
    () => projectGeoToSvg(dropoffCoords.lat, dropoffCoords.lon, width, height),
    [dropoffCoords]
  );

  // Generate curved bezier path between pickup and dropoff
  const pathD = useMemo(() => {
    const dx = dPos.x - pPos.x;
    const dy = dPos.y - pPos.y;
    const cx1 = pPos.x + dx * 0.25 - dy * 0.2;
    const cy1 = pPos.y + dy * 0.25 + dx * 0.2;
    const cx2 = pPos.x + dx * 0.75 + dy * 0.15;
    const cy2 = pPos.y + dy * 0.75 - dx * 0.15;
    return `M ${pPos.x} ${pPos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${dPos.x} ${dPos.y}`;
  }, [pPos, dPos]);

  return (
    <div className="map-card">
      <div className="map-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={18} style={{ color: 'var(--taxi-yellow)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>NYC Spatial Trajectory Simulator</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Click landmarks to update route
        </span>
      </div>

      <div className="map-svg-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            {/* Ambient Gradients */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Waterways */}
          <rect width={width} height={height} fill="#0a0f1d" />

          {/* NYC Simplified Landmass Outlines */}
          {/* Manhattan Island */}
          <path
            d="M 210,130 L 255,160 L 235,270 L 195,360 L 175,350 L 195,260 L 190,150 Z"
            fill="#141c2c"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
          />
          <text x="215" y="240" fill="rgba(255,255,255,0.2)" fontSize="11" fontWeight="700" transform="rotate(-65 215,240)">
            MANHATTAN
          </text>

          {/* Brooklyn Landmass */}
          <path
            d="M 195,365 L 250,330 L 330,350 L 380,440 L 260,490 L 170,440 Z"
            fill="#131a28"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
          />
          <text x="260" y="410" fill="rgba(255,255,255,0.18)" fontSize="13" fontWeight="700">
            BROOKLYN
          </text>

          {/* Queens Landmass & JFK */}
          <path
            d="M 260,165 L 430,170 L 590,260 L 580,380 L 460,450 L 340,350 L 260,320 Z"
            fill="#121926"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
          />
          <text x="390" y="270" fill="rgba(255,255,255,0.18)" fontSize="14" fontWeight="700">
            QUEENS
          </text>

          {/* Bronx Outline */}
          <path
            d="M 235,60 L 330,65 L 340,140 L 265,150 L 225,120 Z"
            fill="#111722"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
          />
          <text x="270" y="105" fill="rgba(255,255,255,0.18)" fontSize="12" fontWeight="700">
            THE BRONX
          </text>

          {/* Staten Island Outline */}
          <path
            d="M 40,370 L 110,360 L 130,450 L 70,480 L 30,430 Z"
            fill="#101520"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
          />
          <text x="60" y="420" fill="rgba(255,255,255,0.15)" fontSize="10" fontWeight="700">
            STATEN ISLAND
          </text>

          {/* Transit Hub Highlights (JFK & LGA) */}
          {/* JFK Area */}
          <circle cx="515" cy="400" r="28" fill="rgba(6, 182, 212, 0.08)" stroke="#06b6d4" strokeDasharray="3 3" strokeWidth="1" />
          <text x="515" y="405" fill="#06b6d4" fontSize="10" fontWeight="800" textAnchor="middle">JFK INTL</text>

          {/* LGA Area */}
          <circle cx="360" cy="180" r="22" fill="rgba(6, 182, 212, 0.08)" stroke="#06b6d4" strokeDasharray="3 3" strokeWidth="1" />
          <text x="360" y="184" fill="#06b6d4" fontSize="9" fontWeight="800" textAnchor="middle">LGA</text>

          {/* Landmark Node Pins */}
          {PRESET_LANDMARKS.map((lm) => {
            const pos = projectGeoToSvg(lm.lat, lm.lon, width, height);
            const isPickup = lm.lat === pickupCoords.lat && lm.lon === pickupCoords.lon;
            const isDropoff = lm.lat === dropoffCoords.lat && lm.lon === dropoffCoords.lon;

            return (
              <g
                key={lm.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectLandmark && onSelectLandmark(lm)}
              >
                <circle
                  r={isPickup || isDropoff ? 7 : 4}
                  fill={isPickup ? '#10b981' : isDropoff ? '#ef4444' : 'rgba(255, 255, 255, 0.4)'}
                  stroke="#ffffff"
                  strokeWidth={isPickup || isDropoff ? 2 : 1}
                />
                <text
                  x={8}
                  y={4}
                  fill={isPickup ? '#10b981' : isDropoff ? '#ef4444' : 'rgba(255, 255, 255, 0.6)'}
                  fontSize="9"
                  fontWeight={isPickup || isDropoff ? 700 : 500}
                >
                  {lm.name}
                </text>
              </g>
            );
          })}

          {/* Active Route Spline with Glow */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(245, 158, 11, 0.25)"
            strokeWidth="8"
            filter="url(#glow)"
          />
          <path
            id="taxiTrajectoryPath"
            d={pathD}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Animated Pulsing Pickup Marker (Green) */}
          <circle cx={pPos.x} cy={pPos.y} r="14" fill="rgba(16, 185, 129, 0.25)">
            <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={pPos.x} cy={pPos.y} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />

          {/* Animated Pulsing Dropoff Marker (Red) */}
          <circle cx={dPos.x} cy={dPos.y} r="14" fill="rgba(239, 68, 68, 0.25)">
            <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={dPos.x} cy={dPos.y} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />

          {/* Animated Yellow Taxi Car cruising along the route trajectory */}
          <g transform="translate(-10, -10)">
            <animateMotion
              path={pathD}
              dur="4s"
              repeatCount="indefinite"
              rotate="auto"
            />
            {/* Yellow Taxi Icon */}
            <rect x="0" y="0" width="20" height="12" rx="3" fill="#fbbf24" stroke="#000000" strokeWidth="1.5" />
            <rect x="5" y="2" width="10" height="8" rx="1.5" fill="#090d16" />
            <rect x="8" y="0" width="4" height="2" fill="#000000" />
            {/* Headlights beam */}
            <polygon points="20,2 28,-2 28,14 20,10" fill="rgba(251, 191, 36, 0.35)" />
          </g>
        </svg>
      </div>
    </div>
  );
};
