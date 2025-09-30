import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';

gsap.registerPlugin(TextPlugin);

const NotFound = () => {
    const { t } = useTranslation();
    const mainContentRef = useRef(null);
    const backgroundRef = useRef(null);
    const notFoundTextsRef = useRef(null);

    const characters = "0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?";
    const total404s = 15;
    const allIndices = Array.from({ length: total404s }).map((_, i) => i);
    const centralIndex = Math.floor(total404s / 2);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // --- Animate the background full of random characters ---
        let randomString = '';
        for (let i = 0; i < 2000; i++) {
            randomString += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        backgroundRef.current.innerText = randomString;
        gsap.to(backgroundRef.current, { opacity: 0.1, duration: 2, delay: 0.5 });

        // --- Animate all 404 texts with randomization effect ---
        const animate404s = () => {
            gsap.fromTo(notFoundTextsRef.current.querySelectorAll('.four-oh-four'),
                { opacity: 0, y: 50, innerText: "" },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 1.5,
                    ease: "back.out(1.7)",
                    innerText: "404",
                    scrambleText: {
                        chars: characters,
                        speed: 0.5,
                        delimiter: ""
                    }
                }
            );
        };
        
        // This is a single effect for all the animations
        // Main content appears first, then the 404s
        tl.fromTo(mainContentRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, delay: 0.5 }
        ).then(() => {
            // Start the 404 randomization after the main content is visible
            animate404s();
        });

    }, []);

    return (
        <div 
            className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 relative font-mono overflow-hidden"
        >
            {/* Background of random characters */}
            <div 
                ref={backgroundRef} 
                className="absolute inset-0 z-0 text-2xl leading-tight text-gray-700 whitespace-pre-wrap break-all"
            >
                {/* Random text will be populated here by JS */}
            </div>

            {/* The animated 404s container */}
            <div ref={notFoundTextsRef} className="absolute inset-0 grid grid-cols-10 md:grid-cols-20 lg:grid-cols-25 gap-2 z-10 p-2">
                {Array.from({ length: 250 }).map((_, index) => (
                    index % 18 === 0 && index < 250 && allIndices.length > 0 ? (
                        <span 
                            key={index}
                            className={`four-oh-four text-xl sm:text-2xl font-bold opacity-0 
                                ${allIndices[0] === centralIndex ? 'text-primary' : 'text-red-600'}
                            `}
                        >
                            404
                        </span>
                    ) : (
                        <span key={index} className="text-xl sm:text-2xl text-transparent">
                            &nbsp;
                        </span>
                    )
                ))}
            </div>

            {/* Main content - floated on top */}
            <div ref={mainContentRef} className="main-content z-20 flex flex-col items-center justify-center text-center opacity-0">
                <h1 className="text-8xl sm:text-9xl md:text-[10rem] font-extrabold text-primary mb-4 select-none">
                    404
                </h1>
                <h2 className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-white mb-6">
                    NOT FOUND
                </h2>
                <p className="text-xl sm:text-2xl font-light mb-8 max-w-lg">
                    {t('not_found_message')}
                </p>
                <Link 
                    to="/" 
                    className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                    <Home size={24} className="mr-3" />
                    {t('go_to_homepage')}
                </Link>
            </div>
        </div>
    );
};

export default NotFound;