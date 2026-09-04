import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faTrash, faCheckCircle, faTimesCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { getDicebearAvatar } from '../../../utils/avatar';

export default function UsersTable({ users, searchQuery, setSearchQuery, roleFilter, setRoleFilter, currentUserId, onRoleToggle, onVerifyToggle, onDeleteClick }) {
  const filtered = users.filter(u => {
    if (roleFilter === 'admin') return u.role === 'admin';
    if (roleFilter === 'user') return u.role !== 'admin';
    return true;
  });

  return (
    <div className="chart-panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 280 }}>
          <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 12 }} />
          <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: '#080c14', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 12, outline: 'none' }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ background: '#080c14', border: '1px solid #1e293b', color: '#94a3b8', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontFamily: 'monospace' }}>
          <option value="all">All ({users.length})</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead><tr>
            <th>Account</th><th>Role</th><th>Status</th><th style={{ textAlign: 'center' }}>Notes</th><th style={{ textAlign: 'center' }}>Session</th><th style={{ textAlign: 'right' }}>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#475569', fontFamily: 'monospace' }}>No users match criteria</td></tr>
            ) : filtered.map((u) => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img 
                      src={getDicebearAvatar(u.username)} 
                      alt={u.username}
                      style={{ width: 32, height: 32, borderRadius: 8, background: '#080c14', border: '1px solid #1e293b', objectFit: 'contain', padding: 2 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>{u.name || u.username}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{u.role}</span></td>
                <td>
                  <button onClick={() => onVerifyToggle(u._id)} className={`badge ${u.isVerified ? 'badge-verified' : 'badge-unverified'}`}
                    style={{ cursor: 'pointer', border: 'none' }} title="Toggle verification">
                    <FontAwesomeIcon icon={u.isVerified ? faCheckCircle : faTimesCircle} />
                    {u.isVerified ? 'Verified' : 'Pending'}
                  </button>
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 700, color: '#fff' }}>{u.noteCount || 0}</td>
                <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{u.sessionTime || 0}m</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-action" onClick={() => onRoleToggle(u._id, u.role)} title={u.role === 'admin' ? 'Demote' : 'Promote'}>
                    <FontAwesomeIcon icon={faUserShield} />
                  </button>
                  {u._id !== currentUserId && (
                    <button className="btn-action btn-danger" onClick={() => onDeleteClick(u)} title="Delete user">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
