import React, { useRef } from 'react';
import { Github, Linkedin, Facebook, Instagram, Youtube, Lightbulb, Building, Users, Scale, Mail, ExternalLink } from 'lucide-react';
import NoteCreepSVG from '../assets/Note_Creep-removebg-preview.png';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    const footerRef = useRef(null);
    const linkRefs = useRef([]);
    const currentYear = new Date().getFullYear();

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
                { name: t('footer.LinkedIn'), path: 'https://www.linkedin.com/in/alrifatsabbir/', external: true, Icon: Linkedin },
                { name: t('footer.GitHub'), path: 'https://github.com/alrifatsabbir', external: true, Icon: Github },
                { name: t('footer.Facebook'), path: 'https://www.facebook.com/al.rifat.sabbir47', external: true, Icon: Facebook },
                { name: t('footer.Instagram'), path: 'https://www.instagram.com/alrifatsabbir/', external: true, Icon: Instagram },
                { name: t('footer.YouTube'), path: 'https://www.youtube.com/@codearcglobal', external: true, Icon: Youtube },
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
        { name: 'Email', href: 'mailto:alrifatsabbir@gmail.com', Icon: Mail },
    ];

    const linkClasses = "flex items-center text-gray-400 text-sm font-medium hover:text-[#00bf63] transition-all duration-200 p-2 -ml-2 rounded-md hover:bg-gray-800/50";

    return (
        <footer ref={footerRef} className="bg-gray-900 text-white border-t border-gray-700/50 shadow-2xl overflow-hidden">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
                    <div className="col-span-2 lg:col-span-1 space-y-6">
                        <div className="flex items-center space-x-3">
                            <img src={NoteCreepSVG} alt={t("footer.NoteCreep Logo")} className="w-36 h-36 object-contain rounded-lg shadow-lg" />
                        </div>
                        <p className="text-gray-400 text-base max-w-sm">
                            {t('footer.Note Creep your ultimate note-taking companion.')}<br />
                            {t('footer.Mirpur, Dhaka, Bangladesh')}   
                        </p>
                        <div className="flex space-x-4 pt-2">
                            {primarySocials.map((social, index) => {
                                const IconComponent = social.Icon;
                                return (
                                    <a 
                                        key={index}
                                        href={social.href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-[#00bf63] hover:scale-110 transition-transform duration-300" 
                                        title={t(`footer.Visit our ${social.name}`)}
                                    >
                                        <IconComponent size={32} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                    {footerSections.map((section, index) => {
                        const SectionIcon = section.Icon;
                        return (
                            <div key={index} ref={el => linkRefs.current[index] = el} className="col-span-1">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2 border-b border-gray-700/50 pb-2">
                                    <SectionIcon className="text-[#00bf63] w-4 h-4" />
                                    <span>{section.title}</span>
                                </h3>
                                <ul className="space-y-1">
                                    {section.links.map((link, linkIndex) => {
                                        const LinkIcon = link.Icon;
                                        return (
                                            <li key={linkIndex}>
                                                <a
                                                    href={link.path}
                                                    target={link.external ? "_blank" : "_self"}
                                                    rel={link.external ? "noopener noreferrer" : undefined}
                                                    className={linkClasses}
                                                    title={link.name}
                                                >
                                                    {LinkIcon && <LinkIcon className="mr-2 w-4 h-4" />}
                                                    {link.name}
                                                    {link.external && <ExternalLink className="ml-2 w-3 h-3 text-gray-500" />}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-16 border-t border-gray-800"></div>
                <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left text-sm text-gray-500">
                    <p>
                        &copy; {currentYear} NoteCreep. {t('footer.All rights reserved.')}
                    </p>
                    <p className="mt-4 md:mt-0">
                        {t('footer.Developed by an')} <span className="text-red-500 mx-0.5 animate-pulse" role="img" aria-label="love">{t('footer.enthusiast ')}</span>
                        <Link to="https://alrifatsabbir.netlify.app" target="_blank" className="text-[#00bf63] hover:underline font-medium">{t('footer.Al Rifat Sabbir')}</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
