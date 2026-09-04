import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash, faShieldHalved, faTimes, faCheck, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    variant: 'danger', // 'danger' | 'warning' | 'info'
    resolveRef: null
  });

  const backdropRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (modalState.isOpen) {
      if (backdropRef.current && cardRef.current) {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, scale: 0.9, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)' }
        );
      }
    }
  }, [modalState.isOpen]);

  const confirm = ({
    title = t('Are you sure?'),
    message = t('This action cannot be undone.'),
    confirmText = t('Confirm'),
    cancelText = t('Cancel'),
    variant = 'danger'
  }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        variant,
        resolveRef: resolve
      });
    });
  };

  const handleClose = (result) => {
    if (cardRef.current && backdropRef.current) {
      gsap.to(cardRef.current, { opacity: 0, scale: 0.9, duration: 0.2 });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          if (modalState.resolveRef) {
            modalState.resolveRef(result);
          }
          setModalState(prev => ({ ...prev, isOpen: false, resolveRef: null }));
        }
      });
    } else {
      if (modalState.resolveRef) {
        modalState.resolveRef(result);
      }
      setModalState(prev => ({ ...prev, isOpen: false, resolveRef: null }));
    }
  };

  const getVariantStyles = () => {
    switch (modalState.variant) {
      case 'danger':
        return {
          icon: faTrash,
          color: '#ef4444',
          badgeBg: 'rgba(239, 68, 68, 0.15)',
          badgeBorder: 'rgba(239, 68, 68, 0.3)',
          btnBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          btnShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
        };
      case 'warning':
        return {
          icon: faExclamationTriangle,
          color: '#f59e0b',
          badgeBg: 'rgba(245, 158, 11, 0.15)',
          badgeBorder: 'rgba(245, 158, 11, 0.3)',
          btnBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          btnShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
        };
      default:
        return {
          icon: faInfoCircle,
          color: '#3b82f6',
          badgeBg: 'rgba(59, 130, 246, 0.15)',
          badgeBorder: 'rgba(59, 130, 246, 0.3)',
          btnBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          btnShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {modalState.isOpen && (
        <div
          ref={backdropRef}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(4, 7, 13, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => handleClose(false)}
        >
          <div
            ref={cardRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#0d1117',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 20,
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 191, 99, 0.05)',
              color: '#ffffff',
              fontFamily: 'Inter, system-ui, sans-serif',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => handleClose(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <FontAwesomeIcon icon={faTimes} style={{ fontSize: 13 }} />
            </button>

            {/* Icon Banner */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: vStyles.badgeBg,
                border: `1px solid ${vStyles.badgeBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}
            >
              <FontAwesomeIcon icon={vStyles.icon} style={{ fontSize: 24, color: vStyles.color }} />
            </div>

            {/* Title & Message */}
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#ffffff', letterSpacing: '-0.3px' }}>
              {modalState.title}
            </h3>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.6 }}>
              {modalState.message}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => handleClose(false)}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  color: '#cbd5e1',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {modalState.cancelText}
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: vStyles.btnBg,
                  border: 'none',
                  borderRadius: 12,
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: vStyles.btnShadow,
                  transition: 'all 0.2s ease'
                }}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
