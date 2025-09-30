import React from 'react';
import { useTranslation } from 'react-i18next';

const PageLoader = () => {
  const { t } = useTranslation(); // ✅ This line was missing

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        <p className="mt-4 text-white font-medium">{t("Loading...")}</p>
      </div>
    </div>
  );
};

export default PageLoader;