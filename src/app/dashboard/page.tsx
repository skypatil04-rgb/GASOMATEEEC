'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TotalCylinderCount from '@/components/TotalCylinderCount';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowRight, Users, Warehouse } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { vendors, isLoading } = useData();
  const [totalCylindersOut, setTotalCylindersOut] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && vendors.length > 0) {
      const total = vendors.reduce((acc, vendor) => {
        const oxygenOut = vendor.cylindersOut?.oxygen || 0;
        const co2Out = vendor.cylindersOut?.co2 || 0;
        return acc + oxygenOut + co2Out;
      }, 0);
      setTotalCylindersOut(total);
    }
  }, [vendors, hasMounted]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
    <Header />
    <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto grid gap-8">
        <TotalCylinderCount />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Quick Summary</CardTitle>
                <Warehouse className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading || !hasMounted ? (
                <div className="space-y-4 mt-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                </div>
                ) : (
                <>
                    <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">{vendors.length}</div>
                    <p className="text-sm text-muted-foreground">Total Vendors</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                    <div className="text-4xl font-bold text-destructive">{totalCylindersOut}</div>
                    <p className="text-sm text-muted-foreground">Total Cylinders with Vendors</p>
                    </div>
                </>
                )}
            </CardContent>
            </Card>

            <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Manage Vendors</CardTitle>
                <Users className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-4">
                Add, view, and track cylinder transactions for each of your vendors.
                </p>
                <Button asChild className="mt-auto w-full sm:w-auto self-start">
                <Link href="/vendors">
                    Go to Vendors <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                </Button>
            </CardContent>
            </Card>
        </div>
        </div>
    </main>
    </div>
  );
}
