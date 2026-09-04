import React, { useState, useEffect } from 'react';
import { admin as adminApi } from '../../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faPaperPlane,
  faBullhorn,
  faUser,
  faUsers,
  faCircleInfo,
  faCheckCircle,
  faTriangleExclamation,
  faCircleExclamation,
  faSpinner,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const AdminNotificationsPanel = () => {
  const { t } = useTranslation();
  const [targetType, setTargetType] = useState('all'); // 'all' or 'user'
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [notifType, setNotifType] = useState('info'); // info, success, warning, danger
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await adminApi.getUsers();
        setUsers(res.data.users || []);
      } catch (err) {
        console.error('Failed to load user list:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  const handleClearNotifications = async () => {
    if (!window.confirm(t('Are you sure you want to purge all notification records?'))) return;
    try {
      await adminApi.clearNotifications();
      toast.success(t('All notification records purged from database'));
    } catch (err) {
      toast.error(t('Failed to purge notifications'));
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error(t('Please fill in title and message'));
      return;
    }

    if (targetType === 'user' && !selectedUser) {
      toast.error(t('Please select a target user'));
      return;
    }

    setSending(true);
    try {
      const res = await adminApi.sendNotification({
        recipientId: targetType === 'user' ? selectedUser : null,
        title,
        message,
        type: notifType
      });

      toast.success(res.data.message || t('Notification dispatched successfully!'));
      setTitle('');
      setMessage('');
      setSelectedUser('');
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to dispatch notification'));
    } finally {
      setSending(false);
    }
  };

  const typeOptions = [
    { id: 'info', label: t('Info'), icon: faCircleInfo, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    { id: 'success', label: t('Success'), icon: faCheckCircle, color: '#00bf63', bg: 'rgba(0,191,99,0.15)' },
    { id: 'warning', label: t('Warning'), icon: faTriangleExclamation, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { id: 'danger', label: t('Critical'), icon: faCircleExclamation, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1117', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: 12, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
            <FontAwesomeIcon icon={faBullhorn} style={{ fontSize: 18 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{t('Broadcast & User Notifications')}</h3>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {t('Dispatch instant alerts to all registered users or target a specific user account.')}
            </div>
          </div>
        </div>

        <button
          onClick={handleClearNotifications}
          style={{ padding: '8px 14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FontAwesomeIcon icon={faTrash} /> {t('Purge Notifications')}
        </button>
      </div>

      {/* Main Broadcast Form Card */}
      <form onSubmit={handleSendNotification} style={{ background: '#0d1117', border: '1px solid #1e293b', padding: 24, borderRadius: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Target Audience Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              {t('Target Audience')}
            </label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setTargetType('all')}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: targetType === 'all' ? '1px solid #00bf63' : '1px solid #1e293b',
                  background: targetType === 'all' ? 'rgba(0,191,99,0.1)' : '#080c14',
                  color: targetType === 'all' ? '#00bf63' : '#94a3b8',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  gap: 8
                }}
              >
                <FontAwesomeIcon icon={faUsers} /> {t('All Users (Global Broadcast)')}
              </button>

              <button
                type="button"
                onClick={() => setTargetType('user')}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: targetType === 'user' ? '1px solid #a78bfa' : '1px solid #1e293b',
                  background: targetType === 'user' ? 'rgba(167,139,250,0.1)' : '#080c14',
                  color: targetType === 'user' ? '#a78bfa' : '#94a3b8',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  gap: 8
                }}
              >
                <FontAwesomeIcon icon={faUser} /> {t('Specific User')}
              </button>
            </div>
          </div>

          {/* User Select Dropdown (If specific user target) */}
          {targetType === 'user' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                {t('Select Recipient User')}
              </label>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#080c14', border: '1px solid #1e293b', borderRadius: 8, color: '#fff', fontSize: 14 }}
              >
                <option value="">-- {t('Choose User Account')} --</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name || u.username} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notification Category Type */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              {t('Notification Category')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
              {typeOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setNotifType(opt.id)}
                  style={{
                    padding: '10px',
                    borderRadius: 8,
                    border: notifType === opt.id ? `1px solid ${opt.color}` : '1px solid #1e293b',
                    background: notifType === opt.id ? opt.bg : '#080c14',
                    color: notifType === opt.id ? opt.color : '#64748b',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <FontAwesomeIcon icon={opt.icon} /> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              {t('Notification Title')}
            </label>
            <input
              type="text"
              required
              placeholder={t('e.g. Scheduled System Maintenance')}
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#080c14', border: '1px solid #1e293b', borderRadius: 8, color: '#fff', fontSize: 14 }}
            />
          </div>

          {/* Message Area */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              {t('Notification Message Body')}
            </label>
            <textarea
              required
              rows={4}
              placeholder={t('Enter details for the notification...')}
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#080c14', border: '1px solid #1e293b', borderRadius: 8, color: '#fff', fontSize: 14, resize: 'vertical' }}
            />
          </div>

          {/* Submit CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="submit"
              disabled={sending}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #00bf63 0%, #008f4c 100%)',
                color: '#000',
                border: 'none',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 15px rgba(0,191,99,0.3)'
              }}
            >
              {sending ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPaperPlane} />}
              {sending ? t('Dispatching...') : t('Send Notification')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminNotificationsPanel;
