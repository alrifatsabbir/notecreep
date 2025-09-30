import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { notes as notesApi } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faThumbtack, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/PageLoader';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import Back from '../../components/Back';

const PinnedNotesPage = () => {
    const { t } = useTranslation();
    const { isLoggedIn, user: currentUser } = useContext(AuthContext); // ✅ Added currentUser
    const navigate = useNavigate();
    const [pinnedNotes, setPinnedNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const containerRef = useRef(null);

    const fetchPinnedNotes = useCallback(async () => {
        if (!isLoggedIn || !currentUser) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await notesApi.getNotes();
            const allNotes = response.data.notes || [];
            const fetchedPinnedNotes = allNotes.filter(note => note.pinned);
            setPinnedNotes(fetchedPinnedNotes);
        } catch (error) {
            console.error("Failed to fetch pinned notes:", error);
            toast.error(t("Failed to load pinned notes."));
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, currentUser, t]);

    useEffect(() => {
        fetchPinnedNotes();
    }, [fetchPinnedNotes]);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
        }
    }, []);

    const truncateText = (text, wordCount) => {
        if (!text) return '';
        const words = text.split(' ');
        if (words.length <= wordCount) return text;
        return words.slice(0, wordCount).join(' ') + '...';
    };

    const handleEdit = (id) => {
        if (isActionLoading) return;
        navigate(`/edit/${id}`);
    };

    const handleDelete = async (id) => {
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            await notesApi.deleteNote(id);
            toast.success(t("Note deleted successfully!"));
            await fetchPinnedNotes();
        } catch (error) {
            console.error("Failed to delete note:", error);
            toast.error(t("Failed to delete note"));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUnpin = async (id) => {
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            await notesApi.unpinNote(id);
            toast.success(t("Note unpinned successfully"));
            await fetchPinnedNotes();
        } catch (error) {
            console.error("Failed to unpin note:", error);
            toast.error(t("Failed to unpin note"));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleShare = async (id, title, content) => {
        if (isActionLoading) return;
        try {
            await notesApi.shareNote(id, { title, content });
            toast.success(t("Note shared successfully!"));
        } catch (error) {
            console.error("Error sharing note:", error);
            toast.error(t("Failed to share note."));
        }
    };

    if (isLoading) return <Loader />;

    if (!isLoggedIn || !currentUser) {
        return (
            <div className="min-h-screen w-full absolute bg-gray-800 flex flex-col justify-center items-center">
                <p className="text-[#00bf63] text-3xl text-center mb-6">{t("Please log in to view your notes.")}</p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-6 px-6 py-2 bg-[#00bf63] text-white rounded-lg shadow hover:bg-[#009e53] transition-colors"
                >
                    {t("Go to Login")}
                </button>
            </div>
        );
    }

    const renderNoteCard = (note) => {
        const isOwner = note.user === currentUser.id || note.user?._id === currentUser.id;
        const isReadOnly = !isOwner && note.sharedWith?.length > 0;

        return (
            <div
                key={note._id}
                className={`p-6 rounded-xl shadow-lg bg-gray-800 text-white relative hover:scale-[1.02] transition-transform duration-300 ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !isReadOnly && handleEdit(note._id)}
                title={isReadOnly ? 'Read-only' : ''}
            >
                <h3 className="text-xl font-bold mb-2">{truncateText(note.title, 6)}</h3>
                <p className="mb-4 text-gray-400">{truncateText(note.content, 20)}</p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); isOwner && handleUnpin(note._id); }}
                        className={`p-2 rounded-full text-[#c1ff72] bg-gray-700 hover:bg-gray-600 transition-colors ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={t("Unpin Note")}
                        disabled={!isOwner}
                    >
                        <FontAwesomeIcon icon={faThumbtack} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); isOwner && handleShare(note._id, note.title, note.content); }}
                        className={`p-2 rounded-full text-blue-400 hover:bg-gray-700 transition-colors ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={t("Share Note")}
                        disabled={!isOwner}
                    >
                        <FontAwesomeIcon icon={faShareAlt} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); isOwner && handleDelete(note._id); }}
                        className={`p-2 rounded-full text-red-500 hover:bg-gray-700 transition-colors ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={t("Delete Note")}
                        disabled={!isOwner}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full relative">
            <div
                className="absolute inset-0 z-0"
                style={{ background: "radial-gradient(125% 125% at 50% 100%, #000000 40%, #2b0707 100%)" }}
            />

            <div className="relative z-10">
                <Navbar />
                <Back />
                {isActionLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-secondary rounded-full animate-spin"></div>
                    </div>
                )}
                
                <div ref={containerRef} className="p-4 sm:p-8 md:p-12 max-w-6xl mx-auto pt-8 relative z-20">
                    <h1 className="text-4xl pt-8 sm:text-5xl font-bold mb-8 text-[#00bf63] mt-8">
                        {t("Pinned Notes")}
                    </h1>
                    {pinnedNotes.length === 0 ? (
                        <div className="text-center mt-20">
                            <p className="text-xl font-medium text-gray-400">{t("You have no pinned notes yet.")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pinnedNotes.map(renderNoteCard)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PinnedNotesPage;
