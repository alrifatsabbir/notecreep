import React from 'react';

export default function AuditLogs({ logs }) {
  return (
    <div className="chart-panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bf63', boxShadow: '0 0 6px rgba(0,191,99,0.6)' }} />
          System Audit Stream
        </div>
        <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>{logs.length} events</span>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#475569', fontFamily: 'monospace', fontSize: 12 }}>No events recorded</div>
        ) : logs.map(log => (
          <div key={log.id} className="log-entry">
            <span className={`log-level ${log.level === 'WARN' ? 'log-level-warn' : 'log-level-info'}`}>{log.level}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#e2e8f0', marginBottom: 2 }}>{log.message}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>
                <span>{log.type}</span>
                {log.actor && <span>by {log.actor}</span>}
              </div>
            </div>
            <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {new Date(log.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
