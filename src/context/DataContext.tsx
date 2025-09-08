'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Vendor, CylinderTransaction, Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, writeBatch, query, getDoc, getDocs, where, runTransaction } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';


// Data Context
interface DataContextType {
  vendors: Vendor[];
  oxygenCylinders: number;
  co2Cylinders: number;
  totalCylinders: number;
  addVendor: (name: string) => Promise<void>;
  handleTransaction: (vendorId: string, type: 'in' | 'out', cylinderType: keyof CylinderTransaction, count: number, date: Date, ownership: 'gasomateec' | 'self') => Promise<void>;
  setStock: (oxygen: number, co2: number) => Promise<void>;
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
  const pathname = usePathname();
  
  // Simple client-side auth
  const login = (email: string, pass: string) => {
    if (email === 'info@gasomateec' && pass === 'Admin@123') {
      setIsAuthenticated(true);
      router.push('/dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    router.push('/');
  };

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/') {
        router.push('/');
    }
  }, [isAuthenticated, pathname, router]);

  useEffect(() => {
    if (!isAuthenticated) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);

    const vendorsQuery = query(collection(db, 'vendors'));
    const unsubscribeVendors = onSnapshot(vendorsQuery, (snapshot) => {
        const vendorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendor));
        setVendors(vendorsData.sort((a,b) => a.name.localeCompare(b.name)));
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching vendors:", error);
        toast({ title: "Error", description: "Could not fetch vendor data.", variant: "destructive" });
        setIsLoading(false);
    });
    
    const stockRef = doc(db, 'stock', 'total');
    const unsubscribeStock = onSnapshot(stockRef, (doc) => {
        if(doc.exists()){
            const data = doc.data();
            setOxygenCylinders(data.oxygen || 0);
            setCo2Cylinders(data.co2 || 0);
        } else {
            setDoc(doc.ref, { oxygen: 50, co2: 50 });
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching stock:", error);
        toast({ title: "Error", description: "Could not fetch stock data.", variant: "destructive" });
        setIsLoading(false);
    });

    return () => {
      unsubscribeVendors();
      unsubscribeStock();
    };
  }, [toast, isAuthenticated]);

  
  const addVendor = async (name: string) => {
    if (name.trim() === '') {
        toast({ title: "Error", description: "Vendor name cannot be empty.", variant: "destructive" });
        return;
    }

    const vendorsQuery = query(collection(db, 'vendors'), where('name', '==', name.trim()));
    const querySnapshot = await getDocs(vendorsQuery);
    if (!querySnapshot.empty) {
        toast({ title: "Error", description: "A vendor with this name already exists.", variant: "destructive" });
        return;
    }
    
    const newVendorRef = doc(collection(db, 'vendors'));
    const newVendor: Omit<Vendor, 'id'> = {
      name: name.trim(),
      cylindersOut: { oxygen: 0, co2: 0 },
      transactions: [],
    };
    
    await setDoc(newVendorRef, newVendor);
    toast({ title: "Success", description: `Vendor "${name.trim()}" has been added.` });
  };

  const handleTransaction = useCallback(async (vendorId: string, type: 'in' | 'out', cylinderType: keyof CylinderTransaction, count: number, date: Date, ownership: 'gasomateec' | 'self') => {
    if (count <= 0) {
        toast({
            title: "Invalid count",
            description: "Transaction count must be a positive number.",
            variant: "destructive",
        });
        return;
    }

    const vendorRef = doc(db, 'vendors', vendorId);
    const stockRef = doc(db, 'stock', 'total');
    
    try {
      await runTransaction(db, async (transaction) => {
        const vendorDoc = await transaction.get(vendorRef);
        const stockDoc = await transaction.get(stockRef);

        if (!vendorDoc.exists()) throw new Error("Vendor does not exist!");
        if (!stockDoc.exists()) throw new Error("Stock data is not initialized!");
        
        const vendorData = vendorDoc.data() as Omit<Vendor, 'id'>;
        const stockData = stockDoc.data();

        if (ownership === 'gasomateec') {
          if (type === 'out') {
            const currentStock = cylinderType === 'oxygen' ? stockData.oxygen : stockData.co2;
            if (currentStock < count) {
              throw new Error(`Cannot check out ${count} ${cylinderType.toUpperCase()} cylinder(s), only ${currentStock} in stock.`);
            }
          }

          if (type === 'in') {
            const netCylindersWithVendor = vendorData.cylindersOut[cylinderType];
            if (netCylindersWithVendor < count) {
              throw new Error(`Cannot check in ${count} ${cylinderType.toUpperCase()} Gasomateec cylinder(s), vendor only holds ${netCylindersWithVendor}.`);
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

        const newTransactions = [newTransaction, ...vendorData.transactions];
        
        let updatedCylindersOut = { ...vendorData.cylindersOut };

        if (ownership === 'gasomateec') {
          updatedCylindersOut[cylinderType] = type === 'out'
            ? updatedCylindersOut[cylinderType] + count
            : updatedCylindersOut[cylinderType] - count;
        }

        transaction.update(vendorRef, { 
          transactions: newTransactions,
          cylindersOut: updatedCylindersOut 
        });

        if (ownership === 'gasomateec') {
          const fieldToUpdate = cylinderType === 'oxygen' ? 'oxygen' : 'co2';
          const newStockCount = type === 'in' ? stockData[fieldToUpdate] + count : stockData[fieldToUpdate] - count;
          transaction.update(stockRef, { [fieldToUpdate]: newStockCount });
        }
      });

      toast({
          title: "Transaction complete",
          description: `${count} ${cylinderType.toUpperCase()} cylinder(s) (${ownership}) ${type === 'in' ? 'returned from' : 'given to'} vendor.`
      });

    } catch (e: any) {
      toast({ title: "Transaction failed", description: e.message, variant: "destructive" });
    }
  }, [toast]);
  
  const setStock = async (oxygen: number, co2: number) => {
    const stockRef = doc(db, 'stock', 'total');
    await setDoc(stockRef, { oxygen, co2 }, { merge: true });
    toast({
        title: "Stock updated",
        description: "Total cylinder counts have been saved."
    });
  }

  const contextValue = { 
      vendors, 
      oxygenCylinders, 
      co2Cylinders, 
      totalCylinders: oxygenCylinders + co2Cylinders, 
      addVendor, 
      handleTransaction, 
      setStock, 
      isLoading,
      isAuthenticated,
      login,
      logout
  };

  return (
    <DataContext.Provider value={contextValue}>
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
