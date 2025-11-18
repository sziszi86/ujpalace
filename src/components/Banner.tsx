'use client';

import { useState, useEffect } from 'react';

interface BannerData {
  id: number;
  title: string;
  description: string;
  image: string;
  active: boolean;
  visibleFrom: string;
  visibleUntil: string;
  order: number;
  url?: string;
  customUrl?: string;
  openInNewTab?: boolean;
}

const defaultBanners: BannerData[] = [
  {
    id: 1,
    title: 'Weekend Main Event',
    description: 'Csatlakozz a hétvégi főeseményhez! Nagy nyeremények várnak!',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI2MCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjYwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyNjAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMTI2MCIgeTI9IjQwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMEYzRjI2Ii8+CjxzdG9wIG9mZnNldD0iMC41IiBzdG9wLWNvbG9yPSIjMjI4QjIyIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0Q0QUYzNyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjwvcnZnPgo=',
    active: true,
    visibleFrom: '2025-01-01',
    visibleUntil: '2025-12-31',
    order: 1
  },
  {
    id: 2,
    title: 'Cash Game Akció',
    description: 'Különleges cash game asztalok minden este!',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI2MCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjYwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyNjAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMTI2MCIgeTI9IjQwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMEYzRjI2Ii8+CjxzdG9wIG9mZnNldD0iMC41IiBzdG9wLWNvbG9yPSIjMjI4QjIyIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0Q0QUYzNyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjwvcnZnPgo=',
    active: true,
    visibleFrom: '2025-01-01',
    visibleUntil: '2025-12-31',
    order: 2
  },
  {
    id: 3,
    title: 'Póker Oktatás',
    description: 'Tanuld meg a póker alapjait a profiktól!',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI2MCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjYwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyNjAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMTI2MCIgeTI9IjQwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMUEyRTU5Ii8+CjxzdG9wIG9mZnNldD0iMC41IiBzdG9wLWNvbG9yPSIjMjI0NDc3Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0Q0QUYzNyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjwvcnZnPgo=',
    active: true,
    visibleFrom: '2025-01-01',
    visibleUntil: '2025-12-31',
    order: 3
  }
];

export default function Banner() {
  const [banners, setBanners] = useState<BannerData[]>(defaultBanners);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    const loadBanners = async () => {
      try {
        // Try to load from API first
        const response = await fetch('/api/banners');
        let loadedBanners = defaultBanners;
        
        if (response.ok) {
          const apiBanners = await response.json();
          const today = new Date().toISOString().split('T')[0];
          
          const visibleBanners = apiBanners.filter((banner: any) => {
            if (!banner.active) return false;
            
            // Ha nincs visibleFrom dátum, akkor mindig látható
            const fromDate = banner.visible_from;
            if (fromDate && fromDate > today) return false;
            
            // Ha nincs visibleUntil dátum, akkor nincs lejárat
            const untilDate = banner.visible_until;
            if (untilDate && untilDate < today) return false;
            
            return true;
          }).map((banner: any) => ({
            id: banner.id,
            title: banner.title,
            description: banner.description,
            image: banner.image_url,
            active: banner.active,
            visibleFrom: banner.visible_from,
            visibleUntil: banner.visible_until,
            order: banner.order_index,
            url: banner.link_url,
            customUrl: banner.custom_url,
            openInNewTab: banner.open_in_new_tab
          })).sort((a: BannerData, b: BannerData) => a.order - b.order);
          
          if (visibleBanners.length > 0) {
            loadedBanners = visibleBanners;
          }
        } else {
          // Fallback to localStorage if API fails
          if (typeof window !== 'undefined') {
            const savedBanners = localStorage.getItem('adminBanners');
            
            if (savedBanners) {
              try {
                const parsed = JSON.parse(savedBanners);
                const today = new Date().toISOString().split('T')[0];
                
                const visibleBanners = parsed.filter((banner: BannerData) => {
                  if (!banner.active) return false;
                  
                  // Ha nincs visibleFrom dátum, akkor mindig látható
                  const fromDate = banner.visibleFrom;
                  if (fromDate && fromDate > today) return false;
                  
                  // Ha nincs visibleUntil dátum, akkor nincs lejárat
                  const untilDate = banner.visibleUntil;
                  if (untilDate && untilDate < today) return false;
                  
                  return true;
                }).sort((a: BannerData, b: BannerData) => a.order - b.order);
                
                if (visibleBanners.length > 0) {
                  loadedBanners = visibleBanners;
                }
              } catch (error) {
                console.error('Error parsing banners:', error);
              }
            }
          }
        }
        
        setBanners(loadedBanners);
      } catch (error) {
        console.error('Error loading banners:', error);
        setBanners(defaultBanners);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
    
    if (typeof window !== 'undefined') {
      const handleBannersUpdated = () => {
        loadBanners();
      };

      window.addEventListener('bannersUpdated', handleBannersUpdated);
      window.addEventListener('storage', handleBannersUpdated);
      
      return () => {
        window.removeEventListener('bannersUpdated', handleBannersUpdated);
        window.removeEventListener('storage', handleBannersUpdated);
      };
    }
  }, []);

  const activeBanners = banners;

  useEffect(() => {
    if (activeBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [activeBanners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? activeBanners.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === activeBanners.length - 1 ? 0 : currentIndex + 1);
  };

  if (loading || !hasMounted) {
    return (
      <section className="relative h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-r from-poker-darkgreen to-poker-green mt-[80px] md:mt-[60px] lg:mt-0 -mb-[80px] md:-mb-[60px] lg:mb-0">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </section>
    );
  }

  if (activeBanners.length === 0) {
    return (
      <section className="relative h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-r from-poker-darkgreen to-poker-green mt-[80px] md:mt-[60px] lg:mt-0 -mb-[80px] md:-mb-[60px] lg:mb-0">
        <div className="absolute inset-0 bg-gradient-to-r from-poker-black/70 to-transparent z-10"></div>
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Palace Poker Szombathely
              </h1>
              <p className="text-xl md:text-2xl text-poker-gold mb-8 leading-relaxed">
                Szeretettel várjuk kedves vendégeinket!
              </p>
              <a href="/tournaments" className="btn-primary text-lg px-8 py-4 inline-block hover:scale-105 transform transition-all duration-200">
                Versenyek
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-r from-poker-darkgreen to-poker-green mt-[80px] md:mt-[60px] lg:mt-0 -mb-[80px] md:-mb-[60px] lg:mb-0">
      {/* Banner Images */}
      <div className="relative w-full h-full">
        {activeBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Banner Background Image */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
              style={{
                backgroundImage: banner.image 
                  ? `url(${banner.image})`
                  : `linear-gradient(45deg, #0F3F26 0%, #228B22 50%, #D4AF37 100%)`
              }}
            />
            {/* Dark overlay */}
            <div 
              className="absolute inset-0 z-10"
              style={{
                background: 'linear-gradient(to right, rgba(0, 0, 0, 0.7), transparent)'
              }}
            ></div>
            
            {/* Content */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    {banner.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-poker-gold mb-8 leading-relaxed">
                    {banner.description}
                  </p>
                  {(() => {
                    let buttonUrl = null;
                    
                    if (banner.url === 'custom' && banner.customUrl) {
                      buttonUrl = banner.customUrl;
                    } else if (banner.url && banner.url !== '' && banner.url !== 'custom') {
                      buttonUrl = banner.url;
                    }
                    
                    return buttonUrl ? (
                      <a
                        href={buttonUrl}
                        target={banner.openInNewTab ? '_blank' : '_self'}
                        rel={banner.openInNewTab ? 'noopener noreferrer' : undefined}
                        className="btn-primary text-lg px-8 py-4 inline-block hover:scale-105 transform transition-all duration-200"
                      >
                        Tudj meg többet
                      </a>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-poker-black/50 hover:bg-poker-black/75 text-white p-3 rounded-full transition-colors duration-200"
            aria-label="Előző banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-poker-black/50 hover:bg-poker-black/75 text-white p-3 rounded-full transition-colors duration-200"
            aria-label="Következő banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots indicator */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex 
                  ? 'bg-poker-gold' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Decorative poker chips */}
      <div className="absolute top-10 right-10 opacity-20 hidden lg:block">
        <div className="w-20 h-20 bg-poker-gold rounded-full border-4 border-white flex items-center justify-center">
          <span className="text-poker-black font-bold text-lg">♠</span>
        </div>
      </div>
      <div className="absolute bottom-10 left-20 opacity-20 hidden lg:block">
        <div className="w-16 h-16 bg-poker-red rounded-full border-4 border-white flex items-center justify-center">
          <span className="text-white font-bold">♥</span>
        </div>
      </div>
    </section>
  );
}