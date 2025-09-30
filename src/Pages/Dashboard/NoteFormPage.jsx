import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { notes as notesApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import Loader from '../../components/PageLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faThumbtack, faShareAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/Note_Creep-removebg-preview.png';

const NoteFormPage = () => {
    const { t } = useTranslation();
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSharedNote, setIsSharedNote] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPinned, setIsPinned] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        const fetchNote = async () => {
            setIsLoading(true);
            if (id) {
                try {
                    const response = await notesApi.getNote(id);
                    setTitle(response.data.title);
                    setContent(response.data.content);
                    setIsPinned(response.data.pinned);
                    
                    const isShared = location.pathname.startsWith('/shared-note');
                    setIsSharedNote(isShared);
                } catch (error) {
                    console.error("Failed to fetch note:", error);
                    toast.error(t("Failed to load note."));
                    navigate('/notes');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchNote();

        if (formRef.current) {
            gsap.fromTo(formRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
        }
    }, [id, isLoggedIn, navigate, location.pathname, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const noteData = { title, content };
        
        if (isSharedNote) {
            toast.error(t("You can't edit a shared note."));
            return;
        }

        try {
            if (id) {
                await notesApi.updateNote(id, noteData);
                toast.success(t("Note updated successfully!"));
            } else {
                await notesApi.createNote(noteData);
                toast.success(t("Note created successfully!"));
            }
            navigate('/notes');
        } catch (error) {
            console.error("Failed to save note:", error);
            toast.error(t("Failed to save note."));
        }
    };

    const handlePinToggle = async () => {
        if (!id) return;
        try {
            if (isPinned) {
                await notesApi.unpinNote(id);
                setIsPinned(false);
                toast.success(t("Note unpinned successfully"));
            } else {
                await notesApi.pinNote(id);
                setIsPinned(true);
                toast.success(t("Note pinned successfully"));
            }
        } catch (error) {
            console.error("Failed to update pin status:", error);
            toast.error(t("Failed to update pin status"));
        }
    };

    const handleShare = async () => {
        const email = prompt("Enter email to share with:");
        if (email) {
            try {
                await notesApi.shareNote(id, { email });
                toast.success(t("Note shared successfully!"));
            } catch (error) {
                console.error("Error sharing note:", error);
                toast.error(t("Failed to share note."));
            }
        }
    };

    const handleDelete = async () => {
        if (isSharedNote) {
            toast.error(t("You can't delete a shared note."));
            return;
        }
        if (window.confirm(t("Are you sure you want to delete this note?"))) {
            try {
                await notesApi.deleteNote(id);
                toast.success(t("Note deleted successfully!"));
                navigate('/notes');
            } catch (error) {
                console.error("Failed to delete note:", error);
                toast.error(t("Failed to delete note."));
            }
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen w-full relative">
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "radial-gradient(125% 125% at 50% 100%, #000000 40%, #2b0707 100%)",
                }}
            />
            <div className="relative z-10 flex flex-col items-center p-4 min-h-screen font-sans">
                <div className="w-full flex justify-center mt-8 mb-4">
                    <img src={logo} alt="Note Creep Logo" className="h-24 w-auto shadow-effect" />
                </div>
                <div ref={formRef} className="w-full max-w-4xl p-8 rounded-2xl shadow-2xl bg-gray-900 border border-gray-700 backdrop-filter backdrop-blur-md bg-opacity-80 transition-all duration-500 transform">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 text-white text-3xl hover:text-[#00bf63] transition-colors"
                        aria-label="Go back"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#c1ff72] mb-6 text-center">
                        {id ? t("Edit Note") : t("Create Note")}
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <label htmlFor="title" className="block text-gray-400 text-sm font-medium mb-2">
                                {t("Title")}
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00bf63]"
                                placeholder={t("Title of your note")}
                                required
                                readOnly={isSharedNote}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="content" className="block text-gray-400 text-sm font-medium mb-2">
                                {t("Content")}
                            </label>
                            {/* Note: A simple textarea cannot support rich text formatting. */}
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows="6"
                                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00bf63] min-h-[250px] resize-y"
                                placeholder={t("Write your note content here...")}
                                required
                                readOnly={isSharedNote}
                            ></textarea>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            {id && !isSharedNote && (
                                <>
                                    <div className="flex space-x-4">
                                        <button
                                            type="button"
                                            onClick={handlePinToggle}
                                            className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-300 ${isPinned ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                            title={isPinned ? t("Unpin Note") : t("Pin Note")}
                                        >
                                            <FontAwesomeIcon icon={faThumbtack} size="lg" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleShare}
                                            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 text-blue-400 hover:bg-gray-700 transition-colors duration-300"
                                            title={t("Share Note")}
                                        >
                                            <FontAwesomeIcon icon={faShareAlt} size="lg" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="w-12 h-12 flex items-center justify-center rounded-full bg-red-800 text-red-300 hover:bg-red-700 transition-colors duration-300"
                                            title={t("Delete Note")}
                                        >
                                            <FontAwesomeIcon icon={faTrash} size="lg" />
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 rounded-lg bg-[#00bf63] text-gray-900 font-semibold text-lg hover:bg-[#009e53] transition-colors shadow-lg"
                                    >
                                        {t("Save Changes")}
                                    </button>
                                </>
                            )}
                            {!id && (
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 rounded-lg bg-[#00bf63] text-gray-900 font-semibold text-lg hover:bg-[#009e53] transition-colors shadow-lg"
                                >
                                    {t("Create Note")}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NoteFormPage;