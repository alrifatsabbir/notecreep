// src/components/forms/VerifyMailFormComponent.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { auth } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

const VerifyMailFormComponent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationState, setVerificationState] = useState('initial'); // 'initial' | 'link-verifying' | 'otp-form'

    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const formRef = useRef(null);

    // GSAP animation
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo(containerRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 })
          .fromTo(titleRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6 }, '-=0.5')
          .fromTo(formRef.current?.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.4');
        return () => tl.kill();
    }, [verificationState]);

    // Check for link verification
    useEffect(() => {
        const token = searchParams.get('token');
        const id = searchParams.get('id');

        if (token && id) {
            setVerificationState('link-verifying');
            handleLinkVerification(token, id);
        } else {
            setVerificationState('otp-form');
        }
    }, [searchParams]);

    const handleLinkVerification = async (token, id) => {
        setIsVerifying(true);
        const loadingToastId = toast.loading(t('verifyMail.linkVerifying'));
        try {
            await auth.verifyEmailByLink({ token, id });
            toast.success(t('verifyMail.success'), { id: loadingToastId });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('verifyMail.invalidLink');
            toast.error(errorMessage, { id: loadingToastId });
            setVerificationState('otp-form');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleOtpVerification = async (e) => {
        e.preventDefault();
        if (!otp) return toast.error(t('verifyMail.otpRequired'));
        setIsVerifying(true);
        const loadingToastId = toast.loading(t('verifyMail.otpVerifying'));
        try {
            await auth.verifyEmailByOtp({ email, otp });
            toast.success(t('verifyMail.success'), { id: loadingToastId });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('verifyMail.invalidOtp');
            toast.error(errorMessage, { id: loadingToastId });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            toast.error(t('verifyMail.emailRequired'));
            return;
        }
        const loadingToastId = toast.loading(t('verifyMail.resending'));
        try {
            await auth.resendOTP({ email });
            toast.success(t('verifyMail.resendSuccess'), { id: loadingToastId });
        } catch (error) {
            const errorMessage = error.response?.data?.msg || t('verifyMail.resendError');
            toast.error(errorMessage, { id: loadingToastId });
        }
    };

    if (verificationState === 'link-verifying') {
        return (
            <div ref={containerRef} className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl relative z-10 max-w-md w-full text-white">
                <h2 ref={titleRef} className="text-4xl sm:text-2xl font-extrabold mb-4">{t('verifyMail.linkVerifyingTitle')}</h2>
                <p className="text-gray-300">{t('verifyMail.linkVerifyingMessage')}</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl relative z-10 max-w-md w-full">
            <h2 ref={titleRef} className="text-4xl sm:text-2xl font-extrabold text-white mb-8">{t('verifyMail.title')}</h2>
            <form ref={formRef} onSubmit={handleOtpVerification} className="w-full space-y-6">
                <div className="relative">
                    <input
                        type="email"
                        name="email"
                        placeholder={t('verifyMail.emailPlaceholder')}
                        value={email}
                        readOnly
                        className="w-full p-4 rounded-xl bg-gray-800 text-gray-400 placeholder-gray-400 focus:outline-none transition-all duration-300 pr-12 cursor-not-allowed"
                        required
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FontAwesomeIcon icon={faLock} />
                    </div>
                </div>
                <input
                    type="text"
                    name="otp"
                    placeholder={t('verifyMail.otpPlaceholder')}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bf63] transition-all duration-300"
                    required
                    disabled={isVerifying}
                />
                <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-4 rounded-xl bg-[#00bf63] text-white text-xl font-bold hover:bg-[#008f4c] transition-all duration-300 shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isVerifying ? t('verifyMail.verifying') : t('verifyMail.button')}
                </button>
            </form>
            <button
                onClick={handleResendOtp}
                disabled={isVerifying || !email}
                className="mt-4 text-sm font-bold text-white hover:text-[#c1ff72] transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                {t('verifyMail.resendOtp')}
            </button>
        </div>
    );
};

export default VerifyMailFormComponent;
