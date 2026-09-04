import React, { useState, useEffect, useRef, useContext } from 'react';
import { notifications as notifApi } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCircleInfo,
  faCheckCircle,
  faTriangleExclamation,
  faCircleExclamation,
  faCheckDouble,
  faTrash,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const { t } = useTranslation();
  const { isLoggedIn } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await notifApi.get();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notifApi.markRead(id);
      fetchNotifications();
    } catch (err) {
      toast.error(t('Failed to mark notification read'));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notifApi.markAllRead();
      toast.success(t('All notifications marked as read'));
      fetchNotifications();
    } catch (err) {
      toast.error(t('Failed to mark all read'));
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notifApi.delete(id);
      fetchNotifications();
    } catch (err) {
      toast.error(t('Failed to delete notification'));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return { icon: faCheckCircle, color: '#00bf63' };
      case 'warning': return { icon: faTriangleExclamation, color: '#f59e0b' };
      case 'danger': return { icon: faCircleExclamation, color: '#ef4444' };
      default: return { icon: faCircleInfo, color: '#3b82f6' };
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          background: isOpen ? '#1e293b' : 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          width: 38,
          height: 38,
          borderRadius: 10,
          color: unreadCount > 0 ? '#fff' : '#94a3b8',
          fontSize: 15,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
      >
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              background: '#ef4444',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              width: 18,
              height: 18,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
              border: '2px solid #0d1117'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="notif-dropdown-panel">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #1e293b', background: '#080c14' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>{t('Notifications')}</span>
              {unreadCount > 0 && (
                <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: 11, fontWeight: 700 }}>
                  {unreadCount} {t('new')}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', color: '#00bf63', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <FontAwesomeIcon icon={faCheckDouble} /> {t('Mark all read')}
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: 8 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                <FontAwesomeIcon icon={faBell} style={{ fontSize: 24, marginBottom: 8, opacity: 0.4 }} />
                <div>{t('No notifications yet')}</div>
              </div>
            ) : (
              notifications.map((n) => {
                const typeInfo = getTypeIcon(n.type);
                return (
                  <div
                    key={n._id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: n.isRead ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                      border: n.isRead ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.06)',
                      marginBottom: 6,
                      display: 'flex',
                      gap: 12,
                      position: 'relative'
                    }}
                  >
                    <div style={{ marginTop: 2, color: typeInfo.color, fontSize: 14 }}>
                      <FontAwesomeIcon icon={typeInfo.icon} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: 13, fontWeight: n.isRead ? 600 : 800, color: '#fff', margin: 0 }}>
                          {n.title}
                        </h4>
                        <button
                          onClick={(e) => handleDelete(n._id, e)}
                          title={t('Delete')}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2, fontSize: 11 }}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>

                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 6px', lineHeight: 1.4 }}>
                        {n.message}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#64748b' }}>
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                        {!n.isRead && (
                          <button
                            onClick={(e) => handleMarkRead(n._id, e)}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 10 }}
                          >
                            {t('Mark read')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
