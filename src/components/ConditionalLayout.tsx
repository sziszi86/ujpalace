'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VisitorTracker from '@/components/VisitorTracker';
import CookieBanner from '@/components/CookieBanner';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Admin oldalakon ne jelenjen meg a frontend header és footer
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    // Admin oldalakon csak a gyermek komponenseket rendereljük
    return <>{children}</>;
  }

  // Frontend oldalakon teljes layout a header-rel és footer-rel
  return (
    <div className="min-h-screen flex flex-col">
      <VisitorTracker />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieBanner 
        onAccept={() => {
          // Optional: Track cookie acceptance
          console.log('Cookies accepted');
        }}
        onDecline={() => {
          // Optional: Track cookie decline
          console.log('Cookies declined');
        }}
      />
    </div>
  );
}