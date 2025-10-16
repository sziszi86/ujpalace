'use client';

import React, { useState, useEffect } from 'react';

interface AgeVerificationModalProps {
  onVerified?: () => void;
  onUnderAge?: () => void;
}

export default function AgeVerificationModal({ onVerified, onUnderAge }: AgeVerificationModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUnderAgeMessage, setShowUnderAgeMessage] = useState(false);

  useEffect(() => {
    // Check if user has already verified their age
    const ageVerified = localStorage.getItem('age-verified');
    if (!ageVerified) {
      // Show modal after a short delay for better UX
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 500);
    }
  }, []);

  const handleYes = () => {
    localStorage.setItem('age-verified', 'true');
    localStorage.setItem('age-verified-date', new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onVerified?.();
    }, 300);
  };

  const handleNo = () => {
    localStorage.setItem('age-verified', 'false');
    localStorage.setItem('age-verified-date', new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => {
      setShowUnderAgeMessage(true);
      onUnderAge?.();
    }, 300);
  };

  if (showUnderAgeMessage) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
        
        {/* Underage Message */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-gradient-to-br from-red-50 via-red-100 to-red-50 rounded-3xl shadow-2xl border-2 border-red-300 overflow-hidden">
            {/* Content */}
            <div className="relative z-10 p-8 text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <span className="text-2xl">🚫</span>
              </div>
              
              {/* Message */}
              <h2 className="text-2xl font-bold text-red-700 mb-4">
                Sajnáljuk!
              </h2>
              <p className="text-red-600 leading-relaxed">
                Ön még kiskorú!
              </p>
              <p className="text-red-500 text-sm mt-2">
                Ez a weboldal csak 18 éven felüliek számára elérhető.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Age Verification Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`relative max-w-lg w-full bg-gradient-to-br from-white via-poker-light/30 to-white rounded-3xl shadow-2xl border-2 border-poker-primary/20 overflow-hidden transform transition-all duration-500 ${
            isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 text-4xl text-poker-primary animate-pulse">♠</div>
            <div className="absolute bottom-4 left-4 text-4xl text-poker-gold animate-pulse" style={{animationDelay: '1s'}}>♦</div>
            <div className="absolute top-1/2 left-8 text-3xl text-poker-green animate-float">♣</div>
            <div className="absolute top-8 left-1/2 text-3xl text-poker-red animate-float" style={{animationDelay: '0.5s'}}>♥</div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-poker-primary to-poker-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-bounce-subtle">
                <span className="text-2xl">🔞</span>
              </div>
              <h2 className="text-2xl font-bold text-poker-dark mb-2">
                Korhatár Ellenőrzés
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-poker-primary to-poker-gold rounded-full mx-auto"></div>
            </div>

            {/* Message */}
            <div className="text-center mb-8">
              <p className="text-black leading-relaxed mb-4 text-lg font-semibold">
                Elmúltam 18 éves
              </p>
              <div className="bg-poker-light/50 rounded-xl p-4 border border-poker-primary/10">
                <p className="text-sm text-black">
                  <strong className="text-black">Figyelem:</strong> Ez a weboldal csak 18 éven felüli 
                  személyek számára elérhető. A továbblépéssel megerősíti, hogy betöltötte a 18. életévét.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleYes}
                className="flex-1 bg-gradient-to-r from-poker-primary to-poker-secondary text-white font-bold py-4 px-6 rounded-xl hover:from-poker-secondary hover:to-poker-primary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Igen
                </span>
              </button>
              
              <button
                onClick={handleNo}
                className="flex-1 bg-white text-poker-primary border-2 border-poker-primary/30 font-bold py-4 px-6 rounded-xl hover:bg-poker-primary hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Nem
                </span>
              </button>
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-poker-light/50">
              <p className="text-xs text-black text-center">
                A szerencsejáték káros szenvedélyt okozhat. 18 éven aluliak részére tilos!
              </p>
            </div>
          </div>

          {/* Decorative Border */}
          <div className="absolute inset-0 rounded-3xl border border-gradient-to-r from-poker-primary/20 via-poker-gold/20 to-poker-primary/20 pointer-events-none"></div>
        </div>
      </div>
    </>
  );
}

// Hook for checking age verification status
export function useAgeVerification() {
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const verificationStatus = localStorage.getItem('age-verified');
    setVerified(verificationStatus === 'true' ? true : verificationStatus === 'false' ? false : null);
  }, []);

  const updateVerification = (status: boolean) => {
    localStorage.setItem('age-verified', status.toString());
    localStorage.setItem('age-verified-date', new Date().toISOString());
    setVerified(status);
  };

  const clearVerification = () => {
    localStorage.removeItem('age-verified');
    localStorage.removeItem('age-verified-date');
    setVerified(null);
  };

  return {
    verified,
    hasVerified: verified !== null,
    isVerified: verified === true,
    isUnderAge: verified === false,
    updateVerification,
    clearVerification
  };
}