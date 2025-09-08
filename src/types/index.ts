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
  ownership: 'gasomateec' | 'self';
}

export interface Vendor {
  id: string;
  name: string;
  cylindersOut: CylinderTransaction;
  transactions: Transaction[];
}
