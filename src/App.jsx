import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './Pages/Dashboard/Homepage';
import LoginPage from './Pages/Auth/LoginPage';
import RegisterPage from './Pages/Auth/RegisterPage';
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
import Footer from './components/footer.jsx';
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

  // ✅ নতুন useEffect Hook-টি যুক্ত করা হয়েছে সম্পূর্ণ ওয়েবসাইটের সময় ট্র্যাক করার জন্য।
  useEffect(() => {
    let interval;
    if (isLoggedIn) {
      interval = setInterval(() => {
        analytics.updateSession({ time: 1 });
      }, 60000); // 60000ms = 1 minute
    }
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const currentLanguage = i18n.language;

  return (
    <>
      {isPageLoading && <PageLoader />}
      <div className={`min-h-screen ${currentLanguage === 'en' ? 'lang-en' : 'lang-bn'}`}>
        <Routes>
          <Route path="/" element={<HomePage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<LoginPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/signup" element={<RegisterPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/verify-email" element={<VerifyMailPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
          <Route path="/dashboard" element={<Dashboard isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />} />
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
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    </>
  );
};

export default App;