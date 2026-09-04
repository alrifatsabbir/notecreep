import React, { useState, useEffect } from 'react';
import { admin as adminApi } from '../../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPaperPlane,
  faCheckCircle,
  faXmarkCircle,
  faSearch,
  faTrash,
  faRefresh,
  faTriangleExclamation,
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const EmailLogsPanel = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalSent: 0, totalFailed: 0 });
  const [smtpStatus, setSmtpStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const fetchLogsAndStatus = async () => {
    try {
      const [logsRes, smtpRes] = await Promise.all([
        adminApi.getEmailLogs(filterStatus, searchQuery),
        adminApi.getSmtpStatus()
      ]);
      setLogs(logsRes.data.logs || []);
      setStats(logsRes.data.stats || { total: 0, totalSent: 0, totalFailed: 0 });
      setSmtpStatus(smtpRes.data);
    } catch (err) {
      console.error('Failed to load email logs:', err);
      toast.error(t('Failed to load email dispatch logs'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndStatus();
  }, [filterStatus, searchQuery]);

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testEmail) return;
    setSendingTest(true);
    try {
      await adminApi.sendTestEmail(testEmail);
      toast.success(t('Test email dispatched successfully!'));
      setShowTestModal(false);
      setTestEmail('');
      fetchLogsAndStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to send test email'));
    } finally {
      setSendingTest(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm(t('Are you sure you want to purge all email logs?'))) return;
    try {
      await adminApi.clearEmailLogs();
      toast.success(t('Email logs purged'));
      fetchLogsAndStatus();
    } catch (err) {
      toast.error(t('Failed to clear logs'));
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'verification': return { bg: 'rgba(0,191,99,0.15)', color: '#00bf63', border: 'rgba(0,191,99,0.3)' };
      case 'otp': return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' };
      case 'password_reset': return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' };
      case 'test': return { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: 'rgba(167,139,250,0.3)' };
      default: return { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header SMTP Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1117', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: 12, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 18 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{t('Email Dispatch & SMTP Logs')}</h3>
            <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span>SMTP Host: {smtpStatus?.config?.host || 'Console Fallback'}</span>
              <span>•</span>
              <span style={{ color: smtpStatus?.status === 'connected' ? '#00bf63' : '#f59e0b', fontWeight: 600 }}>
                ● {smtpStatus?.status === 'connected' ? t('SMTP ACTIVE') : t('FALLBACK MODE')}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowTestModal(true)}
            style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #00bf63 0%, #008f4c 100%)', color: '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FontAwesomeIcon icon={faPaperPlane} /> {t('Send Test Email')}
          </button>
          <button
            onClick={handleClearLogs}
            style={{ padding: '8px 14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FontAwesomeIcon icon={faTrash} /> {t('Purge Logs')}
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', background: '#0d1117', border: '1px solid #1e293b', padding: 4, borderRadius: 8 }}>
          {['all', 'sent', 'failed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: filterStatus === s ? '#1e293b' : 'transparent',
                color: filterStatus === s ? '#fff' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {t(s)} ({s === 'all' ? stats.total : s === 'sent' ? stats.totalSent : stats.totalFailed})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: 280 }}>
          <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 13 }} />
          <input
            type="text"
            placeholder={t('Search recipient or subject...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', background: '#0d1117', border: '1px solid #1e293b', borderRadius: 8, color: '#fff', fontSize: 13 }}
          />
        </div>
      </div>

      {/* Email Logs Table */}
      <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        {logs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }} />
            <div>{t('No email dispatch logs found')}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#080c14', borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>{t('Status')}</th>
                <th style={{ padding: '12px 16px' }}>{t('Recipient')}</th>
                <th style={{ padding: '12px 16px' }}>{t('Subject')}</th>
                <th style={{ padding: '12px 16px' }}>{t('Category')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>{t('Timestamp')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const bStyle = getBadgeStyle(log.emailType);
                return (
                  <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      {log.status === 'sent' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,191,99,0.15)', color: '#00bf63', fontSize: 11, fontWeight: 700 }}>
                          <FontAwesomeIcon icon={faCheckCircle} /> {t('Sent')}
                        </span>
                      ) : (
                        <span title={log.errorMessage || 'Failed'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'help' }}>
                          <FontAwesomeIcon icon={faXmarkCircle} /> {t('Failed')}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 600 }}>
                      {log.recipient}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                      {log.subject}
                      {log.errorMessage && (
                        <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{log.errorMessage}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, background: bStyle.bg, color: bStyle.color, border: `1px solid ${bStyle.border}`, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                        {log.emailType}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b', fontSize: 12 }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Send Test Email Modal */}
      {showTestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <form onSubmit={handleSendTest} style={{ width: '100%', maxWidth: 440, background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>{t('Dispatch Test Email')}</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              {t('Send a test message to verify outbound SMTP configuration and network connectivity.')}
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>{t('Recipient Email Address')}</label>
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#080c14', border: '1px solid #1e293b', borderRadius: 8, color: '#fff', fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                style={{ padding: '8px 16px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
              >
                {t('Cancel')}
              </button>
              <button
                type="submit"
                disabled={sendingTest}
                style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #00bf63 0%, #008f4c 100%)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
              >
                {sendingTest ? t('Sending...') : t('Send Email')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmailLogsPanel;
