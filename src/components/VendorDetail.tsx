'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp, Calendar as CalendarIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function VendorDetail({ vendorId }: { vendorId: string }) {
  const { vendors, handleTransaction, isLoading } = useData();
  const [oxygenOutCount, setOxygenOutCount] = useState(1);
  const [oxygenInCount, setOxygenInCount] = useState(1);
  const [co2OutCount, setCo2OutCount] = useState(1);
  const [co2InCount, setCo2InCount] = useState(1);
  const [date, setDate] = useState<Date>(new Date());
  
  const vendor = vendors.find(v => v.id === vendorId);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!vendor) {
    notFound();
  }

  return (
    <div className="space-y-6">
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
                <p className="text-sm text-muted-foreground">Oxygen: <span className="font-bold text-lg">{vendor.cylindersIn.oxygen}</span></p>
                <p className="text-sm text-muted-foreground">CO2: <span className="font-bold text-lg">{vendor.cylindersIn.co2}</span></p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Cylinders Out</CardTitle>
                <CardDescription>Total given to vendor</CardDescription>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-muted-foreground">Oxygen: <span className="font-bold text-lg">{vendor.cylindersOut.oxygen}</span></p>
                 <p className="text-sm text-muted-foreground">CO2: <span className="font-bold text-lg">{vendor.cylindersOut.co2}</span></p>
              </CardContent>
            </Card>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-4 text-center">Record a Transaction</h3>
            <div className="flex flex-col items-center gap-4 mb-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => setDate(d || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-center mb-2">Oxygen Cylinder</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Input type="number" value={oxygenOutCount} onChange={e => setOxygenOutCount(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1" />
                    <Button
                      variant="destructive"
                      className="transition-transform active:scale-95"
                      onClick={() => handleTransaction(vendor.id, 'out', 'oxygen', oxygenOutCount, date)}
                    >
                      Out <ArrowDown className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                     <Input type="number" value={oxygenInCount} onChange={e => setOxygenInCount(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1" />
                    <Button
                      variant="default"
                      className="transition-transform active:scale-95"
                      onClick={() => handleTransaction(vendor.id, 'in', 'oxygen', oxygenInCount, date)}
                    >
                      In <ArrowUp className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-center mb-2">CO2 Cylinder</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="flex items-center gap-2">
                     <Input type="number" value={co2OutCount} onChange={e => setCo2OutCount(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1" />
                    <Button
                      variant="destructive"
                      className="transition-transform active:scale-95"
                      onClick={() => handleTransaction(vendor.id, 'out', 'co2', co2OutCount, date)}
                    >
                     Out <ArrowDown className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                   <div className="flex items-center gap-2">
                      <Input type="number" value={co2InCount} onChange={e => setCo2InCount(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1" />
                      <Button
                          variant="default"
                          className="transition-transform active:scale-95"
                          onClick={() => handleTransaction(vendor.id, 'in', 'co2', co2InCount, date)}
                      >
                          In <ArrowUp className="ml-2 h-5 w-5" />
                      </Button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A log of all cylinder movements for {vendor.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cylinder</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendor.transactions && vendor.transactions.length > 0 ? (
                vendor.transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(new Date(tx.date), 'PP')}</TableCell>
                    <TableCell>
                      <span className={cn(tx.type === 'in' ? 'text-primary' : 'text-destructive')}>
                        {tx.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{tx.cylinderType.toUpperCase()}</TableCell>
                    <TableCell className="text-right">{tx.count}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No transactions yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
