import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { auth } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPaperPlane, faShieldHalved, faExclamationTriangle, faCheckCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';
import './AuthPages.css';

const RequestPasswordReset = ({ isDarkTheme, toggleTheme }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const verified = searchParams.get('verified');
    const reset = searchParams.get('reset');
    
    if (verified === 'true') {
      setMessage(t('Email verified successfully! You can now login.'));
      setSuccess(true);
    }
    
    if (reset === 'true') {
      setMessage(t('Password reset successfully! Please login with your new password.'));
      setSuccess(true);
    }
  }, [searchParams, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await auth.requestPasswordReset(email);
      setMessage(response.message || t('Reset instructions sent to your email!'));
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || t('Failed to request reset'));
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
            <span>{t('Account Recovery')}</span>
          </div>

          <h2 className="auth-title">
            {success ? t('Check Your Email') : t('Forgot Password?')}
          </h2>
          
          {!success ? (
            <>
              <p className="auth-subtitle">
                {t("Enter your registered email address and we'll send you a link to reset your password.")}
              </p>

              {error && (
                <div className="auth-error-box">
                  <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginTop: 2 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="auth-form-group">
                  <label className="auth-label">{t('Email Address')}</label>
                  <div className="auth-input-wrapper">
                    <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('name@example.com')}
                      className="auth-input"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="auth-btn-primary"
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  <span>{loading ? t('Sending Link...') : t('Send Reset Link')}</span>
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ margin: '0 auto 16px', width: 64, height: 64, borderRadius: '50%', background: 'rgba(0, 191, 99, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 32, color: '#00bf63' }} />
              </div>
              <div className="auth-success-box" style={{ justifyContent: 'center', textAlign: 'center' }}>
                <span>{message}</span>
              </div>
              <p className="auth-subtitle" style={{ marginBottom: 20 }}>
                {t('Check your email inbox and click the reset link to choose a new password.')}
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

export default RequestPasswordReset;