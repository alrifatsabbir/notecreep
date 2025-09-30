import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { notes as notesApi } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faThumbtack, faPlus, faCheckCircle, faClock, faShareAlt, faCheckSquare, faSquare, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/PageLoader';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import ShareNoteModal from '../../components/modals/ShareNoteModal';

const NotesPage = () => {
    const { t } = useTranslation();
    const { isLoggedIn, user: currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [noteToShareId, setNoteToShareId] = useState(null);

    const containerRef = useRef(null);

    // ✅ UPDATED: Sorts notes based on effective pinned status (owner's 'pinned' or read-only user's 'readOnlyPinned')
    const sortNotes = useCallback((allNotes) => {
        const currentUserId = currentUser?.id;

        const getEffectivePinnedStatus = (note) => {
            // Check if the current user is the owner of the note
            const isOwner = note.user === currentUserId;

            // If owner, use note.pinned. If read-only copy, use note.readOnlyPinned
            // We ensure to handle undefined/null cases gracefully
            return isOwner ? (note.pinned || false) : (note.readOnlyPinned || false);
        };

        // Filter based on the effective pinned status for the current user
        const pinned = allNotes.filter(note => getEffectivePinnedStatus(note));
        const unpinned = allNotes.filter(note => !getEffectivePinnedStatus(note));

        // Pinned notes come first
        return [...pinned, ...unpinned];
    }, [currentUser]); // Dependency on currentUser is crucial for correct shared note sorting

    const fetchNotes = useCallback(async () => {
        if (!isLoggedIn) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await notesApi.getNotes();
            // Using the updated sortNotes function
            setNotes(sortNotes(response.data.notes));
        } catch (error) {
            console.error("Failed to fetch notes:", error);
            toast.error(t("Failed to load notes."));
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, t, sortNotes]); // Added sortNotes dependency

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

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
        if (isSelectionMode || isActionLoading) return;
        navigate(`/edit/${id}`);
    };

    const handleDelete = async (id) => {
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            await notesApi.deleteNote(id);
            toast.success(t("Note deleted successfully!"));
            await fetchNotes();
        } catch (error) {
            console.error("Failed to delete note:", error);
            toast.error(t("Failed to delete note"));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handlePin = async (id, isCurrentlyPinned) => {
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            if (isCurrentlyPinned) {
                await notesApi.unpinNote(id); // <--- Single Unpin Logic
                toast.success(t("Note unpinned successfully"));
            } else {
                await notesApi.pinNote(id);
                toast.success(t("Note pinned successfully"));
            }
            await fetchNotes();
            setSelectedNotes([]);
        } catch (error) {
            console.error("Failed to update pin status:", error);
            toast.error(t("Failed to update pin status"));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handlePinReadOnly = async (noteId, isCurrentlyPinned) => {
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            // Toggles the pinned status
            await notesApi.pinReadOnlyCopy(noteId, !isCurrentlyPinned); 
            toast.success(isCurrentlyPinned ? t("Read-only note unpinned") : t("Read-only note pinned"));
            await fetchNotes();
        } catch (error) {
            console.error("Failed to pin/unpin read-only note:", error);
            toast.error(t("Failed to update pin status for read-only note"));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteReadOnly = async (noteId) => {
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            await notesApi.deleteReadOnlyCopy(noteId);
            toast.success(t("Read-only note deleted successfully"));
            await fetchNotes();
        } catch (error) {
            console.error("Failed to delete read-only note:", error);
            toast.error(t("Failed to delete read-only note"));
        } finally {
            setIsActionLoading(false);
        }
    };

    // ===== Updated handleNoteClick to allow open in view mode (unchanged) =====
    const handleNoteClick = (note) => {
        // Ensure currentUser is available before proceeding
        if (!currentUser) return; 
        
        const isOwner = note.user === currentUser.id;
        const isReadOnly = !isOwner;

        if (!isSelectionMode) {
            localStorage.setItem('lastOpenedNoteId', note._id);

            if (isReadOnly) {
                navigate(`/view/${note._id}`); // read-only view page
            } else {
                navigate(`/edit/${note._id}`); // owner edit page
            }
            return;
        }

        // Only allow selection of owned notes for bulk actions
        if (!isReadOnly) { 
            setSelectedNotes(prevSelected => {
                if (prevSelected.includes(note._id)) {
                    return prevSelected.filter(noteId => noteId !== note._id);
                } else {
                    return [...prevSelected, note._id];
                }
            });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedNotes.length === 0 || isActionLoading) return;
        setIsActionLoading(true);
        try {
            await Promise.all(selectedNotes.map(id => notesApi.deleteNote(id)));
            toast.success(t("Selected notes deleted successfully!"));
            await fetchNotes();
            setSelectedNotes([]);
            setIsSelectionMode(false);
        } catch (error) {
            console.error("Failed to delete selected notes:", error);
            toast.error(t("Failed to delete selected notes."));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleBulkPin = async () => {
        if (selectedNotes.length === 0 || isActionLoading) return;
        setIsActionLoading(true);
        try {
            await Promise.all(selectedNotes.map(id => notesApi.pinNote(id)));
            toast.success(t("Selected notes pinned successfully!"));
            await fetchNotes();
            setSelectedNotes([]);
            setIsSelectionMode(false);
        } catch (error) {
            console.error("Failed to pin selected notes:", error);
            toast.error(t("Failed to pin selected notes."));
        } finally {
            setIsActionLoading(false);
        }
    };
    
    // ✅ New Function: Handle Bulk Unpin
    const handleBulkUnpin = async () => {
        if (selectedNotes.length === 0 || isActionLoading) return;
        setIsActionLoading(true);
        try {
            // Unpin all selected notes
            await Promise.all(selectedNotes.map(id => notesApi.unpinNote(id))); 
            toast.success(t("Selected notes unpinned successfully!"));
            await fetchNotes();
            setSelectedNotes([]);
            setIsSelectionMode(false);
        } catch (error) {
            console.error("Failed to unpin selected notes:", error);
            toast.error(t("Failed to unpin selected notes."));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelSelection = () => {
        setSelectedNotes([]);
        setIsSelectionMode(false);
    };

    const handleRecentNote = useCallback(() => {
        const lastOpenedNoteId = localStorage.getItem('lastOpenedNoteId');
        if (lastOpenedNoteId) {
            navigate(`/edit/${lastOpenedNoteId}`);
        } else {
            toast.error(t("No recently opened notes found."));
        }
    }, [navigate, t]);

    if (isLoading) return <Loader />;

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
        );
    }

    const renderNoteCard = (note) => {
        const isSelected = selectedNotes.includes(note._id);
        const isOwner = note.user === currentUser.id;
        const isReadOnly = !isOwner;

        return (
            <div
                key={note._id}
                className={`p-6 rounded-xl shadow-lg bg-gray-800 text-white relative hover:scale-[1.02] transition-transform duration-300 ${isSelected ? 'ring-4 ring-[#c1ff72] shadow-xl' : ''} ${isReadOnly ? 'opacity-70' : ''} cursor-pointer`}
                onClick={() => handleNoteClick(note)}
                title={isReadOnly ? 'Read-only' : ''}
            >
                {isSelectionMode && !isReadOnly && (
                    <div className="absolute top-2 right-2 text-2xl z-10">
                        <FontAwesomeIcon icon={isSelected ? faCheckSquare : faSquare} className="text-[#c1ff72]" />
                    </div>
                )}
                {note.sharedWith && note.sharedWith.length > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-gray-700 text-xs rounded text-white">
                        🔗 {note.sharedWith.length}
                    </div>
                )}
                <h3 className="text-xl font-bold mb-2">{truncateText(note.title, 6)}</h3>
                <p className="mb-4 text-gray-400">{truncateText(note.content, 20)}</p>

                <div className="flex justify-end space-x-2">
                    {isOwner ? (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePin(note._id, note.pinned); }}
                                className={`p-2 rounded-full ${note.pinned ? 'text-[#c1ff72] bg-gray-700' : 'text-secondary hover:bg-gray-700'} transition-colors`}
                                title={note.pinned ? t("Unpin Note") : t("Pin Note")}
                            >
                                <FontAwesomeIcon icon={faThumbtack} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setNoteToShareId(note._id); setIsShareModalOpen(true); }}
                                className="p-2 rounded-full text-blue-400 hover:bg-gray-700 transition-colors"
                                title={t("Share Note")}
                            >
                                <FontAwesomeIcon icon={faShareAlt} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                                className="p-2 rounded-full text-red-500 hover:bg-gray-700 transition-colors"
                                title={t("Delete Note")}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); handlePinReadOnly(note._id, note.readOnlyPinned || false); }}
                                className="p-2 rounded-full text-yellow-400 hover:bg-gray-700 transition-colors"
                                title={note.readOnlyPinned ? t("Unpin Read-only") : t("Pin Read-only")}
                            >
                                <FontAwesomeIcon icon={faThumbtack} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteReadOnly(note._id); }}
                                className="p-2 rounded-full text-red-500 hover:bg-gray-700 transition-colors"
                                title={t("Delete Read-only")}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full relative">
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "radial-gradient(125% 125% at 50% 100%, #000000 40%, #2b0707 100%)",
                }}
            />
            <div className="relative z-10">
                <Navbar />
                {isActionLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-secondary rounded-full animate-spin"></div>
                    </div>
                )}
                {isSelectionMode ? (
                    <div className="sticky top-[74px] z-40 max-w-sm sm:max-w-lg mx-auto bg-[#2b0707] rounded-full shadow-lg py-3 transition-all duration-300 flex items-center justify-center space-x-4">
                        <button
                            onClick={handleBulkPin}
                            className="group relative p-2 rounded-full bg-secondary text-gray-900 transition-colors"
                            title={t("Pin Selected")}
                        >
                            <FontAwesomeIcon icon={faThumbtack} />
                        </button>
                        <button // ✅ Bulk Unpin Button Added
                            onClick={handleBulkUnpin}
                            className="group relative p-2 rounded-full text-white hover:bg-gray-700 transition-colors"
                            title={t("Unpin Selected")}
                        >
                            {/* Rotate the thumbtack icon to visually represent unpinning */}
                            <FontAwesomeIcon icon={faThumbtack} className="rotate-180" /> 
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="group relative p-2 rounded-full bg-red-500 text-white transition-colors"
                            title={t("Delete Selected")}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                        <button
                            onClick={handleCancelSelection}
                            className="group relative p-2 rounded-full text-white hover:bg-gray-700 transition-colors"
                            title={t("Cancel")}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                ) : (
                    <div className="sticky top-[74px] z-40 max-w-sm sm:max-w-lg mx-auto bg-[#2b0707] rounded-full shadow-lg py-3 transition-all duration-300">
                        <div className="flex items-center justify-center space-x-4 sm:space-x-10 text-white text-lg px-2">
                            <button
                                onClick={() => navigate('/create')}
                                className="group relative p-2 rounded-full hover:bg-[#c1ff72] hover:text-gray-900 transition-colors"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <span className="absolute bottom-[-2.5rem] left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                    {t("Create Note")}
                                </span>
                            </button>
                            <button
                                onClick={() => navigate('/pinned')}
                                className="group relative p-2 rounded-full hover:bg-[#c1ff72] hover:text-gray-900 transition-colors"
                            >
                                <FontAwesomeIcon icon={faThumbtack} />
                                <span className="absolute bottom-[-2.5rem] left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                    {t("Pinned Notes")}
                                </span>
                            </button>
                            <button
                                onClick={handleRecentNote}
                                className="group relative p-2 rounded-full hover:bg-[#c1ff72] hover:text-gray-900 transition-colors"
                            >
                                <FontAwesomeIcon icon={faClock} />
                                <span className="absolute bottom-[-2.5rem] left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                    {t("Recent Notes")}
                                </span>
                            </button>
                            <button
                                onClick={() => navigate('/trash')}
                                className="group relative p-2 rounded-full hover:bg-[#c1ff72] hover:text-gray-900 transition-colors"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                <span className="absolute bottom-[-2.5rem] left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                    {t("Trash")}
                                </span>
                            </button>
                            <button
                                onClick={() => setIsSelectionMode(!isSelectionMode)}
                                className="group relative p-2 rounded-full hover:bg-[#c1ff72] hover:text-gray-900 transition-colors"
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span className="absolute bottom-[-2.5rem] left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                    {t("Select")}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                <div ref={containerRef} className="p-4 sm:p-8 md:p-12 max-w-6xl mx-auto pt-8 relative z-20">
                    <h1 className="text-4xl pt-8 sm:text-5xl font-bold mb-8 text-[#00bf63] mt-8">
                        {t("My Notes")}
                    </h1>
                    {notes.length === 0 ? (
                        <div className="text-center mt-20">
                            <p className="text-xl font-medium text-gray-400">{t("You have no notes yet. Create your first one!")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {notes.map(renderNoteCard)}
                        </div>
                    )}
                </div>

                {/* Share Note Modal */}
                <ShareNoteModal
                    isOpen={isShareModalOpen}
                    onClose={() => {
                        setIsShareModalOpen(false);
                        setNoteToShareId(null);
                    }}
                    noteId={noteToShareId}
                    onShared={fetchNotes}
                />
            </div>
        </div>
    );
};

export default NotesPage;