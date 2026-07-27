'use client';

import React from 'react';
import ProfileHeader from '../components/ProfileHeader';
import BusinessCardForm from '../components/BusinessCardForm';
import CoachCardSection from '../components/CoachCardSection';
import QrScannerSection from '../components/QrScannerSection';

export default function Home() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Profile Header & Welcome Section */}
      <ProfileHeader />

      {/* 2. User Business Card Form & Flex Preview (liff.sendMessages) */}
      <BusinessCardForm />

      {/* 3. Coach Business Card & Share Target Picker (liff.shareTargetPicker) */}
      <CoachCardSection />

      {/* 4. QR Code Scanner (liff.scanCodeV2) */}
      <QrScannerSection />

      {/* App Footer */}
      <footer
        style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-glass)',
        }}
      >
        <p>LINE OA & LIFF App | อ.วุฒิพงษ์ ชินศรี (อ.เณร)</p>
        <p style={{ marginTop: '0.25rem' }}>
          ข้อมูลอ้างอิง:{' '}
          <a
            href="https://wutthipong.info"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--line-green)', textDecoration: 'none' }}
          >
            wutthipong.info
          </a>
        </p>
      </footer>
    </main>
  );
}
