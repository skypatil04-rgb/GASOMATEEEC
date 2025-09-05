'use client';

import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Warehouse } from 'lucide-react';

export default function TotalCylinderCount() {
  const { oxygenCylinders, co2Cylinders, isLoading } = useData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Cylinders in Stock</CardTitle>
        <Warehouse className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">OXYGEN</p>
              <div className="text-5xl font-bold text-primary">{oxygenCylinders}</div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CO2</p>
              <div className="text-5xl font-bold text-primary">{co2Cylinders}</div>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground pt-2">
          This is the total count of cylinders available across all locations.
        </p>
      </CardContent>
    </Card>
  );
}
