'use client';

import { useEffect, useState } from 'react';

interface Chip {
  id: number;
  color: string;
  value: string;
  startX: number;
  startY: number;
  rotation: number;
  delay: number;
}

export default function CashGameHero() {
  const [chips, setChips] = useState<Chip[]>([]);

  useEffect(() => {
    // Generate poker chips with realistic positions
    const pokerChips: Chip[] = [
      { id: 1, color: 'bg-red-600', value: '100', startX: 10, startY: 20, rotation: 15, delay: 0 },
      { id: 2, color: 'bg-blue-600', value: '500', startX: 85, startY: 25, rotation: -20, delay: 0.2 },
      { id: 3, color: 'bg-green-600', value: '1000', startX: 15, startY: 75, rotation: 25, delay: 0.4 },
      { id: 4, color: 'bg-purple-600', value: '5000', startX: 80, startY: 70, rotation: -15, delay: 0.6 },
      { id: 5, color: 'bg-orange-600', value: '200', startX: 50, startY: 50, rotation: 10, delay: 0.8 },
    ];
    setChips(pokerChips);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-poker-dark via-poker-primary to-poker-dark relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(255,255,255,0.05) 35px,
            rgba(255,255,255,0.05) 70px
          )`
        }}></div>
      </div>

      {/* Floating Card Suits */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['♠', '♥', '♦', '♣'].map((suit, i) => (
          <div
            key={i}
            className="absolute text-6xl md:text-8xl font-bold animate-float"
            style={{
              left: `${15 + i * 25}%`,
              top: `${10 + (i % 2) * 60}%`,
              color: suit === '♥' || suit === '♦' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              animationDelay: `${i * 0.5}s`,
              animationDuration: '4s',
            }}
          >
            {suit}
          </div>
        ))}
      </div>

      {/* Animated Poker Chips */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {chips.map((chip) => (
          <div
            key={chip.id}
            className="absolute animate-chip-float"
            style={{
              left: `${chip.startX}%`,
              top: `${chip.startY}%`,
              animationDelay: `${chip.delay}s`,
              animationDuration: '6s',
            }}
          >
            <div
              className={`w-16 h-16 md:w-20 md:h-20 ${chip.color} rounded-full border-4 border-white shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform`}
              style={{ transform: `rotate(${chip.rotation}deg)` }}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-dashed border-white/50 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs md:text-sm">{chip.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-poker-gold/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-poker-green/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center animate-scale-in">
          {/* Main Badge */}
          <div className="inline-block mb-8">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-white/30 blur-2xl rounded-3xl animate-pulse"></div>
              
              {/* Badge */}
              <div className="relative bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl px-8 md:px-12 py-6 md:py-8 rounded-3xl border-2 border-white/30 shadow-2xl">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
                  MINDEN JÁTÉKNAP
                </h2>
                
                <div className="flex items-center justify-center gap-3 md:gap-6 mt-4 md:mt-6">
                  <div className="h-1 md:h-1.5 w-12 md:w-24 bg-gradient-to-r from-transparent via-poker-gold to-transparent rounded-full animate-shimmer"></div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-poker-gold/50 blur-xl animate-pulse"></div>
                    <p className="relative text-3xl md:text-5xl lg:text-6xl font-black text-poker-gold animate-pulse drop-shadow-lg">
                      CASH GAME
                    </p>
                  </div>
                  <div className="h-1 md:h-1.5 w-12 md:w-24 bg-gradient-to-r from-transparent via-poker-gold to-transparent rounded-full animate-shimmer"></div>
                </div>
                
                <p className="text-2xl md:text-4xl lg:text-5xl font-black text-white mt-4 md:mt-6 tracking-wide drop-shadow-lg">
                  NYITÁSTÓL!!!
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-3xl mx-auto mt-8 md:mt-12">
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg px-6 md:px-8 py-5 md:py-6 rounded-2xl border border-white/20 shadow-xl">
              <p className="text-white/90 text-base md:text-xl font-medium leading-relaxed">
                🎰 Várunk minden nap <span className="text-poker-gold font-bold">cash game</span> asztalainknál a nyitástól kezdve!
                <br />
                <span className="text-sm md:text-base">Különböző tétlimitekkel, profi dealerekkel és barátságos légkörrel!</span>
              </p>
            </div>
          </div>

          {/* No CTA Buttons - removed */}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes chip-float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) rotate(-5deg);
          }
          75% {
            transform: translateY(-25px) rotate(3deg);
          }
        }
        .animate-chip-float {
          animation: chip-float 6s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.5;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
