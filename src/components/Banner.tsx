'use client';

import { useState, useEffect } from 'react';

interface Tournament {
  id: number;
  title: string;
  description: string;
  date: string;
  buyin_amount: number;
  banner_image?: string;
}

export default function Banner() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const loadFeaturedTournaments = async () => {
      try {
        // Load featured tournaments
        const response = await fetch('/api/tournaments?featured=true');

        if (response.ok) {
          const data = await response.json();
          // Sort by date (closest first)
          const sortedTournaments = data.sort((a: Tournament, b: Tournament) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
          setTournaments(sortedTournaments);
        }
      } catch (error) {
        console.error('Error loading featured tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedTournaments();
  }, []);

  const activeTournaments = tournaments;

  useEffect(() => {
    if (activeTournaments.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === activeTournaments.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [activeTournaments.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? activeTournaments.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === activeTournaments.length - 1 ? 0 : currentIndex + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day}. ${hours}:${minutes}`;
  };

  const formatBuyin = (amount: number) => {
    return new Intl.NumberFormat('hu-HU').format(amount) + ' Ft';
  };

  if (loading || !hasMounted) {
    return null;
  }

  // Ha nincs kiemelt verseny, ne jelenjen meg a banner
  if (activeTournaments.length === 0) {
    return null;
  }

  return (
    <section className="relative h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden bg-gradient-to-r from-poker-darkgreen to-poker-green">
      {/* Tournament Banners */}
      <div className="relative w-full h-full">
        {activeTournaments.map((tournament, index) => (
          <div
            key={tournament.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
              style={{
                backgroundImage: tournament.banner_image
                  ? `url(${tournament.banner_image})`
                  : `url(/images/banners/001-optimized.jpg)`,
                backgroundPosition: 'center center',
                backgroundSize: 'cover'
              }}
            />
            {/* Dark overlay for better text readability */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.75) 100%)'
              }}
            ></div>
            {/* Additional overlay for text readability */}
            <div className="absolute inset-0 z-[11] bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>

            {/* Content */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                  <div className="inline-block bg-poker-gold/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                    <span className="text-poker-gold font-semibold text-sm md:text-base">Kiemelt Verseny</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 leading-tight px-4">
                    {tournament.title}
                  </h1>
                  <div className="flex justify-center mb-6">
                    <div className="flex items-center bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                      <svg className="w-5 h-5 md:w-6 md:h-6 mr-3 text-poker-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-bold text-white text-lg md:text-xl">{formatDate(tournament.date)}</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <a
                      href={`/tournaments/${tournament.id}`}
                      className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4 inline-block hover:scale-105 transform transition-all duration-200"
                    >
                      Részletek
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {activeTournaments.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-30 bg-poker-black/60 hover:bg-poker-black/80 text-white p-2 md:p-3 rounded-full transition-all duration-200 shadow-lg"
            aria-label="Előző verseny"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-30 bg-poker-black/60 hover:bg-poker-black/80 text-white p-2 md:p-3 rounded-full transition-all duration-200 shadow-lg"
            aria-label="Következő verseny"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots indicator */}
      {activeTournaments.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2 md:space-x-3">
          {activeTournaments.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200 shadow-md ${
                index === currentIndex
                  ? 'bg-poker-gold scale-125'
                  : 'bg-white/60 hover:bg-white/90'
              }`}
              aria-label={`Verseny ${index + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
}