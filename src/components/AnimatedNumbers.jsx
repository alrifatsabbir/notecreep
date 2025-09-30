// src/components/AnimatedNumbers.jsx

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const AnimatedNumbers = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = ''; 

        const numNumbers = 50;

        for (let i = 0; i < numNumbers; i++) {
            const span = document.createElement('span');
            span.textContent = Math.floor(Math.random() * 10);
            span.style.position = 'absolute';
            span.style.color = 'rgba(255, 255, 255, 0.1)';
            span.style.fontSize = `${gsap.utils.random(20, 80)}px`;
            span.style.pointerEvents = 'none';
            container.appendChild(span);

            gsap.fromTo(span,
                {
                    x: gsap.utils.random(0, window.innerWidth),
                    y: gsap.utils.random(0, window.innerHeight),
                    opacity: 0,
                    scale: 0.5,
                    rotation: gsap.utils.random(-180, 180),
                },
                {
                    x: gsap.utils.random(0, window.innerWidth),
                    y: gsap.utils.random(0, window.innerHeight),
                    opacity: gsap.utils.random(0.05, 0.2),
                    scale: 1,
                    rotation: gsap.utils.random(-180, 180),
                    duration: gsap.utils.random(10, 20),
                    ease: "none",
                    repeat: -1,
                    yoyo: true,
                    delay: gsap.utils.random(0, 5),
                    onUpdate: function () {
                        const currentX = gsap.getProperty(this.targets()[0], "x");
                        const currentY = gsap.getProperty(this.targets()[0], "y");
                        
                        const mouseX = window.gsapMouseX || window.innerWidth / 2;
                        const mouseY = window.gsapMouseY || window.innerHeight / 2;

                        const dist = Math.sqrt(Math.pow(mouseX - currentX, 2) + Math.pow(mouseY - currentY, 2));

                        if (dist < 150) {
                            gsap.to(this.targets()[0], { opacity: 0.3, duration: 0.2 });
                        } else {
                            gsap.to(this.targets()[0], { opacity: gsap.utils.random(0.05, 0.2), duration: 0.2 });
                        }
                    }
                }
            );
        }

        const trackMouse = (e) => {
            window.gsapMouseX = e.clientX;
            window.gsapMouseY = e.clientY;
        };
        window.addEventListener('mousemove', trackMouse);

        return () => {
            window.removeEventListener('mousemove', trackMouse);
            gsap.killTweensOf(container.children);
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            style={{ 
                position: 'absolute', // Changed from fixed
                inset: 0, 
                zIndex: -1, 
                overflow: 'hidden',
                backgroundColor: '#1a1a2e'
            }} 
        />
    );
};

export default AnimatedNumbers;