import React, { useState } from 'react';
import { auth } from '../../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const ProfileEditModal = ({ isOpen, onClose, currentBio, onUpdate }) => {
  const { t } = useTranslation();
  const [bio, setBio] = useState(currentBio || '');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await auth.updateProfile({ bio });
      toast.success(t('Profile updated'));
      onUpdate({ bio });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('Failed to update profile'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, padding: 24, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>{t('Edit Bio')}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16, padding: 4 }}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontFamily: 'monospace', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{t('Bio')}</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="4"
              style={{ width: '100%', padding: '10px 14px', background: '#080c14', border: '1px solid #1e293b', borderRadius: 10, color: '#e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
              placeholder={t('Write a short bio about yourself...')}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onClose}
              style={{ padding: '8px 16px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              {t('Cancel')}
            </button>
            <button type="submit" disabled={isLoading}
              style={{ padding: '8px 16px', background: '#00bf63', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: isLoading ? 0.6 : 1 }}>
              {isLoading ? t('Saving...') : t('Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;