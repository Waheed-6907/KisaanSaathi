import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kisan Sathi Market Intelligence | Verified Agricultural Pricing',
  description: 'Production-Oriented AI Agent & Real-time Agricultural Market Pricing Platform for Telangana & Pan-India Farmers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
