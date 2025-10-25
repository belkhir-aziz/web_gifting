"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNav() {
  const pathname = usePathname() || '/';

  const tabs = [
    {
      href: '/',
      label: 'Gift Discovery',
      active:
        pathname === '/' ||
        pathname.startsWith('/gift-discover') ||
        pathname.startsWith('/review'),
    },
    {
      href: '/products',
      label: 'Products',
      active: pathname.startsWith('/products') || pathname.startsWith('/admin'),
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 backdrop-blur px-1 py-1 shadow-sm">
        {tabs.map((t) =>
          t.active ? (
            <span
              key={t.href}
              role="tab"
              aria-selected="true"
              className="px-4 py-1.5 text-sm rounded-full bg-slate-900 text-white cursor-default select-none"
            >
              {t.label}
            </span>
          ) : (
            <Link
              key={t.href}
              href={t.href}
              role="tab"
              aria-selected="false"
              className="px-4 py-1.5 text-sm rounded-full text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              {t.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
