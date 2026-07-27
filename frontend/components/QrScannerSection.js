'use client';

import React, { useState } from 'react';
import { useLiff } from './LiffProvider';
import { QrCode, Send, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QrScannerSection() {
  const { liff } = useLiff();
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleScanQRCode = async () => {
    setIsScanning(true);
    setStatusMsg(null);

    if (liff && liff.isInClient()) {
      const scanFn = liff.scanCodeV2 ? liff.scanCodeV2.bind(liff) : liff.scanCode ? liff.scanCode.bind(liff) : null;
      
      if (scanFn) {
        try {
          const res = await scanFn();
          const resultText = typeof res === 'object' && res !== null ? (res.value || JSON.stringify(res)) : res;
          if (resultText) {
            setScanResult(resultText);
            confetti({ particleCount: 60, spread: 60 });
          }
        } catch (err) {
          console.error('[LIFF] scanCode error:', err);
          setStatusMsg({
            type: 'error',
            text: `เกิดข้อผิดพลาดในการสแกน: ${err.message || err}. (กรุณาตรวจสอบว่าเปิด "Scan QR Code" ใน LINE Developers Console แล้วหรือยัง)`,
          });
        } finally {
          setIsScanning(false);
        }
      } else {
        setIsScanning(false);
        setStatusMsg({
          type: 'error',
          text: 'ไม่พบฟังก์ชัน Scan QR Code: กรุณาเปิดฟีเจอร์ "Scan QR Code" (หรือ "QR code reader") ใน LINE Developers Console > LIFF Tab ให้เป็น Enabled',
        });
      }
    } else {
      // Mock scanner for desktop browser / testing environment
      setTimeout(() => {
        setIsScanning(false);
        const mockQrCode = 'https://wutthipong.info/liff-demo-scanned-qr';
        setScanResult(mockQrCode);
        confetti({ particleCount: 50, spread: 50 });
        setStatusMsg({
          type: 'info',
          text: 'สแกน QR Code (โหมดจำลอง เบราว์เซอร์) สำเร็จ! (หากต้องการสแกนจริง ให้เปิดผ่านแอป LINE บนมือถือ)',
        });
      }, 700);
    }
  };

  const handleSendScanResultToChat = async () => {
    if (!scanResult) return;

    setIsSending(true);
    setStatusMsg(null);

    const messagePayload = {
      type: 'text',
      text: `📷 ผลลัพธ์การสแกน QR Code:\n${scanResult}`,
    };

    if (liff && liff.isInClient()) {
      try {
        await liff.sendMessages([messagePayload]);
        confetti({ particleCount: 80, spread: 60 });
        setStatusMsg({ type: 'success', text: 'ส่งผลลัพธ์ QR Code เข้าแชทเรียบร้อย!' });
      } catch (err) {
        console.error('[LIFF] sendMessages error:', err);
        setStatusMsg({ type: 'error', text: `ส่งผลลัพธ์เข้าแชทไม่สำเร็จ: ${err.message}` });
      } finally {
        setIsSending(false);
      }
    } else {
      setTimeout(() => {
        setIsSending(false);
        setStatusMsg({
          type: 'success',
          text: 'ส่งผลลัพธ์ (โหมดจำลอง) เรียบร้อย! (เมื่อรันบน LINE App ข้อความจะถูกส่งเข้าห้องแชท)',
        });
      }, 500);
    }
  };

  return (
    <div className="glass-card">
      <div className="section-title">
        <QrCode className="section-icon" size={20} />
        <span>สแกน QR Code (liff.scanCodeV2)</span>
      </div>

      <button onClick={handleScanQRCode} disabled={isScanning} className="btn btn-purple">
        <Camera size={18} />
        {isScanning ? 'กำลังเปิดกล้องสแกน...' : 'Scan QR Code (สแกนคิวอาร์โค้ด)'}
      </button>

      {scanResult && (
        <div className="result-box">
          <div className="result-header">ผลลัพธ์ที่สแกนได้ (Scanned Result):</div>
          <div className="result-content">{scanResult}</div>

          <button
            onClick={handleSendScanResultToChat}
            disabled={isSending}
            className="btn btn-primary"
            style={{ marginTop: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
          >
            <Send size={16} />
            {isSending ? 'กำลังส่ง...' : 'ส่งผลลัพธ์เข้าห้องแชท'}
          </button>
        </div>
      )}

      {statusMsg && (
        <div
          className="result-box"
          style={{
            borderColor:
              statusMsg.type === 'error'
                ? '#ef4444'
                : statusMsg.type === 'info'
                ? '#8b5cf6'
                : 'var(--accent-emerald)',
            backgroundColor:
              statusMsg.type === 'error'
                ? 'rgba(239, 68, 68, 0.1)'
                : statusMsg.type === 'info'
                ? 'rgba(139, 92, 246, 0.1)'
                : 'rgba(16, 185, 129, 0.1)',
            marginTop: '1rem',
          }}
        >
          <div
            className="result-header"
            style={{
              color:
                statusMsg.type === 'error'
                  ? '#ef4444'
                  : statusMsg.type === 'info'
                  ? '#8b5cf6'
                  : 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {statusMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {statusMsg.type === 'error' ? 'แจ้งเตือน' : statusMsg.type === 'info' ? 'ข้อมูล' : 'สำเร็จ'}
          </div>
          <div className="result-content" style={{ fontFamily: 'inherit' }}>
            {statusMsg.text}
          </div>
        </div>
      )}
    </div>
  );
}
