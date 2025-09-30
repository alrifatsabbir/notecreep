// src/components/modals/ShareNoteModal.jsx

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareAlt, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { notes as notesApi } from '../../services/api';

const ShareNoteModal = ({ isOpen, onClose, noteId, onShared }) => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleShare = async (e) => {
        e.preventDefault();

        if (!username.trim()) {
            toast.error("Please enter a username to share with.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await notesApi.shareNote(noteId, { username });
            toast.success(response.data.message);
            if (onShared) onShared(); // parent component কে refresh করার জন্য কল
            onClose();
            setUsername('');
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to share note.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <FontAwesomeIcon icon={faShareAlt} className="mr-2 text-purple-400" /> Share Note
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>
                <p className="text-gray-400 mb-4 text-sm">
                    Enter the username of the person you want to share this note with. They will be able to view it.
                </p>
                <form onSubmit={handleShare}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`py-2 px-4 rounded-lg font-bold transition-colors duration-300 ${isLoading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            {isLoading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                    Sharing...
                                </>
                            ) : (
                                'Share'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShareNoteModal;
