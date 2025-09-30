import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { notes as notesApi } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashRestore, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/PageLoader';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import Navbar from '../../components/Navbar';
import Back from '../../components/Back';

const TrashPage = () => {
    const { t } = useTranslation();
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const [deletedNotes, setDeletedNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const containerRef = useRef(null);

    const fetchDeletedNotes = useCallback(async () => {
        if (!isLoggedIn) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await notesApi.getDeletedNotes();
            // Ensure we always have an array
            const fetchedDeletedNotes = Array.isArray(response.data)
                ? response.data
                : response.data?.notes || [];
            setDeletedNotes(fetchedDeletedNotes);
        } catch (error) {
            console.error("Failed to fetch deleted notes:", error);
            toast.error(t("Failed to load deleted notes."));
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, t]);

    useEffect(() => {
        fetchDeletedNotes();
    }, [fetchDeletedNotes]);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
            );
        }
    }, []);

    const truncateText = (text, wordCount) => {
        if (!text) return '';
        const words = text.split(' ');
        if (words.length <= wordCount) return text;
        return words.slice(0, wordCount).join(' ') + '...';
    };

    const handleSelectNote = (id) => {
        setSelectedNotes((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((noteId) => noteId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedNotes.length === deletedNotes.length) {
            setSelectedNotes([]);
        } else {
            setSelectedNotes(deletedNotes.map((note) => note._id));
        }
    };

    const handleRestore = async (id) => {
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            await notesApi.restoreNote(id);
            toast.success(t("Note restored successfully!"));
            await fetchDeletedNotes();
        } catch (error) {
            console.error("Failed to restore note:", error);
            toast.error(t("Failed to restore note."));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleBulkRestore = async () => {
        if (isActionLoading || selectedNotes.length === 0) return;
        setIsActionLoading(true);
        try {
            await Promise.all(selectedNotes.map((id) => notesApi.restoreNote(id)));
            toast.success(t("Selected notes restored successfully!"));
            setSelectedNotes([]);
            await fetchDeletedNotes();
        } catch (error) {
            console.error("Failed to bulk restore notes:", error);
            toast.error(t("Failed to restore selected notes."));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleHardDelete = async (id) => {
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            await notesApi.hardDeleteNote(id);
            toast.success(t("Note permanently deleted!"));
            await fetchDeletedNotes();
        } catch (error) {
            console.error("Failed to permanently delete note:", error);
            toast.error(t("Failed to permanently delete note."));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (isActionLoading || selectedNotes.length === 0) return;
        setIsActionLoading(true);
        try {
            await Promise.all(selectedNotes.map((id) => notesApi.hardDeleteNote(id)));
            toast.success(t("Selected notes permanently deleted!"));
            setSelectedNotes([]);
            await fetchDeletedNotes();
        } catch (error) {
            console.error("Failed to bulk delete notes:", error);
            toast.error(t("Failed to delete selected notes."));
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) return <Loader />;

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen w-full absolute bg-gray-800 flex flex-col justify-center items-center">
                <p className="text-[#00bf63] text-3xl text-center mb-6">
                    {t("Please log in to view your notes.")}
                </p>
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
        const isSelected = selectedNotes.includes(note._id);
        return (
            <div
                key={note._id}
                className={`p-6 rounded-xl shadow-lg bg-gray-800 text-white relative hover:scale-[1.02] transition-transform duration-300 cursor-pointer ${isSelected ? 'ring-4 ring-[#00bf63]' : ''}`}
                onClick={() => handleSelectNote(note._id)}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{truncateText(note.title, 6)}</h3>
                    {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#00bf63] border-2 border-white"></div>
                    )}
                </div>
                <p className="mb-4 text-gray-400">{truncateText(note.content, 20)}</p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleRestore(note._id); }}
                        className="p-2 rounded-full text-blue-400 bg-gray-700 hover:bg-gray-600 transition-colors"
                        title={t("Restore Note")}
                    >
                        <FontAwesomeIcon icon={faTrashRestore} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleHardDelete(note._id); }}
                        className="p-2 rounded-full text-red-500 bg-gray-700 hover:bg-gray-600 transition-colors"
                        title={t("Permanently Delete")}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full relative">
            <Navbar />
            <Back />
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "radial-gradient(125% 125% at 50% 100%, #000000 40%, #2b0707 100%)",
                }}
            />

            <div className="relative z-10">
                <div ref={containerRef} className="p-4 sm:p-8 md:p-12 max-w-6xl mx-auto pt-8 relative z-20">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                        <h1 className="text-4xl pt-8 sm:text-5xl font-bold mb-4 sm:mb-0 text-[#00bf63] mt-8">
                            {t("Trash")}
                        </h1>
                        {selectedNotes.length > 0 && (
                            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                                <label className="text-white text-lg flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedNotes.length === deletedNotes.length && deletedNotes.length > 0}
                                        onChange={handleSelectAll}
                                        className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded-md text-[#00bf63] focus:ring-[#00bf63] transition-colors duration-200"
                                    />
                                    <span className="ml-2 text-gray-300">{t("Select All")}</span>
                                </label>
                                <button
                                    onClick={handleBulkRestore}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTrashRestore} className="mr-2" />
                                    {t("Restore")}
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                    {t("Permanently Delete")}
                                </button>
                            </div>
                        )}
                    </div>

                    {isActionLoading && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                            <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-secondary rounded-full animate-spin"></div>
                        </div>
                    )}

                    {deletedNotes.length === 0 ? (
                        <div className="text-center mt-20">
                            <p className="text-xl font-medium text-gray-400">{t("Your trash is empty.")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {deletedNotes.map(renderNoteCard)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrashPage;
