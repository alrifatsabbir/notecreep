import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { notes as notesApi } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faThumbtack, faShareAlt, faFileLines, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/PageLoader';
import Navbar from '../../components/Navbar';
import Back from '../../components/Back';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import './NotesPage.css';

const PinnedNotesPage = () => {
  const { t } = useTranslation();
  const { isLoggedIn, user: currentUser } = useContext(AuthContext);
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
      const fetchedPinnedNotes = allNotes.filter(note => {
        const isOwner = note.user === currentUser.id;
        return isOwner ? note.pinned : note.readOnlyPinned;
      });
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
    if (!isLoading && containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
    }
  }, [isLoading]);

  const truncateText = (text, wordCount) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  const handleUnpin = async (id) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      await notesApi.unpinNote(id);
      toast.success(t("Note unpinned"));
      await fetchPinnedNotes();
    } catch (error) {
      console.error("Failed to unpin note:", error);
      toast.error(t("Failed to unpin note"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      await notesApi.deleteNote(id);
      toast.success(t("Note moved to trash!"));
      await fetchPinnedNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error(t("Failed to delete note"));
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) return <Loader />;

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="notes-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: 40, background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16 }}>
          <p style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 20 }}>{t("Please log in to view your pinned notes.")}</p>
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
            <h1 className="notes-title">{t("Pinned Notes")}</h1>
            <span className="notes-badge-count" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)' }}>
              {pinnedNotes.length} {t("Pinned")}
            </span>
          </div>

          <div className="notes-action-group">
            <button onClick={() => navigate('/notes')} className="notes-btn-icon">
              <FontAwesomeIcon icon={faFileLines} />
              <span>{t("All Notes")}</span>
            </button>
            <button onClick={() => navigate('/create')} className="notes-btn-create">
              <FontAwesomeIcon icon={faPlus} />
              <span>{t("Create Note")}</span>
            </button>
          </div>
        </div>

        {/* Pinned Notes Grid */}
        {pinnedNotes.length === 0 ? (
          <div className="notes-empty-card">
            <FontAwesomeIcon icon={faThumbtack} style={{ fontSize: 44, color: '#f59e0b', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>
              {t("No Pinned Notes")}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>
              {t("Pin important notes from your workspace to keep them quickly accessible here.")}
            </p>
            <button onClick={() => navigate('/notes')} className="notes-btn-create" style={{ margin: '0 auto' }}>
              {t("View Workspace Notes")}
            </button>
          </div>
        ) : (
          <div className="notes-grid">
            {pinnedNotes.map((note) => {
              const isOwner = note.user === currentUser.id;
              const charCount = (note.content || '').length;

              return (
                <div
                  key={note._id}
                  className="note-card"
                  onClick={() => isOwner ? navigate(`/edit/${note._id}`) : navigate(`/view/${note._id}`)}
                >
                  <div className="note-card-badges">
                    <span className="note-badge-pin">
                      <FontAwesomeIcon icon={faThumbtack} style={{ marginRight: 4 }} /> {t("PINNED")}
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
                        onClick={(e) => { e.stopPropagation(); handleUnpin(note._id); }}
                        className="note-btn-action note-btn-pin-active"
                        title={t("Unpin Note")}
                      >
                        <FontAwesomeIcon icon={faThumbtack} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                        className="note-btn-action note-btn-danger"
                        title={t("Delete Note")}
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

export default PinnedNotesPage;
