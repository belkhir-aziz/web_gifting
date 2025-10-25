import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import TopNav from '@/components/TopNav';

export const metadata: Metadata = {
  title: 'Gifty Web Admin',
  description: 'Ops and curation console for Gifty',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white/70 backdrop-blur">
          <nav className="container flex h-14 items-center justify-between">
            <Link href="/" className="font-semibold text-slate-900 hover:opacity-80">
              Gifty
            </Link>
            <TopNav />
          </nav>
        </header>
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
