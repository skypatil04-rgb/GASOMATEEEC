import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { DataProvider } from '@/context/DataContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'GASOMATEEC',
  description: 'Manage your gas cylinder inventory with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', inter.variable)}>
          <DataProvider>{children}</DataProvider>
        <Toaster />
      </body>
    </html>
  );
}
