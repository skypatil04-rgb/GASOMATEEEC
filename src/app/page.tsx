'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TotalCylinderCount from '@/components/TotalCylinderCount';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto grid gap-8">
          <TotalCylinderCount />
          <div className="grid md:grid-cols-1 gap-8">
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
