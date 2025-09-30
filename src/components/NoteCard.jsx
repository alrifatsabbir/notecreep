import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faThumbtack, faShareAlt, faCheckSquare, faSquare, faPencilAlt, faFileLines } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const NoteCard = ({
    note,
    isSelectionMode = false,
    isSelected = false,
    handleDelete,
    handlePinToggle,
    handleUnpin,
    isPlaceholder = false,
    link,
    title,
    icon,
}) => {
    const { t } = useTranslation();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isPlaceholder) {
        return (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 h-60 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.02]">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-[#c1ff72]">{t(title)}</h3>
                        <FontAwesomeIcon icon={icon} className="text-gray-500 text-lg" />
                    </div>
                    {note ? (
                        <>
                            <p className="text-lg font-medium text-gray-300 truncate">{note.title}</p>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-3">{note.content}</p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-400 mt-1">{t("No notes here.")}</p>
                    )}
                </div>
                <a href={link} className="text-[#00bf63] font-semibold hover:underline mt-4 self-start">
                    {t("View")}
                </a>
            </div>
        );
    }

    const shortContent = note?.content.length > 100 ? `${note.content.substring(0, 100)}...` : note?.content;

    const handleShareClick = (e) => {
        e.stopPropagation();
        toast.success(t("Share feature coming soon!"));
    };

    const handlePinClick = (e) => {
        e.stopPropagation();
        if (handlePinToggle) {
            handlePinToggle();
        } else if (handleUnpin) {
            handleUnpin();
        }
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (handleDelete) {
            handleDelete();
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 relative transition-transform duration-300 hover:scale-[1.02] transform-gpu">
            {isSelectionMode && (
                <div className="absolute top-4 right-4 z-10">
                    <FontAwesomeIcon
                        icon={isSelected ? faCheckSquare : faSquare}
                        className={`text-2xl cursor-pointer transition-colors ${isSelected ? 'text-[#00bf63]' : 'text-gray-500 hover:text-gray-300'}`}
                    />
                </div>
            )}
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-[#c1ff72] break-all max-w-[80%]">{note?.title || t("Untitled")}</h3>
                <div className="flex-shrink-0 flex items-center space-x-2">
                    <button onClick={handlePinClick} className="text-gray-500 hover:text-yellow-400 transition-colors">
                        <FontAwesomeIcon icon={faThumbtack} />
                    </button>
                    <button onClick={handleShareClick} className="text-gray-500 hover:text-blue-400 transition-colors">
                        <FontAwesomeIcon icon={faShareAlt} />
                    </button>
                    <button onClick={handleDeleteClick} className="text-gray-500 hover:text-red-400 transition-colors">
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{shortContent || t("No content.")}</p>
            <div className="text-right text-gray-500 text-xs mt-auto">
                {formatDate(note?.createdAt)}
            </div>
        </div>
    );
};

export default NoteCard;