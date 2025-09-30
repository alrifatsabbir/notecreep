import React, { useState, useRef, useEffect, useContext } from 'react';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
// ✅ auth from '../../services/api' থেকে auth এর পরিবর্তে সরাসরি login ফাংশন ব্যবহার করব
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';


const LoginFormComponent = () => {
    const { t, i18n } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const buttonRef = useRef(null);
    const signupTextRef = useRef(null);
    
    // ✅ AuthContext থেকে login ফাংশনটি নেওয়া হয়েছে
    const { login } = useContext(AuthContext);

    const navigate = useNavigate();

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(containerRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 })
          .fromTo(titleRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6 }, "-=0.5")
          .fromTo([usernameRef.current, passwordRef.current], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.2 }, "-=0.4")
          .fromTo(buttonRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6 }, "-=0.3")
          .fromTo(signupTextRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2");
        
        return () => tl.kill();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        gsap.to(buttonRef.current, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" });

        const loadingToastId = toast.loading(t('login.loading'));

        try {
            // ✅ এখানে সরাসরি Context-এর login ফাংশনটি কল করা হয়েছে
            await login({ username, password });

            toast.success(t('login.success'), {
                id: loadingToastId,
            });
            
            navigate('/'); 

        } catch (error) {
            toast.error(error.message || t('login.invalid'), {
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
            <h2 ref={titleRef} className="text-4xl sm:text-4xl font-extrabold text-white mb-8">{t('login.title')}</h2>
            
            <div className="flex gap-4 mb-4">
                <button onClick={() => changeLanguage('en')} className="text-sm font-bold text-white hover:text-[#00bf63] transition-colors">English</button>
                <button onClick={() => changeLanguage('bn')} className="text-sm font-bold text-white hover:text-[#00bf63] transition-colors">বাংলা</button>
            </div>
            
            <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div ref={usernameRef} className="relative">
                    <input
                        type="text"
                        placeholder={t('login.username')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bf63] transition-all duration-300"
                    />
                </div>
                
                <div ref={passwordRef} className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t('login.password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                
                <button
                    ref={buttonRef}
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#00bf63] text-white text-xl font-bold hover:bg-[#008f4c] transition-all duration-300 shadow-lg"
                >
                    {t('login.button')}
                </button>
            </form>
            
            <p ref={signupTextRef} className="mt-6 text-gray-300 text-sm">
                {t('login.notAccount')} <a href="/signup" className="text-[#c1ff72] hover:underline">{t('login.signUp')}</a>
            </p>
        </div>
    );
};

export default LoginFormComponent;