import './globals.css';
import type { Metadata } from 'next';
import { Inter, Vazirmatn } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const vazirmatn = Vazirmatn({ 
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'سامانه مدیریت نمایندگان',
  description: 'سیستم مدیریت و نظارت بر عملکرد نمایندگان',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/Vazirmatn-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Vazirmatn-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Vazirmatn-Light.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} ${vazirmatn.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}