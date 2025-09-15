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
      // Handle both possible field names from API
      const dateField = tournament.tournament_date || tournament.date;
      const timeField = tournament.tournament_time || tournament.time;
      
      if (!dateField || !timeField) return;
      
      const tournamentDateTime = new Date(`${dateField.split('T')[0]}T${timeField}`);
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
  }, [tournament.date, tournament.time, tournament.tournament_date, tournament.tournament_time]);
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

  const addToCalendar = () => {
    const dateField = tournament.tournament_date || tournament.date;
    const timeField = tournament.tournament_time || tournament.time;
    const startDate = new Date(`${dateField.split('T')[0]}T${timeField}`);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 6); // Assume tournament lasts 6 hours

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const eventTitle = `Palace Poker - ${tournament.title}`;
    const eventDescription = `${tournament.description}\\n\\nBuy-in: ${formatCurrency(Number(tournament.buy_in || tournament.buyIn || 0))}\\nHelyszín: Palace Poker Szombathely, Semmelweis u. 2.\\nTel: +36 30 971 5832`;
    const eventLocation = 'Palace Poker Szombathely, Semmelweis u. 2., 9700 Szombathely';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Palace Poker//Tournament Calendar//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${eventDescription}`,
      `LOCATION:${eventLocation}`,
      `UID:tournament-${tournament.id}-${Date.now()}@palace-poker.hu`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `palace-poker-${tournament.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
    link.click();
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
        {/* Tournament Date - Prominently Featured */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-poker-primary to-poker-secondary p-6 rounded-xl text-white text-center shadow-lg">
            <div className="mb-2">
              <h4 className="text-lg font-bold">Verseny időpontja</h4>
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatDate(tournament.tournament_date || tournament.date)}
            </div>
            <div className="text-xl font-semibold text-poker-accent">
              {tournament.tournament_time || tournament.time}
            </div>
          </div>
        </div>

        {/* Modern Countdown Timer */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200 shadow-inner">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-md">
                <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
                <span className="font-bold text-sm">Kezdésig hátralevő idő</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white rounded-xl p-2 sm:p-3 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1 group-hover:text-poker-primary transition-colors">
                    {timeLeft.days}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    nap
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-2 sm:p-3 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1 group-hover:text-poker-primary transition-colors">
                    {timeLeft.hours}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    óra
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-2 sm:p-3 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1 group-hover:text-poker-primary transition-colors">
                    {timeLeft.minutes}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    perc
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-2 sm:p-3 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1 group-hover:text-poker-primary transition-colors animate-pulse">
                    {timeLeft.seconds}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    mp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="mb-6 space-y-3">
          
          {/* Rebuy/Addon Info */}
          {(tournament.rebuyPrice || tournament.addonPrice) && (
            <div className="space-y-2">
              {tournament.rebuyPrice && (
                <div className="flex items-center justify-between p-3 bg-poker-light/50 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span className="text-poker-dark/80 font-medium">Rebuy:</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-poker-dark">{formatCurrency(tournament.rebuyPrice)}</span>
                    {tournament.rebuyChips && (
                      <div className="text-xs text-poker-muted">{formatChips(tournament.rebuyChips)}</div>
                    )}
                  </div>
                </div>
              )}
              
              {tournament.addonPrice && (
                <div className="flex items-center justify-between p-3 bg-poker-light/50 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    <span className="text-poker-dark/80 font-medium">Add-on:</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-poker-dark">{formatCurrency(tournament.addonPrice)}</span>
                    {tournament.addonChips && (
                      <div className="text-xs text-poker-muted">{formatChips(tournament.addonChips)}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
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
          <p className="font-bold text-2xl">
            {formatCurrency(Number(tournament.buy_in || tournament.buyIn || 0))}
          </p>
        </div>



        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href={`/tournaments/${tournament.id}`}>
            <button className="w-full btn-primary group relative overflow-hidden">
              <span className="relative z-10 flex items-center justify-center">
                <span className="mr-2">📋</span>
                <span>Részletek</span>
              </span>
            </button>
          </Link>
          
          <button 
            onClick={addToCalendar}
            className="w-full bg-poker-gold/10 border border-poker-gold text-poker-dark hover:bg-poker-gold hover:text-poker-dark font-semibold py-2 px-4 rounded-lg transition-all duration-300 group"
          >
            <span className="flex items-center justify-center">
              <span className="mr-2">📅</span>
              <span>Naptárhoz adás</span>
            </span>
          </button>
        </div>
        
      </div>
    </div>
  );
}