'use client';

import Link from 'next/link';
import { Warehouse, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-card border-b">
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Warehouse className="w-6 h-6" />
          <h1 className="text-xl font-bold">GASOMATEEC</h1>
        </Link>
        <nav>
          <Link
            href="/reports"
            className={cn(
              'flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors',
              pathname === '/reports' && 'text-primary'
            )}
          >
            <FileText className="w-5 h-5" />
            Reports
          </Link>
        </nav>
      </div>
    </header>
  );
}
