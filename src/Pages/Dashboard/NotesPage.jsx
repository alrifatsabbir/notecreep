import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { notes as notesApi } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash, faThumbtack, faPlus, faCheckCircle, faClock,
  faShareAlt, faCheckSquare, faSquare, faTimes, faSearch,
  faFilter, faSortAmountDown, faFileLines, faExternalLinkAlt,
  faPenToSquare, faEye
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/PageLoader';
import Navbar from '../../components/Navbar';
import Back from '../../components/Back';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import ShareNoteModal from '../../components/modals/ShareNoteModal';
import { useConfirm } from '../../context/ConfirmContext';
import './NotesPage.css';

const NotesPage = () => {
  const { t, i18n } = useTranslation();
  const { isLoggedIn, user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [noteToShareId, setNoteToShareId] = useState(null);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'pinned', 'shared'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'title', 'length'

  const containerRef = useRef(null);

  const sortNotes = useCallback((allNotes) => {
    const currentUserId = currentUser?.id;

    const getEffectivePinnedStatus = (note) => {
      const isOwner = note.user === currentUserId;
      return isOwner ? (note.pinned || false) : (note.readOnlyPinned || false);
    };

    const pinned = allNotes.filter(note => getEffectivePinnedStatus(note));
    const unpinned = allNotes.filter(note => !getEffectivePinnedStatus(note));

    return [...pinned, ...unpinned];
  }, [currentUser]);

  const fetchNotes = useCallback(async () => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await notesApi.getNotes();
      setNotes(sortNotes(response.data.notes));
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      toast.error(t("Failed to load notes."));
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, t, sortNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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

  const handleDelete = async (id) => {
    if (isActionLoading) return;
    const isConfirmed = await confirm({
      title: t('Move Note to Trash'),
      message: t('Are you sure you want to move this note to trash?'),
      confirmText: t('Move to Trash'),
      variant: 'danger'
    });
    if (!isConfirmed) return;

    setIsActionLoading(true);
    try {
      await notesApi.deleteNote(id);
      toast.success(t("Note moved to trash!"));
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
        await notesApi.unpinNote(id);
        toast.success(t("Note unpinned"));
      } else {
        await notesApi.pinNote(id);
        toast.success(t("Note pinned"));
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
      await notesApi.pinReadOnlyCopy(noteId, !isCurrentlyPinned);
      toast.success(isCurrentlyPinned ? t("Read-only note unpinned") : t("Read-only note pinned"));
      await fetchNotes();
    } catch (error) {
      console.error("Failed to pin read-only note:", error);
      toast.error(t("Failed to update pin status"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteReadOnly = async (noteId) => {
    if (isActionLoading) return;
    const isConfirmed = await confirm({
      title: t('Remove Shared Note'),
      message: t('Are you sure you want to remove this shared note from your list?'),
      confirmText: t('Remove Note'),
      variant: 'danger'
    });
    if (!isConfirmed) return;

    setIsActionLoading(true);
    try {
      await notesApi.deleteReadOnlyCopy(noteId);
      toast.success(t("Read-only copy removed"));
      await fetchNotes();
    } catch (error) {
      console.error("Failed to delete read-only note:", error);
      toast.error(t("Failed to delete read-only note"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleNoteClick = (note) => {
    if (!currentUser) return;

    const isOwner = note.user === currentUser.id || note.isOwner;
    const canEdit = isOwner || note.canEdit || note.permission === 'edit';

    if (!isSelectionMode) {
      localStorage.setItem('lastOpenedNoteId', note._id);
      if (canEdit) {
        navigate(`/edit/${note._id}`);
      } else {
        navigate(`/view/${note._id}`);
      }
      return;
    }

    if (canEdit || isOwner) {
      setSelectedNotes(prev => {
        if (prev.includes(note._id)) {
          return prev.filter(id => id !== note._id);
        } else {
          return [...prev, note._id];
        }
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotes.length === 0 || isActionLoading) return;
    const isConfirmed = await confirm({
      title: t('Move Selected Notes to Trash'),
      message: t('Are you sure you want to move selected notes to trash?'),
      confirmText: t('Move All to Trash'),
      variant: 'danger'
    });
    if (!isConfirmed) return;

    setIsActionLoading(true);
    try {
      await Promise.all(selectedNotes.map(id => notesApi.deleteNote(id)));
      toast.success(t("Selected notes moved to trash!"));
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

  const handleBulkPinToggle = async () => {
    if (selectedNotes.length === 0 || isActionLoading) return;
    setIsActionLoading(true);
    try {
      const selectedObjects = notes.filter(n => selectedNotes.includes(n._id));
      const allPinned = selectedObjects.length > 0 && selectedObjects.every(n => n.pinned);

      if (allPinned) {
        await Promise.all(selectedNotes.map(id => notesApi.unpinNote(id)));
        toast.success(t("Selected notes unpinned!"));
      } else {
        await Promise.all(selectedNotes.map(id => notesApi.pinNote(id)));
        toast.success(t("Selected notes pinned!"));
      }
      await fetchNotes();
      setSelectedNotes([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error("Failed to toggle pin on selected notes:", error);
      toast.error(t("Failed to update pin status."));
    } finally {
      setIsActionLoading(false);
    }
  };

  // Filtering & Sorting Logic
  const filteredNotes = notes.filter(note => {
    const isOwner = note.user === currentUser?.id;
    const isPinned = isOwner ? note.pinned : note.readOnlyPinned;
    const isShared = (note.sharedWith && note.sharedWith.length > 0) || !isOwner;

    // Filter by Category
    if (filterCategory === 'pinned' && !isPinned) return false;
    if (filterCategory === 'shared' && !isShared) return false;

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title?.toLowerCase().includes(q);
      const matchContent = note.content?.toLowerCase().includes(q);
      return matchTitle || matchContent;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    if (sortBy === 'length') return (b.content || '').length - (a.content || '').length;
    return 0;
  });

  if (isLoading) return <Loader />;

  if (!isLoggedIn) {
    return (
      <div className="notes-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: 40, background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, maxWidth: 400 }}>
          <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 40, color: '#00bf63', marginBottom: 16 }} />
          <p style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 20 }}>{t("Please log in to view your notes.")}</p>
          <button onClick={() => navigate('/login')} className="notes-btn-create" style={{ margin: '0 auto' }}>
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
            <h1 className="notes-title">{t("Workspace Notes")}</h1>
            <span className="notes-badge-count">{filteredNotes.length} {t("Notes")}</span>
          </div>

          <div className="notes-action-group">
            <button onClick={() => navigate('/create')} className="notes-btn-create">
              <FontAwesomeIcon icon={faPlus} />
              <span>{t("Create Note")}</span>
            </button>

            <button 
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              className={`notes-btn-icon ${isSelectionMode ? 'notes-btn-active' : ''}`}
            >
              <FontAwesomeIcon icon={isSelectionMode ? faCheckSquare : faSquare} />
              <span>{isSelectionMode ? t("Cancel") : t("Select")}</span>
            </button>

            <button onClick={() => navigate('/pinned')} className="notes-btn-icon">
              <FontAwesomeIcon icon={faThumbtack} style={{ color: '#f59e0b' }} />
              <span>{t("Pinned")}</span>
            </button>

            <button onClick={() => navigate('/trash')} className="notes-btn-icon">
              <FontAwesomeIcon icon={faTrash} style={{ color: '#ef4444' }} />
              <span>{t("Trash")}</span>
            </button>
          </div>
        </div>

        {/* Sticky Bulk Action Control Bar */}
        {isSelectionMode && (
          <div className="notes-bulk-bar">
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
              {selectedNotes.length} {t("Selected")}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleBulkPinToggle} className="notes-btn-create" style={{ background: '#f59e0b', color: '#000' }}>
                <FontAwesomeIcon icon={faThumbtack} /> {t("Pin / Unpin")}
              </button>
              <button onClick={handleBulkDelete} className="notes-btn-icon" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                <FontAwesomeIcon icon={faTrash} /> {t("Delete")}
              </button>
              <button onClick={() => { setSelectedNotes([]); setIsSelectionMode(false); }} className="notes-btn-icon">
                <FontAwesomeIcon icon={faTimes} /> {t("Cancel")}
              </button>
            </div>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="notes-filter-strip">
          {/* Search Box */}
          <div className="notes-search-box">
            <FontAwesomeIcon icon={faSearch} className="notes-search-icon" />
            <input
              type="text"
              placeholder={t("Search title, content...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="notes-search-input"
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'pinned', 'shared'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`notes-btn-icon ${filterCategory === cat ? 'notes-btn-active' : ''}`}
                style={{ textTransform: 'capitalize', fontSize: 11, padding: '6px 12px' }}
              >
                {t(cat)}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FontAwesomeIcon icon={faSortAmountDown} style={{ fontSize: 12, color: '#64748b' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: '#080c14', border: '1px solid #1e293b', color: '#94a3b8',
                borderRadius: 8, padding: '6px 10px', fontSize: 11, fontFamily: 'monospace', outline: 'none'
              }}
            >
              <option value="newest">{t("Newest First")}</option>
              <option value="oldest">{t("Oldest First")}</option>
              <option value="title">{t("Title (A-Z)")}</option>
              <option value="length">{t("Length")}</option>
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="notes-empty-card">
            <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 44, color: '#334155', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>
              {searchQuery ? t("No matching notes found") : t("No notes created yet")}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>
              {searchQuery ? t("Try adjusting your search query or category filters.") : t("Create your first note to start organizing ideas securely.")}
            </p>
            {!searchQuery && (
              <button onClick={() => navigate('/create')} className="notes-btn-create" style={{ margin: '0 auto' }}>
                <FontAwesomeIcon icon={faPlus} /> {t("Create First Note")}
              </button>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => {
              const isSelected = selectedNotes.includes(note._id);
              const isOwner = note.user === currentUser?.id || note.isOwner;
              const permission = note.permission || (isOwner ? 'owner' : 'read');
              const canEdit = isOwner || note.canEdit || permission === 'edit';
              const isReadOnly = !isOwner && !canEdit;
              const isPinned = isOwner ? note.pinned : note.readOnlyPinned;
              const charCount = (note.content || '').length;
              const dateLocale = i18n.language === 'bn' ? 'bn-BD' : 'en-US';
              const createdDate = new Date(note.createdAt || Date.now()).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' });

              return (
                <div
                  key={note._id}
                  className={`note-card ${isSelected ? 'note-card-selected' : ''} ${isReadOnly ? 'note-card-readonly' : ''}`}
                  onClick={() => handleNoteClick(note)}
                >
                  {/* Badges Bar */}
                  <div className="note-card-badges">
                    {isPinned && (
                      <span className="note-badge-pin">
                        <FontAwesomeIcon icon={faThumbtack} style={{ marginRight: 4 }} /> {t("PINNED")}
                      </span>
                    )}

                    {isOwner && note.sharedWith && note.sharedWith.length > 0 && (
                      <span className="note-badge-share">
                        <FontAwesomeIcon icon={faShareAlt} style={{ marginRight: 4 }} /> {t("SHARED")} ({note.sharedWith.length})
                      </span>
                    )}

                    {!isOwner && canEdit && (
                      <span className="note-badge-share" style={{ color: '#00bf63', borderColor: 'rgba(0,191,99,0.3)', background: 'rgba(0,191,99,0.15)' }}>
                        <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: 4 }} /> {t("CAN EDIT")}
                      </span>
                    )}

                    {!isOwner && !canEdit && (
                      <span className="note-badge-share" style={{ color: '#a78bfa', borderColor: 'rgba(167,139,246,0.3)', background: 'rgba(167,139,246,0.15)' }}>
                        <FontAwesomeIcon icon={faEye} style={{ marginRight: 4 }} /> {t("READ ONLY")}
                      </span>
                    )}
                  </div>

                  {/* Title & Excerpt */}
                  <h3 className="note-title">{truncateText(note.title || t('Untitled Note'), 8)}</h3>
                  <p className="note-excerpt">{truncateText(note.content, 26)}</p>

                  {/* Card Footer */}
                  <div className="note-card-footer">
                    <div className="note-date">
                      {createdDate} • {charCount} {t("chars")}
                    </div>

                    <div className="note-actions">
                      {isOwner ? (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePin(note._id, note.pinned); }}
                            className={`note-btn-action ${note.pinned ? 'note-btn-pin-active' : ''}`}
                            title={note.pinned ? t('Unpin Note') : t('Pin Note')}
                          >
                            <FontAwesomeIcon icon={faThumbtack} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setNoteToShareId(note._id); setIsShareModalOpen(true); }}
                            className="note-btn-action"
                            title={t('Share Note')}
                          >
                            <FontAwesomeIcon icon={faShareAlt} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                            className="note-btn-action note-btn-danger"
                            title={t('Delete Note')}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePinReadOnly(note._id, note.readOnlyPinned || false); }}
                            className={`note-btn-action ${note.readOnlyPinned ? 'note-btn-pin-active' : ''}`}
                            title={t('Pin Read-only')}
                          >
                            <FontAwesomeIcon icon={faThumbtack} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteReadOnly(note._id); }}
                            className="note-btn-action note-btn-danger"
                            title={t('Delete Read-only')}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
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
  );
};

export default NotesPage;