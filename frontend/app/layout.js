import './globals.css';
import LiffProvider from '../components/LiffProvider';

export const metadata = {
  title: 'LINE LIFF Business Card & QR Scanner | อ.วุฒิพงษ์ ชินศรี (อ.เณร)',
  description: 'แอปพลิเคชัน LINE LIFF สำหรับสร้างนามบัตรดิจิทัล แชร์นามบัตรโค้ช และสแกน QR Code',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <LiffProvider>
          <div className="app-container">
            {children}
          </div>
        </LiffProvider>
      </body>
    </html>
  );
}
