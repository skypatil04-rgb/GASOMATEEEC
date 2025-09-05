'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useData } from '@/context/DataContext';
import { generateLowStockAlert } from '@/ai/flows/low-stock-alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Bot } from 'lucide-react';

const formSchema = z.object({
  threshold: z.coerce.number().min(1, 'Threshold must be at least 1.'),
});

export default function LowStockAlert() {
  const { totalCylinders } = useData();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      threshold: 10,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsChecking(true);
    try {
      const result = await generateLowStockAlert({
        totalCylinderCount: totalCylinders,
        lowStockThreshold: values.threshold,
      });
      if (result.isLowStock) {
        toast({
          title: 'Low Stock Warning',
          description: result.alertMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Stock Level OK',
          description: 'Cylinder stock is above the threshold.',
        });
      }
    } catch (error) {
      console.error('Error generating alert:', error);
      toast({
        title: 'Error',
        description: 'Could not check stock levels.',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">AI Low Stock Alert</CardTitle>
        <Bot className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4">
          Check if your inventory is below a critical threshold.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col justify-between">
            <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isChecking} className="w-full sm:w-auto">
              {isChecking ? 'Checking...' : 'Check Stock'}
              <AlertTriangle className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
