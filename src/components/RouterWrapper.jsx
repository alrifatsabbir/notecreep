import React from 'react';
import { useNavigation } from 'react-router-dom';
import PageLoader from './PageLoader'; // ✅ PageLoader import করা হয়েছে

const RouterWrapper = ({ children }) => {
  const navigation = useNavigation();

  if (navigation.state === 'loading') {
    return <PageLoader />;
  }

  return <>{children}</>;
};

export default RouterWrapper;