export interface CylinderTransaction {
  oxygen: number;
  co2: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  type: 'in' | 'out';
  cylinderType: 'oxygen' | 'co2';
  count: number;
}

export interface Vendor {
  id: string;
  name: string;
  cylindersOut: CylinderTransaction;
  cylindersIn: CylinderTransaction;
  transactions: Transaction[];
}
