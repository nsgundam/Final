'use client';

import React, { useState } from 'react';
import { useLiff } from './LiffProvider';
import { CreditCard, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BusinessCardForm() {
  const { liff, profile, isLoggedIn } = useLiff();
  const [studentId, setStudentId] = useState('66011234');
  const [courseName, setCourseName] = useState('เทคโนโลยีสารสนเทศ (IT)');
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const displayName = profile?.displayName || 'นักศึกษามหาวิทยาลัยรังสิต';
  const pictureUrl = profile?.pictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop';

  const handleSendMyCard = async () => {
    if (!studentId.trim() || !courseName.trim()) {
      setStatusMsg({ type: 'error', text: 'กรุณากรอกรหัสนักศึกษาและหลักสูตรให้ครบถ้วน' });
      return;
    }

    const flexCardPayload = {
      type: 'flex',
      altText: `นามบัตรของคุณ ${displayName}`,
      contents: {
        type: 'bubble',
        hero: {
          type: 'image',
          url: pictureUrl,
          size: 'full',
          aspectRatio: '1:1',
          aspectMode: 'cover',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'text', text: displayName, weight: 'bold', size: 'xl' },
            { type: 'text', text: `รหัสนักศึกษา: ${studentId}`, size: 'sm', color: '#666666', margin: 'sm' },
            { type: 'text', text: `หลักสูตร: ${courseName}`, size: 'sm', color: '#666666', margin: 'xs' },
          ],
        },
      },
    };

    setIsSending(true);
    setStatusMsg(null);

    if (liff && liff.isInClient()) {
      try {
        await liff.sendMessages([flexCardPayload]);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        setStatusMsg({ type: 'success', text: 'ส่งนามบัตรเข้าแชทเรียบร้อยแล้ว!' });
      } catch (err) {
        console.error('[LIFF] sendMessages error:', err);
        setStatusMsg({ type: 'error', text: `ส่งนามบัตรไม่สำเร็จ: ${err.message}` });
      } finally {
        setIsSending(false);
      }
    } else {
      // Simulation / External browser fallback
      setTimeout(() => {
        setIsSending(false);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        setStatusMsg({
          type: 'success',
          text: 'ส่งนามบัตร (โหมดจำลอง) เรียบร้อย! (หากอยู่ใน LINE App นามบัตรจะส่งเข้าห้องแชททันที)',
        });
      }, 600);
    }
  };

  return (
    <div className="glass-card">
      <div className="section-title">
        <CreditCard className="section-icon" size={20} />
        <span>สร้างนามบัตรดิจิทัลของคุณ</span>
      </div>

      <div className="form-group">
        <label className="form-label">รหัสนักศึกษา (Student ID)</label>
        <input
          type="text"
          className="form-input"
          placeholder="เช่น 66011234"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">หลักสูตรที่เรียน (Program / Course)</label>
        <input
          type="text"
          className="form-input"
          placeholder="เช่น วิทยาการคอมพิวเตอร์"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
      </div>

      {/* Live Flex Preview */}
      <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          📱 พรีวิวนามบัตร Flex Card (Live Preview)
        </div>
        <div className="flex-preview-box">
          {/* eslint-disable-next-img-element */}
          <img src={pictureUrl} alt={displayName} className="flex-hero-img" />
          <div className="flex-body">
            <div className="flex-title">{displayName}</div>
            <div className="flex-subtext">รหัสนักศึกษา: {studentId || '-'}</div>
            <div className="flex-subtext">หลักสูตร: {courseName || '-'}</div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`result-box ${statusMsg.type === 'error' ? 'border-red-500' : ''}`}
          style={{
            borderColor: statusMsg.type === 'error' ? '#ef4444' : 'var(--accent-emerald)',
            backgroundColor: statusMsg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            marginBottom: '1rem',
          }}
        >
          <div
            className="result-header"
            style={{
              color: statusMsg.type === 'error' ? '#ef4444' : 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {statusMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {statusMsg.type === 'error' ? 'เกิดข้อผิดพลาด' : 'สำเร็จ'}
          </div>
          <div className="result-content" style={{ fontFamily: 'inherit' }}>
            {statusMsg.text}
          </div>
        </div>
      )}

      <button
        onClick={handleSendMyCard}
        disabled={isSending}
        className="btn btn-primary"
      >
        <Send size={18} />
        {isSending ? 'กำลังส่งนามบัตร...' : 'Send My Card (ส่งนามบัตรตัวเอง)'}
      </button>
    </div>
  );
}
