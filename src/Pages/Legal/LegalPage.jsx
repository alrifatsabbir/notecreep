import React from 'react';
import Navbar from '../../components/Navbar';
import PrivacyPolicy from '../../components/Legals/PrivacyPolicy';
import TermsOfService from '../../components/Legals/TermsOfServices';
import SecurityPolicy from '../../components/Legals/SecurityPolicy';
import Licenses from '../../components/Legals/Licenses';
import { useTranslation } from 'react-i18next';

const LegalPage = () => {
    const { t } = useTranslation();
    return (
        <div className='bg-gray-800'>
            <Navbar />
            <div className="container mx-auto px-24 py-20 bg-gray-800 text-white min-h-screen">
                <h1 className="text-5xl font-bold mb-6 text-center">{t('Legal Information')}</h1>
                <div className="space-y-12">
                    <PrivacyPolicy />
                    <TermsOfService />
                    <SecurityPolicy />
                    <Licenses /> 
                </div>
            </div>
        </div>
    );
};

export default LegalPage;