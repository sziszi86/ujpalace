'use client';

import { useEffect, useState } from 'react';
import Banner from "@/components/Banner";
import FeaturedOffers from "@/components/FeaturedOffers";
import FeaturedEvents from "@/components/FeaturedEvents";
import BlogSection from "@/components/BlogSection";

interface AboutData {
  opening_hours?: string;
}

export default function Home() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);

  useEffect(() => {
    // Fetch opening hours
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/about');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setAboutData(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
      }
    };
    fetchAboutData();

    // Counter animation function
    const animateCounters = () => {
      const counters = document.querySelectorAll('.counter');
      const speed = 200; // Animation speed

      const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target as HTMLElement;
            const target = parseInt(counter.getAttribute('data-target') || '0');
            const increment = target / speed;
            let count = 0;

            const updateCount = () => {
              if (count < target) {
                count += increment;
                counter.textContent = Math.ceil(count).toString();
                setTimeout(updateCount, 1);
              } else {
                counter.textContent = target.toString();
              }
            };

            updateCount();
            observer.unobserve(counter);
          }
        });
      }, observerOptions);

      counters.forEach((counter) => {
        observer.observe(counter);
      });
    };

    animateCounters();
  }, []);
  return (
    <div>
      {/* Hero Banner */}
      <Banner />

      {/* Featured Events Section */}
      <FeaturedEvents />

      {/* Featured Offers Section */}
      <FeaturedOffers />

      {/* About Section - Trendy Design */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Subtle background decorations */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-20 left-10 text-6xl animate-float text-poker-gold">♠</div>
          <div className="absolute bottom-20 right-10 text-6xl animate-float text-poker-primary" style={{animationDelay: '1s'}}>♦</div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-poker-dark mb-4">
              Üdvözlünk a <span className="text-poker-primary">Palace Poker</span> Szombathelyen!
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-poker-primary to-poker-gold rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-poker-muted max-w-2xl mx-auto">
              Szeretettel várjuk kedves vendégeinket
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="space-y-8">
                <p className="text-lg text-poker-muted leading-relaxed">
                  Tapasztalt dealereink, barátságos légkörünk és világszínvonalú 
                  felszerelésünk biztosítja a legjobb poker élményt Szombathelyen.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-poker-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-poker-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-poker-dark mb-1">Profi környezet</h3>
                      <p className="text-sm text-poker-muted">Tapasztalt dealerek és modern asztalok</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-poker-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-poker-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-poker-dark mb-1">Tapasztalt személyzet</h3>
                      <p className="text-sm text-poker-muted">Képzett dealerek és segítőkész munkatársak</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-poker-red/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-poker-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-poker-dark mb-1">Barátságos közösség</h3>
                      <p className="text-sm text-poker-muted">Kezdő és profi játékosok</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-poker-dark mb-1">Változatos tétek</h3>
                      <p className="text-sm text-poker-muted">100/200 Ft-tól high stakesig</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/about" className="btn-primary text-center flex-1">
                    Tudj meg többet
                  </a>
                  <a href="/contact" className="btn-secondary text-center flex-1">
                    Kapcsolat
                  </a>
                </div>
              </div>
            </div>
            
            <div className="relative animate-scale-in" style={{animationDelay: '0.4s'}}>
              <div className="bg-gradient-to-br from-poker-darkgreen via-poker-green to-poker-darkgreen rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 text-4xl animate-pulse">♠</div>
                  <div className="absolute bottom-4 left-4 text-4xl animate-pulse" style={{animationDelay: '1s'}}>♦</div>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-8 text-center">Miért válassz minket?</h3>
                  <ul className="space-y-5">
                    <li className="flex items-center animate-slide-up" style={{animationDelay: '0.6s'}}>
                      <div className="w-4 h-4 bg-poker-gold rounded-full mr-4 animate-pulse"></div>
                      <span className="text-lg">10+ éves tapasztalat a póker világában</span>
                    </li>
                    <li className="flex items-center animate-slide-up" style={{animationDelay: '0.8s'}}>
                      <div className="w-4 h-4 bg-poker-gold rounded-full mr-4 animate-pulse"></div>
                      <span className="text-lg">Licenszelt és biztonságos játéktér</span>
                    </li>
                    <li className="flex items-center animate-slide-up" style={{animationDelay: '1s'}}>
                      <div className="w-4 h-4 bg-poker-gold rounded-full mr-4 animate-pulse"></div>
                      <span className="text-lg">Rendszeres versenyek és promóciók</span>
                    </li>
                    <li className="flex items-center animate-slide-up" style={{animationDelay: '1.2s'}}>
                      <div className="w-4 h-4 bg-poker-gold rounded-full mr-4 animate-pulse"></div>
                      <span className="text-lg">Ingyenes italszervíz játék közben</span>
                    </li>
                    <li className="flex items-center animate-slide-up" style={{animationDelay: '1.4s'}}>
                      <div className="w-4 h-4 bg-poker-gold rounded-full mr-4 animate-pulse"></div>
                      <span className="text-lg">Professzionális és diszkrét kiszolgálás</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Enhanced Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-poker-gold to-amber-400 rounded-full opacity-20 animate-float"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-poker-red to-red-500 rounded-full opacity-20 animate-float" style={{animationDelay: '1.5s'}}></div>
              <div className="absolute top-1/2 -right-3 w-12 h-12 bg-gradient-to-br from-poker-accent to-orange-200 rounded-full opacity-15 animate-bounce-subtle" style={{animationDelay: '2s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Trendy */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Modern background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-32 w-32 h-32 bg-poker-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-32 w-40 h-40 bg-poker-gold rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-poker-dark mb-4">
              Számokban a <span className="text-poker-primary">sikerünk</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-poker-primary to-poker-gold rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-poker-muted max-w-2xl mx-auto">
              Büszkék vagyunk a közösségünkre és az eredményeinkre
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-poker-gold to-amber-400 text-white w-28 h-28 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="text-center relative z-10">
                  <span className="counter block text-2xl font-bold" data-target="500">0</span>
                  <span className="text-lg font-medium">+</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-poker-dark mb-2">Aktív játékos</h3>
              <p className="text-poker-muted">Havonta látogató játékosok</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-poker-green to-emerald-600 text-white w-28 h-28 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="text-center relative z-10">
                  <span className="counter block text-2xl font-bold" data-target="20">0</span>
                  <span className="text-lg font-medium">+</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-poker-dark mb-2">Havi verseny</h3>
              <p className="text-poker-muted">Különböző formátumú versenyek</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-poker-red to-red-600 text-white w-28 h-28 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="text-center relative z-10">
                  <span className="counter block text-xl font-bold" data-target="5">0</span>
                  <span className="text-sm font-medium">M+ Ft</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-poker-dark mb-2">Összdíjalap</h3>
              <p className="text-poker-muted">Havonta kiosztott díjak</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white w-28 h-28 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="text-center relative z-10">
                  <span className="counter block text-2xl font-bold" data-target="10">0</span>
                  <span className="text-lg font-medium">+</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-poker-dark mb-2">Év tapasztalat</h3>
              <p className="text-poker-muted">Hosszú távú működés és tapasztalat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog & News Section */}
      <BlogSection />

      {/* Location Section - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-white to-poker-light/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl font-bold gradient-text mb-6">
              Találj meg minket
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-poker-primary to-poker-gold rounded-full mx-auto mb-6"></div>
            <p className="text-xl text-poker-muted max-w-3xl mx-auto">
              Szombathely központjában várunk, könnyű megközelíthetőség és ingyenes parkolás
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-poker-light/50">
                <h3 className="text-3xl font-bold text-poker-dark mb-8 flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-poker-primary to-poker-secondary rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Palace Poker Szombathely
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center group hover:bg-poker-light/30 p-4 rounded-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-poker-green to-poker-darkgreen rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-poker-dark">Cím</p>
                      <p className="text-poker-muted">9700 Szombathely, Semmelweis u. 2.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center group hover:bg-poker-light/30 p-4 rounded-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-poker-primary to-poker-secondary rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-poker-dark">Telefon</p>
                      <p className="text-poker-muted">+36 30 971 5832</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center group hover:bg-poker-light/30 p-4 rounded-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-poker-gold to-amber-400 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-poker-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-poker-dark">Nyitvatartás</p>
                      <div className="text-poker-muted font-medium text-sm space-y-1">
                        {aboutData?.opening_hours ? (
                          aboutData.opening_hours.split('\n').map((line, index) => (
                            <div key={index} className={line.toLowerCase().includes('zárva') ? 'text-xs' : ''}>
                              {line}
                            </div>
                          ))
                        ) : (
                          <>
                            <div>Szerda: 19:00 - 04:00</div>
                            <div>Péntek-Szombat: 19:30 - 04:00</div>
                            <div className="text-xs">Vas-Hét-Kedd-Csüt: zárva</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center group hover:bg-poker-light/30 p-4 rounded-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-poker-dark">Parkolás</p>
                      <p className="text-poker-muted">Ingyenes parkolás az épület előtt</p>
                    </div>
                  </div>
                </div>

                {/* Route Planner Button */}
                <div className="mt-8 pt-8 border-t border-poker-light">
                  <a 
                    href="https://www.google.com/maps/dir/?api=1&destination=9700+Szombathely,+Semmelweis+u.+2.,+Hungary" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center group"
                  >
                    <svg className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Útvonaltervező indítása
                  </a>
                </div>
              </div>
            </div>
            
            {/* Enhanced Map Section */}
            <div className="animate-scale-in" style={{animationDelay: '0.3s'}}>
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-poker-light/50">
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-bold text-poker-dark mb-2">Helyszín térképen</h4>
                  <p className="text-poker-muted">Palace Poker Szombathely elhelyezkedése</p>
                </div>
                
                <div className="relative bg-gradient-to-br from-poker-light to-gray-100 rounded-2xl h-96 overflow-hidden shadow-inner">
                  {/* Google Maps Embed */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2733.8547284446343!2d16.625284576769855!3d47.23142757115926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476e5da6d7d6b0d9%3A0xf5c5a5c5c5c5c5c5!2sSzombathely%2C%20Semmelweis%20u.%202%2C%209700%20Hungary!5e0!3m2!1sen!2sus!4v1703180000000!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-2xl"
                    title="Palace Poker Szombathely Helyszín"
                  />
                  
                  {/* Fallback for when iframe doesn't load */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-poker-primary/10 to-poker-green/10 animate-pulse" style={{display: 'none'}}>
                    <div className="text-center text-poker-dark">
                      <div className="w-16 h-16 bg-poker-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
                        <svg className="w-8 h-8 text-poker-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="font-semibold">Térkép betöltése...</p>
                      <p className="text-sm text-poker-muted">Palace Poker Szombathely</p>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-3 mt-6">
                  <a 
                    href="https://www.google.com/maps/place/Szombathely,+Semmelweis+u.+2,+9700+Hungary" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 btn-outline text-center py-3 text-sm"
                  >
                    Térkép megnyitása
                  </a>
                  <a 
                    href="https://www.google.com/maps/dir/?api=1&destination=9700+Szombathely,+Semmelweis+u.+2.,+Hungary" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 btn-secondary text-center py-3 text-sm"
                  >
                    Navigálás
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}