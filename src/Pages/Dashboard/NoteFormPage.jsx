import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { notes as notesApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import Loader from '../../components/PageLoader';
import Navbar from '../../components/Navbar';
import Back from '../../components/Back';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faThumbtack,
  faShareAlt,
  faSave,
  faPlus,
  faClock,
  faFont,
  faFileText,
  faTimes,
  faCheckCircle,
  faBold,
  faItalic,
  faHeading,
  faQuoteLeft,
  faCode,
  faListUl,
  faListOl,
  faCheckSquare,
  faLink,
  faHighlighter,
  faEye,
  faEdit,
  faUserPlus,
  faUserMinus,
  faLock,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import { useConfirm } from '../../context/ConfirmContext';
import './NotesPage.css';

const NoteFormPage = () => {
  const { t } = useTranslation();
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { id } = useParams();
  const location = useLocation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSharedNote, setIsSharedNote] = useState(false);
  const [canEditNote, setCanEditNote] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  
  // Share & Permission State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUsername, setShareUsername] = useState('');
  const [sharePermission, setSharePermission] = useState('read'); // 'read' | 'edit'
  const [sharedUsersList, setSharedUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'

  const textareaRef = useRef(null);
  const formRef = useRef(null);

  const fetchSharedUsersList = async (noteId) => {
    try {
      const response = await notesApi.getSharedUsers(noteId);
      setSharedUsersList(response.data.sharedAccess || []);
    } catch (error) {
      console.error("Failed to fetch shared users list:", error);
    }
  };

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
          const noteData = response.data;

          setTitle(noteData.title || '');
          setContent(noteData.content || '');
          setIsPinned(noteData.pinned || false);

          const isShared = !noteData.isOwner;
          setIsSharedNote(isShared);
          setCanEditNote(noteData.canEdit);

          if (noteData.isOwner) {
            await fetchSharedUsersList(id);
          }
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
  }, [id, isLoggedIn, navigate, location.pathname, t]);

  useEffect(() => {
    if (!isLoading && formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [isLoading]);

  // Rich Text Format Inserter
  const applyFormat = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error(t("Please fill in both title and content."));
      return;
    }

    if (!canEditNote) {
      toast.error(t("You do not have permission to edit this note."));
      return;
    }

    setIsActionLoading(true);
    const noteData = { title, content };

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
      toast.error(error.response?.data?.error || t("Failed to save note."));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePinToggle = async () => {
    if (!id || isActionLoading) return;
    setIsActionLoading(true);
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
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareUsername.trim() || isActionLoading) return;

    setIsActionLoading(true);
    try {
      const response = await notesApi.shareNote(id, {
        username: shareUsername.trim(),
        permission: sharePermission
      });
      toast.success(t(`Note shared with ${shareUsername} (${sharePermission === 'edit' ? 'Can Edit' : 'Read Only'})!`));
      setShareUsername('');
      if (response.data.sharedAccess) {
        setSharedUsersList(response.data.sharedAccess);
      } else {
        await fetchSharedUsersList(id);
      }
    } catch (error) {
      console.error("Error sharing note:", error);
      toast.error(error.response?.data?.error || t("Failed to share note."));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnshareUser = async (targetUserId, targetUsername) => {
    if (isActionLoading) return;
    const isConfirmed = await confirm({
      title: t('Revoke Sharing Access'),
      message: t(`Are you sure you want to revoke sharing access for ${targetUsername}?`),
      confirmText: t('Revoke Access'),
      variant: 'warning'
    });
    if (!isConfirmed) return;

    setIsActionLoading(true);
    try {
      const response = await notesApi.unshareNote(id, targetUserId);
      toast.success(t(`Access revoked for ${targetUsername}`));
      if (response.data.sharedAccess) {
        setSharedUsersList(response.data.sharedAccess);
      } else {
        await fetchSharedUsersList(id);
      }
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error(t("Failed to revoke access."));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isSharedNote) {
      toast.error(t("You cannot delete a shared note."));
      return;
    }
    const isConfirmed = await confirm({
      title: t('Move Note to Trash'),
      message: t("Are you sure you want to move this note to trash?"),
      confirmText: t('Move to Trash'),
      variant: 'danger'
    });
    if (!isConfirmed) return;

    setIsActionLoading(true);
    try {
      await notesApi.deleteNote(id);
      toast.success(t("Note moved to trash!"));
      navigate('/notes');
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error(t("Failed to delete note."));
    } finally {
      setIsActionLoading(false);
    }
  };

  // Render Rich HTML Preview
  const renderPreview = (text) => {
    if (!text) return <p style={{ color: '#64748b', fontStyle: 'italic' }}>{t("Empty content...")}</p>;

    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.*$)/gim, '<h3 style="color:#00bf63; font-size: 18px; margin: 12px 0 6px;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color:#00bf63; font-size: 20px; margin: 14px 0 8px;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="color:#00bf63; font-size: 24px; margin: 16px 0 10px;">$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3px solid #00bf63; padding-left: 12px; color: #94a3b8; margin: 10px 0; font-style: italic;">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color: #cbd5e1;">$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: rgba(0,191,99,0.15); color: #00bf63; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer" style="color: #3b82f6; text-decoration: underline;">$1</a>')
      .replace(/^- \[ \] (.*$)/gim, '<div style="display:flex; align-items:center; gap:8px; margin: 4px 0;"><input type="checkbox" disabled /> <span>$1</span></div>')
      .replace(/^- \[x\] (.*$)/gim, '<div style="display:flex; align-items:center; gap:8px; margin: 4px 0; color: #00bf63;"><input type="checkbox" checked disabled /> <span style="text-decoration: line-through;">$1</span></div>')
      .replace(/^- (.*$)/gim, '<li style="margin-left: 20px;">$1</li>')
      .replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="notes-root">
      <div className="notes-ambient-bg" />
      <Navbar />

      <div className="notes-container" style={{ maxWidth: 950 }}>
        {/* Top Header Bar */}
        <div className="notes-header-bar" style={{ marginBottom: 24 }}>
          <div className="notes-title-group">
            <Back inline />
            <h1 className="notes-title">
              {id ? (isSharedNote ? (canEditNote ? t('Edit Shared Note') : t('View Note')) : t('Edit Note')) : t('Create Note')}
            </h1>
            {isPinned && (
              <span className="notes-badge-count" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)' }}>
                <FontAwesomeIcon icon={faThumbtack} style={{ marginRight: 4 }} /> {t("PINNED")}
              </span>
            )}
            {isSharedNote && (
              <span className="notes-badge-count" style={{ borderColor: canEditNote ? 'rgba(0, 191, 99, 0.4)' : 'rgba(59, 130, 246, 0.4)', color: canEditNote ? '#00bf63' : '#3b82f6', background: 'rgba(15, 23, 42, 0.6)' }}>
                <FontAwesomeIcon icon={canEditNote ? faEdit : faEye} style={{ marginRight: 4 }} />
                {canEditNote ? t('Can Edit') : t('Read Only')}
              </span>
            )}
          </div>

          {/* Top Quick Actions */}
          <div className="notes-action-group">
            {id && (
              <>
                <button
                  type="button"
                  onClick={handlePinToggle}
                  disabled={isActionLoading}
                  className={`notes-btn-icon ${isPinned ? 'notes-btn-active' : ''}`}
                  title={t("Pin Note")}
                  style={isPinned ? { borderColor: '#f59e0b', color: '#f59e0b', background: 'rgba(245,158,11,0.15)' } : {}}
                >
                  <FontAwesomeIcon icon={faThumbtack} />
                  <span>{isPinned ? t('Pinned') : t('Pin')}</span>
                </button>

                {!isSharedNote && (
                  <button
                    type="button"
                    onClick={() => {
                      fetchSharedUsersList(id);
                      setIsShareModalOpen(true);
                    }}
                    disabled={isActionLoading}
                    className="notes-btn-icon"
                    style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#3b82f6' }}
                    title={t("Share & Manage Access")}
                  >
                    <FontAwesomeIcon icon={faShareAlt} />
                    <span>{t("Share & Access")} ({sharedUsersList.length})</span>
                  </button>
                )}

                {!isSharedNote && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isActionLoading}
                    className="notes-btn-icon"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                    title={t("Delete Note")}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span>{t("Trash")}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main Editor Cockpit Card */}
        <div
          ref={formRef}
          style={{
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(8, 12, 20, 0.95) 100%)',
            borderColor: 'rgba(30, 41, 59, 0.8)',
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Title Field */}
            <div>
              <label
                htmlFor="title"
                style={{
                  display: 'block',
                  color: '#64748b',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                  fontFamily: 'monospace'
                }}
              >
                {t("Title")}
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("Title...")}
                required
                readOnly={!canEditNote}
                style={{
                  width: '100%',
                  background: 'rgba(8, 12, 20, 0.7)',
                  border: '1px solid #1e293b',
                  borderRadius: 10,
                  padding: '14px 18px',
                  color: '#ffffff',
                  fontSize: 20,
                  fontWeight: 700,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00bf63'}
                onBlur={(e) => e.target.style.borderColor = '#1e293b'}
              />
            </div>

            {/* Rich Text Editor Block */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label
                    style={{
                      color: '#64748b',
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontFamily: 'monospace',
                      marginRight: 8
                    }}
                  >
                    {t("Content Body")}
                  </label>

                  {/* Mode Selector Tabs */}
                  <div style={{ display: 'flex', background: '#080c14', borderRadius: 8, padding: 3, border: '1px solid #1e293b' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('write')}
                      style={{
                        padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', background: activeTab === 'write' ? '#00bf63' : 'transparent',
                        color: activeTab === 'write' ? '#080c14' : '#64748b', transition: 'all 0.2s ease'
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} style={{ marginRight: 4 }} /> {t("Editor")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      style={{
                        padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', background: activeTab === 'preview' ? '#00bf63' : 'transparent',
                        color: activeTab === 'preview' ? '#080c14' : '#64748b', transition: 'all 0.2s ease'
                      }}
                    >
                      <FontAwesomeIcon icon={faEye} style={{ marginRight: 4 }} /> {t("Preview")}
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', gap: 14, fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                  <span><FontAwesomeIcon icon={faFont} style={{ marginRight: 4 }} />{wordCount} {t("words")}</span>
                  <span><FontAwesomeIcon icon={faFileText} style={{ marginRight: 4 }} />{charCount} {t("chars")}</span>
                  <span><FontAwesomeIcon icon={faClock} style={{ marginRight: 4 }} />~{readTimeMin} {t("min read")}</span>
                </div>
              </div>

              {/* Rich Text Toolbar */}
              {activeTab === 'write' && canEditNote && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    background: '#080c14',
                    border: '1px solid #1e293b',
                    borderBottom: 'none',
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    padding: '8px 12px'
                  }}
                >
                  <button type="button" onClick={() => applyFormat('**', '**')} className="notes-btn-icon" style={{ padding: '4px 8px', fontSize: 12 }} title={t("Bold")}>
                    <FontAwesomeIcon icon={faBold} />
                  </button>
                  <button type="button" onClick={() => applyFormat('*', '*')} className="notes-btn-icon" style={{ padding: '4px 8px', fontSize: 12 }} title={t("Italic")}>
                    <FontAwesomeIcon icon={faItalic} />
                  </button>
                  <button type="button" onClick={() => applyFormat('<mark>', '</mark>')} className="notes-btn-icon" style={{ padding: '4px 8px', fontSize: 12 }} title={t("Highlight")}>
                    <FontAwesomeIcon icon={faHighlighter} />
                  </button>
                  <div style={{ width: 1, background: '#1e293b', margin: '0 4px' }} />
                  <button type="button" onClick={() => applyFormat('# ')} className="notes-btn-icon" style={{ padding: '4px 8px', fontSize: 12 }} title={t("Heading")}>
                    <FontAwesomeIcon icon={faHeading} /> H1
                  </button>
                  <button type="button" onClick={() => applyFormat('## ')} className="notes-btn-icon" style={{ padding: '4px 8px', fontSize: 12 }} title={t("Heading")}>
                    <FontAwesomeIcon icon={faHeading} /> H2
                  </button>
                  <div style={{ width: 1, background: '#1e293b', margin: '0 4px' }} />
                  <button type="button" onClick={() => applyFormat('> ')} className="notes-btn-icon" style={{ padding: '4px 8px', fontSize: 12 }} title={t("Blockquote")}>
                    <FontAwesomeIcon icon={faQuoteLeft} />
                  </button>
                  <button type="button" onClick={() => applyFormat('`', '`')} className="notes-btn-icon" style={{ padding: '4px 8px', fontSize: 12 }} title={t("Code Block")}>
                    <FontAwesomeIcon icon={faCode} />
                  </button>
                  <div style={{ width: 1, background: '#1e293b', margin: '0 4px' }} />
                  <button type="button" onClick={() => applyFormat('- ')} className="notes-btn-icon" style={{ padding: '4px 8px', fontSize: 12 }} title={t("Checklist")}>
                    <FontAwesomeIcon icon={faListUl} />
                  </button>
                  <button type="button" onClick={() => applyFormat('1. ')} className="notes-btn-icon" style={{ padding: '4px 8px', fontSize: 12 }} title={t("Checklist")}>
                    <FontAwesomeIcon icon={faListOl} />
                  </button>
                  <button type="button" onClick={() => applyFormat('- [ ] ')} className="notes-btn-icon" style={{ padding: '4px 8px', fontSize: 12 }} title={t("Checklist")}>
                    <FontAwesomeIcon icon={faCheckSquare} />
                  </button>
                  <button type="button" onClick={() => applyFormat('[Link Title](', ')')} className="notes-btn-icon" style={{ padding: '4px 8px', fontSize: 12 }} title={t("Link")}>
                    <FontAwesomeIcon icon={faLink} />
                  </button>
                </div>
              )}

              {/* Editor Textarea or Live Preview Display */}
              {activeTab === 'write' ? (
                <textarea
                  ref={textareaRef}
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t("Write your markdown note here...")}
                  required
                  readOnly={!canEditNote}
                  rows={14}
                  style={{
                    width: '100%',
                    minHeight: 320,
                    background: 'rgba(8, 12, 20, 0.7)',
                    border: '1px solid #1e293b',
                    borderTopLeftRadius: canEditNote ? 0 : 10,
                    borderTopRightRadius: canEditNote ? 0 : 10,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    padding: '16px 18px',
                    color: '#e2e8f0',
                    fontSize: 15,
                    lineHeight: 1.7,
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.2s ease',
                    fontFamily: 'monospace, inter, sans-serif',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00bf63'}
                  onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    minHeight: 320,
                    background: 'rgba(8, 12, 20, 0.9)',
                    border: '1px solid #1e293b',
                    borderRadius: 10,
                    padding: '20px 24px',
                    color: '#e2e8f0',
                    fontSize: 15,
                    lineHeight: 1.7,
                    boxSizing: 'border-box',
                    overflowY: 'auto'
                  }}
                >
                  {renderPreview(content)}
                </div>
              )}
            </div>

            {/* Form Footer Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(30, 41, 59, 0.6)' }}>
              <button
                type="button"
                onClick={() => navigate('/notes')}
                className="notes-btn-icon"
              >
                {t("Cancel")}
              </button>

              {canEditNote && (
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="notes-btn-create"
                  style={{ padding: '12px 28px', fontSize: 14 }}
                >
                  <FontAwesomeIcon icon={id ? faSave : faPlus} />
                  <span>{id ? t("Save Note") : t("Create Note")}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Upgraded Share & Access Control Modal */}
      {isShareModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#0d1117', border: '1px solid #1e293b',
            borderRadius: 16, padding: 28, width: '100%', maxWidth: 520,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                <FontAwesomeIcon icon={faShareAlt} style={{ color: '#3b82f6', marginRight: 8 }} />
                {t("Share & Manage Access")}
              </h3>
              <button onClick={() => setIsShareModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Share Form */}
            <form onSubmit={handleShareSubmit} style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #1e293b' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'monospace' }}>
                {t("Add Collaborator by Username")}
              </label>
              
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder={t("Enter username...")}
                  value={shareUsername}
                  onChange={(e) => setShareUsername(e.target.value)}
                  required
                  style={{
                    flex: 1, background: '#161b22', border: '1px solid #1e293b',
                    borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14,
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />

                {/* Permission Selector */}
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value)}
                  style={{
                    background: '#161b22', border: '1px solid #1e293b', color: '#fff',
                    borderRadius: 8, padding: '0 12px', fontSize: 13, fontWeight: 600, outline: 'none'
                  }}
                >
                  <option value="read">{t("Read Only")}</option>
                  <option value="edit">{t("Can Edit")}</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isActionLoading || !shareUsername.trim()}
                className="notes-btn-create"
                style={{ width: '100%', justifyContent: 'center', background: '#3b82f6', color: '#ffffff' }}
              >
                <FontAwesomeIcon icon={faUserPlus} /> {t("Share Access")}
              </button>
            </form>

            {/* Collaborators List */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 12 }}>
                {t("Current Collaborators")} ({sharedUsersList.length})
              </h4>

              {sharedUsersList.length === 0 ? (
                <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                  {t("This note is not currently shared with anyone.")}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                  {sharedUsersList.map((entry, idx) => {
                    const u = entry.user || {};
                    const perm = entry.permission || 'read';
                    return (
                      <div
                        key={u._id || idx}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: '#161b22', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 14px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                            @{u.username || 'User'}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{u.email || ''}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                              background: perm === 'edit' ? 'rgba(0,191,99,0.15)' : 'rgba(59,130,246,0.15)',
                              color: perm === 'edit' ? '#00bf63' : '#3b82f6',
                              border: `1px solid ${perm === 'edit' ? 'rgba(0,191,99,0.3)' : 'rgba(59,130,246,0.3)'}`
                            }}
                          >
                            <FontAwesomeIcon icon={perm === 'edit' ? faEdit : faEye} style={{ marginRight: 4 }} />
                            {perm === 'edit' ? t("Can Edit") : t("Read Only")}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleUnshareUser(u._id, u.username)}
                            disabled={isActionLoading}
                            style={{
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                              color: '#ef4444', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer'
                            }}
                            title={t("Revoke Access")}
                          >
                            <FontAwesomeIcon icon={faUserMinus} /> {t("Remove")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteFormPage;