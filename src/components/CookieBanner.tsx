'use client';

import React, { useState, useEffect } from 'react';
import { ANALYTICS_CONSENT_KEY, ANALYTICS_SETTINGS_EVENT, saveAnalyticsConsent } from '@/lib/analytics-client';

interface CookieBannerProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function CookieBanner({ onAccept, onDecline }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const show = () => { setIsVisible(true); setIsAnimating(true); };
    let hasChoice = false;
    try { hasChoice = !!localStorage.getItem(ANALYTICS_CONSENT_KEY); } catch { /* Show a usable banner even without storage. */ }
    const timer = !hasChoice ? setTimeout(show, 1500) : undefined;
    window.addEventListener(ANALYTICS_SETTINGS_EVENT, show);
    return () => { clearTimeout(timer); window.removeEventListener(ANALYTICS_SETTINGS_EVENT, show); };
  }, []);

  const handleAccept = () => {
    saveAnalyticsConsent('accepted');
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onAccept?.();
    }, 300);
  };

  const handleDecline = () => {
    saveAnalyticsConsent('declined');
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDecline?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Cookie Banner */}
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
                <span className="text-2xl">🍪</span>
              </div>
              <h2 className="text-2xl font-bold text-poker-dark mb-2">
                Süti Kezelés
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-poker-primary to-poker-gold rounded-full mx-auto"></div>
            </div>

            {/* Message */}
            <div className="text-center mb-8">
              <p className="text-black leading-relaxed mb-4">
                Engedélyezi a látogatottság mérését? Egy véletlen böngészőazonosító segítségével számoljuk a látogatókat és az oldalmegtekintéseket. Az azonosítót legfeljebb 90 napig tároljuk a böngészőben.
              </p>
              <div className="bg-poker-light/50 rounded-xl p-4 border border-poker-primary/10">
                <p className="text-sm text-black">
                  <strong className="text-black">Ön dönt:</strong> Az analitika csak elfogadás után indul. Elutasítás esetén is használhatja az oldalt. A mérési adatok saját adatbázisunkba kerülnek.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 bg-gradient-to-r from-poker-primary to-poker-secondary text-white font-bold py-4 px-6 rounded-xl hover:from-poker-secondary hover:to-poker-primary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Analitika engedélyezése
                </span>
              </button>
              
              <button
                onClick={handleDecline}
                className="flex-1 bg-white text-poker-primary border-2 border-poker-primary/30 font-bold py-4 px-6 rounded-xl hover:bg-poker-primary hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Csak szükséges
                </span>
              </button>
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-poker-light/50">
              <p className="text-xs text-black text-center">
                További információért olvassa el{' '}
                <a href="/privacy" className="text-poker-primary hover:text-poker-secondary transition-colors underline">
                  Adatvédelmi szabályzatunkat
                </a>.
                Beállításait a lábléc „Sütibeállítások” gombjával módosíthatja.
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

// Hook for checking cookie consent status
export function useCookieConsent() {
  const [consent, setConsent] = useState<'accepted' | 'declined' | null>(null);

  useEffect(() => {
    const consentStatus = localStorage.getItem('cookie-consent') as 'accepted' | 'declined' | null;
    setConsent(consentStatus);
  }, []);

  const updateConsent = (status: 'accepted' | 'declined') => {
    localStorage.setItem('cookie-consent', status);
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setConsent(status);
  };

  const clearConsent = () => {
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-consent-date');
    setConsent(null);
  };

  return {
    consent,
    hasConsented: consent !== null,
    isAccepted: consent === 'accepted',
    isDeclined: consent === 'declined',
    updateConsent,
    clearConsent
  };
}