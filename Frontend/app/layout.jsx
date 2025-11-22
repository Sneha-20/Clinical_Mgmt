import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ReduxProvider } from '@/lib/redux/provider';
import CommonLoader from '@/components/ui/CommoLoader';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata = {
  title: 'NOIS - Clinic Management System',
  description: 'Navjeevan Operating Intelligence System',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  generator: 'v0.app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
         <Toaster position="top-right" />
         <ReduxProvider>
          <CommonLoader />
           {children}
         </ReduxProvider>
      </body>
    </html>
  );
}
