'use client';

import VendorDetail from '@/components/VendorDetail';
import Header from '@/components/Header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function VendorDetailPage({ params }: { params: { vendorId: string } }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-4 -ml-4">
            <Link href="/vendors">
              <ChevronLeft className="mr-2 h-4 w-4" />
              All Vendors
            </Link>
          </Button>
          <VendorDetail vendorId={params.vendorId} />
        </div>
      </main>
    </div>
  );
}
