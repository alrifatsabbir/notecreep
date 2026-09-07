import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './Pages/Dashboard/HomePage.jsx';
import LoginPage from './Pages/Auth/LoginPage';
import RegisterPage from './Pages/Auth/RegisterPage';
import RequestPasswordReset from './Pages/Auth/RequestPasswordReset.jsx';
import ResetPassword from './Pages/Auth/ResetPassword.jsx';
import Note from './Pages/Dashboard/NotesPage.jsx';
import NotFound from './Pages/NotFound';
import { Toaster } from 'react-hot-toast';
import VerifyMailPage from './Pages/Auth/VerifyMailPage';
import Dashboard from './Pages/Dashboard/Dashboard';
import PageLoader from './components/PageLoader.jsx';
import PinnedNotesPage from './Pages/Dashboard/PinnedNotes.jsx';
import TrashPage from './Pages/Dashboard/TrashPage.jsx';
import NoteFormPage from './Pages/Dashboard/NoteFormPage.jsx';
import ProfilePage from './Pages/Dashboard/ProfilePage.jsx';
import AccountManagementPage from './Pages/Dashboard/AccountManagementPage.jsx';
import { useTranslation } from 'react-i18next';
import { AuthContext } from './context/AuthContext';
import { analytics } from './services/api';
import ViewNotePage from './Pages/Dashboard/ViewNotePage.jsx';
import AdminDashboard from './Pages/Dashboard/AdminDashboard.jsx';
import Footer from './components/Footer.jsx';
import LegalPageSection from './Pages/Legal/LegalPage.jsx';
import Features from './Pages/Features.jsx';
import Pricing from './Pages/Pricing.jsx';

const App = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const { isLoggedIn } = useContext(AuthContext);
  
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? false : true; 
  });

  const toggleTheme = () => {
    setIsDarkTheme(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkTheme]);

  useEffect(() => {
    setIsPageLoading(true);
    const timeout = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Real-time Active Time Tracking (No hallucination, visibility-aware, idle-safe, multi-tab deduplicated)
  useEffect(() => {
    if (!isLoggedIn) return;

    let lastActiveTime = Date.now();
    const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes idle threshold

    const onUserActivity = () => {
      lastActiveTime = Date.now();
    };

    window.addEventListener('mousemove', onUserActivity, { passive: true });
    window.addEventListener('keydown', onUserActivity, { passive: true });
    window.addEventListener('scroll', onUserActivity, { passive: true });
    window.addEventListener('click', onUserActivity, { passive: true });
    window.addEventListener('touchstart', onUserActivity, { passive: true });

    const interval = setInterval(() => {
      // 1. Only track if tab is currently visible
      if (document.hidden || (typeof document.visibilityState !== 'undefined' && document.visibilityState !== 'visible')) {
        return;
      }

      // 2. Only track if user had active interactions recently (prevents idle AFK accumulation)
      const isIdle = Date.now() - lastActiveTime > IDLE_TIMEOUT_MS;
      if (isIdle) {
        return;
      }

      // 3. Multi-tab deduplication via localStorage timestamp
      const now = Date.now();
      const lastPing = Number(localStorage.getItem('notecreep_last_session_ping') || 0);
      if (now - lastPing < 50000) {
        // Another active tab already logged this minute
        return;
      }
      localStorage.setItem('notecreep_last_session_ping', String(now));

      // 4. Local timezone & date resolution (defaults to Asia/Dhaka / user browser local)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka';
      const clientDate = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());

      analytics.updateSession({ time: 1, timezone, clientDate }).catch(() => {});
    }, 60000); // 1-minute heartbeat

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', onUserActivity);
      window.removeEventListener('keydown', onUserActivity);
      window.removeEventListener('scroll', onUserActivity);
      window.removeEventListener('click', onUserActivity);
      window.removeEventListener('touchstart', onUserActivity);
    };
  }, [isLoggedIn]);

  const currentLanguage = i18n.language;

  return (
    <>
      {isPageLoading && <PageLoader />}
      <div className={`min-h-screen ${currentLanguage === 'en' ? 'lang-en' : 'lang-bn'}`}>
        <Routes>
          <Route path="/" element={<HomePage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<LoginPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/register" element={<RegisterPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/verify-email" element={<VerifyMailPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/request-password-reset" element={<RequestPasswordReset isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}/>} />
          <Route path="/reset-password" element={<ResetPassword isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}/>} />
          <Route path="/dashboard" element={<Dashboard isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/admin" element={<AdminDashboard isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/notes" element={<Note isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/pinned" element={<PinnedNotesPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}/>} />
          <Route path="/trash" element={<TrashPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}/>} />
          <Route path="*" element={<NotFound isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/create" element={<NoteFormPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} /> 
          <Route path="/edit/:id" element={<NoteFormPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/shared-note/:id" element={<NoteFormPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/profile/:username" element={<ProfilePage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}/>}/>
          <Route path="/account-management" element={<AccountManagementPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}/>}/>
          <Route path="/view/:id" element={<ViewNotePage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}/>} />
          {/* Add more routes as needed */}
          <Route path="/legal/privacy" element={<LegalPageSection section="privacy" isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/legal/terms" element={<LegalPageSection section="terms" isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/legal/security" element={<LegalPageSection section="security" isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/legal/licenses" element={<LegalPageSection section="licenses" isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/features" element={<Features isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}/>}/>
          <Route path="/pricing" element={<Pricing isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}/>}/>
        </Routes>
        <Footer isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0d1117',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '12px 18px',
              fontSize: '14px',
              fontFamily: 'Inter, system-ui, sans-serif',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 191, 99, 0.1)',
              backdropFilter: 'blur(12px)',
            },
            success: {
              iconTheme: {
                primary: '#00bf63',
                secondary: '#000000',
              },
              style: {
                border: '1px solid rgba(0, 191, 99, 0.3)',
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }
            },
            loading: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }
            }
          }}
        />
      </div>
    </>
  );
};

export default App;