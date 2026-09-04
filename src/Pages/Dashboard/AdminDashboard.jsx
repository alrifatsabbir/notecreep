import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { admin as adminApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import Back from '../../components/Back';
import Loader from '../../components/PageLoader';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faLock, faChartLine, faUsers, faTerminal, faEnvelope, faDatabase, faServer, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import StatsCards from './admin/StatsCards';
import ChartPanel from './admin/ChartPanel';
import UsersTable from './admin/UsersTable';
import AuditLogs from './admin/AuditLogs';
import DetailsPanel from './admin/DetailsPanel';
import ServerHealthPanel from './admin/ServerHealthPanel';
import EmailLogsPanel from './admin/EmailLogsPanel';
import AdminNotificationsPanel from './admin/AdminNotificationsPanel';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dailySeries, setDailySeries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAll = useCallback(async () => {
    try {
      const [s, u, l, c] = await Promise.all([
        adminApi.getStats(), adminApi.getUsers(searchQuery),
        adminApi.getSystemLogs(), adminApi.getChartAnalytics()
      ]);
      setStats(s.data); setUsers(u.data.users); setLogs(l.data.logs);
      setChartData(c.data.chartSeries); setDailySeries(c.data.dailySeries || []);
    } catch (e) { console.error(e); toast.error(t('Failed to load admin data')); }
    finally { setIsLoading(false); setRefreshing(false); }
  }, [searchQuery, t]);

  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') fetchAll();
    else if (isLoggedIn) setIsLoading(false);
  }, [isLoggedIn, user, fetchAll]);

  const handleRoleToggle = async (id, role) => {
    try { await adminApi.updateRole(id, role === 'admin' ? 'user' : 'admin'); toast.success(t('Role updated')); fetchAll(); }
    catch (e) { toast.error(e.response?.data?.message || t('Failed to update role')); }
  };
  const handleVerifyToggle = async (id) => {
    try { const r = await adminApi.toggleVerification(id); toast.success(r.data.message); fetchAll(); }
    catch { toast.error(t('Failed to toggle verification')); }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await adminApi.deleteUser(deleteTarget._id); toast.success(t('User purged')); setDeleteTarget(null); fetchAll(); }
    catch (e) { toast.error(e.response?.data?.message || t('Failed to delete user')); }
  };

  if (isLoading) return <Loader />;
  if (!isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="admin-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', padding: 40, borderRadius: 16, textAlign: 'center', maxWidth: 380 }}>
          <FontAwesomeIcon icon={faLock} style={{ fontSize: 36, color: '#ef4444', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{t('Restricted Access')}</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>{t('Administrative privileges required.')}</p>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 24px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            {t('Return to Dashboard')}
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: t('Overview'), icon: faChartLine },
    { id: 'users', label: `${t('Users')} (${users.length})`, icon: faUsers },
    { id: 'health', label: t('Server Health & Storage'), icon: faServer },
    { id: 'emailLogs', label: t('Email Logs'), icon: faEnvelope },
    { id: 'notifications', label: t('Notifications'), icon: faBullhorn },
    { id: 'logs', label: t('Audit Logs'), icon: faTerminal },
    { id: 'details', label: t('Details'), icon: faDatabase },
  ];

  return (
    <div className="admin-root">
      <Navbar /><Back />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ padding: '4px 10px', fontSize: 10, fontFamily: 'monospace', fontWeight: 700, background: 'rgba(0,191,99,0.1)', color: '#00bf63', border: '1px solid rgba(0,191,99,0.25)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bf63', boxShadow: '0 0 6px rgba(0,191,99,0.6)' }} />
                {t('Admin Console')}
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{t('Administrative Engine')}</h1>
          </div>
          <button onClick={() => { setRefreshing(true); fetchAll(); }}
            style={{ padding: '8px 16px', background: '#0d1117', border: '1px solid #1e293b', borderRadius: 8, color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FontAwesomeIcon icon={faRefresh} spin={refreshing} /> {t('Refresh')}
          </button>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: 24 }}><StatsCards stats={stats} /></div>

        {/* Tabs */}
        <div style={{ marginBottom: 24 }}>
          <div className="admin-tabs">
            {tabs.map(tab => (
              <button key={tab.id} className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                <FontAwesomeIcon icon={tab.icon} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <ChartPanel chartData={chartData} dailySeries={dailySeries} />}
        {activeTab === 'users' && (
          <UsersTable users={users} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            roleFilter={roleFilter} setRoleFilter={setRoleFilter} currentUserId={user?.id}
            onRoleToggle={handleRoleToggle} onVerifyToggle={handleVerifyToggle} onDeleteClick={setDeleteTarget} />
        )}
        {activeTab === 'health' && <ServerHealthPanel />}
        {activeTab === 'emailLogs' && <EmailLogsPanel />}
        {activeTab === 'notifications' && <AdminNotificationsPanel />}
        {activeTab === 'logs' && <AuditLogs logs={logs} />}
        {activeTab === 'details' && <DetailsPanel stats={stats} />}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{t('Delete User')}</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              {t('Permanently delete')} <strong style={{ color: '#fff' }}>{deleteTarget.username}</strong> ({deleteTarget.email}) {t('and all their data?')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: '8px 16px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>{t('Cancel')}</button>
              <button onClick={handleDelete} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>{t('Delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
