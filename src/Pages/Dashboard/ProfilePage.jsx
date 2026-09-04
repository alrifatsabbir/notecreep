import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import PageLoader from '../../components/PageLoader';
import Back from '../../components/Back';
import toast from 'react-hot-toast';
import { auth } from '../../services/api';
import ProfileEditModal from '../../components/modals/ProfileEditModal';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faEnvelope, faCalendarAlt, faFileLines,
  faThumbtack, faTrash, faShareAlt, faCog, faSignOutAlt,
  faEdit, faClock, faCheckCircle, faTimesCircle,
  faShieldHalved, faLaptopCode
} from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';
import { getDicebearAvatar } from '../../utils/avatar';
import './ProfilePage.css';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { username } = useParams();
  const { user: loggedInUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  cardsRef.current = [];

  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  const isOwner = loggedInUser?.username === username;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) {
        setIsLoading(false);
        toast.error(t('Invalid URL: Username is missing.'));
        navigate('/dashboard');
        return;
      }
      setIsLoading(true);
      try {
        const response = await auth.getUserProfileWithStats(username);
        setProfileData(response.data.profile);
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error(t('Failed to load profile.'));
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [username, navigate, t]);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(containerRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7 }
      );

      if (cardsRef.current.length > 0) {
        tl.fromTo(cardsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          '-=0.4'
        );
      }
    }
  }, [isLoading]);

  if (isLoading) return <PageLoader />;

  if (!profileData) {
    return (
      <div className="profile-root" style={{ display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ textAlign: 'center', background: '#0d1117', border: '1px solid #1e293b', padding: 40, borderRadius: 16, maxWidth: 400 }}>
            <FontAwesomeIcon icon={faUser} style={{ fontSize: 48, color: '#334155', marginBottom: 16 }} />
            <h3 style={{ color: '#fff', fontSize: 18, margin: '0 0 8px' }}>{t('User Not Found')}</h3>
            <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 20px' }}>{t('Profile not found or could not be loaded.')}</p>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 20px', background: '#00bf63', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
              {t('Return to Dashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const joinDate = new Date(profileData.createdAt);
  const daysSinceJoin = Math.max(1, Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  const totalNotesCount = stats?.totalNotes || 0;
  const pinnedCount = stats?.totalPinned || 0;
  const trashCount = stats?.totalTrash || 0;
  const sharedCount = stats?.totalShared || 0;
  const grandTotal = totalNotesCount + trashCount;

  const activeRatio = grandTotal > 0 ? Math.round((totalNotesCount / grandTotal) * 100) : 100;
  const pinnedRatio = totalNotesCount > 0 ? Math.round((pinnedCount / totalNotesCount) * 100) : 0;

  return (
    <div className="profile-root">
      <div className="profile-ambient-bg" />
      <Navbar />

      <div ref={containerRef} className="profile-container">
        
        {/* Header Back Action */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Back inline />
          <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('User Profile Console')}
          </span>
        </div>

        {/* Hero Identity Banner */}
        <div className="profile-hero-card">
          <div className="profile-hero-layout">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar" style={{ overflow: 'hidden', padding: 4 }}>
                <img 
                  src={getDicebearAvatar(profileData.username)} 
                  alt={profileData.username} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div className="profile-avatar-pulse" title="Online" />
            </div>

            <div className="profile-identity-info">
              <div className="profile-name-row">
                <h1 className="profile-display-name">{profileData.name}</h1>

                <span className={`profile-role-badge ${profileData.role === 'admin' ? 'profile-role-admin' : 'profile-role-user'}`}>
                  {profileData.role ? t(profileData.role.toUpperCase()) : t('USER')}
                </span>

                <span className={`profile-verify-badge ${profileData.isVerified ? 'profile-verify-true' : 'profile-verify-false'}`}>
                  <FontAwesomeIcon icon={profileData.isVerified ? faCheckCircle : faTimesCircle} />
                  {profileData.isVerified ? t('Verified Account') : t('Pending Verification')}
                </span>
              </div>

              <div className="profile-handle">@{profileData.username}</div>

              <div className="profile-meta-strip">
                <div className="profile-meta-item">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>{profileData.email}</span>
                </div>
                <div className="profile-meta-item">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{t('Joined')} {joinDate.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="profile-meta-item">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{daysSinceJoin} {t('days member')}</span>
                </div>
              </div>
            </div>

            {isOwner && (
              <div style={{ flexShrink: 0 }}>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="profile-btn-action"
                  style={{ border: '1px solid rgba(0, 191, 99, 0.4)', color: '#00bf63' }}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>{t('Edit Profile')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Split Grid */}
        <div className="profile-grid">

          {/* Left Column: Bio & Note Telemetry */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Bio Card */}
            <div ref={addToCardsRef} className="profile-card">
              <div className="profile-card-header">
                <h3 className="profile-card-title">
                  <FontAwesomeIcon icon={faUser} style={{ color: '#00bf63' }} />
                  {t('Biography')}
                </h3>
                {isOwner && (
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12 }}
                  >
                    {t('Edit')}
                  </button>
                )}
              </div>
              <div className="profile-bio-box">
                <p className={`profile-bio-text ${!profileData.bio ? 'profile-bio-empty' : ''}`}>
                  {profileData.bio || t('No bio provided. Click "Edit Profile" to add one.')}
                </p>
              </div>
            </div>

            {/* Note Stats Grid */}
            <div ref={addToCardsRef} className="profile-card">
              <div className="profile-card-header">
                <h3 className="profile-card-title">
                  <FontAwesomeIcon icon={faFileLines} style={{ color: '#3b82f6' }} />
                  {t('Workspace Metrics')}
                </h3>
              </div>

              <div className="profile-stats-mini-grid">
                <Link to="/notes" className="profile-stat-box">
                  <div className="profile-stat-box-header">
                    <span className="profile-stat-label">{t('Active Notes')}</span>
                    <FontAwesomeIcon icon={faFileLines} style={{ color: '#00bf63', fontSize: 12 }} />
                  </div>
                  <div className="profile-stat-val">{totalNotesCount}</div>
                </Link>

                <Link to="/pinned" className="profile-stat-box">
                  <div className="profile-stat-box-header">
                    <span className="profile-stat-label">{t('Pinned')}</span>
                    <FontAwesomeIcon icon={faThumbtack} style={{ color: '#f59e0b', fontSize: 12 }} />
                  </div>
                  <div className="profile-stat-val">{pinnedCount}</div>
                </Link>

                <Link to="/trash" className="profile-stat-box">
                  <div className="profile-stat-box-header">
                    <span className="profile-stat-label">{t('Trash')}</span>
                    <FontAwesomeIcon icon={faTrash} style={{ color: '#ef4444', fontSize: 12 }} />
                  </div>
                  <div className="profile-stat-val">{trashCount}</div>
                </Link>

                <div className="profile-stat-box" style={{ cursor: 'default' }}>
                  <div className="profile-stat-box-header">
                    <span className="profile-stat-label">{t('Shared')}</span>
                    <FontAwesomeIcon icon={faShareAlt} style={{ color: '#3b82f6', fontSize: 12 }} />
                  </div>
                  <div className="profile-stat-val">{sharedCount}</div>
                </div>
              </div>

              {/* Health Progress Track */}
              <div className="profile-health-bar">
                <div className="profile-health-labels">
                  <span>{t('Note Health Ratio')}</span>
                  <span>{activeRatio}% {t('Active')}</span>
                </div>
                <div className="profile-health-track">
                  <div className="profile-health-fill-active" style={{ width: `${activeRatio}%` }} title={t('Active Notes')} />
                  <div className="profile-health-fill-trash" style={{ width: `${100 - activeRatio}%` }} title={t('Trashed Notes')} />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: System Telemetry & Quick Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Session & Account Security */}
            <div ref={addToCardsRef} className="profile-card">
              <div className="profile-card-header">
                <h3 className="profile-card-title">
                  <FontAwesomeIcon icon={faShieldHalved} style={{ color: '#a78bfa' }} />
                  {t('Account Security & Session')}
                </h3>
              </div>

              <div className="profile-telemetry-row">
                <span className="profile-telemetry-label">{t('Active Session Time')}</span>
                <span className="profile-telemetry-val" style={{ color: '#00bf63' }}>
                  {profileData.sessionTime || 0} {t('mins')}
                </span>
              </div>

              <div className="profile-telemetry-row">
                <span className="profile-telemetry-label">{t('Verification Status')}</span>
                <span className="profile-telemetry-val" style={{ color: profileData.isVerified ? '#00bf63' : '#f59e0b' }}>
                  {profileData.isVerified ? t('VERIFIED') : t('PENDING')}
                </span>
              </div>

              <div className="profile-telemetry-row">
                <span className="profile-telemetry-label">{t('Account Privilege')}</span>
                <span className="profile-telemetry-val" style={{ color: profileData.role === 'admin' ? '#a78bfa' : '#94a3b8' }}>
                  {t((profileData.role || 'user').toUpperCase())}
                </span>
              </div>

              <div className="profile-telemetry-row">
                <span className="profile-telemetry-label">{t('Pinned Ratio')}</span>
                <span className="profile-telemetry-val" style={{ color: '#f59e0b' }}>
                  {pinnedRatio}% {t('of active notes')}
                </span>
              </div>

              <div className="profile-telemetry-row">
                <span className="profile-telemetry-label">{t('Registered Date')}</span>
                <span className="profile-telemetry-val" style={{ color: '#64748b' }}>
                  {joinDate.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Quick Actions Card */}
            {isOwner && (
              <div ref={addToCardsRef} className="profile-card">
                <div className="profile-card-header">
                  <h3 className="profile-card-title">
                    <FontAwesomeIcon icon={faLaptopCode} style={{ color: '#00bf63' }} />
                    {t('Quick Actions')}
                  </h3>
                </div>

                <div className="profile-actions-grid">
                  <button 
                    onClick={() => navigate('/account-management')}
                    className="profile-btn-action"
                  >
                    <FontAwesomeIcon icon={faCog} style={{ color: '#3b82f6' }} />
                    <span>{t('Account Settings')}</span>
                  </button>

                  {profileData.role === 'admin' && (
                    <button 
                      onClick={() => navigate('/admin')}
                      className="profile-btn-action"
                      style={{ borderColor: 'rgba(139, 92, 246, 0.4)' }}
                    >
                      <FontAwesomeIcon icon={faShieldHalved} style={{ color: '#a78bfa' }} />
                      <span>{t('Admin Console')}</span>
                    </button>
                  )}

                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="profile-btn-action"
                  >
                    <FontAwesomeIcon icon={faEdit} style={{ color: '#f59e0b' }} />
                    <span>{t('Edit Bio')}</span>
                  </button>

                  <button 
                    onClick={() => { logout(); navigate('/login'); }}
                    className="profile-btn-action profile-btn-logout"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>{t('Sign Out')}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Edit Bio Modal */}
      {isOwner && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentBio={profileData.bio}
          onUpdate={(updatedData) => setProfileData(prev => ({ ...prev, ...updatedData }))}
        />
      )}
    </div>
  );
};

export default ProfilePage;
