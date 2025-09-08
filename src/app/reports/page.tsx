
'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { format, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';

function Reports() {
  const { vendors, isLoading } = useData();
  const [date, setDate] = useState<DateRange | undefined>();

  const handleDownload = () => {
    if (isLoading) return;

    let allTransactions = vendors.flatMap(vendor =>
      vendor.transactions.map(tx => ({
        vendorName: vendor.name,
        ...tx
      }))
    );
    
    if (date?.from) {
      const from = new Date(date.from);
      from.setHours(0,0,0,0);
      // If there's no 'to' date, use the 'from' date as the end of the range.
      const to = date.to ? new Date(date.to) : new Date(date.from);
      to.setHours(23,59,59,999);

      allTransactions = allTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return isWithinInterval(txDate, { start: from, end: to });
      });
    }

    if (allTransactions.length === 0) {
      alert("There are no transactions for the selected criteria.");
      return;
    }

    // Define CSV headers
    const headers = ['Vendor Name', 'Date', 'Type', 'Cylinder Type', 'Count', 'Ownership'];

    // Convert transaction data to CSV rows
    const csvRows = allTransactions.map(tx => {
      const txDate = format(new Date(tx.date), 'yyyy-MM-dd HH:mm:ss');
      return [
        `"${tx.vendorName.replace(/"/g, '""')}"`, // Handle quotes in vendor name
        txDate,
        tx.type.toUpperCase(),
        tx.cylinderType.toUpperCase(),
        tx.count,
        tx.ownership ? tx.ownership.toUpperCase() : 'GASOMATEEC' // Handle old data
      ].join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fromDate = date?.from ? format(date.from, 'yyyy-MM-dd') : '';
    const toDate = date?.to ? format(date.to, 'yyyy-MM-dd') : '';
    let datePart = '_all_time';
    if(fromDate && toDate) {
        datePart = `_${fromDate}_to_${toDate}`;
    } else if (fromDate) {
        datePart = `_from_${fromDate}`;
    }


    link.setAttribute('href', url);
    link.setAttribute('download', `gasomateec_transactions${datePart}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto grid gap-8">
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>

          <Card>
            <CardHeader>
              <CardTitle>Download Transaction History</CardTitle>
              <CardDescription>
                Select a start and end date to export a log of cylinder movements. If no range is selected, all transactions will be downloaded.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleDownload} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Transactions (CSV)
                </Button>
                {date && (
                   <Button onClick={() => setDate(undefined)} variant="ghost">Clear Dates</Button>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


export default function ReportsPage() {
    return (
        <ProtectedRoute>
            <Reports />
        </ProtectedRoute>
    )
}
