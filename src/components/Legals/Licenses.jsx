import React from 'react';
import { useTranslation } from 'react-i18next';

const Licenses = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">{t('licenses.title')}</h2>

      <p className="mb-4">
        <strong>{t('licenses.effectiveDate')}</strong>
      </p>

      <p className="mb-4">{t('licenses.intro')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('licenses.section1.title')}</h3>
      <p className="mb-4">{t('licenses.section1.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('licenses.section2.title')}</h3>
      <p className="mb-4">{t('licenses.section2.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('licenses.section3.title')}</h3>
      <p className="mb-4">{t('licenses.section3.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('licenses.section4.title')}</h3>
      <p className="mb-4">{t('licenses.section4.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('licenses.section5.title')}</h3>
      <p className="mb-4">{t('licenses.section5.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('licenses.section6.title')}</h3>
      <p className="mb-4">{t('licenses.section6.body')}</p>

      <h3 className="text-xl font-semibold mb-2">{t('licenses.section7.title')}</h3>
      <p className="mb-4">{t('licenses.section7.body')}</p>

      <p className="mt-6">{t('licenses.thanks')}</p>
    </div>
  );
};

export default Licenses;
