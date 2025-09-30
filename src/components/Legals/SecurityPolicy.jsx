import React from 'react';
import { useTranslation } from 'react-i18next';

const SecurityPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">{t('securityPolicy.title')}</h2>

      <p className="mb-4">
        <strong>{t('securityPolicy.effectiveDate')}</strong>
      </p>

      <p className="mb-4">{t('securityPolicy.intro')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('securityPolicy.section1.title')}</h3>
      <p className="mb-4">{t('securityPolicy.section1.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('securityPolicy.section2.title')}</h3>
      <p className="mb-4">{t('securityPolicy.section2.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('securityPolicy.section3.title')}</h3>
      <p className="mb-4">{t('securityPolicy.section3.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('securityPolicy.section4.title')}</h3>
      <p className="mb-4">{t('securityPolicy.section4.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('securityPolicy.section5.title')}</h3>
      <p className="mb-4">{t('securityPolicy.section5.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('securityPolicy.section6.title')}</h3>
      <p className="mb-4">{t('securityPolicy.section6.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('securityPolicy.section7.title')}</h3>
      <p className="mb-4">{t('securityPolicy.section7.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('securityPolicy.section8.title')}</h3>
      <p className="mb-4">{t('securityPolicy.section8.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('securityPolicy.section9.title')}</h3>
      <p className="mb-4">{t('securityPolicy.section9.body')}</p>

      <p className="mt-6">{t('securityPolicy.thanks')}</p>
    </div>
  );
};

export default SecurityPolicy;
