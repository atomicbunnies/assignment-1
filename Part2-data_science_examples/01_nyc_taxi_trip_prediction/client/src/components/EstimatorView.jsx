import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { PRESET_LANDMARKS } from '../utils/landmarks';
import { RouteMap } from './RouteMap';
import {
  MapPin,
  Navigation,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Zap,
  Gauge
} from 'lucide-react';

export const EstimatorView = () => {
  const [pickupLandmark, setPickupLandmark] = useState(PRESET_LANDMARKS[0]); // Times Square
  const [dropoffLandmark, setDropoffLandmark] = useState(PRESET_LANDMARKS[1]); // JFK Airport
  const [passengers, setPassengers] = useState(1);
  const [pickupTime, setPickupTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [isRushHour, setIsRushHour] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch prediction on input change
  useEffect(() => {
    async function calculatePrediction() {
      if (!pickupLandmark || !dropoffLandmark) return;
      try {
        setLoading(true);
        const res = await api.predictTrip({
          pickup_latitude: pickupLandmark.lat,
          pickup_longitude: pickupLandmark.lon,
          dropoff_latitude: dropoffLandmark.lat,
          dropoff_longitude: dropoffLandmark.lon,
          pickup_datetime: pickupTime,
          passenger_count: passengers
        });
        if (res.success) {
          setPrediction(res.prediction);
        }
      } catch (err) {
        console.error('Prediction failed:', err);
      } finally {
        setLoading(false);
      }
    }

    calculatePrediction();
  }, [pickupLandmark, dropoffLandmark, passengers, pickupTime]);

  const handleSwap = () => {
    const temp = pickupLandmark;
    setPickupLandmark(dropoffLandmark);
    setDropoffLandmark(temp);
  };

  const handleMapSelectLandmark = (lm) => {
    if (lm.id === pickupLandmark.id) return;
    setDropoffLandmark(lm);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Kaggle NYC Taxi Challenge Deep-Dive Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(6, 182, 212, 0.08))', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--taxi-yellow)', letterSpacing: '0.05em' }}>
                🏆 Kaggle Benchmark Challenge Deep-Dive
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              New York City Taxi Trip Duration & Fare Prediction Challenge
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.55 }}>
              <strong>The Problem:</strong> Predict total taxi ride duration and fare from spatial-temporal GPS coordinates, pickup hour, day of week, passenger count, and landmark proximity. Features non-linear traffic bottlenecks, bridge tolls, and airport congestion surges.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'rgba(5, 8, 17, 0.85)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Kaggle Grandmaster SOTA</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--taxi-yellow)' }}>0.3680</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Top 1% RMSLE</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Production XGBoost</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>0.1531</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)' }}>R² = 96.97%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Mean Time Error</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>± 2.14 min</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MAE Seconds: 128s</div>
            </div>
          </div>
        </div>
      </div>

      <div className="estimator-layout">
        {/* Left Input & Prediction Panel */}
        <div className="estimator-panel">
          <div className="panel-title">
            <Sparkles size={20} style={{ color: 'var(--taxi-yellow)' }} />
            <span>NYC Ride Estimator</span>
          </div>

        {/* Pickup Location Picker */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
              <MapPin size={14} /> Pickup Spot
            </span>
            <span>{pickupLandmark.zone}</span>
          </label>
          <select
            className="form-select"
            value={pickupLandmark.id}
            onChange={(e) => {
              const found = PRESET_LANDMARKS.find((l) => l.id === e.target.value);
              if (found) setPickupLandmark(found);
            }}
          >
            {PRESET_LANDMARKS.map((lm) => (
              <option key={lm.id} value={lm.id}>
                {lm.name} ({lm.zone})
              </option>
            ))}
          </select>

          {/* Quick chips */}
          <div className="landmark-chips">
            {PRESET_LANDMARKS.slice(0, 5).map((lm) => (
              <button
                key={lm.id}
                type="button"
                className={`landmark-chip ${pickupLandmark.id === lm.id ? 'selected' : ''}`}
                onClick={() => setPickupLandmark(lm)}
              >
                {lm.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dropoff Location Picker */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444' }}>
              <Navigation size={14} /> Dropoff Destination
            </span>
            <span>{dropoffLandmark.zone}</span>
          </label>
          <select
            className="form-select"
            value={dropoffLandmark.id}
            onChange={(e) => {
              const found = PRESET_LANDMARKS.find((l) => l.id === e.target.value);
              if (found) setDropoffLandmark(found);
            }}
          >
            {PRESET_LANDMARKS.map((lm) => (
              <option key={lm.id} value={lm.id}>
                {lm.name} ({lm.zone})
              </option>
            ))}
          </select>

          {/* Quick chips */}
          <div className="landmark-chips">
            {PRESET_LANDMARKS.slice(0, 5).map((lm) => (
              <button
                key={lm.id}
                type="button"
                className={`landmark-chip ${dropoffLandmark.id === lm.id ? 'selected' : ''}`}
                onClick={() => setDropoffLandmark(lm)}
              >
                {lm.name}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time + Passenger Count */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} /> Pickup Time
              </span>
            </label>
            <input
              type="datetime-local"
              className="form-input"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={13} /> Passengers
              </span>
            </label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPassengers(num)}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0',
                    borderRadius: 'var(--radius-md)',
                    background: passengers === num ? 'var(--taxi-yellow)' : 'var(--bg-tertiary)',
                    color: passengers === num ? '#000' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prediction Results Card */}
        {prediction && (
          <div className="prediction-card">
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                Predicted Trip Duration
              </span>
              <div className="metric-hero-row">
                <div className="hero-duration">
                  {prediction.predicted_duration_formatted}
                </div>
                <div className="hero-fare">
                  ${prediction.estimated_fare.total.toFixed(2)}
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Estimated 95% Confidence Interval: {prediction.confidence_interval_minutes.lower}m – {prediction.confidence_interval_minutes.upper}m
              </p>
            </div>

            {/* Fare Breakdown */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Base Fare:</span>
                <span>${prediction.estimated_fare.base_fare.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Distance Rate ({prediction.route_metrics.manhattan_distance_miles} mi):</span>
                <span>${prediction.estimated_fare.distance_fare.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Time Rate ({prediction.predicted_duration_minutes} min):</span>
                <span>${prediction.estimated_fare.time_fare.toFixed(2)}</span>
              </div>
              {prediction.estimated_fare.airport_fee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-cyan)' }}>
                  <span>Airport Access Surcharge:</span>
                  <span>+${prediction.estimated_fare.airport_fee.toFixed(2)}</span>
                </div>
              )}
              {prediction.estimated_fare.rush_surcharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--taxi-yellow)' }}>
                  <span>Peak Rush Hour Surge:</span>
                  <span>+${prediction.estimated_fare.rush_surcharge.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Spatial Telemetry Grid */}
            <div className="telemetry-grid">
              <div className="telemetry-item">
                <div className="telemetry-label">Manhattan Grid Distance</div>
                <div className="telemetry-value">
                  {prediction.route_metrics.manhattan_distance_miles} mi ({prediction.route_metrics.manhattan_distance_km} km)
                </div>
              </div>
              <div className="telemetry-item">
                <div className="telemetry-label">Great-Circle Haversine</div>
                <div className="telemetry-value">
                  {prediction.route_metrics.haversine_distance_miles} mi
                </div>
              </div>
              <div className="telemetry-item">
                <div className="telemetry-label">Compass Heading</div>
                <div className="telemetry-value">
                  {prediction.route_metrics.bearing_degrees}°
                </div>
              </div>
              <div className="telemetry-item">
                <div className="telemetry-label">Predicted Avg Speed</div>
                <div className="telemetry-value">
                  {prediction.route_metrics.estimated_speed_mph} mph ({prediction.route_metrics.estimated_speed_kmh} km/h)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Interactive Spatial Map Simulator */}
      <RouteMap
        pickupCoords={{ lat: pickupLandmark.lat, lon: pickupLandmark.lon }}
        dropoffCoords={{ lat: dropoffLandmark.lat, lon: dropoffLandmark.lon }}
        pickupName={pickupLandmark.name}
        dropoffName={dropoffLandmark.name}
        onSelectLandmark={handleMapSelectLandmark}
      />
      </div>
    </div>
  );
};
