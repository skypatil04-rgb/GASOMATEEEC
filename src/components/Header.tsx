'use client';

import Link from 'next/link';
import { Warehouse } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b">
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Warehouse className="w-6 h-6" />
          <h1 className="text-xl font-bold">CylinderLink</h1>
        </Link>
      </div>
    </header>
  );
}
