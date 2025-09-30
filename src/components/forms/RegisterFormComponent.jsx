// src/components/forms/RegisterFormComponent.jsx

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { auth } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const RegisterFormComponent = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const formRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(containerRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 })
            .fromTo(titleRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6 }, "-=0.5")
            .fromTo(formRef.current?.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, "-=0.4");
        return () => tl.kill();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error(t('register.passwordMismatch'));
            return;
        }

        const loadingToastId = toast.loading(t('register.loading'));

        try {
            await auth.register({ 
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            toast.success(t('register.success'), {
                id: loadingToastId,
            });

            // Redirect to the correct verification page with email as a query parameter
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);

        } catch (error) {
            let errorMessage = t('register.invalid'); 
            
            if (error.response && error.response.data && error.response.data.message) {
                const serverMessage = error.response.data.message.toLowerCase();

                if (serverMessage.includes('username') && serverMessage.includes('in use')) {
                    errorMessage = t('register.usernameInUse');
                } else if (serverMessage.includes('email') && serverMessage.includes('in use')) {
                    errorMessage = t('register.emailInUse');
                } else if (serverMessage.includes('password') && serverMessage.includes('8 digit')) {
                    errorMessage = t('register.passwordMinLength');
                } else {
                    errorMessage = error.response.data.message;
                }
            }
            
            toast.error(errorMessage, {
                id: loadingToastId,
            });
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl relative z-10 max-w-md w-full"
        >
            <h2 ref={titleRef} className="text-4xl sm:text-2xl font-extrabold text-white mb-8">{t('register.title')}</h2>
            <div className="flex gap-4 mb-4">
                <button onClick={() => changeLanguage('en')} className="text-sm font-bold text-white hover:text-[#00bf63] transition-colors">English</button>
                <button onClick={() => changeLanguage('bn')} className="text-sm font-bold text-white hover:text-[#00bf63] transition-colors">বাংলা</button>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="w-full space-y-6">
                <input
                    type="text"
                    name="name"
                    placeholder={t('register.name')}
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bf63] transition-all duration-300"
                />
                <input
                    type="text"
                    name="username"
                    placeholder={t('register.username')}
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bf63] transition-all duration-300"
                />
                <input
                    type="email"
                    name="email"
                    placeholder={t('register.email')}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bf63] transition-all duration-300"
                />
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={t('register.password')}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bf63] transition-all duration-300 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                </div>
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder={t('register.confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bf63] transition-all duration-300"
                />
                <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#00bf63] text-white text-xl font-bold hover:bg-[#008f4c] transition-all duration-300 shadow-lg"
                >
                    {t('register.button')}
                </button>
            </form>
            <p className="mt-6 text-gray-300 text-sm">
                {t('register.haveAccount')} <a href="/login" className="text-[#c1ff72] hover:underline">{t('register.signIn')}</a>
            </p>
        </div>
    );
};

export default RegisterFormComponent;