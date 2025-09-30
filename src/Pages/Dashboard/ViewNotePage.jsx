import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { notes as notesApi } from '../../services/api';
import { useTranslation } from 'react-i18next'; 
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import Loader from '../../components/PageLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faThumbtack, faShareAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/Note_Creep-removebg-preview.png'; // আপনার লোগো পাথ

const ViewNotePage = () => {
    const { t } = useTranslation(); 
    // AuthContext থেকে isLoggedIn এবং user তথ্য প্রয়োজন
    const { isLoggedIn, user } = useContext(AuthContext); 
    const navigate = useNavigate();
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPinned, setIsPinned] = useState(false);
    const [isOwner, setIsOwner] = useState(false); // ✅ মালিকানা ট্র্যাকিং
    const [isActionLoading, setIsActionLoading] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        const fetchNote = async () => {
            setIsLoading(true);
            try {
                const response = await notesApi.getNote(id);
                const fetchedNote = response.data;

                // **মালিকানা যাচাই করার জন্য IDs তুলনা করা**
                const currentUserId = user?.id?.toString(); 
                const noteOwnerId = fetchedNote.user?.toString();
                
                const ownerStatus = currentUserId && (currentUserId === noteOwnerId);
                setIsOwner(ownerStatus);

                // --- Pin Status Logic Update ---
                let effectivePinStatus = fetchedNote.pinned; // Default to owner's status
                
                // If the user is NOT the owner, check their readOnlyCopies status for pinning
                if (!ownerStatus && fetchedNote.readOnlyCopies) {
                    const readOnlyCopy = fetchedNote.readOnlyCopies.find(
                        (copy) => copy.user.toString() === currentUserId
                    );
                    if (readOnlyCopy) {
                        // Use the pinned status from the read-only copy document
                        effectivePinStatus = readOnlyCopy.pinned; 
                    }
                }
                // -----------------------------

                setTitle(fetchedNote.title);
                setContent(fetchedNote.content);
                setIsPinned(effectivePinStatus); // Use the calculated effective status
                
            } catch (error) {
                console.error("Failed to fetch note:", error);
                toast.error(t("Failed to load note or you don't have access."));
                navigate('/notes');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNote();

        if (formRef.current) {
            gsap.fromTo(formRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
        }
    }, [id, isLoggedIn, navigate, user, t]);

    // --- Pin/Unpin ফাংশন (Owner এবং Read-Only Copy উভয়ের জন্য আপডেট করা হয়েছে) ---
    const handlePinToggle = async () => {
        if (!id || isActionLoading) return;

        setIsActionLoading(true);
        try {
            if (isOwner) {
                // Owner Logic: Use dedicated pin/unpin routes
                if (isPinned) {
                    await notesApi.unpinNote(id);
                    setIsPinned(false);
                    toast.success(t("Note unpinned successfully"));
                } else {
                    await notesApi.pinNote(id);
                    setIsPinned(true);
                    toast.success(t("Note pinned successfully"));
                }
            } else {
                // Read-Only Copy Logic: Use the dedicated read-only pin endpoint
                const newPinStatus = !isPinned;
                
                // ✅ ফিক্সড: আপনার api.js-কে অক্ষত রাখতে, আমরা শুধুমাত্র boolean value সরাসরি পাঠাচ্ছি।
                // api.js এ pinReadOnlyCopy: (id, pinned) => API.patch(`/note/${id}/pin-readonly`, { pinned }) আছে,
                // তাই এটি বুলিয়ান ভ্যালুটি আশা করে।
                await notesApi.pinReadOnlyCopy(id, newPinStatus); 
                
                setIsPinned(newPinStatus);
                toast.success(t(newPinStatus ? "Note pinned successfully" : "Note unpinned successfully"));
            }
            
        } catch (error) {
            console.error("Failed to update pin status:", error); 
            // 400 ত্রুটি ডিবাগ করার জন্য গুরুত্বপূর্ণ
            console.error("Server Error Details (Check Network Tab):", error.response); 
            // API থেকে এরর মেসেজ দেখান
            toast.error(error.response?.data?.error || t("Failed to update pin status"));
        } finally {
            setIsActionLoading(false);
        }
    };
    // -----------------------------------------------------------------

    const handleShare = async () => {
        if (!id || !isOwner) return; 
        const username = prompt(t("Enter username to share with:"));
        if (username) {
            try {
                await notesApi.shareNote(id, { username });
                toast.success(t("Note shared successfully!"));
            } catch (error) {
                console.error("Error sharing note:", error);
                console.error("Server Error Details:", error.response); 
                toast.error(error.response?.data?.error || t("Failed to share note."));
            }
        }
    };
    
    // Updated: নোট মালিক না হলে তালিকা থেকে সরিয়ে দেওয়া (Delete Read-Only Copy)
    const handleRemoveSharedNote = async () => {
        if (isActionLoading) return;
        if (window.confirm(t("Are you sure you want to remove this shared note from your list?"))) {
            setIsActionLoading(true);
            try {
                // এটি আপনার api.js এ বিদ্যমান deleteReadOnlyCopy ফাংশনকে কল করবে।
                await notesApi.deleteReadOnlyCopy(id); 
                toast.success(t('This note has been removed from your list.'));
                navigate('/notes');
            } catch (error) {
                console.error("Error removing shared note:", error);
                console.error("Server Error Details (Check Network Tab):", error.response); 
                toast.error(error.response?.data?.error || t("Failed to remove shared note."));
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    // --- Delete ফাংশন (Owner-এর জন্য ডিলিট, Shared User-এর জন্য Remove) ---
    const handleDelete = async () => {
        if (isActionLoading) return;

        if (!isOwner) {
            handleRemoveSharedNote(); // মালিক না হলে রিমুভ করুন
            return;
        }
        
        // মালিক হলে ডিলিট করুন (Soft Delete assumed)
        if (window.confirm(t("Are you sure you want to delete this note?"))) {
            setIsActionLoading(true);
            try {
                await notesApi.deleteNote(id);
                toast.success(t("Note moved to trash."));
                navigate('/notes');
            } catch (error) {
                console.error("Failed to delete note:", error);
                console.error("Server Error Details:", error.response); 
                toast.error(t("Failed to delete note."));
            } finally {
                setIsActionLoading(false);
            }
        }
    };
    // ----------------------------------------------------------------------


    if (isLoading) {
        return <Loader />;
    }
    
    if (!title && !content) {
        return <div className="text-center mt-20 text-white relative z-10">{t("Note not found or you do not have permission.")}</div>;
    }

    return (
        <div className="min-h-screen w-full relative">
            {/* NoteFormPage-এর হুবহু ব্যাকগ্রাউন্ড স্টাইল */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "radial-gradient(125% 125% at 50% 100%, #000000 40%, #2b0707 100%)",
                }}
            />
            
            <div className="relative z-10 flex flex-col items-center p-4 min-h-screen font-sans">
                {/* Logo */}
                <div className="w-full flex justify-center mt-8 mb-4">
                    <img src={logo} alt="Note Creep Logo" className="h-24 w-auto shadow-effect" />
                </div>
                
                {/* Note Form/View Card */}
                <div ref={formRef} className="w-full max-w-4xl p-8 rounded-2xl shadow-2xl bg-gray-900 border border-gray-700 backdrop-filter backdrop-blur-md bg-opacity-80 transition-all duration-500 transform">
                    
                    {/* Back বাটন */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 text-white text-3xl hover:text-[#00bf63] transition-colors"
                        aria-label={t("Go back")}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    
                    {/* হেডিং */}
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#c1ff72] mb-6 text-center mt-8">
                        {isOwner ? t("View Your Note") : t("Shared Note")}
                    </h1>
                    
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        <div className="relative">
                            <label htmlFor="title" className="block text-gray-400 text-sm font-medium mb-2">
                                {t("Title")}
                            </label>
                            {/* Title Input */}
                            <input
                                id="title"
                                type="text"
                                value={title}
                                readOnly 
                                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00bf63]"
                                placeholder={t("Title of your note")}
                            />
                        </div>
                        
                        <div className="relative">
                            <label htmlFor="content" className="block text-gray-400 text-sm font-medium mb-2">
                                {t("Content")}
                            </label>
                            {/* Content Textarea */}
                            <textarea
                                id="content"
                                value={content}
                                rows="6"
                                readOnly
                                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00bf63] min-h-[250px] resize-y"
                                placeholder={t("Note content...")}
                            ></textarea>
                        </div>
                        
                        {/* অ্যাকশন বাটনস */}
                        <div className="flex items-center justify-between pt-4">
                            <div className="flex space-x-4">
                                
                                {/* 1. Pin/Unpin বাটন (Owner এবং Shared User উভয়ের জন্য) */}
                                {id && ( // Note ID থাকলে পিন বাটন দেখান
                                    <button
                                        type="button"
                                        onClick={handlePinToggle}
                                        disabled={isActionLoading}
                                        className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-300 ${isPinned ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                        title={isPinned ? t("Unpin Note") : t("Pin Note")}
                                    >
                                        <FontAwesomeIcon icon={faThumbtack} size="lg" />
                                    </button>
                                )}
                                
                                {/* 2. Share বাটন (শুধুমাত্র মালিকের জন্য) */}
                                {isOwner && (
                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        disabled={isActionLoading}
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 text-blue-400 hover:bg-gray-700 transition-colors duration-300"
                                        title={t("Share Note")}
                                    >
                                        <FontAwesomeIcon icon={faShareAlt} size="lg" />
                                    </button>
                                )}
                                
                                {/* 3. Delete / Remove বাটন (সকলের জন্য) */}
                                {id && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isActionLoading}
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-red-800 text-red-300 hover:bg-red-700 transition-colors duration-300"
                                        title={isOwner ? t("Delete Note") : t("Remove from List")}
                                    >
                                        <FontAwesomeIcon icon={faTrash} size="lg" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ViewNotePage;