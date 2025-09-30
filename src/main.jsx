import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n.js';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx'; // ✅ AuthProvider এবং AuthContext import করা হয়েছে
import { BrowserRouter } from 'react-router-dom';
import PageLoader from './components/PageLoader.jsx'; // ✅ Loader import করা হয়েছে

const RootComponent = () => {
  const { isLoading } = useContext(AuthContext); // ✅ AuthContext থেকে isLoading স্টেট নেওয়া হচ্ছে

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <RootComponent />
      </AuthProvider>
    </I18nextProvider>
  </React.StrictMode>,
);

