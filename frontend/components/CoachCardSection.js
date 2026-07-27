'use client';

import React, { useState } from 'react';
import { useLiff } from './LiffProvider';
import { Share2, ExternalLink, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CoachCardSection() {
  const { liff } = useLiff();
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState(null);

  const coachFlexPayload = {
    type: 'flex',
    altText: 'นามบัตร อ.วุฒิพงษ์ ชินศรี (อ.เณร)',
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: 'https://wutthipong.info/wp-content/uploads/2023/profile.jpg',
        size: 'full',
        aspectRatio: '1:1',
        aspectMode: 'cover',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'วุฒิพงษ์ ชินศรี', weight: 'bold', size: 'xl' },
          { type: 'text', text: 'อาจารย์ ม.รังสิต', size: 'md', color: '#888888', margin: 'md' },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'Website',
              uri: 'https://wutthipong.info',
            },
            style: 'primary',
            color: '#06C755',
          },
        ],
      },
    },
  };

  const handleShareCoachCard = async () => {
    setIsSharing(true);
    setShareStatus(null);

    if (liff) {
      if (liff.isApiAvailable('shareTargetPicker')) {
        try {
          const res = await liff.shareTargetPicker([coachFlexPayload]);
          if (res) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            setShareStatus({ type: 'success', text: 'แชร์นามบัตร อ.เณร ให้เพื่อน/กลุ่มสำเร็จแล้ว!' });
          } else {
            setShareStatus({ type: 'info', text: 'ยกเลิกการแชร์ หรือไม่มีการเลือกเป้าหมาย' });
          }
        } catch (err) {
          console.error('[LIFF] shareTargetPicker error:', err);
          setShareStatus({ type: 'error', text: `แชร์นามบัตรไม่สำเร็จ: ${err.message}` });
        } finally {
          setIsSharing(false);
        }
      } else {
        setIsSharing(false);
        setShareStatus({
          type: 'info',
          text: 'shareTargetPicker พร้อมใช้งานเมื่อเปิดผ่าน LINE App เท่านั้น',
        });
      }
    } else {
      setTimeout(() => {
        setIsSharing(false);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
        setShareStatus({
          type: 'success',
          text: 'แชร์นามบัตร อ.เณร (โหมดจำลอง) เรียบร้อยแล้ว!',
        });
      }, 500);
    }
  };

  return (
    <div className="glass-card">
      <div className="section-title">
        <Sparkles className="section-icon" size={20} />
        <span>นามบัตรอาจารย์ (Coach Card)</span>
      </div>

      <div className="flex-preview-box" style={{ marginBottom: '1.25rem' }}>
        {/* eslint-disable-next-img-element */}
        <img
          src="https://wutthipong.info/wp-content/uploads/2023/profile.jpg"
          alt="อ.วุฒิพงษ์ ชินศรี"
          className="flex-hero-img"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop';
          }}
        />
        <div className="flex-body">
          <div className="flex-title">วุฒิพงษ์ ชินศรี</div>
          <div className="flex-subtext" style={{ fontSize: '0.95rem', color: '#4b5563', fontWeight: 600 }}>
            อาจารย์ ม.รังสิต
          </div>
          <a
            href="https://wutthipong.info"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: '#06C755',
              color: '#ffffff',
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            <ExternalLink size={16} /> Website wutthipong.info
          </a>
        </div>
      </div>

      {shareStatus && (
        <div
          className="result-box"
          style={{
            borderColor:
              shareStatus.type === 'error'
                ? '#ef4444'
                : shareStatus.type === 'info'
                ? '#3b82f6'
                : 'var(--accent-emerald)',
            backgroundColor:
              shareStatus.type === 'error'
                ? 'rgba(239, 68, 68, 0.1)'
                : shareStatus.type === 'info'
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(16, 185, 129, 0.1)',
            marginBottom: '1rem',
          }}
        >
          <div
            className="result-header"
            style={{
              color:
                shareStatus.type === 'error'
                  ? '#ef4444'
                  : shareStatus.type === 'info'
                  ? '#3b82f6'
                  : 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {shareStatus.type === 'error' ? (
              <AlertCircle size={16} />
            ) : shareStatus.type === 'info' ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {shareStatus.type === 'error' ? 'แจ้งเตือน' : shareStatus.type === 'info' ? 'ข้อมูล' : 'สำเร็จ'}
          </div>
          <div className="result-content" style={{ fontFamily: 'inherit' }}>
            {shareStatus.text}
          </div>
        </div>
      )}

      <button onClick={handleShareCoachCard} disabled={isSharing} className="btn btn-secondary">
        <Share2 size={18} />
        {isSharing ? 'กำลังเปิดหน้าจอแชร์...' : 'Share Coach Card (แชร์นามบัตร อ.เณร)'}
      </button>
    </div>
  );
}
