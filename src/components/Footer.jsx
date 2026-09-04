import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Lightbulb,
  Building,
  Users,
  Scale,
  Mail,
  ExternalLink,
  Download,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import NoteCreepLogo from '../assets/Note_Creep-removebg-preview.png';

const Footer = () => {
  const { t } = useTranslation();
  const footerRef = useRef(null);
  const currentYear = new Date().getFullYear();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const footerSections = [
    {
      title: t('footer.Product & Features'),
      Icon: Lightbulb,
      links: [
        { name: t('footer.Features'), path: '/features' },
        { name: t('footer.Pricing'), path: '/pricing' },
        { name: t('footer.Dashboard'), path: '/dashboard' },
      ]
    },
    {
      title: t('footer.Company & Info'),
      Icon: Building,
      links: [
        { name: t('footer.About'), path: '/#about-us' },
        { name: t('footer.FAQ'), path: '/#faq' },
        { name: t('footer.Contact'), path: '/#feedback' },
      ]
    },
    {
      title: t('footer.Community'),
      Icon: Users,
      links: [
        { name: 'LinkedIn', path: 'https://www.linkedin.com/in/alrifatsabbir/', external: true, Icon: Linkedin },
        { name: 'GitHub', path: 'https://github.com/alrifatsabbir', external: true, Icon: Github },
        { name: 'Facebook', path: 'https://www.facebook.com/al.rifat.sabbir47', external: true, Icon: Facebook },
        { name: 'Instagram', path: 'https://www.instagram.com/alrifatsabbir/', external: true, Icon: Instagram },
        { name: 'YouTube', path: 'https://www.youtube.com/@codearcglobal', external: true, Icon: Youtube },
      ]
    },
    {
      title: t('footer.Legal'),
      Icon: Scale,
      links: [
        { name: t('footer.Privacy Policy'), path: '/legal/privacy' },
        { name: t('footer.Terms of Services'), path: '/legal/terms' },
        { name: t('footer.Security Policy'), path: '/legal/security' },
        { name: t('footer.Licenses'), path: '/legal/licenses' },
      ]
    }
  ];

  const primarySocials = [
    { name: 'GitHub', href: 'https://github.com/alrifatsabbir', Icon: Github },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/alrifatsabbir/', Icon: Linkedin },
    { name: 'Email', href: 'mailto:notecreep@alrifatsabbir.me', Icon: Mail },
  ];

  return (
    <footer
      ref={footerRef}
      className="relative bg-[#050810] text-gray-300 border-t border-[#00bf63]/20 overflow-hidden"
    >
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00bf63]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Ambient Glow Hairline */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00bf63]/60 to-transparent" />

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Pre-Footer Action Banner (TasteSkill AIDA Action Stage) */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0d1424]/90 via-[#090f1d]/90 to-[#070b14]/90 border border-[#00bf63]/30 backdrop-blur-2xl p-8 sm:p-12 mb-16 shadow-[0_20px_60px_rgba(0,191,99,0.12)] overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#00bf63]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00bf63]/10 border border-[#00bf63]/30 text-[#00bf63] text-xs font-bold tracking-wide">
                <Sparkles size={14} />
                <span>Next-Gen Encrypted Note Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Ready to organize your workspace with absolute privacy?
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Join thousands using NoteCreep for seamless note management across desktop and mobile devices.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
              <button
                onClick={handleInstallClick}
                disabled={isInstalled}
                className={`flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl font-extrabold text-sm transition-all duration-300 ${
                  isInstalled
                    ? 'bg-gray-800/80 text-[#00bf63] border border-[#00bf63]/30 cursor-default'
                    : 'bg-gradient-to-r from-[#00bf63] to-[#00964d] text-black hover:brightness-110 shadow-[0_0_25px_rgba(0,191,99,0.4)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                }`}
              >
                {isInstalled ? <CheckCircle2 size={18} /> : <Download size={18} />}
                <span>{isInstalled ? 'NoteCreep Installed' : 'Install it now!'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          
          {/* Brand Column with Large Crisp Logo */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="inline-block group">
              <img
                src={NoteCreepLogo}
                alt="NoteCreep Logo"
                className="w-40 h-40 object-contain drop-shadow-[0_0_25px_rgba(0,191,99,0.35)] transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.Note Creep your ultimate note-taking companion.')}
              <span className="block text-xs text-gray-500 font-mono mt-2">
                Mirpur, Dhaka, Bangladesh
              </span>
            </p>

            {/* Social Icons */}
            <div className="flex space-x-3 pt-2">
              {primarySocials.map((social, index) => {
                const IconComponent = social.Icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-gray-800/50 border border-gray-700/60 text-gray-400 hover:text-[#00bf63] hover:border-[#00bf63]/60 hover:bg-[#00bf63]/10 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(0,191,99,0.2)] transition-all duration-300"
                    title={t(`footer.Visit our ${social.name}`)}
                  >
                    <IconComponent size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section, index) => {
            const SectionIcon = section.Icon;
            return (
              <div key={index} className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2.5 border-b border-gray-800/80 pb-3">
                  <SectionIcon className="text-[#00bf63] w-4.5 h-4.5" />
                  <span>{section.title}</span>
                </h3>

                <ul className="space-y-2.5">
                  {section.links.map((link, linkIndex) => {
                    const LinkIcon = link.Icon;
                    return (
                      <li key={linkIndex}>
                        <a
                          href={link.path}
                          target={link.external ? "_blank" : "_self"}
                          rel={link.external ? "noopener noreferrer" : undefined}
                          className="flex items-center text-gray-400 text-sm font-medium hover:text-[#00bf63] hover:translate-x-1.5 transition-all duration-200 py-1"
                          title={link.name}
                        >
                          {LinkIcon && <LinkIcon className="mr-2 w-4 h-4 text-gray-500" />}
                          <span>{link.name}</span>
                          {link.external && <ExternalLink className="ml-1.5 w-3 h-3 text-gray-600" />}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

        </div>

        {/* Hairline Divider */}
        <div className="mt-16 border-t border-gray-800/80" />

        {/* Sub-Footer Copyright & Attribution */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left text-sm text-gray-500 gap-4">
          <p>
            &copy; {currentYear} NoteCreep. {t('footer.All rights reserved.')}
          </p>

          <p className="flex items-center space-x-1.5">
            <span>{t('footer.Developed by an')}</span>
            <span className="text-red-500 animate-pulse font-semibold">enthusiast</span>
            <a
              href="https://alrifatsabbir.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00bf63] hover:underline font-extrabold ml-1 transition-colors"
            >
              Al Rifat Sabbir
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
