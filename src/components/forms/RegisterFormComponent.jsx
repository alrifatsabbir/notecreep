import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faAt, faEnvelope, faLock, faEye, faEyeSlash, faUserPlus, faExclamationTriangle, faCheckCircle, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';

const RegisterFormComponent = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [showSuccess]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('Passwords do not match'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError(t('Password must be at least 8 characters'));
      setLoading(false);
      return;
    }

    try {
      await auth.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setShowSuccess(true);
      toast.success(t('Account created! Please check your email to verify.'));

      setTimeout(() => {
        navigate('/verify-email', { state: { email: formData.email } });
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || t('Registration failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div ref={formRef} className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ margin: '0 auto 16px', width: 64, height: 64, borderRadius: '50%', background: 'rgba(0, 191, 99, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 32, color: '#00bf63' }} />
        </div>
        <h2 className="auth-title">{t('Account Created!')}</h2>
        <p className="auth-subtitle" style={{ marginBottom: 0 }}>
          {t('Check your email for the verification link to activate your account.')}
        </p>
      </div>
    );
  }

  return (
    <div ref={formRef} className="auth-card">
      {/* Security Badge */}
      <div className="auth-badge">
        <span className="auth-badge-dot" />
        <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 11 }} />
        <span>{t('New Workspace')}</span>
      </div>

      <h2 className="auth-title">{t('Create Account')}</h2>
      <p className="auth-subtitle">{t('Join NoteCreep to organize and share your notes')}</p>

      {error && (
        <div className="auth-error-box">
          <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginTop: 2 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="auth-form-group">
          <label className="auth-label">{t('Full Name')}</label>
          <div className="auth-input-wrapper">
            <FontAwesomeIcon icon={faUser} className="auth-input-icon" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('Enter your full name...')}
              className="auth-input"
              required
            />
          </div>
        </div>

        {/* Username */}
        <div className="auth-form-group">
          <label className="auth-label">{t('Username')}</label>
          <div className="auth-input-wrapper">
            <FontAwesomeIcon icon={faAt} className="auth-input-icon" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={t('Choose a unique username...')}
              className="auth-input"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="auth-form-group">
          <label className="auth-label">{t('Email Address')}</label>
          <div className="auth-input-wrapper">
            <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('name@example.com')}
              className="auth-input"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="auth-form-group">
          <label className="auth-label">{t('Password')}</label>
          <div className="auth-input-wrapper">
            <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('At least 8 characters...')}
              className="auth-input"
              style={{ paddingRight: 40 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-eye-btn"
              title={showPassword ? t('Hide password') : t('Show password')}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="auth-form-group">
          <label className="auth-label">{t('Confirm Password')}</label>
          <div className="auth-input-wrapper">
            <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t('Re-enter password...')}
              className="auth-input"
              style={{ paddingRight: 40 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="auth-eye-btn"
              title={showConfirmPassword ? t('Hide password') : t('Show password')}
            >
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="auth-btn-primary">
          <FontAwesomeIcon icon={faUserPlus} />
          <span>{loading ? t('Creating Account...') : t('Create Account')}</span>
        </button>
      </form>

      {/* Footer Nav Links */}
      <div className="auth-footer-links">
        <span>
          {t('Already have an account?')}{' '}
          <Link to="/login" className="auth-link">
            {t('Sign In')}
          </Link>
        </span>
      </div>
    </div>
  );
};

export default RegisterFormComponent;