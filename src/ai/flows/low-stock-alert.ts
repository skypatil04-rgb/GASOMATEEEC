'use server';

/**
 * @fileOverview Generates a low stock alert notification based on the current cylinder count.
 * 
 * - generateLowStockAlert - A function that generates a low stock alert.
 * - LowStockAlertInput - The input type for the generateLowStockAlert function.
 * - LowStockAlertOutput - The return type for the generateLowStockAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LowStockAlertInputSchema = z.object({
  totalCylinderCount: z
    .number()
    .describe('The current total number of gas cylinders in stock.'),
  lowStockThreshold: z
    .number()
    .describe(
      'The threshold below which a low stock alert should be generated.'
    )
    .default(10), // Set a default low stock threshold
});
export type LowStockAlertInput = z.infer<typeof LowStockAlertInputSchema>;

const LowStockAlertOutputSchema = z.object({
  alertMessage: z
    .string()
    .describe(
      'A warning message indicating that the cylinder stock is dangerously low.'
    ),
  isLowStock: z
    .boolean()
    .describe('Whether the cylinder stock is below the low stock threshold.'),
});
export type LowStockAlertOutput = z.infer<typeof LowStockAlertOutputSchema>;

export async function generateLowStockAlert(
  input: LowStockAlertInput
): Promise<LowStockAlertOutput> {
  return lowStockAlertFlow(input);
}

const lowStockAlertPrompt = ai.definePrompt({
  name: 'lowStockAlertPrompt',
  input: {schema: LowStockAlertInputSchema},
  output: {schema: LowStockAlertOutputSchema},
  prompt: `You are an inventory management assistant.  Your job is to monitor gas cylinder stock levels and generate alerts when the stock is dangerously low.

  The current total cylinder count is: {{{totalCylinderCount}}}
  The low stock threshold is: {{{lowStockThreshold}}}

  If the total cylinder count is less than the low stock threshold, then generate a warning message and set isLowStock to true.  Otherwise, return an empty alert message and set isLowStock to false.

  Respond in JSON format.
  {
    "alertMessage": "",
    "isLowStock": false
  }`,
});

const lowStockAlertFlow = ai.defineFlow(
  {
    name: 'lowStockAlertFlow',
    inputSchema: LowStockAlertInputSchema,
    outputSchema: LowStockAlertOutputSchema,
  },
  async input => {
    const {output} = await lowStockAlertPrompt(input);
    return output!;
  }
);
