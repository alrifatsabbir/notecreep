import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { analytics, admin as adminApi } from '../../services/api';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faThumbtack,
  faFileLines,
  faClock,
  faChartLine,
  faUsers,
  faShieldHalved,
  faTerminal,
  faPlus,
  faArrowRight,
  faUserShield,
  faCheckCircle,
  faTimesCircle,
  faSearch,
  faRefresh,
  faUserCheck,
  faUserXmark
} from '@fortawesome/free-solid-svg-icons';
import Loader from '../../components/PageLoader';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import Back from '../../components/Back';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  // User Dashboard State
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin Suite State (if user is admin)
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [adminChartData, setAdminChartData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [activeAdminTab, setActiveAdminTab] = useState('users');

  const containerRef = useRef(null);
  const isAdmin = user?.role === 'admin';

  const fetchDashboardData = useCallback(async () => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch User Analytics
      const [summaryRes, analyticsRes] = await Promise.all([
        analytics.getDashboardSummary(),
        analytics.getAnalytics(),
      ]);

      setDashboardData(summaryRes.data);
      setAnalyticsData(analyticsRes.data);

      // 2. If Admin, fetch Admin Telemetry
      if (user?.role === 'admin') {
        try {
          const [statsRes, usersRes, logsRes, chartRes] = await Promise.all([
            adminApi.getStats(),
            adminApi.getUsers(searchQuery),
            adminApi.getSystemLogs(),
            adminApi.getChartAnalytics(),
          ]);

          setAdminStats(statsRes.data);
          setAdminUsers(usersRes.data.users);
          setAdminLogs(logsRes.data.logs);
          setAdminChartData(chartRes.data.chartSeries);
        } catch (err) {
          console.error('Failed to load admin telemetry:', err);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error(t('Failed to load notes'));
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user?.role, searchQuery, t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    }
  }, []);

  // Admin Actions
  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminApi.updateRole(userId, newRole);
      toast.success(`User role changed to ${newRole.toUpperCase()}`);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleVerifyToggle = async (userId) => {
    try {
      const res = await adminApi.toggleVerification(userId);
      toast.success(res.data.message);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    try {
      await adminApi.deleteUser(selectedUserForDelete._id);
      toast.success('User account purged successfully');
      setSelectedUserForDelete(null);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (isLoading) return <Loader />;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-gray-950 flex flex-col items-center justify-center p-6 text-white">
        <p className="text-[#00bf63] text-2xl font-bold mb-4">{t('Please log in to view your notes.')}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-[#00bf63] hover:bg-[#009e4d] text-black font-semibold rounded-lg shadow-lg transition"
        >
          {t('login.button')}
        </button>
      </div>
    );
  }

  const truncateText = (text, wordCount) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  // Helper calculation for monthly notes graph
  const notesCreatedMonthly = analyticsData?.notesCreated || [];
  const maxMonthlyVal = Math.max(...notesCreatedMonthly.map((m) => m.notes || 0), 5);

  const filteredAdminUsers = adminUsers.filter((u) => {
    if (roleFilter === 'admin') return u.role === 'admin';
    if (roleFilter === 'user') return u.role !== 'admin';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 font-sans selection:bg-[#00bf63] selection:text-black">
      <Navbar />
      <Back />

      <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Welcome Header & Action Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-mono font-semibold bg-[#00bf63]/10 text-[#00bf63] border border-[#00bf63]/30 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00bf63] animate-pulse" />
                {isAdmin ? t('SYSTEM ADMINISTRATOR CONSOLE') : t('PERSONAL WORKSPACE')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t('Welcome, {{name}}!', { name: user?.name || user?.username })}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {t("Overview of note activity, session telemetry, and real-time statistics.")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/create"
              className="px-5 py-2.5 bg-[#00bf63] hover:bg-[#009e4d] text-black font-semibold rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('Create Note')}
            </Link>
            <Link
              to="/notes"
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition flex items-center gap-2"
            >
              {t('Go to Notes')}
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>

        {/* SECTION 1: TOP TELEMETRY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-[#00bf63]/50 transition">
            <div className="flex justify-between items-start mb-3">
              <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">{t('Total Notes')}</span>
              <div className="p-2.5 bg-emerald-500/10 text-[#00bf63] rounded-xl">
                <FontAwesomeIcon icon={faFileLines} />
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-white mb-1">
              {dashboardData?.totalNotes || 0}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span className="text-[#00bf63] font-mono">{dashboardData?.pinnedNotes || 0} {t('Pinned')}</span>
              <span>•</span>
              <span className="text-red-400 font-mono">{dashboardData?.deletedNotes || 0} {t('Trash')}</span>
            </div>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-[#00bf63]/50 transition">
            <div className="flex justify-between items-start mb-3">
              <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">{t('Time Spent (minutes)')}</span>
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                <FontAwesomeIcon icon={faClock} />
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-white mb-1">
              {analyticsData?.timeSpent?.[0]?.time || 0} <span className="text-sm font-sans text-gray-400">mins</span>
            </div>
            <div className="text-xs text-gray-400">{t('Total time spent on the website today.')}</div>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-[#00bf63]/50 transition">
            <div className="flex justify-between items-start mb-3">
              <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">{t('Pinned Notes')}</span>
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                <FontAwesomeIcon icon={faThumbtack} />
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-white mb-1">
              {dashboardData?.pinnedNotes || 0}
            </div>
            <div className="text-xs text-gray-400">{t('Total notes pinned')}</div>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-[#00bf63]/50 transition">
            <div className="flex justify-between items-start mb-3">
              <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">{t('Deleted Notes')}</span>
              <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl">
                <FontAwesomeIcon icon={faTrash} />
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-white mb-1">
              {dashboardData?.deletedNotes || 0}
            </div>
            <div className="text-xs text-gray-400">{t('Total notes deleted')}</div>
          </div>
        </div>

        {/* SECTION 2: CHARTS & INTERACTIVE VISUALIZATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Chart 1: Notes Creation Velocity */}
          <div className="lg:col-span-2 bg-gray-900/90 border border-gray-800 p-6 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faChartLine} className="text-[#00bf63]" />
                  {t('Notes Created')}
                </h3>
                <p className="text-xs text-gray-400">{t('Total number of notes created.')}</p>
              </div>
            </div>

            {/* Interactive SVG Bar Chart */}
            <div className="h-64 w-full flex items-end gap-4 pt-8 pb-3 border-b border-gray-800">
              {notesCreatedMonthly.length === 0 ? (
                <div className="w-full text-center text-gray-500 font-mono text-sm py-12">
                  {t('No data')}
                </div>
              ) : (
                notesCreatedMonthly.map((m, idx) => {
                  const heightPercent = Math.min(100, Math.max(12, (m.notes / maxMonthlyVal) * 100));
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const monthLabel = monthNames[(m.month - 1) % 12] || `M${m.month}`;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full flex items-end justify-center h-full px-2">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[48px] bg-gradient-to-t from-[#00bf63]/30 via-[#00bf63]/70 to-[#00bf63] rounded-t-lg transition-all duration-500 group-hover:brightness-125 relative group-hover:shadow-[0_0_15px_rgba(0,191,99,0.5)]"
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-mono px-2.5 py-1 rounded-md border border-gray-700 pointer-events-none transition whitespace-nowrap shadow-lg">
                            {m.notes} {t('notes')}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-gray-400 mt-3 group-hover:text-[#00bf63] transition">
                        {monthLabel}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chart 2: Category & Distribution Breakdown */}
          <div className="bg-gray-900/90 border border-gray-800 p-6 rounded-2xl shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{t('My Notes')}</h3>
              <p className="text-xs text-gray-400 mb-6">{t('Total number of notes created.')}</p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-gray-300">{t('Total Notes')}</span>
                    <span className="text-[#00bf63] font-bold">
                      {dashboardData?.totalNotes || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden flex">
                    <div
                      style={{
                        width: `${
                          (dashboardData?.totalNotes || 0) > 0
                            ? (((dashboardData?.totalNotes || 0) - (dashboardData?.deletedNotes || 0)) /
                                (dashboardData?.totalNotes || 1)) *
                              100
                            : 100
                        }%`,
                      }}
                      className="bg-[#00bf63] h-full"
                    />
                    <div
                      style={{
                        width: `${
                          (dashboardData?.totalNotes || 0) > 0
                            ? ((dashboardData?.deletedNotes || 0) / (dashboardData?.totalNotes || 1)) * 100
                            : 0
                        }%`,
                      }}
                      className="bg-red-500 h-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-gray-300">{t('Pinned Notes')}</span>
                    <span className="text-amber-400 font-bold">
                      {dashboardData?.pinnedNotes || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${
                          (dashboardData?.totalNotes || 0) > 0
                            ? ((dashboardData?.pinnedNotes || 0) / (dashboardData?.totalNotes || 1)) * 100
                            : 0
                        }%`,
                      }}
                      className="bg-amber-400 h-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-gray-300">{t('Deleted Notes')}</span>
                    <span className="text-red-400 font-bold">
                      {dashboardData?.deletedNotes || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${
                          (dashboardData?.totalNotes || 0) > 0
                            ? ((dashboardData?.deletedNotes || 0) / (dashboardData?.totalNotes || 1)) * 100
                            : 0
                        }%`,
                      }}
                      className="bg-red-500 h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: RECENT NOTE DETAILS CARDS */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FontAwesomeIcon icon={faFileLines} className="text-[#00bf63]" />
          {t('Recent Notes')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Recent Note */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl hover:border-[#00bf63]/40 transition duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faFileLines} className="text-[#00bf63]" />
                  {t('Recent_Note')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                {dashboardData?.firstNote?.title || t('No data')}
              </h3>
              <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                {dashboardData?.firstNote ? truncateText(dashboardData.firstNote.content, 15) : t('You have no notes in this category.')}
              </p>
            </div>

            <button
              onClick={() => dashboardData?.firstNote && navigate(`/view/${dashboardData.firstNote._id}`)}
              disabled={!dashboardData?.firstNote}
              className={`w-full py-2.5 rounded-xl font-medium text-sm transition ${
                dashboardData?.firstNote
                  ? 'bg-[#00bf63] hover:bg-[#009e4d] text-black font-semibold shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {dashboardData?.firstNote ? t('View Full Note') : t('No Notes to View')}
            </button>
          </div>

          {/* Card 2: Trashed Note */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl hover:border-red-500/40 transition duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faTrash} className="text-red-400" />
                  {t('In Trash')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                {dashboardData?.firstDeletedNote?.title || t('No data')}
              </h3>
              <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                {dashboardData?.firstDeletedNote ? truncateText(dashboardData.firstDeletedNote.content, 15) : t('You have no notes in this category.')}
              </p>
            </div>

            <button
              onClick={() => navigate('/trash')}
              disabled={!dashboardData?.firstDeletedNote}
              className={`w-full py-2.5 rounded-xl font-medium text-sm transition ${
                dashboardData?.firstDeletedNote
                  ? 'bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {dashboardData?.firstDeletedNote ? t('Go to Trash') : t('Trash is Empty')}
            </button>
          </div>

          {/* Card 3: Pinned Note */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl hover:border-amber-400/40 transition duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faThumbtack} className="text-amber-400" />
                  {t('Pinned')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                {dashboardData?.firstPinnedNote?.title || t('No data')}
              </h3>
              <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                {dashboardData?.firstPinnedNote ? truncateText(dashboardData.firstPinnedNote.content, 15) : t('You have no notes in this category.')}
              </p>
            </div>

            <button
              onClick={() => dashboardData?.firstPinnedNote && navigate(`/view/${dashboardData.firstPinnedNote._id}`)}
              disabled={!dashboardData?.firstPinnedNote}
              className={`w-full py-2.5 rounded-xl font-medium text-sm transition ${
                dashboardData?.firstPinnedNote
                  ? 'bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {dashboardData?.firstPinnedNote ? t('Go to Pinned') : t('No Pinned Notes')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;