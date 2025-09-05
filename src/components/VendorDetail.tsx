'use client';

import { useData } from '@/context/DataContext';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function VendorDetail({ vendorId }: { vendorId: string }) {
  const { vendors, handleTransaction, isLoading } = useData();
  const vendor = vendors.find(v => v.id === vendorId);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!vendor) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{vendor.name}</CardTitle>
        <CardDescription>Track cylinders checked in and out for this vendor.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">Cylinders In</CardTitle>
              <CardDescription>Total returned by vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{vendor.cylindersIn}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Cylinders Out</CardTitle>
              <CardDescription>Total given to vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{vendor.cylindersOut}</p>
            </CardContent>
          </Card>
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-medium mb-4 text-center">Record a Transaction</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="destructive"
              className="flex-1 transition-transform active:scale-95"
              onClick={() => handleTransaction(vendor.id, 'out')}
            >
              Cylinder Out
              <ArrowDown className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="default"
              className="flex-1 transition-transform active:scale-95"
              onClick={() => handleTransaction(vendor.id, 'in')}
            >
              Cylinder In
              <ArrowUp className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
