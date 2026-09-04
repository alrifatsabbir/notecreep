// src/components/modals/ShareNoteModal.jsx

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShareAlt,
  faTimes,
  faSpinner,
  faUserPlus,
  faUserMinus,
  faEye,
  faEdit
} from "@fortawesome/free-solid-svg-icons";
import { notes as notesApi } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';

const ShareNoteModal = ({ isOpen, onClose, noteId, onShared }) => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [username, setUsername] = useState('');
  const [permission, setPermission] = useState('read'); // 'read' | 'edit'
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [sharedUsersList, setSharedUsersList] = useState([]);

  const fetchSharedUsers = async () => {
    if (!noteId) return;
    try {
      const response = await notesApi.getSharedUsers(noteId);
      setSharedUsersList(response.data.sharedAccess || []);
    } catch (error) {
      console.error("Failed to fetch shared users:", error);
    }
  };

  useEffect(() => {
    if (isOpen && noteId) {
      fetchSharedUsers();
    } else {
      setSharedUsersList([]);
      setUsername('');
      setPermission('read');
    }
  }, [isOpen, noteId]);

  if (!isOpen) return null;

  const handleShare = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error(t("Please enter a username to share with."));
      return;
    }

    setIsLoading(true);
    try {
      const response = await notesApi.shareNote(noteId, {
        username: username.trim(),
        permission
      });
      toast.success(t(response.data.message || `Note shared with ${username}!`));
      setUsername('');
      if (response.data.sharedAccess) {
        setSharedUsersList(response.data.sharedAccess);
      } else {
        await fetchSharedUsers();
      }
      if (onShared) onShared();
    } catch (error) {
      toast.error(error.response?.data?.error || t("Failed to share note."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnshareUser = async (targetUserId, targetUsername) => {
    if (isActionLoading) return;
    const isConfirmed = await confirm({
      title: t('Revoke Sharing Access'),
      message: t(`Are you sure you want to revoke sharing access for {{username}}?`, { username: targetUsername }),
      confirmText: t('Revoke Access'),
      variant: 'warning'
    });
    if (!isConfirmed) return;

    setIsActionLoading(true);
    try {
      const response = await notesApi.unshareNote(noteId, targetUserId);
      toast.success(t(`Access revoked for {{username}}`, { username: targetUsername }));
      if (response.data.sharedAccess) {
        setSharedUsersList(response.data.sharedAccess);
      } else {
        await fetchSharedUsers();
      }
      if (onShared) onShared();
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error(t("Failed to revoke access."));
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{
        background: '#0d1117', border: '1px solid #1e293b',
        borderRadius: 16, padding: 28, width: '100%', maxWidth: 500,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faShareAlt} style={{ color: '#3b82f6', marginRight: 10 }} />
            {t("Share & Manage Access")}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Share Form */}
        <form onSubmit={handleShare} style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #1e293b' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'monospace' }}>
            {t("Add Collaborator by Username")}
          </label>
          
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input
              type="text"
              placeholder={t("Enter username...")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                flex: 1, background: '#161b22', border: '1px solid #1e293b',
                borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14,
                outline: 'none', boxSizing: 'border-box'
              }}
            />

            {/* Permission Selector */}
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              style={{
                background: '#161b22', border: '1px solid #1e293b', color: '#fff',
                borderRadius: 8, padding: '0 12px', fontSize: 13, fontWeight: 600, outline: 'none'
              }}
            >
              <option value="read">{t("Read Only")}</option>
              <option value="edit">{t("Can Edit")}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: 8,
              padding: '11px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              opacity: isLoading || !username.trim() ? 0.6 : 1, transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                {t("Sharing Access...")}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUserPlus} />
                {t("Share Access")}
              </>
            )}
          </button>
        </form>

        {/* Active Collaborators Section */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 12 }}>
            {t("Current Collaborators")} ({sharedUsersList.length})
          </h4>

          {sharedUsersList.length === 0 ? (
            <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', margin: 0 }}>
              {t("This note is not currently shared with anyone.")}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
              {sharedUsersList.map((entry, idx) => {
                const u = entry.user || {};
                const perm = entry.permission || 'read';
                return (
                  <div
                    key={u._id || idx}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#161b22', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 14px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                        @{u.username || 'User'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{u.email || ''}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                          background: perm === 'edit' ? 'rgba(0,191,99,0.15)' : 'rgba(59,130,246,0.15)',
                          color: perm === 'edit' ? '#00bf63' : '#3b82f6',
                          border: `1px solid ${perm === 'edit' ? 'rgba(0,191,99,0.3)' : 'rgba(59,130,246,0.3)'}`
                        }}
                      >
                        <FontAwesomeIcon icon={perm === 'edit' ? faEdit : faEye} style={{ marginRight: 4 }} />
                        {perm === 'edit' ? t("Can Edit") : t("Read Only")}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleUnshareUser(u._id, u.username)}
                        disabled={isActionLoading}
                        style={{
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                          color: '#ef4444', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer'
                        }}
                        title={t("Revoke Access")}
                      >
                        <FontAwesomeIcon icon={faUserMinus} /> {t("Remove")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareNoteModal;
