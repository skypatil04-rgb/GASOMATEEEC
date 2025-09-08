
'use client';

import VendorDetail from '@/components/VendorDetail';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { useParams } from 'next/navigation';

export default function VendorPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  return (
    <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-4 -ml-4">
            <Link href="/vendors">
            <ChevronLeft className="mr-2 h-4 w-4" />
            All Vendors
            </Link>
        </Button>
        <VendorDetail vendorId={vendorId} />
        </div>
    </main>
  );
}
