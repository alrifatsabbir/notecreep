import React from 'react';

export default function ChartPanel({ chartData, dailySeries }) {
  const maxMonth = Math.max(...(chartData || []).map(d => Math.max(d.users, d.notes)), 1);
  const maxDay = Math.max(...(dailySeries || []).map(d => Math.max(d.notes, d.signups)), 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
      {/* 6-Month Chart */}
      <div className="chart-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>6-Month Growth</h3>
            <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>Users vs Notes created</p>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 10, fontFamily: 'monospace', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3b82f6' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#3b82f6' }} /> Users
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00bf63' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#00bf63' }} /> Notes
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, paddingTop: 16 }}>
          {(chartData || []).map((item, i) => (
            <div key={i} className="chart-bar-group">
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: '100%', width: '100%', justifyContent: 'center' }}>
                <div className="chart-bar" style={{ height: `${Math.max(8, (item.notes / maxMonth) * 100)}%`, background: 'linear-gradient(to top, rgba(0,191,99,0.3), #00bf63)' }}>
                  <div className="chart-tooltip">{item.notes} notes</div>
                </div>
                <div className="chart-bar" style={{ height: `${Math.max(8, (item.users / maxMonth) * 100)}%`, background: 'linear-gradient(to top, rgba(59,130,246,0.3), #3b82f6)' }}>
                  <div className="chart-tooltip">{item.users} users</div>
                </div>
              </div>
              <span className="chart-month">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Chart */}
      <div className="chart-panel">
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>7-Day Activity</h3>
          <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>Daily notes and signups</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, paddingTop: 16 }}>
          {(dailySeries || []).map((item, i) => (
            <div key={i} className="chart-bar-group">
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: '100%', width: '100%', justifyContent: 'center' }}>
                <div className="chart-bar" style={{ height: `${Math.max(8, (item.notes / maxDay) * 100)}%`, background: 'linear-gradient(to top, rgba(0,191,99,0.3), #00bf63)' }}>
                  <div className="chart-tooltip">{item.notes} notes</div>
                </div>
                <div className="chart-bar" style={{ height: `${Math.max(8, (item.signups / maxDay) * 100)}%`, background: 'linear-gradient(to top, rgba(168,85,247,0.3), #a855f7)' }}>
                  <div className="chart-tooltip">{item.signups} signups</div>
                </div>
              </div>
              <span className="chart-month">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
