'use client';

import { useState, useEffect } from 'react';
import { Tournament } from '@/types';
import Link from 'next/link';
import { formatChips, formatCurrency } from '@/utils/formatters';

interface TournamentCardProps {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const tournamentDateTime = new Date(`${tournament.date}T${tournament.time}`);
      const now = new Date();
      const difference = tournamentDateTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [tournament.date, tournament.time]);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const monthNames = [
      'január', 'február', 'március', 'április', 'május', 'június',
      'július', 'augusztus', 'szeptember', 'október', 'november', 'december'
    ];
    
    return `${year}. ${monthNames[month - 1]} ${day}.`;
  };


  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-500 text-white';
      case 'ongoing':
        return 'bg-yellow-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming':
        return 'Közelgő';
      case 'ongoing':
        return 'Folyamatban';
      case 'completed':
        return 'Befejezett';
      default:
        return 'Ismeretlen';
    }
  };

  return (
    <div className="card-modern group hover:scale-105 transition-all duration-500 overflow-hidden">
      {/* Header with Image Support */}
      <div className="relative">
        {tournament.image ? (
          <div className="h-48 bg-cover bg-center relative" style={{backgroundImage: `url(${tournament.image})`}}>
            <div className="absolute inset-0 bg-gradient-to-t from-poker-primary/90 via-poker-primary/50 to-transparent"></div>
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-poker-primary via-poker-secondary to-poker-primary relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 text-4xl animate-pulse">♠</div>
              <div className="absolute top-4 right-4 text-3xl animate-bounce" style={{animationDelay: '0.5s'}}>♥</div>
              <div className="absolute bottom-4 left-1/2 text-2xl animate-pulse" style={{animationDelay: '1s'}}>♣</div>
            </div>
          </div>
        )}
        
        {/* Overlay content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 group-hover:text-poker-accent transition-colors">
                {tournament.title}
              </h3>
              {tournament.category && (
                <span className="inline-block px-3 py-1 bg-poker-gold text-poker-dark text-xs font-bold rounded-full mb-2">
                  {tournament.category}
                </span>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${getStatusColor(tournament.status)}`}>
              {getStatusText(tournament.status)}
            </span>
          </div>
          <p className="text-white/95 text-sm leading-relaxed drop-shadow-sm">{tournament.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date and Basic Info */}
        <div className="mb-6 space-y-3">
          {/* Countdown Timer */}
          <div className="p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                <span className="text-poker-dark font-medium">Kezdésig:</span>
              </div>
              <span className="text-xs text-poker-muted">{formatDate(tournament.date)} • {tournament.time}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white/70 rounded-lg p-2 min-h-[60px] flex flex-col justify-center hover:bg-white/90 transition-all duration-300 hover:scale-105">
                <div className="font-bold text-base text-poker-dark countdown-number">{timeLeft.days}</div>
                <div className="text-xs text-poker-muted">nap</div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 min-h-[60px] flex flex-col justify-center hover:bg-white/90 transition-all duration-300 hover:scale-105">
                <div className="font-bold text-base text-poker-dark countdown-number">{timeLeft.hours}</div>
                <div className="text-xs text-poker-muted">óra</div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 min-h-[60px] flex flex-col justify-center hover:bg-white/90 transition-all duration-300 hover:scale-105">
                <div className="font-bold text-base text-poker-dark countdown-number">{timeLeft.minutes}</div>
                <div className="text-xs text-poker-muted">perc</div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 min-h-[60px] flex flex-col justify-center hover:bg-white/90 transition-all duration-300 hover:scale-105">
                <div className="font-bold text-base text-poker-dark countdown-number">{timeLeft.seconds}</div>
                <div className="text-xs text-poker-muted">mp</div>
              </div>
            </div>
          </div>
          
          {/* Category */}
          <div className="flex items-center justify-between p-3 bg-poker-light/50 rounded-lg">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-poker-gold rounded-full mr-3"></span>
              <span className="text-poker-dark/80 font-medium">Kategória:</span>
            </div>
            <span className="font-bold text-poker-dark">Verseny</span>
          </div>
          
          {/* Starting Chips */}
          {tournament.startingChips && (
            <div className="flex items-center justify-between p-3 bg-poker-light/50 rounded-lg">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                <span className="text-poker-dark/80 font-medium">Kezdőzseton:</span>
              </div>
              <span className="font-bold text-poker-dark">{formatChips(tournament.startingChips)}</span>
            </div>
          )}
        </div>

        {/* Registration Fee */}
        <div className="mb-6 p-4 bg-gradient-to-br from-poker-primary to-poker-secondary text-white rounded-xl shadow-lg text-center">
          <p className="text-white/90 text-sm mb-1 font-medium">Nevezési díj</p>
          <p className="font-bold text-2xl">{formatCurrency(tournament.buyIn)}</p>
        </div>

        {/* Rebuy and Addon Info */}
        {(tournament.rebuyPrice || tournament.addonPrice) && (
          <div className="mb-6 space-y-3">
            {tournament.rebuyPrice && (
              <div className="flex items-center justify-between p-3 bg-poker-light/50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <span className="text-poker-dark/80 font-medium">Rebuy:</span>
                </div>
                <span className="font-bold text-poker-dark">{formatCurrency(tournament.rebuyPrice)}</span>
              </div>
            )}
            
            {tournament.addonPrice && (
              <div className="flex items-center justify-between p-3 bg-poker-light/50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  <span className="text-poker-dark/80 font-medium">Add-on:</span>
                </div>
                <span className="font-bold text-poker-dark">{formatCurrency(tournament.addonPrice)}</span>
              </div>
            )}
          </div>
        )}


        {/* Action Button */}
        <Link href={`/tournaments/${tournament.id}`}>
          <button className="w-full btn-primary group relative overflow-hidden">
            <span className="relative z-10 flex items-center justify-center">
              <span className="mr-2">📋</span>
              <span>Részletek</span>
            </span>
          </button>
        </Link>
        
      </div>
    </div>
  );
}