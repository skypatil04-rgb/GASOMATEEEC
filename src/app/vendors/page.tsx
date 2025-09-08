
'use client';
import AddVendorForm from '@/components/AddVendorForm';
import VendorList from '@/components/VendorList';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';

function Vendors() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto grid gap-8">
            <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
            <AddVendorForm />
            <VendorList />
        </div>
      </main>
    </div>
  );
}

export default function VendorsPage() {
    return (
        <ProtectedRoute>
            <Vendors />
        </ProtectedRoute>
    )
}
