import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import TopNav from '@/components/TopNav';

export const metadata: Metadata = {
  title: 'Gifting Web Admin',
  description: 'Ops and curation console for Gifting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white/70 backdrop-blur">
          <nav className="container flex h-14 items-center justify-between">
            <Link href="/" className="font-semibold text-slate-900 hover:opacity-80">
              Gifting
            </Link>
            <TopNav />
          </nav>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="border-t bg-white/60">
          <div className="container py-6 text-sm text-slate-600">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>© {new Date().getFullYear()} Gifting</span>
              <Link href="/web/privacy-policy" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">
                Privacy Policy
              </Link>
              <Link href="/web/data-deletion" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">
                Account & Data Deletion
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
