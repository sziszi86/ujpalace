'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VisitorTracker from '@/components/VisitorTracker';
import CookieBanner from '@/components/CookieBanner';
import AgeVerificationModal from '@/components/AgeVerificationModal';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  
  // Admin oldalakon ne jelenjen meg a frontend header és footer
  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    // Check if cookies are accepted and age verification is needed
    const checkModals = () => {
      const cookieConsent = localStorage.getItem('cookie-consent');
      const ageVerified = localStorage.getItem('age-verified');
      
      // Show age verification if cookies are accepted but age not verified
      if (cookieConsent === 'accepted' && !ageVerified) {
        setTimeout(() => {
          setShowAgeVerification(true);
        }, 1000); // Small delay after cookie banner closes
      }
    };

    checkModals();
  }, []);

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
          // Trigger age verification check after cookie acceptance
          setTimeout(() => {
            const ageVerified = localStorage.getItem('age-verified');
            if (!ageVerified) {
              setShowAgeVerification(true);
            }
          }, 1000);
        }}
        onDecline={() => {
          // Optional: Track cookie decline
          console.log('Cookies declined');
        }}
      />
      {showAgeVerification && (
        <AgeVerificationModal 
          onVerified={() => {
            console.log('Age verified');
            setShowAgeVerification(false);
          }}
          onUnderAge={() => {
            console.log('User is underage');
            // Keep modal visible to show underage message
          }}
        />
      )}
    </div>
  );
}