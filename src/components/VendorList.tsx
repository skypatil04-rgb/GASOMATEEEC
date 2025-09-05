'use client';

import { useData } from '@/context/DataContext';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

export default function VendorList() {
  const { vendors, isLoading } = useData();

  if (isLoading) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Your Vendors</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-40" />
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
              <Card className="h-full hover:border-primary transition-colors hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-lg">
                    {vendor.name}
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-around gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-bold">{vendor.cylindersIn}</span>
                      <span className="text-muted-foreground ml-1">In</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-destructive" />
                    <div>
                      <span className="font-bold">{vendor.cylindersOut}</span>
                      <span className="text-muted-foreground ml-1">Out</span>
                    </div>
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
