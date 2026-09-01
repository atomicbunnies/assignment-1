import React from 'react';
import { Clock, BarChart2 } from 'lucide-react';

export const DatasetStatsChart = ({ durationDist = [], hourlyDist = [] }) => {
  const maxDurCount = durationDist.length > 0 ? Math.max(...durationDist.map((d) => d.count)) : 1;
  const maxHourCount = hourlyDist.length > 0 ? Math.max(...hourlyDist.map((h) => h.count)) : 1;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {/* Trip Duration Distribution */}
      <div className="data-table-container" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Clock size={16} style={{ color: 'var(--taxi-yellow)' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Trip Duration Distribution</h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: 140, paddingTop: 10 }}>
          {durationDist.map((d, i) => {
            const heightPercent = Math.max(8, (d.count / maxDurCount) * 100);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}
                title={`${d.bin}: ${d.count} trips`}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${heightPercent}%`,
                    background: 'linear-gradient(180deg, #f59e0b, rgba(245, 158, 11, 0.3))',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 400ms ease'
                  }}
                />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4, transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                  {d.bin}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Pickup Density */}
      <div className="data-table-container" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BarChart2 size={16} style={{ color: '#06b6d4' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Hourly Pickup Density (24h)</h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: 140, paddingTop: 10 }}>
          {hourlyDist.map((h, i) => {
            const heightPercent = Math.max(6, (h.count / maxHourCount) * 100);
            const isRush = [7, 8, 9, 16, 17, 18, 19].includes(i);

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}
                title={`${h.hour}: ${h.count} pickups`}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${heightPercent}%`,
                    background: isRush
                      ? 'linear-gradient(180deg, #ef4444, rgba(239, 68, 68, 0.4))'
                      : 'linear-gradient(180deg, #06b6d4, rgba(6, 182, 212, 0.3))',
                    borderRadius: '2px 2px 0 0'
                  }}
                />
                {i % 4 === 0 && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {i}h
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
