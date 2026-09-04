import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';

const Back = ({ inline = false }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const buttonRef = useRef(null);

    useEffect(() => {
        if (buttonRef.current) {
            gsap.fromTo(buttonRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
        }
    }, []);

    const handleGoBack = () => {
        navigate(-1);
    };

    if (inline) {
        return (
            <button
                ref={buttonRef}
                onClick={handleGoBack}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#0d1117',
                    border: '1px solid #1e293b',
                    color: '#00bf63',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#00bf63'; e.currentTarget.style.background = '#111827'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.background = '#0d1117'; }}
                title={t("Go Back")}
            >
                <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 14 }} />
            </button>
        );
    }

    return (
        <button
            ref={buttonRef}
            onClick={handleGoBack}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0d1117] text-[#00bf63] hover:bg-[#111827] border border-[#1e293b] hover:border-[#00bf63] shadow-md transition-all cursor-pointer"
            title={t("Go Back")}
        >
            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
        </button>
    );
};

export default Back;