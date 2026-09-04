import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faFileLines, faClock, faShieldHalved, faEnvelope, faThumbtack } from '@fortawesome/free-solid-svg-icons';

const Card = ({ label, value, sub, icon, iconBg, iconColor }) => (
  <div className="metric-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span className="metric-label">{label}</span>
      <div className="metric-icon" style={{ background: iconBg, color: iconColor }}><FontAwesomeIcon icon={icon} /></div>
    </div>
    <div className="metric-value">{value}</div>
    {sub && <div className="metric-sub">{sub}</div>}
  </div>
);

export default function StatsCards({ stats }) {
  if (!stats) return null;
  const verifyPct = stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
      <Card label="Total Users" value={stats.totalUsers} sub={`${stats.adminCount} admin, ${stats.verifiedUsers} verified`}
        icon={faUsers} iconBg="rgba(59,130,246,0.1)" iconColor="#3b82f6" />
      <Card label="System Notes" value={stats.totalNotes} sub={`${stats.activeNotes} active, ${stats.deletedNotes} trash`}
        icon={faFileLines} iconBg="rgba(0,191,99,0.1)" iconColor="#00bf63" />
      <Card label="Pinned / Shared" value={`${stats.pinnedNotes} / ${stats.sharedNotes}`} sub="across all accounts"
        icon={faThumbtack} iconBg="rgba(245,158,11,0.1)" iconColor="#f59e0b" />
      <Card label="Session Time" value={`${stats.totalSessionTime}m`} sub="aggregate across users"
        icon={faClock} iconBg="rgba(168,85,247,0.1)" iconColor="#a855f7" />
      <Card label="Verification" value={`${verifyPct}%`} sub={`${stats.unverifiedUsers} pending`}
        icon={faShieldHalved} iconBg="rgba(6,182,212,0.1)" iconColor="#06b6d4" />
      <Card label="24h Activity" value={`+${stats.newNotesToday || 0}`} sub={`${stats.newUsersToday || 0} new users today`}
        icon={faEnvelope} iconBg="rgba(0,191,99,0.1)" iconColor="#00bf63" />
    </div>
  );
}
