import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Sun, Moon, LogIn, User, LayoutDashboard, LogOut, ChevronDown, Globe } from 'lucide-react';
import { gsap } from 'gsap';
import logo from '../assets/Note_Creep-removebg-preview.png';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const { isLoggedIn, logout, user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(true);

    const navbarRef = useRef(null);
    
    useEffect(() => {
        gsap.fromTo(navbarRef.current, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" });
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light');
            setIsDarkTheme(false);
        } else {
            document.documentElement.classList.remove('light');
            setIsDarkTheme(true);
        }
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -70; // Adjust this value to account for the fixed navbar height
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const handleNavigate = (path, id) => {
        if (location.pathname === '/') {
            // If already on the homepage, just scroll
            scrollToSection(id);
        } else {
            // If on another page, navigate and pass the ID as a state
            navigate(path, { state: { sectionId: id } });
        }
    };

    const handleLogoClick = () => {
        if (location.pathname === '/') {
            // If already on the homepage, scroll to the top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // If on another page, navigate to the homepage
            navigate('/');
        }
    };

    // Use useEffect to check for state changes and scroll
    useEffect(() => {
        if (location.state?.sectionId) {
            scrollToSection(location.state.sectionId);
            // Clear the state after scrolling to prevent unwanted scrolls on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state, location.pathname]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    const toggleLanguageMenu = () => {
        setIsLanguageMenuOpen(!isLanguageMenuOpen);
    };

    const toggleTheme = () => {
        const newTheme = !isDarkTheme;
        setIsDarkTheme(newTheme);
        if (newTheme) {
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        }
    };
    
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsLanguageMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsProfileMenuOpen(false);
    };

    return (
        <nav ref={navbarRef} className="fixed w-full top-0 left-0 z-50 bg-background/80 backdrop-blur-sm shadow-lg nav-bg-color">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Side: Logo */}
                    <div className="flex-shrink-0">
                        <button onClick={handleLogoClick} className="text-primary text-2xl font-bold">
                            <img src={logo} alt="Note Creep Logo" className="h-16 w-auto shadow-effect" />
                        </button>
                    </div>

                    {/* Right Side: Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Middle Links */}
                        <button onClick={() => handleNavigate('/', 'about-us')} className="shadow-effect text-white hover:text-secondary transition-colors duration-200">
                            {t('about_us')}
                        </button>
                        <button onClick={() => handleNavigate('/', 'faq')} className="shadow-effect text-white hover:text-secondary transition-colors duration-200">
                            {t('FAQ')}
                        </button>
                        <button onClick={() => handleNavigate('/', 'feedback')} className="shadow-effect text-white hover:text-secondary transition-colors duration-200">
                            {t('FEEDBACK')}
                        </button>
                        {isLoggedIn && (
                            <Link to="/notes" className="shadow-effect text-white hover:text-secondary transition-colors duration-200">
                                {t('notes')}
                            </Link>
                        )}
                        
                        {/* Right Side Links */}
                        <div className="flex items-center space-x-2">
                            {/* Theme Toggle: Only show on homepage */}
                            {location.pathname === '/' && (
                                <button onClick={toggleTheme} className="shadow-effect p-2 rounded-full text-white hover:bg-primary transition-colors duration-200">
                                    {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                            )}
                            
                            {/* Language Dropdown */}
                            <div className="relative">
                                <button onClick={toggleLanguageMenu} className="shadow-effect-2 p-2 rounded-full text-black hover:text-secondary hover:bg-transparent bg-secondary transition-colors duration-200 flex items-center">
                                    <Globe size={20} className={""}/>
                                    <ChevronDown size={16} className={`shadow-effect ml-1 transition-transform duration-300 ${isLanguageMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                                </button>
                                {isLanguageMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-28 bg-card rounded-md shadow-lg py-1">
                                        <button onClick={() => changeLanguage('en')} className="shadow-effect block px-4 text-white dropdown-lang-nav py-2 text-text w-full text-left">
                                            English
                                        </button>
                                        <button onClick={() => changeLanguage('bn')} className="shadow-effect block px-4 text-white dropdown-lang-nav py-2 text-text w-full text-left">
                                            বাংলা
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isLoggedIn ? (
                            <Link to="/login"
                                className="px-4 shadow-effect-2 py-2 bg-secondary nav-color-txt text-text rounded-full font-semibold transition-colors duration-200 hover:bg-primary-light flex items-center"
                            >
                                <LogIn size={18} className="mr-2 shadow-effect" />
                                {t('login')}
                            </Link>
                        ) : (
                            <div className="relative">
                                <button 
                                    onClick={toggleProfileMenu} 
                                    className="px-4 shadow-effect-2 py-2 bg-secondary nav-color-txt text-text rounded-full font-semibold transition-colors duration-200 hover:bg-primary-light flex items-center"
                                >
                                    <User size={18} className="mr-2 shadow-effect" />
                                    {t('profile')}
                                    <ChevronDown size={16} className={`ml-2 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                                </button>
                                {isProfileMenuOpen && (
                                    <div className="absolute profile-menu-o right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1">
                                        <Link to={`/profile/${user.username}`} onClick={() => setIsProfileMenuOpen(false)} className="flex profile-menu items-center px-4 py-2 text-text w-full">
                                            <User size={18} className="mr-2 shadow-effect" />
                                            {t('profile')}
                                        </Link>
                                        <Link to="/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="flex profile-menu items-center px-4 py-2 text-text w-full">
                                            <LayoutDashboard size={18} className="mr-2 shadow-effect" />
                                            {t('dashboard')}
                                        </Link>
                                        <button onClick={handleLogout} className="flex profile-menu items-center px-4 py-2 text-text w-full">
                                            <LogOut size={18} className="mr-2 shadow-effect" />
                                            {t('logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-2">
                        {/* Theme Toggle: Only show on homepage for mobile */}
                        {location.pathname === '/' && (
                            <button onClick={toggleTheme} className="shadow-effect p-2 rounded-full text-text focus:outline-none">
                                {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        )}
                        <div className="relative">
                            <button onClick={toggleLanguageMenu} className="shadow-effect p-2 rounded-full text-text focus:outline-none flex items-center">
                                <Globe size={20} />
                                <ChevronDown size={16} className={`shadow-effect ml-1 transition-transform duration-300 ${isLanguageMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </button>
                            {isLanguageMenuOpen && (
                                <div className="absolute right-0 mt-2 w-28 bg-card rounded-md shadow-lg py-1">
                                    <button onClick={() => changeLanguage('en')} className="shadow-effect block dropdown-lang-nav px-4 py-2 text-text w-full text-left">
                                        English
                                    </button>
                                    <button onClick={() => changeLanguage('bn')} className="shadow-effect block dropdown-lang-nav px-4 py-2 text-text w-full text-left">
                                        বাংলা
                                    </button>
                                </div>
                            )}
                        </div>
                        <button onClick={toggleMenu} className="text-text focus:outline-none">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile Menu (responsive) */}
            {isMenuOpen && (
                <div className="md:hidden bg-background/90 backdrop-blur-sm py-4 transition-all duration-300">
                    <div className="flex flex-col items-center space-y-4">
                        <button onClick={() => { handleNavigate('/', 'about-us'); toggleMenu(); }} className="shadow-effect text-text hover:text-secondary transition-colors duration-200">
                            {t('about_us')}
                        </button>
                        <button onClick={() => { handleNavigate('/', 'faq'); toggleMenu(); }} className="shadow-effect text-text hover:text-secondary transition-colors duration-200">
                            {t('faq')}
                        </button>
                        <button onClick={() => { handleNavigate('/', 'feedback'); toggleMenu(); }} className="shadow-effect text-text hover:text-secondary transition-colors duration-200">
                            {t('feedback')}
                        </button>
                        {isLoggedIn && (
                            <Link to="/notes" onClick={toggleMenu} className="shadow-effect text-text hover:text-secondary transition-colors duration-200">
                                {t('Notes')}
                            </Link>
                        )}
                        {!isLoggedIn ? (
                            <Link to="/login" onClick={toggleMenu} className="shadow-effect nav-color-txt px-4 py-2 w-fit bg-secondary text-text rounded-full font-semibold transition-colors duration-200 hover:bg-primary-light flex items-center">
                                <LogIn size={18} className="mr-2" />
                                {t('login')}
                            </Link>
                        ) : (
                            <div className="flex flex-col items-center space-y-2 w-full">
                                <button onClick={toggleProfileMenu} className="nav-color-txt px-4 py-2 w-fit bg-secondary text-text rounded-full font-semibold transition-colors duration-200 hover:bg-primary-light flex items-center">
                                    <User size={18} className="mr-2 shadow-effect" />
                                    {t('profile')}
                                </button>
                                {isProfileMenuOpen && (
                                    <div className="flex profile-menu-o flex-col items-center space-y-2">
                                        <Link to={`/profile/${user.username}`} onClick={toggleMenu} className="flex profile-menu items-center px-4 py-2 text-text w-full">
                                            <User size={18} className="mr-2 shadow-effect" />
                                            {t('profile')}
                                        </Link>
                                        <Link to="/dashboard" onClick={toggleMenu} className="flex profile-menu items-center px-4 py-2 text-text w-full">
                                            <LayoutDashboard size={18} className="mr-2 shadow-effect" />
                                            {t('dashboard')}
                                        </Link>
                                        <button onClick={handleLogout} className="flex profile-menu items-center px-4 py-2 text-text w-full">
                                            <LogOut size={18} className="mr-2 shadow-effect" />
                                            {t('logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;