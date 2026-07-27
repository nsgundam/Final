'use client';

import React from 'react';
import { useLiff } from './LiffProvider';
import { UserCheck, LogIn } from 'lucide-react';

export default function ProfileHeader() {
  const { profile, isLoggedIn, isLoading, liff } = useLiff();

  const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=06C755&color=fff&size=128';

  const displayName = profile?.displayName || 'นักศึกษา';
  const pictureUrl = profile?.pictureUrl || defaultAvatar;

  if (isLoading) {
    return (
      <div className="glass-card profile-header">
        <div className="profile-avatar-container animate-pulse" style={{ background: '#334155' }} />
        <div className="profile-info">
          <div className="profile-greeting">กำลังโหลดข้อมูล LIFF...</div>
          <div className="profile-name">LINE Official Account</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card profile-header">
        <div className="profile-avatar-container">
          {/* eslint-disable-next-img-element */}
          <img
            src={pictureUrl}
            alt={displayName}
            className="profile-avatar"
            onError={(e) => {
              e.target.src = defaultAvatar;
            }}
          />
        </div>

        <div className="profile-info">
          <div className="profile-greeting">ยินดีต้อนรับ 👋</div>
          <div className="profile-name">สวัสดี {displayName}</div>
          <div className="status-badge">
            <span className="status-dot" style={{ backgroundColor: isLoggedIn ? '#10b981' : '#f59e0b' }}></span>
            <span>{isLoggedIn ? 'เชื่อมต่อ LINE แล้ว' : 'ยังไม่ได้เข้าสู่ระบบ LINE'}</span>
          </div>
        </div>

        {!isLoggedIn && liff && (
          <button
            onClick={() => liff.login()}
            className="btn btn-primary"
            style={{ marginLeft: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: 'auto' }}
          >
            <LogIn size={14} /> Login
          </button>
        )}
      </div>

      {error && (
        <div
          className="glass-card"
          style={{
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: '#f87171',
          }}
        >
          ⚠️ {error}
        </div>
      )}
    </>
  );
}
