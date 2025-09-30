import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar.jsx';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';

// Import local assets
import backgroundVideo from '../../assets/background.mp4';
import heroImage from '../../assets/hell1.jpg';
import heroImage1 from '../../assets/hell2.jpg';
import NoteCreepSVG from '../../assets/Note_Creep-removebg-preview.svg';
import feedbackImage from '../../assets/91024.png';

// Import icons
import { ChevronDown, Mail } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const HomePage = () => {
    const { isLoggedIn } = useContext(AuthContext);
    const { t } = useTranslation();
    const sectionRefs = useRef([]);
    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const scrollToSection = (id) => {
        gsap.to(window, {
            duration: 1.5,
            scrollTo: `#${id}`,
            ease: "power2.inOut"
        });
    };

    useEffect(() => {
        // ... (আপনার GSAP কোড অপরিবর্তিত) ...
        // GSAP Scroll Animation for the first 3 sections
        const backgrounds = gsap.utils.toArray('.background-scroll');
        backgrounds.forEach((background, i) => {
            gsap.fromTo(background, { scale: 1.2, opacity: 0.8 }, {
                scale: 1,
                opacity: 1,
                ease: "power1.inOut",
                scrollTrigger: {
                    trigger: sectionRefs.current[i],
                    start: "top center",
                    end: "bottom center",
                    toggleActions: "play reverse play reverse"
                }
            });
        });

        // Animation for hero text
        gsap.fromTo(".hero-text-animated h1, .hero-text-animated p, .hero-text-animated .hero-button, .hero-text-animated img", {
            y: 50,
            opacity: 0,
        }, {
            y: 0,
            opacity: 1,
            stagger: 0.3,
            duration: 1.2,
            ease: "power3.out",
        });

        // Animation for number counters
        const counterElements = gsap.utils.toArray('.counter-number');
        counterElements.forEach(counter => {
            gsap.fromTo(counter, {
                innerText: 0
            }, {
                innerText: counter.dataset.count,
                duration: 2,
                snap: "innerText",
                ease: "power1.inOut",
                scrollTrigger: {
                    trigger: counter,
                    start: "top center",
                    toggleActions: "play none none reverse",
                }
            });
        });

        // Animation for About Us text
        gsap.fromTo(".about-us-content h2, .about-us-content p", {
            y: 50,
            opacity: 0,
        }, {
            y: 0,
            opacity: 1,
            stagger: 0.2,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".about-us-content",
                start: "top center",
                toggleActions: "play none none reverse",
            },
        });

        // Animation for About Us SVG
        gsap.fromTo(".about-us-svg", {
            scale: 0.8,
            opacity: 0,
            rotation: -10,
        }, {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".about-us-svg",
                start: "top center",
                toggleActions: "play none none reverse",
            },
        });

        // --- Parallax Animation for the last 3 sections ---

        // Parallax for Services Section Background Video
        gsap.to(".services-section-background-video", {
            y: 100,
            ease: "none",
            scrollTrigger: {
                trigger: ".services-section",
                scrub: true,
                start: "top bottom",
                end: "bottom top",
            }
        });

        // Parallax for FAQ Section
        gsap.to(".faq-section-background", {
            y: -150,
            ease: "none",
            scrollTrigger: {
                trigger: ".faq-section",
                scrub: true,
                start: "top bottom",
                end: "bottom top",
            }
        });

        // Parallax for Feedback Section
        gsap.to(".feedback-section-background", {
            y: 50,
            ease: "none",
            scrollTrigger: {
                trigger: ".feedback-section",
                scrub: true,
                start: "top bottom",
                end: "bottom top",
            }
        });

        // Animate the services section content (new staggered fade-in)
        gsap.fromTo(".services-content > *, .services-content .service-item", {
            y: 50,
            opacity: 0,
        }, {
            y: 0,
            opacity: 1,
            stagger: 0.2,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".services-section",
                start: "top 75%",
                toggleActions: "play none none reverse",
            },
        });

        // Animate the FAQ section content (new staggered fade-in)
        gsap.fromTo(".faq-section > *", {
            y: 50,
            opacity: 0,
        }, {
            y: 0,
            opacity: 1,
            stagger: 0.2,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".faq-section",
                start: "top 75%",
                toggleActions: "play none none reverse",
            },
        });

        // Animate the feedback section content (new staggered fade-in)
        gsap.fromTo(".feedback-content > *", {
            y: 50,
            opacity: 0,
        }, {
            y: 0,
            opacity: 1,
            stagger: 0.2,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".feedback-section",
                start: "top 75%",
                toggleActions: "play none none reverse",
            },
        });
    }, []);

    const addSectionRef = (el) => {
        if (el && !sectionRefs.current.includes(el)) {
            sectionRefs.current.push(el);
        }
    };

    return (
        <div className="bg-background text-text min-h-screen overflow-x-hidden" id="home">
            <Navbar onNavigate={scrollToSection} />
            {/* Section 1: Hero Section */}
            <div 
                ref={addSectionRef}
                className="relative min-h-screen flex flex-col items-center justify-center text-center p-4 sm:p-8"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center background-scroll"
                    style={{ backgroundImage: `url(${heroImage})` }}
                ></div>
                <div className="absolute inset-0 bg-background hero-bg-per opacity-70"></div>
                <div className="relative z-10 hero-text-animated px-4 sm:px-8 max-w-full">
                    <img src={NoteCreepSVG} alt="Note Creep Logo" className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-4" />
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-2 md:mb-4 text-primary leading-tight">
                        {t('hero_title')}
                    </h1>
                    <p className="text-md sm:text-lg md:text-xl max-w-4xl mx-auto font-bold">
                        {t('hero_subtitle')}
                    </p>
                    <div className="mt-8 md:mt-12 hero-button">
                        <Link to={isLoggedIn ? "/dashboard" : "/login"} className="px-6 py-3 md:px-10 md:py-5 bg-secondary txt-hr-section1 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl font-bold text-lg">
                            {t('lets_note')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Section 2: User Stats */}
            <div 
                ref={addSectionRef}
                className="relative min-h-[35vh] flex items-center justify-center text-center bg-secondary py-8 px-4 z-10"
            >
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 w-full max-w-6xl mx-auto">
                    <div className="flex flex-col items-center justify-center txt-hr-section2">
                        <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold counter-number" data-count="150"></span>
                        <p className="text-lg md:text-xl mt-2">{t('users')}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center txt-hr-section2">
                        <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold counter-number" data-count="1"></span>
                        <p className="text-lg md:text-xl mt-2">{t('years')}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center txt-hr-section2">
                        <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold counter-number" data-count="17"></span>
                        <p className="text-lg md:text-xl mt-2">{t('creep_blocked')}</p>
                    </div>
                </div>
            </div>

            {/* Section 3: About Us */}
            <div
                ref={addSectionRef} id='about-us'
                className="relative min-h-screen flex flex-col md:flex-row items-center justify-center bg-background px-4 py-16"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center background-scroll"
                    style={{ backgroundImage: `url(${heroImage1})` }}
                ></div>
                <div className="absolute inset-0 bg-background hero-bg-per opacity-70"></div>
                <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
                    <div className="about-us-svg p-4">
                        <img src={NoteCreepSVG} alt="Note Creep Animated" className="w-full h-auto bg-hero-sec3" />
                    </div>
                    <div className="about-us-content p-4 ">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-primary txt-shade">{t('about_us_title')}</h2>
                        <p className="text-base md:text-lg text-text font-bold leading-relaxed">
                            {t('about_us_text')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 4: Services Section (Parallax) */}
            <div 
                ref={addSectionRef}
                className="relative min-h-screen flex items-center justify-center services-section p-4 overflow-hidden"
            >
                <video
                    className="absolute inset-0 w-full h-full object-cover services-section-background-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    src={backgroundVideo}
                ></video>
                <div className="absolute inset-0 bg-background hero-bg-per opacity-70"></div>
                <div className="relative z-10 text-center text-text w-full max-w-6xl mx-auto services-content p-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-primary">{t('services_title')}</h2>
                    <p className="text-base md:text-xl font-light mb-8 md:mb-12">{t('services_subtitle')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
                        <div className="bg-card p-6 md:p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 service-item">
                            <h3 className="text-xl md:text-2xl font-semibold mb-2 text-secondary">{t('service_1_title')}</h3>
                            <p className="text-sm font-light">{t('service_1_text')}</p>
                        </div>
                        <div className="bg-card p-6 md:p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 service-item">
                            <h3 className="text-xl md:text-2xl font-semibold mb-2 text-secondary">{t('service_2_title')}</h3>
                            <p className="text-sm font-light">{t('service_2_text')}</p>
                        </div>
                        <div className="bg-card p-6 md:p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 service-item">
                            <h3 className="text-xl md:text-2xl font-semibold mb-2 text-secondary">{t('service_3_title')}</h3>
                            <p className="text-sm font-light">{t('service_3_text')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 5: FAQ Section (Parallax) */}
            <div
                ref={addSectionRef} id="faq"
                className="relative min-h-screen py-16 md:py-24 flex flex-col items-center bg-card faq-section px-4"
            >
                <div className="absolute inset-0 bg-background faq-section-background"></div>
                <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 md:mb-12 text-primary">{t('faq_title')}</h2>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="faq-item">
                                <div
                                    className="bg-card p-4 md:p-6 rounded-lg shadow-md cursor-pointer flex justify-between items-center transition-colors duration-200 hover:bg-card-hover"
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <span className="text-base md:text-lg font-semibold">{t(`faq_${index + 1}_question`)}</span>
                                    <ChevronDown className={`transform transition-transform duration-300 ${openFAQ === index ? 'rotate-180' : 'rotate-0'}`} />
                                </div>
                                {openFAQ === index && (
                                    <div className="p-4 md:p-6 bg-card-light rounded-b-lg shadow-inner mt-2">
                                        <p className="text-sm text-text leading-relaxed">{t(`faq_${index + 1}_answer`)}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Section 6: Feedback Section (Parallax) */}
            <div
                id="feedback"
                ref={addSectionRef} 
                className="relative min-h-[45vh] pb-24 flex items-center justify-center pt-5 text-center feedback-section px-4 overflow-hidden"
            >
                <div 
                    className="absolute inset-0 bg-cover bg-center feedback-section-background"
                    style={{ backgroundImage: `url(${feedbackImage})` }}
                ></div>
                <div className="absolute inset-0 bg-background hero-bg-per opacity-60"></div>
                <div className="relative z-10 p-4 feedback-content">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-primary">
                        {t('feedback_title')}
                    </h2>
                    <p className="text-base md:text-xl font-light mb-6 md:mb-8 text-text">
                        {t('feedback_text')}
                    </p>
                    <a href="mailto:alrifatsabbir@gmail.com" className="group">
                        <Mail className="w-10 h-10 md:w-12 md:h-12 text-secondary mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                        <span className="text-lg md:text-2xl font-semibold text-secondary transition-colors duration-200 group-hover:underline">
                            alrifatsabbir@gmail.com
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HomePage;