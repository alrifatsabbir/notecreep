import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { auth } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faKey, faShieldHalved, faPaperPlane, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

const VerifyMailFormComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState(() => searchParams.get('email') || location.state?.email || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationState, setVerificationState] = useState('initial'); // 'initial' | 'link-verifying' | 'otp-form'

  const cardRef = useRef(null);

  // Sync email if location.state or searchParams changes
  useEffect(() => {
    const queryEmail = searchParams.get('email');
    const stateEmail = location.state?.email;
    if (queryEmail || stateEmail) {
      setEmail(queryEmail || stateEmail || '');
    }
  }, [searchParams, location.state]);

  // GSAP entry animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [verificationState]);

  // Check for token link verification in URL
  useEffect(() => {
    const token = searchParams.get('token');
    const id = searchParams.get('id');

    if (token && id) {
      setVerificationState('link-verifying');
      handleLinkVerification(token, id);
    } else {
      setVerificationState('otp-form');
    }
  }, [searchParams]);

  const handleLinkVerification = async (token, id) => {
    setIsVerifying(true);
    const loadingToastId = toast.loading(t('verifyMail.linkVerifying'));
    try {
      await auth.verifyEmailByLink({ token, id });
      toast.success(t('verifyMail.success'), { id: loadingToastId });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('verifyMail.invalidLink');
      toast.error(errorMessage, { id: loadingToastId });
      setVerificationState('otp-form');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (!email) return toast.error(t('verifyMail.emailRequired'));
    if (!otp) return toast.error(t('verifyMail.otpRequired'));

    setIsVerifying(true);
    const loadingToastId = toast.loading(t('verifyMail.verifying'));
    try {
      await auth.verifyEmailByOtp({ email, otp });
      toast.success(t('verifyMail.success'), { id: loadingToastId });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.msg || t('verifyMail.invalidOtp');
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error(t('verifyMail.emailRequired'));
      return;
    }

    setIsResending(true);
    const loadingToastId = toast.loading(t('verifyMail.resending'));
    try {
      await auth.resendOTP({ email });
      toast.success(t('verifyMail.resendSuccess'), { id: loadingToastId });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.msg || t('verifyMail.resendError');
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setIsResending(false);
    }
  };

  if (verificationState === 'link-verifying') {
    return (
      <div ref={cardRef} className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ margin: '0 auto 16px', width: 64, height: 64, borderRadius: '50%', background: 'rgba(0, 191, 99, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 28, color: '#00bf63' }} />
        </div>
        <h2 className="auth-title">{t('verifyMail.linkVerifyingTitle')}</h2>
        <p className="auth-subtitle">
          {t('verifyMail.linkVerifyingMessage')}
        </p>
      </div>
    );
  }

  return (
    <div ref={cardRef} className="auth-card">
      {/* Security Badge */}
      <div className="auth-badge">
        <span className="auth-badge-dot" />
        <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 11 }} />
        <span>{t('Email Verification')}</span>
      </div>

      <h2 className="auth-title">{t('verifyMail.title')}</h2>
      <p className="auth-subtitle">
        {t('verifyMail.subtitle')}
      </p>

      <form onSubmit={handleOtpVerification}>
        {/* Email Field */}
        <div className="auth-form-group">
          <label className="auth-label">{t('Email Address')}</label>
          <div className="auth-input-wrapper">
            <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder={t('verifyMail.emailPlaceholder')}
              required
            />
          </div>
        </div>

        {/* OTP Code Field */}
        <div className="auth-form-group">
          <label className="auth-label">{t('Verification Code (OTP)')}</label>
          <div className="auth-input-wrapper">
            <FontAwesomeIcon icon={faKey} className="auth-input-icon" />
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={t('verifyMail.otpPlaceholder')}
              className="auth-input auth-otp-input"
              required
              disabled={isVerifying}
              autoFocus
            />
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isVerifying} className="auth-btn-primary">
          <FontAwesomeIcon icon={isVerifying ? faSpinner : faCheckCircle} spin={isVerifying} />
          <span>
            {isVerifying ? t('verifyMail.verifying') : t('verifyMail.button')}
          </span>
        </button>
      </form>

      {/* Resend Action Button */}
      <div className="auth-footer-links">
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={isResending || isVerifying || !email}
          className="auth-link-secondary"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FontAwesomeIcon icon={isResending ? faSpinner : faPaperPlane} spin={isResending} style={{ fontSize: 12 }} />
          <span>
            {isResending ? t('verifyMail.resending') : t('verifyMail.resendOtp')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default VerifyMailFormComponent;
