import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faRightToBracket, faExclamationTriangle, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';

const LoginFormComponent = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      toast.success(t('Login successful!'));
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      if (err.response?.data?.needsVerification) {
        setError(t('Please verify your email first. Check your inbox!'));
        setTimeout(() => {
          navigate('/verify-email', { state: { email: err.response.data.email } });
        }, 2000);
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={formRef} className="auth-card">
      {/* Security Pill Badge */}
      <div className="auth-badge">
        <span className="auth-badge-dot" />
        <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 11 }} />
        <span>{t('Secure Portal')}</span>
      </div>

      <h2 className="auth-title">{t('Welcome Back')}</h2>
      <p className="auth-subtitle">{t('Sign in to access your NoteCreep workspace')}</p>

      {error && (
        <div className="auth-error-box">
          <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginTop: 2 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Username Field */}
        <div className="auth-form-group">
          <label className="auth-label">{t('Username or Email')}</label>
          <div className="auth-input-wrapper">
            <FontAwesomeIcon icon={faUser} className="auth-input-icon" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={t('Enter your username...')}
              className="auth-input"
              autoComplete="username"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="auth-form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="auth-label" style={{ margin: 0 }}>{t('Password')}</label>
            <Link to="/request-password-reset" className="auth-link-secondary" style={{ fontSize: 12 }}>
              {t('Forgot Password?')}
            </Link>
          </div>
          <div className="auth-input-wrapper">
            <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('Enter your password...')}
              className="auth-input"
              style={{ paddingRight: 40 }}
              autoComplete="current-password"
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

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="auth-btn-primary">
          <FontAwesomeIcon icon={faRightToBracket} />
          <span>{loading ? t('Signing in...') : t('Sign In')}</span>
        </button>
      </form>

      {/* Footer Nav Links */}
      <div className="auth-footer-links">
        <span>
          {t("Don't have an account?")}{' '}
          <Link to="/register" className="auth-link">
            {t('Create Account')}
          </Link>
        </span>
      </div>
    </div>
  );
};

export default LoginFormComponent;