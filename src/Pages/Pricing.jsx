import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";

export default function Pricing() {
  const { t } = useTranslation();
  const headerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    // Animate header
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
    );

    // Animate cards with stagger
    cardRefs.current.forEach((el, index) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: index * 0.2, ease: "power3.out" }
      );

      // 3D hover effect
      const handleEnter = (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          rotateY: x * 0.05,
          rotateX: -y * 0.05,
          scale: 1.05,
          duration: 0.3,
          ease: "power1.out",
        });
      };
      const handleMove = (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          rotateY: x * 0.05,
          rotateX: -y * 0.05,
          duration: 0.3,
          ease: "power1.out",
        });
      };
      const handleLeave = () => {
        gsap.to(el, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.3, ease: "power1.out" });
      };

      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mousemove", handleMove);
      el.addEventListener("mouseleave", handleLeave);

      return () => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mousemove", handleMove);
        el.removeEventListener("mouseleave", handleLeave);
      };
    });
  }, []);

  const addCardRef = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  const plans = t("pricing.plans", { returnObjects: true });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-6 md:p-12">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <header ref={headerRef} className="mb-12 pt-12 text-center">
          <h1 className="text-5xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
            {t("pricing.title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            {t("pricing.subtitle")}
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              ref={addCardRef}
              className={`bg-gray-800 p-8 rounded-2xl shadow-xl transform will-change-transform transition-all duration-300 flex flex-col justify-between ${
                plan.disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
              <p className="text-gray-300 text-lg mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-gray-400"> / {plan.period}</span>
              </div>
              <ul className="list-disc list-inside text-gray-300 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <button
                disabled={plan.disabled}
                className={`mt-auto font-bold py-2 px-4 rounded-lg transition-colors duration-200 ${
                  plan.disabled
                    ? "bg-gray-600 text-gray-400"
                    : "bg-green-500 hover:bg-green-300 text-gray-900"
                }`}
              >
                {t("pricing.selectPlan")}
              </button>
            </div>
          ))}
        </main>

        <footer className="mt-16 font-bold text-white text-cente leading-relaxed max-w-3xl mx-auto">
          <p>{t("pricing.conclusion")}</p>
        </footer>
      </div>
    </div>
  );
}