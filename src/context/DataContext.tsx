'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vendor, CylinderTransaction } from '@/types';
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
  handleTransaction: (vendorId: string, type: 'in' | 'out', cylinderType: keyof CylinderTransaction) => void;
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
        setVendors(JSON.parse(storedVendors));
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
    };
    setVendors(prev => [...prev, newVendor]);
    toast({ title: "Success", description: `Vendor "${name.trim()}" has been added.` });
  };

  const handleTransaction = (vendorId: string, type: 'in' | 'out', cylinderType: keyof CylinderTransaction) => {
    const currentStock = cylinderType === 'oxygen' ? oxygenCylinders : co2Cylinders;
    if (type === 'out' && currentStock <= 0) {
      toast({
        title: "Action blocked",
        description: `Cannot check out an ${cylinderType.toUpperCase()} cylinder, stock is at 0.`,
        variant: "destructive",
      });
      return;
    }

    if (cylinderType === 'oxygen') {
        setOxygenCylinders(prev => type === 'in' ? prev + 1 : prev - 1);
    } else {
        setCo2Cylinders(prev => type === 'in' ? prev + 1 : prev - 1);
    }
    
    setVendors(prev =>
      prev.map(vendor => {
        if (vendor.id === vendorId) {
          const updatedVendor = { ...vendor };
          if (type === 'in') {
            updatedVendor.cylindersIn[cylinderType]++;
          } else {
            updatedVendor.cylindersOut[cylinderType]++;
          }
          return updatedVendor;
        }
        return vendor;
      })
    );
    toast({
        title: "Transaction complete",
        description: `${cylinderType.toUpperCase()} cylinder ${type === 'in' ? 'returned from' : 'given to'} vendor.`
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
