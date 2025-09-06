'use client';

import { useData } from '@/context/DataContext';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ArrowDownCircle } from 'lucide-react';

export default function VendorList() {
  const { vendors, isLoading } = useData();

  if (isLoading) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Your Vendors</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-48" />
                ))}
            </div>
        </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-foreground">Your Vendors</h2>
      {vendors.length === 0 ? (
        <Card className="text-center py-12">
            <CardContent>
                <p className="text-muted-foreground">You haven't added any vendors yet.</p>
                <p className="text-muted-foreground">Use the form above to get started.</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map(vendor => (
            <Link href={`/vendors/${vendor.id}`} key={vendor.id} className="block group">
              <Card className="h-full hover:border-primary transition-colors hover:shadow-lg flex flex-col">
                <CardHeader className="flex-grow-0">
                  <CardTitle className="flex justify-between items-start text-lg">
                    <span>{vendor.name}</span>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm flex-grow">
                   <div className="flex items-center gap-2 text-destructive">
                    <ArrowDownCircle className="h-4 w-4" />
                    <div className="font-semibold">Cylinders Held by Vendor</div>
                  </div>
                  <div className="pl-6 space-y-1">
                      <p>Oxygen: <span className="font-bold text-lg">{vendor.cylindersOut.oxygen}</span></p>
                      <p>CO2: <span className="font-bold text-lg">{vendor.cylindersOut.co2}</span></p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
