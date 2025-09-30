import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6">{t('privacyPolicy.title')}</h2>

            <p className="mb-6">{t('privacyPolicy.introduction')}</p>

            {/* Section 1 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section1.title')}</h3>
            <p className="mb-4">{t('privacyPolicy.section1.body')}</p>
            <ul className="list-disc ml-6 mb-6">
                <li>{t('privacyPolicy.section1.li1')}</li>
                <li>{t('privacyPolicy.section1.li2')}</li>
                <li>{t('privacyPolicy.section1.li3')}</li>
                <li>{t('privacyPolicy.section1.li4')}</li>
                <li>{t('privacyPolicy.section1.li5')}</li>
            </ul>

            {/* Section 2 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section2.title')}</h3>
            <p className="mb-4">{t('privacyPolicy.section2.body')}</p>
            <ul className="list-disc ml-6 mb-6">
                <li>{t('privacyPolicy.section2.li1')}</li>
                <li>{t('privacyPolicy.section2.li2')}</li>
                <li>{t('privacyPolicy.section2.li3')}</li>
                <li>{t('privacyPolicy.section2.li4')}</li>
                <li>{t('privacyPolicy.section2.li5')}</li>
                <li>{t('privacyPolicy.section2.li6')}</li>
            </ul>

            {/* Section 3 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section3.title')}</h3>
            <p className="mb-6">{t('privacyPolicy.section3.body')}</p>

            {/* Section 4 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section4.title')}</h3>
            <p className="mb-6">{t('privacyPolicy.section4.body')}</p>

            {/* Section 5 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section5.title')}</h3>
            <p className="mb-4">{t('privacyPolicy.section5.intro')}</p>
            <ul className="list-disc ml-6 mb-6">
                <li>{t('privacyPolicy.section5.li1')}</li>
                <li>{t('privacyPolicy.section5.li2')}</li>
                <li>{t('privacyPolicy.section5.li3')}</li>
                <li>{t('privacyPolicy.section5.li4')}</li>
                <li>{t('privacyPolicy.section5.li5')}</li>
            </ul>

            {/* Section 6 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section6.title')}</h3>
            <p className="mb-6">{t('privacyPolicy.section6.body')}</p>

            {/* Section 7 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section7.title')}</h3>
            <p className="mb-6">{t('privacyPolicy.section7.body')}</p>

            {/* Section 8 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section8.title')}</h3>
            <p className="mb-6">{t('privacyPolicy.section8.body')}</p>

            {/* Section 9 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section9.title')}</h3>
            <p className="mb-6">{t('privacyPolicy.section9.body')}</p>

            {/* Section 10 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section10.title')}</h3>
            <p className="mb-6">{t('privacyPolicy.section10.body')}</p>

            {/* Section 11 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section11.title')}</h3>
            <p className="mb-6">{t('privacyPolicy.section11.body')}</p>

            {/* Section 12 */}
            <h3 className="text-2xl font-semibold mb-3">{t('privacyPolicy.section12.title')}</h3>
            <p className="mb-6">{t('privacyPolicy.section12.body')}</p>

            {/* Closing */}
            <p className="mt-8 font-medium">{t('privacyPolicy.closing')}</p>
        </div>
    );
};

export default PrivacyPolicy;
