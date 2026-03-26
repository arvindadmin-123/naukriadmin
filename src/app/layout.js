// src/app/layout.js
import { Poppins } from 'next/font/google';
import './admin-global.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'SidheNaukri Admin Panel',
  description: 'Admin panel for SidheNaukri',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}