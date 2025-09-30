import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

const Back = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const buttonRef = useRef(null);

    useEffect(() => {
        if (buttonRef.current) {
            gsap.fromTo(buttonRef.current, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
        }
    }, []);

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <button
            ref={buttonRef}
            onClick={handleGoBack}
            className="hidden xl:block relative top-40 left-24 z-40 p-2 rounded-full bg-[#c1ff72] text-black hover:text-[#c1ff72] hover:bg-transparent border border-[#c1ff72] shadow-lg transition-transform"
            title={t("Go Back")}
        >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
        </button>
    );
};

export default Back;