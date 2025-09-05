'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';

const formSchema = z.object({
  vendorName: z.string().min(2, 'Vendor name must be at least 2 characters.'),
});

export default function AddVendorForm() {
  const { addVendor } = useData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorName: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addVendor(values.vendorName);
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a New Vendor</CardTitle>
        <CardDescription>Enter the name of the new vendor to add them to your list.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
            <FormField
              control={form.control}
              name="vendorName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="sr-only">Vendor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Acme Gas Supply" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" /> Add Vendor
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
