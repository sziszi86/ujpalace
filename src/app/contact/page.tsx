'use client';

import { useState, useEffect } from 'react';

interface AboutData {
  opening_hours?: string;
}

export default function ContactPage() {
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
    <div className="min-h-screen bg-poker-light py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Kapcsolat
          </h1>
          <p className="text-xl text-poker-muted max-w-3xl mx-auto">
            Lépjen kapcsolatba velünk! Örömmel válaszolunk minden kérdésére.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="card-modern p-8">
              <h2 className="text-3xl font-bold text-poker-dark mb-8 text-center">Elérhetőségek</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-poker-primary/10 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-poker-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-poker-dark mb-1">Cím</h3>
                    <p className="text-poker-muted">Palace Poker Szombathely</p>
                    <p className="text-poker-muted">9700 Szombathely</p>
                    <p className="text-poker-muted">Semmelweis u. 2.</p>
                    <p className="text-poker-muted">Magyarország</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-poker-primary/10 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-poker-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-poker-dark mb-1">Telefon</h3>
                    <p className="text-poker-muted">+36 30 971 5832</p>
                    <p className="text-xs text-poker-muted mt-1">Hívható: H-V 14:00-24:00</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-poker-primary/10 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-poker-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-poker-dark mb-1">Email</h3>
                    <p className="text-poker-muted">palacepoker kukac hotmail.hu</p>
                    <p className="text-xs text-poker-muted mt-1">Válaszidő: 24 órán belül</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-poker-primary/10 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-poker-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-poker-dark mb-1">Nyitvatartás</h3>
                    <div className="text-poker-muted space-y-1">
                      {aboutData?.opening_hours ? (
                        aboutData.opening_hours.split('\n').map((line, index) => (
                          <p key={index} className={line.includes('ZÁRVA') ? 'text-red-600' : 'font-medium text-poker-primary'}>
                            {line}
                          </p>
                        ))
                      ) : (
                        <>
                          <p className="font-medium text-poker-primary">Szerda: 19:00 - 04:00</p>
                          <p className="font-medium text-poker-primary">Péntek-Szombat: 19:30 - 04:00</p>
                          <p className="text-red-600">Vasárnap-Hétfő-Kedd-Csütörtök: ZÁRVA</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-modern p-8">
              <h2 className="text-3xl font-bold text-poker-dark mb-4 text-center">Közösségi média</h2>
              <p className="text-poker-muted text-center mb-8">Kövess minket és maradj naprakész a legfrissebb híreinkkel!</p>
              
              <div className="flex space-x-6 justify-center">
                <a
                  href="https://www.facebook.com/PalacePokerClubSzombathely"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-poker-primary/10 hover:bg-poker-primary hover:text-white text-poker-primary p-3 rounded-lg transition-colors duration-300"
                  title="Palace Poker Facebook oldal"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                
                <a
                  href="mailto:palacepoker kukac hotmail.hu"
                  className="bg-poker-primary/10 hover:bg-poker-primary hover:text-white text-poker-primary p-3 rounded-lg transition-colors duration-300"
                  title="Email küldése"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </a>
                
                <a
                  href="tel:+36309715832"
                  className="bg-poker-primary/10 hover:bg-poker-primary hover:text-white text-poker-primary p-3 rounded-lg transition-colors duration-300"
                  title="Telefonhívás"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Map Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="card-modern p-8">
            <h2 className="text-3xl font-bold text-poker-dark mb-8 text-center">Helyszín és Útvonaltervező</h2>
            
            {/* Route Planning Buttons */}
            <div className="mb-6 flex flex-wrap gap-4 justify-center">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Palace+Poker+Szombathely,+Semmelweis+u.+2,+9700+Szombathely,+Hungary"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center px-6 py-3"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
                Google Maps útvonal
              </a>
              
              <a
                href="https://waze.com/ul?q=Palace+Poker+Szombathely+Semmelweis+u.+2+9700+Szombathely&navigate=yes"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4z"/>
                </svg>
                Waze útvonal
              </a>
              
              <button
                onClick={() => {
                  const address = "Palace Poker Szombathely, Semmelweis u. 2, 9700 Szombathely, Hungary";
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(address);
                    alert('Cím vágólapra másolva!');
                  }
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Cím másolása
              </button>
            </div>

            {/* Google Maps Embed */}
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2734.123456789!2d16.625!3d47.237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDE0JzEzLjIiTiAxNsKwMzcnMzAuMCJF!5e0!3m2!1shu!2shu!4v1000000000000!5m2!1shu!2shu&q=Semmelweis+u.+2,+9700+Szombathely,+Hungary"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Palace Poker Szombathely térképe"
              />
            </div>
            
            <div className="mt-6 text-center">
              <div className="bg-poker-light/50 rounded-lg p-4">
                <h3 className="font-semibold text-poker-dark mb-2">Pontos cím</h3>
                <p className="text-poker-muted font-medium">Palace Poker Szombathely</p>
                <p className="text-poker-muted">9700 Szombathely, Semmelweis u. 2.</p>
                <p className="text-sm text-poker-muted mt-2">
                  📍 GPS koordináták: 47.237°N, 16.625°E
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}