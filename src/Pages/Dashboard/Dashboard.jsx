import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { analytics } from '../../services/api';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faThumbtack, faFileLines } from '@fortawesome/free-solid-svg-icons';
import Loader from '../../components/PageLoader';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import Back from '../../components/Back';

// ✅ Removed theme-related props
const Dashboard = () => {
    const { t } = useTranslation();
    const { user, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // ✅ liveTime state এর আর প্রয়োজন নেই কারণ এটি সরাসরি analyticsData থেকে নেওয়া হবে।
    const [liveTime, setLiveTime] = useState(0);

    const totalNotesRef = useRef(null);
    const deletedNotesRef = useRef(null);
    const pinnedNotesRef = useRef(null);
    const containerRef = useRef(null);

    const fetchDashboardData = useCallback(async () => {
        if (!isLoggedIn) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const summaryResponse = await analytics.getDashboardSummary();
            const analyticsResponse = await analytics.getAnalytics();

            setDashboardData(summaryResponse.data);
            setAnalyticsData(analyticsResponse.data);
            setLiveTime(analyticsResponse.data.timeSpent[0].time);

            if (totalNotesRef.current && deletedNotesRef.current && pinnedNotesRef.current) {
                gsap.fromTo(totalNotesRef.current, { innerText: 0 }, { innerText: summaryResponse.data.totalNotes, duration: 2, ease: "power1.out", snap: "innerText" });
                gsap.fromTo(deletedNotesRef.current, { innerText: 0 }, { innerText: summaryResponse.data.deletedNotes, duration: 2, ease: "power1.out", snap: "innerText" });
                gsap.fromTo(pinnedNotesRef.current, { innerText: 0 }, { innerText: summaryResponse.data.pinnedNotes, duration: 2, ease: "power1.out", snap: "innerText" });
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast.error(t("Failed to load dashboard data."));
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, t]);

    // ✅ App.jsx-এ সেশন আপডেট করার লজিকটি স্থানান্তরিত করা হয়েছে, তাই এই useEffect টি সরিয়ে দেওয়া হয়েছে।
    // useEffect(() => {
    //     if (isLoggedIn) {
    //         const updateSessionAndFetchData = async () => {
    //             try {
    //                 await analytics.updateSession({ time: 1 });
    //                 const analyticsResponse = await analytics.getAnalytics();
    //                 setAnalyticsData(analyticsResponse.data);
    //                 setLiveTime(analyticsResponse.data.timeSpent[0].time);
    //             } catch (error) {
    //                 console.error("Failed to update session time:", error);
    //             }
    //         };
            
    //         const interval = setInterval(updateSessionAndFetchData, 60000);
    //         updateSessionAndFetchData();
            
    //         return () => clearInterval(interval);
    //     }
    // }, [isLoggedIn]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
        }
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen w-full absolute bg-gray-800">
                <p className="text-[#00bf63] text-3xl text-center mt-20">{t("Please log in to view your notes.")}</p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-6 px-6 py-2 bg-[#00bf63] flex justify-self-center text-white rounded-lg shadow hover:bg-[#009e53] transition-colors"
                >
                    {t("Go to Login")}
                </button>
            </div>
        );;
    }

    const truncateText = (text, wordCount) => {
        if (!text) return ''; 
        const words = text.split(' ');
        if (words.length <= wordCount) return text;
        return words.slice(0, wordCount).join(' ') + '...';
    };
    
    const NoteCard = ({ title, icon, link, note }) => (
        // ✅ Replaced dynamic classes with dark theme classes only
        <div className={`p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 bg-gray-800 text-white`}>
            {/* ✅ Replaced dynamic classes with dark theme classes only */}
            <div className={`flex items-center mb-4 text-gray-400`}>
                <FontAwesomeIcon icon={icon} className="mr-2" />
                <h3 className="text-lg font-bold">{t(title)}</h3>
            </div>
            <h4 className="text-xl font-semibold mb-2">{note?.title || t("No data")}</h4>
            <p className="mb-4">{note ? truncateText(note.content, 15) : t("You have no notes in this category.")}</p>
            <button
                onClick={() => note && navigate(link)}
                // ✅ Replaced dynamic classes with dark theme classes only
                className={`w-full py-2 rounded-lg text-white font-medium transition-colors ${note ? 'bg-[#00bf63] hover:bg-[#009e4d]' : 'bg-gray-700 cursor-not-allowed'}`}
                disabled={!note}
            >
                {note ? t("View Full Note") : t("No Notes to View")}
            </button>
        </div>
    );
    
    return (
        // ✅ Replaced dynamic classes and style attribute with dark theme classes only
        <div className={`min-h-screen font-sans bg-gray-900 text-white`}>
            {/* ✅ Removed theme-related props from Navbar */}
            <Navbar />
            <Back/>
            <div ref={containerRef} className="p-8 sm:p-12 max-w-6xl mx-auto pt-16">
                <h1 className="text-4xl sm:text-5xl font-bold mb-8 pt-16 text-[#00bf63]">
                    {t("Welcome, {{name}}!", { name: user?.name || user?.username })}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <NoteCard
                        title={t("Total Notes")}
                        icon={faFileLines}
                        note={{ title: dashboardData?.totalNotes || 0, content: t("Total notes created") }}
                        link="/notes"
                    />
                    
                    <NoteCard
                        title={t("Deleted Notes")}
                        icon={faTrash}
                        note={{ title: dashboardData?.deletedNotes || 0, content: t("Total notes deleted") }}
                        link="/trash"
                    />
                    
                    <NoteCard
                        title={t("Pinned")}
                        icon={faThumbtack}
                        note={{ title: dashboardData?.pinnedNotes || 0, content: t("Total notes pinned") }}
                        link="/pinned"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Time Spent Card */}
                    {/* ✅ Replaced dynamic classes with dark theme classes only */}
                    <div className={`p-6 rounded-xl shadow-lg bg-gray-800`}>
                        {/* ✅ Replaced dynamic classes with dark theme classes only */}
                        <h2 className={`text-xl font-semibold mb-4 text-[#00bf63] text-grey-400`}>{t("Time Spent (minutes)")}</h2>
                        <div className="flex items-center justify-center h-48">
                             {/* ✅ liveTime state এর পরিবর্তে analyticsData থেকে সরাসরি ডেটা ব্যবহার করা হয়েছে */}
                            <span className="text-6xl font-bold text-[#c1ff72]">{analyticsData?.timeSpent?.[0]?.time || 0}</span>
                        </div>
                        {/* ✅ Replaced dynamic classes with dark theme classes only */}
                        <p className={`text-center text-gray-400`}>{t("Total time spent on the website today.")}</p>
                    </div>
                    
                    {/* Notes Created Card */}
                    {/* ✅ Replaced dynamic classes with dark theme classes only */}
                    <div className={`p-6 rounded-xl shadow-lg bg-gray-800`}>
                        {/* ✅ Replaced dynamic classes with dark theme classes only */}
                        <h2 className={`text-xl font-semibold mb-4 text-[#00bf63] text-grey-400`}>{t("Notes Created")}</h2>
                        <div className="flex items-center justify-center h-48">
                            <span className="text-6xl font-bold text-[#c1ff72]">{dashboardData?.totalNotes || 0}</span>
                        </div>
                        {/* ✅ Replaced dynamic classes with dark theme classes only */}
                        <p className={`text-center text-gray-400`}>{t("Total number of notes created.")}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <NoteCard
                        title={t("Recent Note")}
                        icon={faFileLines}
                        note={dashboardData?.firstNote}
                        link={`/edit/${dashboardData?.firstNote?._id}`}
                    />
                    
                    <NoteCard
                        title={t("In Trash")}
                        icon={faTrash}
                        note={dashboardData?.firstDeletedNote}
                        link={`/trash`}
                    />

                    <NoteCard
                        title={t("Pinned")}
                        icon={faThumbtack}
                        note={dashboardData?.firstPinnedNote}
                        link={`/edit/${dashboardData?.firstPinnedNote?._id}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;