import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Sun, Moon, LogIn, User, LayoutDashboard, LogOut, ChevronDown, Globe, Shield, Sparkles, HelpCircle, MessageSquare, FileText } from 'lucide-react';
import { gsap } from 'gsap';
import logo from '../assets/Note_Creep-removebg-preview.png';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { isLoggedIn, logout, user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const navbarRef = useRef(null);
  const profileRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      navbarRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      setIsDarkTheme(false);
    } else {
      document.documentElement.classList.remove('light');
      setIsDarkTheme(true);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLanguageMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleNavigate = (path, id) => {
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      scrollToSection(id);
    } else {
      navigate(path, { state: { sectionId: id } });
    }
  };

  const handleLogoClick = () => {
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    if (location.state?.sectionId) {
      scrollToSection(location.state.sectionId);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, location.pathname]);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    if (newTheme) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLanguageMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const currentLangCode = i18n.language === 'bn' ? 'BN' : 'EN';

  return (
    <header
      ref={navbarRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(13, 17, 23, 0.92)'
          : 'rgba(13, 17, 23, 0.8)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: scrolled
          ? '1px solid rgba(0, 191, 99, 0.25)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: scrolled
          ? '0 10px 30px -10px rgba(0, 0, 0, 0.8)'
          : '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={handleLogoClick}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <img
                src={logo}
                alt="NoteCreep Logo"
                style={{
                  height: 54,
                  width: 'auto',
                  maxWidth: 220,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 14px rgba(0, 191, 99, 0.45))'
                }}
              />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-desktop-links" style={{ alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => handleNavigate('/', 'about-us')}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                background: 'transparent',
                border: '1px solid transparent',
                color: '#cbd5e1',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <Sparkles size={14} style={{ color: '#00bf63' }} />
              {t('about_us')}
            </button>

            <button
              onClick={() => handleNavigate('/', 'faq')}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                background: 'transparent',
                border: '1px solid transparent',
                color: '#cbd5e1',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <HelpCircle size={14} style={{ color: '#3b82f6' }} />
              {t('FAQ')}
            </button>

            <button
              onClick={() => handleNavigate('/', 'feedback')}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                background: 'transparent',
                border: '1px solid transparent',
                color: '#cbd5e1',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <MessageSquare size={14} style={{ color: '#a78bfa' }} />
              {t('FEEDBACK')}
            </button>

            {isLoggedIn && (
              <Link
                to="/notes"
                style={{
                  padding: '7px 14px',
                  borderRadius: 20,
                  background: location.pathname === '/notes' ? 'rgba(0, 191, 99, 0.15)' : 'transparent',
                  border: location.pathname === '/notes' ? '1px solid rgba(0, 191, 99, 0.3)' : '1px solid transparent',
                  color: location.pathname === '/notes' ? '#00bf63' : '#cbd5e1',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <FileText size={14} />
                {t('notes')}
              </Link>
            )}
          </nav>

          {/* Right Action Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            
            {/* Notification Bell */}
            <NotificationBell />

            {/* Language Switcher Dropdown */}
            <div style={{ position: 'relative' }} ref={langRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                style={{
                  height: 36,
                  padding: '0 10px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Globe size={14} style={{ color: '#00bf63' }} />
                <span>{currentLangCode}</span>
                <ChevronDown
                  size={12}
                  style={{
                    color: '#64748b',
                    transform: isLanguageMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>

              {isLanguageMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 42,
                    width: 120,
                    background: '#0d1117',
                    border: '1px solid #1e293b',
                    borderRadius: 12,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.85)',
                    padding: 4,
                    zIndex: 1100
                  }}
                >
                  <button
                    onClick={() => changeLanguage('en')}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: i18n.language !== 'bn' ? 'rgba(0,191,99,0.1)' : 'transparent',
                      color: i18n.language !== 'bn' ? '#00bf63' : '#cbd5e1',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>English</span>
                    {i18n.language !== 'bn' && <span style={{ fontSize: 10 }}>✓</span>}
                  </button>

                  <button
                    onClick={() => changeLanguage('bn')}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: i18n.language === 'bn' ? 'rgba(0,191,99,0.1)' : 'transparent',
                      color: i18n.language === 'bn' ? '#00bf63' : '#cbd5e1',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>বাংলা</span>
                    {i18n.language === 'bn' && <span style={{ fontSize: 10 }}>✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Theme Toggle */}
            {location.pathname === '/' && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="nav-desktop-links"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}

            {/* Desktop User Profile / Auth CTA */}
            <div className="nav-desktop-links" style={{ alignItems: 'center' }}>
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  style={{
                    padding: '7px 16px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #00bf63 0%, #008f4c 100%)',
                    color: '#000',
                    fontSize: 13,
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(0, 191, 99, 0.3)'
                  }}
                >
                  <LogIn size={15} />
                  <span>{t('login')}</span>
                </Link>
              ) : (
                <div style={{ position: 'relative' }} ref={profileRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    style={{
                      padding: '4px 10px 4px 4px',
                      borderRadius: 24,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(user?.username || 'user')}&backgroundColor=0d1117,0a1628`}
                        alt={user?.username}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#0a0e1a',
                          border: '1px solid rgba(0, 191, 99, 0.5)',
                          objectFit: 'cover'
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#00bf63',
                          border: '2px solid #0d1117'
                        }}
                      />
                    </div>

                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                      {user?.username}
                    </span>

                    <ChevronDown
                      size={12}
                      style={{
                        color: '#94a3b8',
                        transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}
                    />
                  </button>

                  {/* Profile Popover Dropdown */}
                  {isProfileMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 44,
                        width: 200,
                        background: '#0d1117',
                        border: '1px solid #1e293b',
                        borderRadius: 14,
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
                        padding: 6,
                        zIndex: 1100,
                        backdropFilter: 'blur(16px)'
                      }}
                    >
                      <div style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{user?.username}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{user?.email}</div>
                      </div>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 10px',
                            borderRadius: 8,
                            color: '#00bf63',
                            fontWeight: 700,
                            fontSize: 12,
                            textDecoration: 'none'
                          }}
                        >
                          <Shield size={15} />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <Link
                        to={`/profile/${user?.username}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          borderRadius: 8,
                          color: '#cbd5e1',
                          fontWeight: 600,
                          fontSize: 12,
                          textDecoration: 'none'
                        }}
                      >
                        <User size={15} />
                        <span>{t('profile')}</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          borderRadius: 8,
                          color: '#cbd5e1',
                          fontWeight: 600,
                          fontSize: 12,
                          textDecoration: 'none'
                        }}
                      >
                        <LayoutDashboard size={15} />
                        <span>{t('dashboard')}</span>
                      </Link>

                      <div style={{ height: 1, background: '#1e293b', margin: '4px 0' }} />

                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          borderRadius: 8,
                          color: '#ef4444',
                          fontWeight: 600,
                          fontSize: 12,
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <LogOut size={15} />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="nav-mobile-toggle"
              aria-label="Toggle Mobile Menu"
              style={{
                width: 36,
                height: 36,
                padding: 0,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div
          className="nav-mobile-toggle"
          style={{
            width: '100%',
            background: '#0d1117',
            borderBottom: '1px solid #1e293b',
            padding: '16px',
            backdropFilter: 'blur(24px)',
            flexDirection: 'column',
            gap: 10,
            boxSizing: 'border-box'
          }}
        >
          {/* User Profile Card (Mobile) */}
          {!isLoggedIn ? (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #00bf63 0%, #008f4c 100%)',
                color: '#000',
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxSizing: 'border-box'
              }}
            >
              <LogIn size={16} />
              <span>{t('login')}</span>
            </Link>
          ) : (
            <div
              style={{
                width: '100%',
                padding: 14,
                background: '#161b22',
                borderRadius: 14,
                border: '1px solid #21262d',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(user?.username || 'user')}&backgroundColor=0d1117,0a1628`}
                  alt={user?.username}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: '#0a0e1a', border: '1px solid #00bf63' }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{user?.username}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{user?.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'rgba(0,191,99,0.15)', color: '#00bf63', fontSize: 12, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to={`/profile/${user?.username}`}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#21262d', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
                >
                  Profile
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#21262d', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
                >
                  Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Links - Full Width Uniform Cards */}
          <button
            onClick={() => handleNavigate('/', 'about-us')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              background: '#161b22',
              border: '1px solid #21262d',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxSizing: 'border-box'
            }}
          >
            <Sparkles size={16} style={{ color: '#00bf63' }} />
            <span>{t('about_us')}</span>
          </button>

          <button
            onClick={() => handleNavigate('/', 'faq')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              background: '#161b22',
              border: '1px solid #21262d',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxSizing: 'border-box'
            }}
          >
            <HelpCircle size={16} style={{ color: '#3b82f6' }} />
            <span>{t('FAQ')}</span>
          </button>

          <button
            onClick={() => handleNavigate('/', 'feedback')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              background: '#161b22',
              border: '1px solid #21262d',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxSizing: 'border-box'
            }}
          >
            <MessageSquare size={16} style={{ color: '#a78bfa' }} />
            <span>{t('FEEDBACK')}</span>
          </button>

          {isLoggedIn && (
            <Link
              to="/notes"
              onClick={() => setIsMenuOpen(false)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(0,191,99,0.1)',
                border: '1px solid rgba(0,191,99,0.3)',
                color: '#00bf63',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxSizing: 'border-box'
              }}
            >
              <FileText size={16} />
              <span>{t('notes')}</span>
            </Link>
          )}

          {/* Theme Toggle - Full Width Row */}
          {location.pathname === '/' && (
            <button
              onClick={toggleTheme}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                background: '#161b22',
                border: '1px solid #21262d',
                color: '#94a3b8',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box'
              }}
            >
              <span>{isDarkTheme ? 'Dark Mode' : 'Light Mode'}</span>
              {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {/* Logout Button - Full Width Row */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxSizing: 'border-box'
              }}
            >
              <LogOut size={16} />
              <span>{t('logout')}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;