import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

export default function SmtpPanel({ smtpStatus, onSendTest }) {
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const s = smtpStatus || {};

  const handleSend = async () => {
    if (!testEmail) return toast.error('Enter an email address');
    setSending(true);
    try {
      await onSendTest(testEmail);
      toast.success('Test email dispatched');
      setTestEmail('');
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  return (
    <div className="chart-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FontAwesomeIcon icon={faEnvelope} style={{ color: '#00bf63' }} /> SMTP Mailer
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`smtp-status-dot ${s.status === 'connected' ? 'smtp-connected' : s.status === 'error' ? 'smtp-error' : 'smtp-unconfigured'}`} />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: s.status === 'connected' ? '#00bf63' : s.status === 'error' ? '#ef4444' : '#64748b' }}>
            {s.status === 'connected' ? 'Connected' : s.status === 'error' ? 'Error' : 'Not configured'}
          </span>
        </div>
      </div>

      {s.config && (
        <div style={{ background: '#080c14', border: '1px solid #1e293b', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', marginBottom: 16, display: 'grid', gridTemplateColumns: '80px 1fr', gap: '6px 12px' }}>
          <span style={{ color: '#475569' }}>Host</span><span>{s.config.host || 'N/A'}</span>
          <span style={{ color: '#475569' }}>Port</span><span>{s.config.port || 'N/A'}</span>
          <span style={{ color: '#475569' }}>User</span><span>{s.config.user || 'N/A'}</span>
          <span style={{ color: '#475569' }}>From</span><span>{s.config.from || s.config.user || 'N/A'}</span>
          <span style={{ color: '#475569' }}>Secure</span><span>{s.config.secure ? 'TLS (465)' : 'STARTTLS'}</span>
        </div>
      )}

      {s.status === 'error' && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 12, fontSize: 11, color: '#f87171', marginBottom: 16 }}>
          {s.message}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input type="email" placeholder="Recipient email for test..." value={testEmail} onChange={e => setTestEmail(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', background: '#080c14', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 12, outline: 'none' }} />
        <button onClick={handleSend} disabled={sending}
          style={{ padding: '8px 16px', background: '#00bf63', color: '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: sending ? 0.6 : 1 }}>
          <FontAwesomeIcon icon={faPaperPlane} /> {sending ? 'Sending...' : 'Send Test'}
        </button>
      </div>
    </div>
  );
}
