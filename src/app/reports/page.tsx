'use client';

import { useData } from '@/context/DataContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { vendors, isLoading } = useData();

  const handleDownload = () => {
    if (isLoading) return;

    const allTransactions = vendors.flatMap(vendor => 
      vendor.transactions.map(tx => ({
        vendorName: vendor.name,
        ...tx
      }))
    );

    if (allTransactions.length === 0) {
      alert("There are no transactions to export.");
      return;
    }

    // Define CSV headers
    const headers = ['Vendor Name', 'Date', 'Type', 'Cylinder Type', 'Count'];
    
    // Convert transaction data to CSV rows
    const csvRows = allTransactions.map(tx => {
      const date = format(new Date(tx.date), 'yyyy-MM-dd HH:mm:ss');
      return [
        `"${tx.vendorName.replace(/"/g, '""')}"`, // Handle quotes in vendor name
        date,
        tx.type.toUpperCase(),
        tx.cylinderType.toUpperCase(),
        tx.count,
      ].join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');
    
    // Create a Blob and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'gasomateec_transactions.csv');
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
                Export a complete log of all cylinder movements for all vendors into a single CSV file, which can be opened with Excel or other spreadsheet software.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleDownload} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                Download All Transactions (CSV)
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
