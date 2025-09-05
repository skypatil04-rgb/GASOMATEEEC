export interface CylinderTransaction {
  oxygen: number;
  co2: number;
}

export interface Vendor {
  id: string;
  name: string;
  cylindersOut: CylinderTransaction;
  cylindersIn: CylinderTransaction;
}
