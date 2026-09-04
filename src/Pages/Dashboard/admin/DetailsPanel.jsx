import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faTrophy,
  faShieldHalved,
  faUserShield,
  faUserPlus,
  faFileLines,
  faLock,
  faDatabase,
  faCheckCircle,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

export default function DetailsPanel({ stats }) {
  const { t } = useTranslation();

  if (!stats) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748b', background: '#0d1117', borderRadius: 12, border: '1px solid #1e293b' }}>
        {t('No telemetry data available')}
      </div>
    );
  }

  const cs = stats.contentStats || {};
  const tc = stats.topContributors || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Zero-Knowledge Security Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          background: 'rgba(0, 191, 99, 0.06)',
          border: '1px solid rgba(0, 191, 99, 0.2)',
          borderRadius: 12,
          color: '#00bf63'
        }}
      >
        <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 20 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{t('Zero-Knowledge Telemetry')}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
            {t('All note content is stored as AES-256 ciphertext. Metrics measure encrypted payload size and vault statistics without decrypting user data.')}
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20
        }}
      >
        {/* Left Column: Content Metrics & Storage Breakdown */}
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #1e293b', paddingBottom: 12 }}>
            <FontAwesomeIcon icon={faChartPie} style={{ color: '#00bf63', fontSize: 16 }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{t('Encrypted Vault Metrics')}</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            <div style={{ background: '#080c14', borderRadius: 10, padding: 14, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FontAwesomeIcon icon={faLock} style={{ fontSize: 10, color: '#00bf63' }} /> {t('Avg Cipher Size')}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                {Math.round(cs.avgLength || 0)} <span style={{ fontSize: 11, color: '#64748b' }}>B</span>
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{t('bytes per note')}</div>
            </div>

            <div style={{ background: '#080c14', borderRadius: 10, padding: 14, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FontAwesomeIcon icon={faDatabase} style={{ fontSize: 10, color: '#3b82f6' }} /> {t('Max Payload')}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                {(cs.maxLength || 0).toLocaleString()} <span style={{ fontSize: 11, color: '#64748b' }}>B</span>
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{t('largest encrypted note')}</div>
            </div>

            <div style={{ background: '#080c14', borderRadius: 10, padding: 14, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 10, color: '#a78bfa' }} /> {t('Total Cipher Volume')}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                {(cs.totalChars || 0).toLocaleString()} <span style={{ fontSize: 11, color: '#64748b' }}>B</span>
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{t('aggregate note payload')}</div>
            </div>

            <div style={{ background: '#080c14', borderRadius: 10, padding: 14, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FontAwesomeIcon icon={faUserShield} style={{ fontSize: 10, color: '#f59e0b' }} /> {t('Notes / User')}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                {stats.avgNotesPerUser || 0}
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{t('average per account')}</div>
            </div>
          </div>

          {/* Ratio Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                <span style={{ color: '#94a3b8' }}>
                  <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#00bf63', marginRight: 6 }} />
                  {t('Active Notes vs Trashed')}
                </span>
                <span style={{ color: '#00bf63', fontFamily: 'monospace', fontWeight: 700 }}>
                  {stats.activeNotes || 0} / {stats.totalNotes || 0}
                </span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                <div
                  style={{
                    width: `${stats.totalNotes > 0 ? ((stats.activeNotes || 0) / stats.totalNotes) * 100 : 100}%`,
                    background: '#00bf63',
                    transition: 'width 0.4s ease'
                  }}
                />
                <div
                  style={{
                    width: `${stats.totalNotes > 0 ? ((stats.deletedNotes || 0) / stats.totalNotes) * 100 : 0}%`,
                    background: '#ef4444',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                <span style={{ color: '#94a3b8' }}>
                  <FontAwesomeIcon icon={faUserShield} style={{ color: '#3b82f6', marginRight: 6 }} />
                  {t('Verified Account Ratio')}
                </span>
                <span style={{ color: '#3b82f6', fontFamily: 'monospace', fontWeight: 700 }}>
                  {stats.verifiedUsers || 0} / {stats.totalUsers || 0}
                </span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${stats.totalUsers > 0 ? ((stats.verifiedUsers || 0) / stats.totalUsers) * 100 : 0}%`,
                    height: '100%',
                    background: '#3b82f6',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Top Contributors & Latest Account */}
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #1e293b', paddingBottom: 12 }}>
            <FontAwesomeIcon icon={faTrophy} style={{ color: '#f59e0b', fontSize: 16 }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{t('Top Vault Contributors')}</h3>
          </div>

          {tc.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#64748b', fontSize: 13 }}>
              {t('No user activity data logged yet')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tc.map((c, i) => {
                const maxCount = tc[0]?.noteCount || 1;
                const percent = Math.round((c.noteCount / maxCount) * 100);
                const isFirst = i === 0;
                const isSecond = i === 1;
                const isThird = i === 2;

                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      background: '#080c14',
                      borderRadius: 10,
                      border: '1px solid #1e293b'
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: isFirst ? 'rgba(0,191,99,0.15)' : isSecond ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                        color: isFirst ? '#00bf63' : isSecond ? '#3b82f6' : '#94a3b8',
                        fontSize: 11,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'monospace'
                      }}
                    >
                      {i + 1}
                    </div>

                    <img
                      src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(c.username || c.name || 'user')}&backgroundColor=0d1117`}
                      alt="avatar"
                      style={{ width: 32, height: 32, borderRadius: '50%', background: '#0a0e1a', border: '1px solid #1e293b' }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.username || c.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.email}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <div style={{ width: 60, height: 5, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: isFirst ? '#00bf63' : '#3b82f6', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'monospace', width: 28, textAlign: 'right' }}>
                        {c.noteCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Latest Registered User */}
          {stats.newestUser && (
            <div style={{ marginTop: 'auto', padding: 14, background: '#080c14', borderRadius: 12, border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: 16 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{t('Latest Registration')}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stats.newestUser.username}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stats.newestUser.email}
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#64748b', textAlign: 'right', whiteSpace: 'nowrap' }}>
                {new Date(stats.newestUser.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
