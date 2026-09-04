import React, { useState, useEffect } from 'react';
import { admin as adminApi } from '../../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faServer,
  faDatabase,
  faMicrochip,
  faMemory,
  faGaugeHigh,
  faShieldHalved,
  faRefresh,
  faHardDrive,
  faLayerGroup,
  faNetworkWired
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const ServerHealthPanel = () => {
  const { t } = useTranslation();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchHealth = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await adminApi.getServerHealth();
      setHealthData(res.data);
      
      const newPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: Math.min(100, Math.round((res.data.server.loadAvg[0] || 0.1) * 20)),
        mem: res.data.server.memory.memPercent,
        latency: res.data.server.dbLatencyMs
      };

      setHistory(prev => [...prev.slice(-14), newPoint]);
    } catch (err) {
      console.error('Failed to load server health:', err);
      toast.error(t('Failed to load server health metrics'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => fetchHealth(), 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !healthData) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <FontAwesomeIcon icon={faServer} spin style={{ fontSize: 28, color: '#00bf63', marginBottom: 12 }} />
        <div>{t('Checking system telemetry...')}</div>
      </div>
    );
  }

  const { server, mongodb } = healthData || {};

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1117', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,191,99,0.1)', border: '1px solid rgba(0,191,99,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00bf63' }}>
            <FontAwesomeIcon icon={faServer} style={{ fontSize: 18 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{t('Server Health & Infrastructure')}</h3>
            <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span>Node.js {server?.nodeVersion} ({server?.platform} {server?.arch})</span>
              <span>•</span>
              <span style={{ color: '#00bf63', fontWeight: 600 }}>● {t('OPERATIONAL')}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchHealth(true)}
          style={{ padding: '8px 14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FontAwesomeIcon icon={faRefresh} spin={refreshing} /> {t('Refresh Status')}
        </button>
      </div>

      {/* Top 4 Telemetry Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {/* Card 1: Server Process Uptime */}
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', padding: 20, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
            <span>{t('Server Uptime')}</span>
            <FontAwesomeIcon icon={faShieldHalved} style={{ color: '#00bf63' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            {formatUptime(server?.processUptime)}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            {t('Host System')}: {formatUptime(server?.systemUptime)}
          </div>
        </div>

        {/* Card 2: Database Latency */}
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', padding: 20, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
            <span>{t('MongoDB Latency')}</span>
            <FontAwesomeIcon icon={faGaugeHigh} style={{ color: server?.dbLatencyMs < 50 ? '#00bf63' : '#f59e0b' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            {server?.dbLatencyMs} <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>ms</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            {server?.dbLatencyMs < 50 ? t('Optimal database response') : t('Moderate response time')}
          </div>
        </div>

        {/* Card 3: Memory Usage */}
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', padding: 20, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
            <span>{t('RAM Usage')}</span>
            <FontAwesomeIcon icon={faMemory} style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            {server?.memory?.heapUsedMB} <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>MB</span>
          </div>
          <div style={{ marginTop: 8, height: 6, width: '100%', background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${server?.memory?.memPercent}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #00bf63)', borderRadius: 3 }} />
          </div>
        </div>

        {/* Card 4: MongoDB Storage Remaining */}
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', padding: 20, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
            <span>{t('Storage Remaining')}</span>
            <FontAwesomeIcon icon={faHardDrive} style={{ color: '#a78bfa' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            {mongodb?.storageRemainingMB} <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>MB</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            {mongodb?.percentUsed}% {t('of 512 MB Quota Used')}
          </div>
        </div>
      </div>

      {/* MongoDB Storage Breakdown Grid */}
      <div style={{ background: '#0d1117', border: '1px solid #1e293b', padding: 24, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <FontAwesomeIcon icon={faDatabase} style={{ color: '#a78bfa', fontSize: 18 }} />
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{t('MongoDB Storage & Collection Details')}</h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)', padding: 16, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{t('Allocated Storage')}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{mongodb?.storageSizeMB} MB</div>
          </div>

          <div style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)', padding: 16, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{t('Raw Data Size')}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{mongodb?.dataSizeMB} MB</div>
          </div>

          <div style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)', padding: 16, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{t('Index Size')}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{mongodb?.indexSizeMB} MB</div>
          </div>

          <div style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)', padding: 16, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{t('Total Documents')}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#00bf63' }}>{mongodb?.objects?.toLocaleString()}</div>
          </div>

          <div style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.06)', padding: 16, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{t('Collections')}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>{mongodb?.collections}</div>
          </div>
        </div>

        {/* Progress Bar for Storage Quota */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
            <span>{t('Storage Allocation Progress')}</span>
            <span>{mongodb?.storageSizeMB} MB / 512.00 MB ({mongodb?.percentUsed}%)</span>
          </div>
          <div style={{ height: 10, background: '#1e293b', borderRadius: 5, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.max(2, mongodb?.percentUsed || 0)}%`,
                height: '100%',
                background: mongodb?.percentUsed > 80 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #00bf63, #3b82f6)',
                borderRadius: 5,
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Monitor SVG Sparkline */}
      {history.length > 1 && (
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', padding: 24, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FontAwesomeIcon icon={faMicrochip} style={{ color: '#00bf63' }} />
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{t('Live Telemetry Stream')}</h4>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              <span style={{ color: '#00bf63', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00bf63' }} /> RAM %
              </span>
              <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> Latency (ms)
              </span>
            </div>
          </div>

          <div style={{ height: 140, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 8, paddingTop: 20 }}>
            {history.map((pt, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: '100%' }}>
                  {/* RAM Bar */}
                  <div
                    title={`RAM: ${pt.mem}%`}
                    style={{ flex: 1, height: `${Math.max(10, pt.mem)}%`, background: 'rgba(0,191,99,0.7)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }}
                  />
                  {/* Latency Bar */}
                  <div
                    title={`Latency: ${pt.latency}ms`}
                    style={{ flex: 1, height: `${Math.max(10, Math.min(100, pt.latency * 2))}%`, background: 'rgba(59,130,246,0.7)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }}
                  />
                </div>
                <span style={{ fontSize: 9, color: '#64748b', fontFamily: 'monospace' }}>{pt.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerHealthPanel;
