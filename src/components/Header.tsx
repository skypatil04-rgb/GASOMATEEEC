
'use client';

import Link from 'next/link';
import { FileText, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { Button } from './ui/button';

export const IndustrialCylinderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 4h8" />
    <path d="M10 4v2" />
    <path d="M14 4v2" />
    <path d="M6 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
    <path d="M8 12h8" />
  </svg>
);


export default function Header() {
  const pathname = usePathname();
  const { logout } = useData();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  return (
    <header className="bg-card border-b">
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <IndustrialCylinderIcon className="w-6 h-6" />
          <h1 className="text-xl font-bold">GASOMATEEC</h1>
        </Link>
        <nav className="flex items-center gap-4">
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
           <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
             <LogOut className="w-5 h-5 mr-2" />
             Sign Out
           </Button>
        </nav>
      </div>
    </header>
  );
}
