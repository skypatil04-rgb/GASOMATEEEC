
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Vendor, CylinderTransaction, Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';

const VENDORS_STORAGE_KEY = 'gasomateecVendors';
const OXYGEN_CYLINDERS_STORAGE_KEY = 'gasomateecTotalOxygen';
const CO2_CYLINDERS_STORAGE_KEY = 'gasomateecTotalCO2';
const AUTH_STORAGE_KEY = 'gasomateecAuth';

interface DataContextType {
  vendors: Vendor[];
  oxygenCylinders: number;
  co2Cylinders: number;
  totalCylinders: number;
  addVendor: (name: string) => void;
  handleTransaction: (vendorId: string, type: 'in' | 'out', cylinderType: keyof CylinderTransaction, count: number, date: Date, ownership: 'gasomateec' | 'self') => void;
  setStock: (oxygen: number, co2: number) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [oxygenCylinders, setOxygenCylinders] = useState<number>(0);
  const [co2Cylinders, setCo2Cylinders] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    try {
      const authStatus = localStorage.getItem(AUTH_STORAGE_KEY);
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        const publicPaths = ['/'];
        if (!publicPaths.includes(window.location.pathname)) {
            router.push('/');
        }
      }

      const storedVendors = localStorage.getItem(VENDORS_STORAGE_KEY);
      const storedOxygenCylinders = localStorage.getItem(OXYGEN_CYLINDERS_STORAGE_KEY);
      const storedCO2Cylinders = localStorage.getItem(CO2_CYLINDERS_STORAGE_KEY);

      if (storedVendors) {
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
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const saveData = useCallback(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(vendors));
        localStorage.setItem(OXYGEN_CYLINDERS_STORAGE_KEY, JSON.stringify(oxygenCylinders));
        localStorage.setItem(CO2_CYLINDERS_STORAGE_KEY, JSON.stringify(co2Cylinders));
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(isAuthenticated));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [vendors, oxygenCylinders, co2Cylinders, isLoading, isAuthenticated]);

  useEffect(() => {
    saveData();
  }, [saveData]);
  
  const login = (email: string, pass: string) => {
    if (email === 'info@gasomateec' && pass === 'Admin@123') {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };


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
      cylindersOut: { oxygen: 0, co2: 0 },
      transactions: [],
    };
    setVendors(prev => [...prev, newVendor]);
    toast({ title: "Success", description: `Vendor "${name.trim()}" has been added.` });
  };

  const handleTransaction = (vendorId: string, type: 'in' | 'out', cylinderType: keyof CylinderTransaction, count: number, date: Date, ownership: 'gasomateec' | 'self') => {
    if (count <= 0) {
        toast({
            title: "Invalid count",
            description: "Transaction count must be a positive number.",
            variant: "destructive",
        });
        return;
    }
    
    let transactionSuccessful = false;
    let newOxygenCylinders = oxygenCylinders;
    let newCo2Cylinders = co2Cylinders;

    setVendors(prev =>
      prev.map(vendor => {
        if (vendor.id === vendorId) {
          
          if (ownership === 'gasomateec') {
            if (type === 'out') {
              const currentStock = cylinderType === 'oxygen' ? newOxygenCylinders : newCo2Cylinders;
              if (currentStock < count) {
                toast({
                  title: "Action blocked",
                  description: `Cannot check out ${count} ${cylinderType.toUpperCase()} cylinder(s), only ${currentStock} in stock.`,
                  variant: "destructive",
                });
                return vendor;
              }
            }

            if (type === 'in') {
              const netCylindersWithVendor = vendor.cylindersOut[cylinderType];
              if (netCylindersWithVendor < count) {
                  toast({
                      title: 'Action blocked',
                      description: `Cannot check in ${count} ${cylinderType.toUpperCase()} Gasomateec cylinder(s), vendor only holds ${netCylindersWithVendor}.`,
                      variant: 'destructive',
                  });
                  return vendor;
              }
            }
          }

          const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            date: date.toISOString(),
            type,
            cylinderType,
            count,
            ownership
          };
          
          if (ownership === 'gasomateec') {
            if (cylinderType === 'oxygen') {
                newOxygenCylinders = type === 'in' ? newOxygenCylinders + count : newOxygenCylinders - count;
            } else {
                newCo2Cylinders = type === 'in' ? newCo2Cylinders + count : newCo2Cylinders - count;
            }
          }

          const transactions = [...(vendor.transactions || []), newTransaction].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          const cylindersOut = transactions
            .filter(t => t.ownership === 'gasomateec')
            .reduce((acc, t) => {
              if (t.type === 'out') {
                acc[t.cylinderType] += t.count;
              } else {
                acc[t.cylinderType] -= t.count;
              }
              return acc;
            }, { oxygen: 0, co2: 0 });
          
          cylindersOut.oxygen = Math.max(0, cylindersOut.oxygen);
          cylindersOut.co2 = Math.max(0, cylindersOut.co2);
          
          transactionSuccessful = true;

          return {
            ...vendor,
            transactions,
            cylindersOut,
          };
        }
        return vendor;
      })
    );
      if (transactionSuccessful) {
          setOxygenCylinders(newOxygenCylinders);
          setCo2Cylinders(newCo2Cylinders);
          toast({
              title: "Transaction complete",
              description: `${count} ${cylinderType.toUpperCase()} cylinder(s) (${ownership}) ${type === 'in' ? 'returned from' : 'given to'} vendor.`
          })
      }
  };
  
  const setStock = (oxygen: number, co2: number) => {
    setOxygenCylinders(oxygen);
    setCo2Cylinders(co2);
    toast({
        title: "Stock updated",
        description: "Total cylinder counts have been saved."
    });
  }

  return (
    <DataContext.Provider value={{ vendors, oxygenCylinders, co2Cylinders, totalCylinders: oxygenCylinders + co2Cylinders, addVendor, handleTransaction, setStock, isLoading, isAuthenticated, login, logout }}>
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
