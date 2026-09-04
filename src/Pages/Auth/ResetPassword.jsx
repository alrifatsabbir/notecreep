import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { auth } from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash, faKey, faShieldHalved, faExclamationTriangle, faCheckCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';
import './AuthPages.css';

const ResetPassword = ({ isDarkTheme, toggleTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('Passwords do not match'));
      return;
    }

    if (password.length < 8) {
      setError(t('Password must be at least 8 characters'));
      return;
    }

    setLoading(true);
    try {
      if (auth.resetPassword) {
        await auth.resetPassword({ token, email, password });
      }
      setSuccess(true);
      toast.success(t('Password updated successfully!'));
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || t('Failed to reset password. Link may be expired.');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Background Ambient Orbs */}
      <div className="auth-ambient-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      {/* Navbar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <Navbar isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
      </div>

      {/* Form Card */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center', padding: '100px 20px 40px' }}>
        <div ref={cardRef} className="auth-card">

          {/* Security Badge */}
          <div className="auth-badge">
            <span className="auth-badge-dot" />
            <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 11 }} />
            <span>{t('Set New Password')}</span>
          </div>

          <h2 className="auth-title">{t('Reset Password')}</h2>
          <p className="auth-subtitle">
            {t('Enter your new account password below')}
          </p>

          {error && (
            <div className="auth-error-box">
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="auth-form-group">
                <label className="auth-label">{t('New Password')}</label>
                <div className="auth-input-wrapper">
                  <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('At least 8 characters...')}
                    className="auth-input"
                    style={{ paddingRight: 40 }}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-eye-btn"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="auth-form-group">
                <label className="auth-label">{t('Confirm New Password')}</label>
                <div className="auth-input-wrapper">
                  <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('Re-enter new password...')}
                    className="auth-input"
                    style={{ paddingRight: 40 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="auth-eye-btn"
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-btn-primary">
                <FontAwesomeIcon icon={faKey} />
                <span>{loading ? t('Updating Password...') : t('Update Password')}</span>
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ margin: '0 auto 16px', width: 64, height: 64, borderRadius: '50%', background: 'rgba(0, 191, 99, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 32, color: '#00bf63' }} />
              </div>
              <h3 style={{ color: '#fff', fontSize: 18, margin: '0 0 8px' }}>{t('Password Updated!')}</h3>
              <p className="auth-subtitle">
                {t('Your password has been changed. Redirecting to login...')}
              </p>
            </div>
          )}

          {/* Footer Nav Link */}
          <div className="auth-footer-links">
            <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 12 }} />
              <span>{t('Back to Sign In')}</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
