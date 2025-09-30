import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import Navbar from "../Components/Navbar";

export default function Features() {
  const { t } = useTranslation();
  const headerRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
    );

    sectionRefs.current.forEach((el, index) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: index * 0.2, ease: "power3.out" }
      );

      const handleEnter = () => gsap.to(el, { scale: 1.03, duration: 0.25 });
      const handleLeave = () => gsap.to(el, { scale: 1, duration: 0.25 });

      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);

      return () => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
      };
    });
  }, []);

  const addSectionRef = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  const sections = t("features.sections", { returnObjects: true });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-6 md:p-12">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <header ref={headerRef} className="mb-12 pt-12 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
            {t("features.title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            {t("features.subtitle")}
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {sections.map((sec, idx) => (
            <article
              key={idx}
              ref={addSectionRef}
              className="p-6 bg-gray-800 rounded-2xl shadow-xl transform will-change-transform hover:shadow-2xl transition-shadow duration-300"
            >
              <h2 className="text-2xl font-bold mb-4">{sec.title}</h2>
              {sec.paragraphs.map((p, i) => (
                <p key={i} className="text-gray-300 leading-relaxed mb-4">
                  {p}
                </p>
              ))}
              {sec.list && sec.list.length > 0 && (
                <ul className="list-disc list-inside text-gray-300 mb-4">
                  {sec.list.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </main>

        <footer className="mt-16 text-center font-bold text-white leading-relaxed max-w-3xl mx-auto">
          <p>{t("features.conclusion")}</p>
        </footer>
      </div>
    </div>
  );
}
