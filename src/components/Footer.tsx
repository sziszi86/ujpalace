'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface AboutData {
  opening_hours?: string;
}

export default function Footer() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/about');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setAboutData(data[0]); // Get the first about page
          }
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
      }
    };

    fetchAboutData();
  }, []);
  return (
    <footer className="bg-poker-black text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-poker-gold rounded-lg flex items-center justify-center mr-3">
                <span className="text-poker-black font-bold text-lg">PP</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Palace Poker</h3>
                <p className="text-poker-gold text-sm">Szombathely</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Szeretettel várjuk kedves vendégeinket. Barátságos légkör 
              és izgalmas játékok várnak kezdő és tapasztalt játékosokra egyaránt.
            </p>
            <div className="flex space-x-3">
              <Link href="https://www.facebook.com/PalacePokerClubSzombathely" className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:text-poker-gold transition-all duration-300 transform hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-poker-gold">Gyors linkek</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Főoldal</Link></li>
              <li><Link href="/tournaments" className="text-gray-300 hover:text-white transition-colors">Versenyek</Link></li>
              <li><Link href="/cash-games" className="text-gray-300 hover:text-white transition-colors">Cash Game</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">Rólunk</Link></li>
              <li><Link href="/gallery" className="text-gray-300 hover:text-white transition-colors">Galéria</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Kapcsolat</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-poker-gold">Elérhetőség</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-poker-gold mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-gray-300">9700 Szombathely</p>
                  <p className="text-gray-300">Semmelweis u. 2.</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 text-poker-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-gray-300">+36 30 971 5832</p>
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 text-poker-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-300">palacepoker kukac hotmail.hu</p>
              </div>
              
              <div className="flex items-start">
                <svg className="w-5 h-5 text-poker-gold mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="text-poker-gold font-medium mb-1">Nyitvatartás:</p>
                  {aboutData?.opening_hours ? (
                    aboutData.opening_hours.split('\n').map((line, index) => (
                      <p key={index} className={line.includes('ZÁRVA') ? 'text-gray-400 text-xs' : 'text-gray-300'}>
                        {line}
                      </p>
                    ))
                  ) : (
                    <>
                      <p className="text-gray-300">Szerda: 19:00-04:00</p>
                      <p className="text-gray-300">Péntek-Szombat: 19:30-04:00</p>
                      <p className="text-gray-400 text-xs mt-1">Játék kezdés: 20:00</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsible Gaming Notice */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-yellow-600 text-yellow-100 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="font-semibold mb-1">Felelős szerencsejáték</p>
                <p className="text-sm">
                  Szerencsejátékban csak 18 éven felüliek vehetnek részt!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Details Bar */}
      <div className="border-t border-gray-700 bg-poker-secondary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center space-y-2">
            <p className="text-white font-semibold text-sm">
              ÜZEMELTETŐ GAZDASÁGI TÁRSASÁG: PANNON PÓKER KFT, 9700 SZOMBATHELY SEMMELWEIS U. 2.
            </p>
            <p className="text-poker-gold font-medium text-sm">
              Kártyaterem hivatalos neve: Palace Poker Club
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © 2025 Palace Poker Szombathely. Minden jog fenntartva.
              </p>
              <div className="flex space-x-4">
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Adatvédelmi tájékoztató
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Szabályzat
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Powered by</span>
              <span className="text-poker-gold font-semibold text-sm">Salamon Szilard</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}