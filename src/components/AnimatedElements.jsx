import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import UserIcon from '../assets/UserIcon.jsx';
import NoteCreepSVG from '../assets/Note_Creep-removebg-preview.svg';

gsap.registerPlugin(ScrollTrigger);

const AnimatedElements = () => {
  const userIconRef = useRef(null);
  const noteCreepRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(userIconRef.current, {
      y: -50,
      opacity: 0,
      rotation: -30
    }, {
      y: 0,
      opacity: 1,
      rotation: 0,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top center",
      }
    });

    gsap.fromTo(noteCreepRef.current, {
      x: 100,
      opacity: 0,
      scale: 0.8
    }, {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 1.5,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top center",
      }
    });

    gsap.fromTo([titleRef.current, subtitleRef.current], {
      y: 20,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.3,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top center",
      }
    });

    gsap.to(".parallax-bg", {
      y: 200,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full bg-text-dark bg-opacity-70 text-text-light p-4">
      <div ref={userIconRef} className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-primary opacity-0">
        <UserIcon /> 
      </div>

      <img 
        ref={noteCreepRef} 
        src={NoteCreepSVG} 
        alt="Note Creep" 
        className="absolute bottom-1/4 right-1/4 w-32 h-32 opacity-0" 
      />

      <h1 ref={titleRef} className="text-4xl md:text-6xl font-bold mb-4 opacity-0 text-primary">
        আপনার নোটগুলি সুন্দর করে সাজান
      </h1>
      <p ref={subtitleRef} className="text-lg md:text-xl text-center mb-8 max-w-2xl opacity-0">
        একটি সহজ এবং সুন্দর নোট অ্যাপ যা আপনাকে আপনার চিন্তা এবং ধারণাগুলো সংরক্ষণ করতে সাহায্য করবে।
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="px-6 py-2 bg-primary text-text-light rounded-md shadow-md hover:bg-secondary transition-colors duration-200">
          লগইন করুন
        </Link>
        <Link to="/register" className="px-6 py-2 bg-secondary text-text-dark rounded-md shadow-md hover:bg-primary transition-colors duration-200">
          রেজিস্টার করুন
        </Link>
      </div>
    </div>
  );
};

export default AnimatedElements;