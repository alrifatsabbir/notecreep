import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import PageLoader from '../../components/PageLoader';
import Back from '../../components/Back';
import toast from 'react-hot-toast';
import { auth } from '../../services/api';
import { getDicebearAvatar } from '../../utils/avatar';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faEnvelope, faSignOutAlt, faLock,
  faTrashAlt, faAt, faIdCardAlt, faShieldHalved, faKey
} from '@fortawesome/free-solid-svg-icons';
import './AccountManagementPage.css';

const AccountManagementPage = () => {
  const { user: loggedInUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  cardsRef.current = [];

  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!loggedInUser?.username) {
        setIsLoading(false);
        navigate('/login');
        return;
      }
      setIsLoading(true);
      try {
        const response = await auth.getUserProfile(loggedInUser.username);
        setProfileData(response.data);
        setNewName(response.data.name || '');
        setNewUsername(response.data.username || '');
        setNewEmail(response.data.email || '');
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error(t('Failed to load account settings'));
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [loggedInUser, navigate, t]);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      );

      if (cardsRef.current.length > 0) {
        tl.fromTo(cardsRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
          '-=0.3'
        );
      }
    }
  }, [isLoading]);

  const handleDeleteAccount = async () => {
    if (deleteConfirm.trim().toLowerCase() !== 'delete') {
      toast.error(t('Type "delete" to confirm account erasure.'));
      return;
    }
    try {
      await auth.deleteAccount();
      toast.success(t('Account deleted successfully.'));
      logout();
      navigate('/register');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(t('Failed to delete account.'));
    }
  };

  const handleNameChange = async (e) => {
    e.preventDefault();
    try {
      await auth.updateName(newName);
      toast.success(t('Name updated successfully'));
      setProfileData((prev) => ({ ...prev, name: newName }));
    } catch (error) {
      toast.error(error.response?.data?.message || t('Failed to update name'));
    }
  };

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    try {
      await auth.updateUsername(newUsername);
      toast.success(t('Username updated successfully'));
      localStorage.setItem('user', JSON.stringify({ ...loggedInUser, username: newUsername }));
      setProfileData((prev) => ({ ...prev, username: newUsername }));
    } catch (error) {
      toast.error(error.response?.data?.message || t('Failed to update username'));
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error(t('Current password is required to change email'));
      return;
    }
    try {
      await auth.updateEmail({ newEmail, currentPassword });
      toast.success(t('Verification link sent to new email.'));
      navigate(`/verify-email?email=${newEmail}`);
    } catch (error) {
      toast.error(error.response?.data?.message || t('Failed to update email'));
    }
  };

  const handleRequestPasswordReset = async () => {
    try {
      await auth.requestPasswordReset(profileData.email);
      toast.success(t('Reset instructions sent to your email!'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('Failed to request reset'));
    }
  };

  if (isLoading) return <PageLoader />;

  if (!profileData) {
    return (
      <div className="acct-root" style={{ display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ textAlign: 'center', background: '#0d1117', border: '1px solid #1e293b', padding: 40, borderRadius: 16 }}>
            <FontAwesomeIcon icon={faUser} style={{ fontSize: 40, color: '#334155', marginBottom: 16 }} />
            <p style={{ color: '#64748b', fontSize: 14 }}>{t('Account details could not be loaded.')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="acct-root">
      <Navbar />

      <div ref={containerRef} className="acct-container">

        {/* Back Button & Page Title Bar */}
        <div className="acct-header-bar">
          <Back inline />
          <div className="acct-title-group">
            <h1 className="acct-title">{t('Account Settings')}</h1>
            <span className="acct-subtitle">{t('Manage security, credentials, and profile preferences')}</span>
          </div>
        </div>

        {/* User Hero Banner */}
        <div ref={addToCardsRef} className="acct-hero-card">
          <div className="acct-hero-left">
            <img 
              src={getDicebearAvatar(profileData.username)} 
              alt={profileData.username} 
              className="acct-hero-avatar"
            />
            <div className="acct-hero-info">
              <h2 className="acct-hero-name">{profileData.name}</h2>
              <span className="acct-hero-username">@{profileData.username}</span>
              <span className="acct-hero-email">
                <FontAwesomeIcon icon={faEnvelope} /> {profileData.email}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link 
              to={`/profile/${profileData.username}`}
              style={{
                padding: '8px 14px', background: '#111827', border: '1px solid #1e293b',
                borderRadius: 10, color: '#e2e8f0', fontSize: 12, fontWeight: 600,
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <FontAwesomeIcon icon={faIdCardAlt} style={{ color: '#00bf63' }} />
              {t('View Profile')}
            </Link>

            <button 
              onClick={() => { logout(); navigate('/'); }}
              style={{
                padding: '8px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 10, color: '#f87171', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              {t('Sign Out')}
            </button>
          </div>
        </div>

        {/* Form Settings Grid */}
        <div className="acct-grid">

          {/* Display Name Card */}
          <div ref={addToCardsRef} className="acct-card">
            <div className="acct-card-header">
              <FontAwesomeIcon icon={faUser} style={{ color: '#00bf63' }} />
              <span>{t('Full Name')}</span>
            </div>
            <form onSubmit={handleNameChange}>
              <label className="acct-label">{t('Display Name')}</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="acct-input"
                required
              />
              <button type="submit" className="acct-btn-primary">
                {t('Save Display Name')}
              </button>
            </form>
          </div>

          {/* Username Card */}
          <div ref={addToCardsRef} className="acct-card">
            <div className="acct-card-header">
              <FontAwesomeIcon icon={faAt} style={{ color: '#3b82f6' }} />
              <span>{t('Account Handle')}</span>
            </div>
            <form onSubmit={handleUsernameChange}>
              <label className="acct-label">{t('Username')}</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="acct-input"
                required
              />
              <button type="submit" className="acct-btn-secondary">
                {t('Update Username')}
              </button>
            </form>
          </div>

          {/* Email Address Card */}
          <div ref={addToCardsRef} className="acct-card">
            <div className="acct-card-header">
              <FontAwesomeIcon icon={faEnvelope} style={{ color: '#06b6d4' }} />
              <span>{t('Email Address')}</span>
            </div>
            <form onSubmit={handleEmailChange}>
              <div style={{ marginBottom: 12 }}>
                <label className="acct-label">{t('New Email Address')}</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="acct-input"
                  required
                />
              </div>
              <div>
                <label className="acct-label">{t('Current Password (For Verification)')}</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="acct-input"
                  placeholder={t('Enter current password...')}
                  required
                />
              </div>
              <button type="submit" className="acct-btn-primary" style={{ background: '#06b6d4', color: '#fff' }}>
                {t('Update Email & Verify')}
              </button>
            </form>
          </div>

          {/* Password Security Card */}
          <div ref={addToCardsRef} className="acct-card">
            <div className="acct-card-header">
              <FontAwesomeIcon icon={faLock} style={{ color: '#a78bfa' }} />
              <span>{t('Password Security')}</span>
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 16px' }}>
                {t('Need to change your security credentials? Request a password reset link sent directly to your registered email address.')}
              </p>
              <button 
                type="button" 
                onClick={handleRequestPasswordReset} 
                className="acct-btn-secondary"
                style={{ borderColor: 'rgba(167, 139, 246, 0.4)' }}
              >
                <FontAwesomeIcon icon={faKey} style={{ marginRight: 6, color: '#a78bfa' }} />
                {t('Send Password Reset Email')}
              </button>
            </div>
          </div>

        </div>

        {/* Danger Zone */}
        <div ref={addToCardsRef} className="acct-danger-card">
          <div className="acct-danger-title">
            <FontAwesomeIcon icon={faTrashAlt} />
            <span>{t('Danger Zone - Account Termination')}</span>
          </div>
          <p className="acct-danger-desc">
            {t('Permanently erase your NoteCreep account, notes, pinned data, and settings. This action is immediate and cannot be undone.')}
          </p>

          <div className="acct-danger-row">
            <input
              type="text"
              placeholder={t('Type "delete" to confirm')}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="acct-input"
              style={{ maxWidth: 260, borderColor: 'rgba(239, 68, 68, 0.4)' }}
            />
            <button onClick={handleDeleteAccount} className="acct-btn-danger">
              {t('Delete Account Permanently')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccountManagementPage;