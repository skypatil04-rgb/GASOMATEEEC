'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vendor, CylinderTransaction, Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';

const VENDORS_STORAGE_KEY = 'cylinderLinkVendors';
const OXYGEN_CYLINDERS_STORAGE_KEY = 'cylinderLinkTotalOxygen';
const CO2_CYLINDERS_STORAGE_KEY = 'cylinderLinkTotalCO2';

interface DataContextType {
  vendors: Vendor[];
  oxygenCylinders: number;
  co2Cylinders: number;
  totalCylinders: number;
  addVendor: (name: string) => void;
  handleTransaction: (vendorId: string, type: 'in' | 'out', cylinderType: keyof CylinderTransaction, count: number, date: Date) => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [oxygenCylinders, setOxygenCylinders] = useState<number>(0);
  const [co2Cylinders, setCo2Cylinders] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedVendors = localStorage.getItem(VENDORS_STORAGE_KEY);
      const storedOxygenCylinders = localStorage.getItem(OXYGEN_CYLINDERS_STORAGE_KEY);
      const storedCO2Cylinders = localStorage.getItem(CO2_CYLINDERS_STORAGE_KEY);

      if (storedVendors) {
        // Ensure transactions array exists for old data
        const parsedVendors = JSON.parse(storedVendors).map((v: Vendor) => ({...v, transactions: v.transactions || []}));
        setVendors(parsedVendors);
      }

      if (storedOxygenCylinders) {
        setOxygenCylinders(JSON.parse(storedOxygenCylinders));
      } else {
        setOxygenCylinders(50);
      }

      if (storedCO2Cylinders) {
        setCo2Cylinders(JSON.parse(storedCO2Cylinders));
      } else {
        setCo2Cylinders(50);
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
        localStorage.setItem(OXYGEN_CYLINDERS_STORAGE_KEY, JSON.stringify(oxygenCylinders));
        localStorage.setItem(CO2_CYLINDERS_STORAGE_KEY, JSON.stringify(co2Cylinders));
      } catch (error) {
        console.error("Failed to save total cylinders to localStorage", error);
      }
    }
  }, [oxygenCylinders, co2Cylinders, isLoading]);

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
      cylindersIn: { oxygen: 0, co2: 0 },
      cylindersOut: { oxygen: 0, co2: 0 },
      transactions: [],
    };
    setVendors(prev => [...prev, newVendor]);
    toast({ title: "Success", description: `Vendor "${name.trim()}" has been added.` });
  };

  const handleTransaction = (vendorId: string, type: 'in' | 'out', cylinderType: keyof CylinderTransaction, count: number, date: Date) => {
    if (count <= 0) {
        toast({
            title: "Invalid count",
            description: "Transaction count must be a positive number.",
            variant: "destructive",
        });
        return;
    }
    
    const currentStock = cylinderType === 'oxygen' ? oxygenCylinders : co2Cylinders;
    if (type === 'out' && currentStock < count) {
      toast({
        title: "Action blocked",
        description: `Cannot check out ${count} ${cylinderType.toUpperCase()} cylinder(s), only ${currentStock} in stock.`,
        variant: "destructive",
      });
      return;
    }

    if (cylinderType === 'oxygen') {
        setOxygenCylinders(prev => type === 'in' ? prev + count : prev - count);
    } else {
        setCo2Cylinders(prev => type === 'in' ? prev + count : prev - count);
    }
    
    setVendors(prev =>
      prev.map(vendor => {
        if (vendor.id === vendorId) {
          const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            date: date.toISOString(),
            type,
            cylinderType,
            count
          };

          const transactions = [...(vendor.transactions || []), newTransaction].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          const cylindersIn = transactions
            .filter(t => t.type === 'in')
            .reduce((acc, t) => {
              acc[t.cylinderType] += t.count;
              return acc;
            }, { oxygen: 0, co2: 0 });

          const cylindersOut = transactions
            .filter(t => t.type === 'out')
            .reduce((acc, t) => {
              acc[t.cylinderType] += t.count;
              return acc;
            }, { oxygen: 0, co2: 0 });

          return {
            ...vendor,
            transactions,
            cylindersIn,
            cylindersOut,
          };
        }
        return vendor;
      })
    );
    toast({
        title: "Transaction complete",
        description: `${count} ${cylinderType.toUpperCase()} cylinder(s) ${type === 'in' ? 'returned from' : 'given to'} vendor.`
    })
  };

  return (
    <DataContext.Provider value={{ vendors, oxygenCylinders, co2Cylinders, totalCylinders: oxygenCylinders + co2Cylinders, addVendor, handleTransaction, isLoading }}>
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
