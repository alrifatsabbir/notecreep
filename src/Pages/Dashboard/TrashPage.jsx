import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { notes as notesApi } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashRestore, faTrash, faFileLines, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/PageLoader';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import Navbar from '../../components/Navbar';
import Back from '../../components/Back';
import { useConfirm } from '../../context/ConfirmContext';
import './NotesPage.css';

const TrashPage = () => {
  const { t } = useTranslation();
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const confirm = useConfirm();

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
    if (!isLoading && containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [isLoading]);

  const truncateText = (text, wordCount) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  const handleSelectNote = (id) => {
    setSelectedNotes((prev) =>
      prev.includes(id) ? prev.filter((noteId) => noteId !== id) : [...prev, id]
    );
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
    const isConfirmed = await confirm({
      title: t('Permanently Delete Note?'),
      message: t('This note will be permanently deleted and cannot be recovered.'),
      confirmText: t('Permanently Delete'),
      variant: 'danger'
    });
    if (!isConfirmed) return;

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
    const isConfirmed = await confirm({
      title: t('Permanently Delete Selected Notes?'),
      message: t('Selected notes will be permanently deleted and cannot be recovered.'),
      confirmText: t('Permanently Delete All'),
      variant: 'danger'
    });
    if (!isConfirmed) return;

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
      <div className="notes-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: 40, background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16 }}>
          <p style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 20 }}>{t("Please log in to view your notes.")}</p>
          <button onClick={() => navigate('/login')} className="notes-btn-create">
            {t("login.button")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-root">
      <div className="notes-ambient-bg" />
      <Navbar />

      <div ref={containerRef} className="notes-container">
        {/* Header Bar */}
        <div className="notes-header-bar">
          <div className="notes-title-group">
            <Back inline />
            <h1 className="notes-title">{t("Trash Bin")}</h1>
            <span className="notes-badge-count" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)' }}>
              {deletedNotes.length} {t("Trashed")}
            </span>
          </div>

          <div className="notes-action-group">
            <button onClick={() => navigate('/notes')} className="notes-btn-icon">
              <FontAwesomeIcon icon={faFileLines} />
              <span>{t("All Notes")}</span>
            </button>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedNotes.length > 0 && (
          <div className="notes-bulk-bar" style={{ borderColor: '#ef4444' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
              {selectedNotes.length} {t("Selected")}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleBulkRestore} className="notes-btn-create" style={{ background: '#3b82f6', color: '#fff' }}>
                <FontAwesomeIcon icon={faTrashRestore} /> {t("Restore Selected")}
              </button>
              <button onClick={handleBulkDelete} className="notes-btn-icon" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                <FontAwesomeIcon icon={faTrash} /> {t("Permanently Delete")}
              </button>
              <button onClick={() => setSelectedNotes([])} className="notes-btn-icon">
                <FontAwesomeIcon icon={faTimes} /> {t("Cancel")}
              </button>
            </div>
          </div>
        )}

        {/* Deleted Notes Grid */}
        {deletedNotes.length === 0 ? (
          <div className="notes-empty-card">
            <FontAwesomeIcon icon={faTrash} style={{ fontSize: 44, color: '#475569', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>
              {t("Trash is Empty")}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>
              {t("Your trash is empty.")}
            </p>
            <button onClick={() => navigate('/notes')} className="notes-btn-create" style={{ margin: '0 auto' }}>
              {t("Go to Notes")}
            </button>
          </div>
        ) : (
          <div className="notes-grid">
            {deletedNotes.map((note) => {
              const isSelected = selectedNotes.includes(note._id);
              const charCount = (note.content || '').length;

              return (
                <div
                  key={note._id}
                  className={`note-card ${isSelected ? 'note-card-selected' : ''}`}
                  onClick={() => handleSelectNote(note._id)}
                >
                  <div className="note-card-badges">
                    <span className="note-badge-pin" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.15)' }}>
                      {t("TRASHED")}
                    </span>
                  </div>

                  <h3 className="note-title">{truncateText(note.title || t('Untitled Note'), 8)}</h3>
                  <p className="note-excerpt">{truncateText(note.content, 26)}</p>

                  <div className="note-card-footer">
                    <div className="note-date">
                      {charCount} {t("chars")}
                    </div>

                    <div className="note-actions">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRestore(note._id); }}
                        className="note-btn-action"
                        style={{ color: '#3b82f6', borderColor: 'rgba(59,130,246,0.4)' }}
                        title={t("Restore Note")}
                      >
                        <FontAwesomeIcon icon={faTrashRestore} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleHardDelete(note._id); }}
                        className="note-btn-action note-btn-danger"
                        title={t("Permanently Delete")}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashPage;
