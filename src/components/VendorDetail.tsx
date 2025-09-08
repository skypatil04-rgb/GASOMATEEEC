'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type Ownership = 'gasomateec' | 'self';

export default function VendorDetail({ vendorId }: { vendorId: string }) {
  const { vendors, handleTransaction, isLoading } = useData();
  const [oxygenOutCount, setOxygenOutCount] = useState(0);
  const [oxygenInCount, setOxygenInCount] = useState(0);
  const [co2OutCount, setCo2OutCount] = useState(0);
  const [co2InCount, setCo2InCount] = useState(0);
  const [date, setDate] = useState<Date>(new Date());
  const [oxygenOwnership, setOxygenOwnership] = useState<Ownership>('gasomateec');
  const [co2Ownership, setCo2Ownership] = useState<Ownership>('gasomateec');
  const [vendor, setVendor] = useState(vendors.find(v => v.id === vendorId));
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setVendor(vendors.find(v => v.id === vendorId));
  }, [vendors, vendorId]);


  if (isLoading || !hasMounted) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!vendor) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle /> Vendor Not Found
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>The vendor with the specified ID could not be found. It may have been deleted.</p>
            </CardContent>
        </Card>
    );
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
                <CardTitle className="text-lg text-destructive">Net Gasomateec Cylinders With Vendor</CardTitle>
                <CardDescription>Total currently held by vendor</CardDescription>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-muted-foreground">Oxygen: <span className="font-bold text-lg">{vendor.cylindersOut.oxygen}</span></p>
                 <p className="text-sm text-muted-foreground">CO2: <span className="font-bold text-lg">{vendor.cylindersOut.co2}</span></p>
              </CardContent>
            </Card>
            <div/>
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
            <div className="space-y-8">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-center mb-4">Oxygen Cylinder</h4>
                 <RadioGroup defaultValue="gasomateec" className="flex justify-center gap-8 mb-4" onValueChange={(value: Ownership) => setOxygenOwnership(value)}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gasomateec" id="o2-gasomateec" />
                        <Label htmlFor="o2-gasomateec">Gasomateec</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="self" id="o2-self" />
                        <Label htmlFor="o2-self">Vendor's Self</Label>
                    </div>
                </RadioGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                     <Input type="number" value={oxygenInCount} onChange={e => setOxygenInCount(Math.max(0, parseInt(e.target.value) || 0))} className="flex-1" />
                    <Button
                      variant="default"
                      className="transition-transform active:scale-95"
                      onClick={() => {
                        handleTransaction(vendor.id, 'in', 'oxygen', oxygenInCount, date, oxygenOwnership);
                        setOxygenInCount(0);
                      }}
                    >
                      In <ArrowUp className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={oxygenOutCount} onChange={e => setOxygenOutCount(Math.max(0, parseInt(e.target.value) || 0))} className="flex-1" />
                    <Button
                      variant="destructive"
                      className="transition-transform active:scale-95"
                      onClick={() => {
                        handleTransaction(vendor.id, 'out', 'oxygen', oxygenOutCount, date, oxygenOwnership);
                        setOxygenOutCount(0);
                      }}
                    >
                      Out <ArrowDown className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-center mb-4">CO2 Cylinder</h4>
                 <RadioGroup defaultValue="gasomateec" className="flex justify-center gap-8 mb-4" onValueChange={(value: Ownership) => setCo2Ownership(value)}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gasomateec" id="co2-gasomateec" />
                        <Label htmlFor="co2-gasomateec">Gasomateec</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="self" id="co2-self" />
                        <Label htmlFor="co2-self">Vendor's Self</Label>
                    </div>
                </RadioGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="flex items-center gap-2">
                      <Input type="number" value={co2InCount} onChange={e => setCo2InCount(Math.max(0, parseInt(e.target.value) || 0))} className="flex-1" />
                      <Button
                          variant="default"
                          className="transition-transform active:scale-95"
                          onClick={() => {
                            handleTransaction(vendor.id, 'in', 'co2', co2InCount, date, co2Ownership);
                            setCo2InCount(0);
                          }}
                      >
                          In <ArrowUp className="ml-2 h-5 w-5" />
                      </Button>
                   </div>
                   <div className="flex items-center gap-2">
                     <Input type="number" value={co2OutCount} onChange={e => setCo2OutCount(Math.max(0, parseInt(e.target.value) || 0))} className="flex-1" />
                    <Button
                      variant="destructive"
                      className="transition-transform active:scale-95"
                      onClick={() => {
                        handleTransaction(vendor.id, 'out', 'co2', co2OutCount, date, co2Ownership);
                        setCo2OutCount(0);
                      }}
                    >
                     Out <ArrowDown className="ml-2 h-5 w-5" />
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
                <TableHead>Source</TableHead>
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
                     <TableCell className="capitalize">{tx.ownership}</TableCell>
                    <TableCell className="text-right">{tx.count}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No transactions yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
