'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vendor } from '@/types';
import { useToast } from '@/hooks/use-toast';

const VENDORS_STORAGE_KEY = 'cylinderLinkVendors';
const CYLINDERS_STORAGE_KEY = 'cylinderLinkTotal';

interface DataContextType {
  vendors: Vendor[];
  totalCylinders: number;
  addVendor: (name: string) => void;
  handleTransaction: (vendorId: string, type: 'in' | 'out') => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalCylinders, setTotalCylinders] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedVendors = localStorage.getItem(VENDORS_STORAGE_KEY);
      const storedCylinders = localStorage.getItem(CYLINDERS_STORAGE_KEY);

      if (storedVendors) {
        setVendors(JSON.parse(storedVendors));
      }

      if (storedCylinders) {
        setTotalCylinders(JSON.parse(storedCylinders));
      } else {
        // Initialize with a default value if nothing is in storage
        setTotalCylinders(100);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({
        title: "Error",
        description: "Could not load saved data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(vendors));
      } catch (error) {
        console.error("Failed to save vendors to localStorage", error);
      }
    }
  }, [vendors, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CYLINDERS_STORAGE_KEY, JSON.stringify(totalCylinders));
      } catch (error) {
        console.error("Failed to save total cylinders to localStorage", error);
      }
    }
  }, [totalCylinders, isLoading]);

  const addVendor = (name: string) => {
    if (name.trim() === '') {
        toast({ title: "Error", description: "Vendor name cannot be empty.", variant: "destructive" });
        return;
    }
    if (vendors.some(v => v.name.toLowerCase() === name.trim().toLowerCase())) {
        toast({ title: "Error", description: "A vendor with this name already exists.", variant: "destructive" });
        return;
    }
    const newVendor: Vendor = {
      id: crypto.randomUUID(),
      name: name.trim(),
      cylindersIn: 0,
      cylindersOut: 0,
    };
    setVendors(prev => [...prev, newVendor]);
    toast({ title: "Success", description: `Vendor "${name.trim()}" has been added.` });
  };

  const handleTransaction = (vendorId: string, type: 'in' | 'out') => {
    if (type === 'out' && totalCylinders <= 0) {
      toast({
        title: "Action blocked",
        description: "Cannot check out a cylinder, stock is at 0.",
        variant: "destructive",
      });
      return;
    }
    
    setTotalCylinders(prev => type === 'in' ? prev + 1 : prev - 1);
    setVendors(prev =>
      prev.map(vendor => {
        if (vendor.id === vendorId) {
          return {
            ...vendor,
            cylindersIn: type === 'in' ? vendor.cylindersIn + 1 : vendor.cylindersIn,
            cylindersOut: type === 'out' ? vendor.cylindersOut + 1 : vendor.cylindersOut,
          };
        }
        return vendor;
      })
    );
    toast({
        title: "Transaction complete",
        description: `Cylinder ${type === 'in' ? 'returned from' : 'given to'} vendor.`
    })
  };

  return (
    <DataContext.Provider value={{ vendors, totalCylinders, addVendor, handleTransaction, isLoading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
