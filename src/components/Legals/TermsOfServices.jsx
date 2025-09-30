import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">{t('termsOfService.title')}</h2>

      <p className="mb-4">
        <strong>{t('termsOfService.effectiveDate')}</strong>
      </p>

      <p className="mb-4">{t('termsOfService.intro')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section1.title')}</h3>
      <p className="mb-4">{t('termsOfService.section1.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section2.title')}</h3>
      <p className="mb-4">{t('termsOfService.section2.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section3.title')}</h3>
      <p className="mb-4">{t('termsOfService.section3.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section4.title')}</h3>
      <p className="mb-4">{t('termsOfService.section4.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section5.title')}</h3>
      <p className="mb-4">{t('termsOfService.section5.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section6.title')}</h3>
      <p className="mb-4">{t('termsOfService.section6.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section7.title')}</h3>
      <p className="mb-4">{t('termsOfService.section7.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section8.title')}</h3>
      <p className="mb-4">{t('termsOfService.section8.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section9.title')}</h3>
      <p className="mb-4">{t('termsOfService.section9.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section10.title')}</h3>
      <p className="mb-4">{t('termsOfService.section10.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section11.title')}</h3>
      <p className="mb-4">{t('termsOfService.section11.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section12.title')}</h3>
      <p className="mb-4">{t('termsOfService.section12.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('termsOfService.section13.title')}</h3>
      <p className="mb-4">{t('termsOfService.section13.body')}</p>

      <p className="mt-6">{t('termsOfService.thanks')}</p>
    </div>
  );
};

export default TermsOfService;
