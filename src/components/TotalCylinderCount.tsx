'use client';

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TotalCylinderCount() {
  const { oxygenCylinders, co2Cylinders, isLoading, setStock } = useData();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // These will hold the temporary values for the form.
  const [newOxygenCount, setNewOxygenCount] = useState(0);
  const [newCo2Count, setNewCo2Count] = useState(0);

  const handleOpenDialog = () => {
    // When opening, initialize form state from the main context.
    setNewOxygenCount(oxygenCylinders);
    setNewCo2Count(co2Cylinders);
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    // On save, submit the form's local state.
    setStock(newOxygenCount, newCo2Count);
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cylinders in Stock</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleOpenDialog}>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Stock Counts</DialogTitle>
            <DialogDescription>
              Manually set the total number of cylinders in stock.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="oxygen" className="text-right">
                Oxygen
              </Label>
              <Input
                id="oxygen"
                type="number"
                value={newOxygenCount}
                onChange={(e) => setNewOxygenCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="co2" className="text-right">
                CO2
              </Label>
              <Input
                id="co2"
                type="number"
                value={newCo2Count}
                onChange={(e) => setNewCo2Count(Math.max(0, parseInt(e.target.value) || 0))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
