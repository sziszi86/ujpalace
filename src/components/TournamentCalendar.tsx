'use client';

import { useState, useEffect } from 'react';
import { Tournament, CashGame } from '@/types';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatters';
import { addTournamentToCalendar, addCashGameToCalendar } from '@/utils/calendar';

interface TournamentCalendarProps {
  showCashGames?: boolean;
  onlyShowCashGames?: boolean;
}

export default function TournamentCalendar({ showCashGames = true, onlyShowCashGames = false }: TournamentCalendarProps) {
  const [selectedView, setSelectedView] = useState<'calendar' | 'list' | 'week' | 'mobile'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'list';
    }
    return 'calendar';
  });
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tournaments' | 'cash-games'>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [cashGames, setCashGames] = useState<CashGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isTableLive = (schedule: string): boolean => {
    if (!schedule) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Parse schedule like "Hétfő-Vasárnap 18:00-06:00" or "Péntek-Vasárnap 20:00-04:00"
    const schedulePattern = /(\w+)-(\w+)\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/;
    const match = schedule.match(schedulePattern);
    
    if (!match) return false;
    
    const [, startDay, endDay, startHour, startMin, endHour, endMin] = match;
    
    // Map Hungarian day names to numbers
    const dayMap: { [key: string]: number } = {
      'Hétfő': 1, 'Kedd': 2, 'Szerda': 3, 'Csütörtök': 4, 'Péntek': 5, 'Szombat': 6, 'Vasárnap': 0
    };
    
    const startDayNum = dayMap[startDay];
    const endDayNum = dayMap[endDay];
    const startTime = parseInt(startHour) * 60 + parseInt(startMin);
    const endTime = parseInt(endHour) * 60 + parseInt(endMin);
    const currentTime = currentHour * 60 + now.getMinutes();
    
    // Check if current day is in range
    let dayInRange = false;
    if (startDayNum <= endDayNum) {
      dayInRange = currentDay >= startDayNum && currentDay <= endDayNum;
    } else {
      // Week wraps around (e.g., Friday-Sunday)
      dayInRange = currentDay >= startDayNum || currentDay <= endDayNum;
    }
    
    if (!dayInRange) return false;
    
    // Check if current time is in range
    if (endTime < startTime) {
      // Time wraps around midnight (e.g., 18:00-06:00)
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      // Normal time range (e.g., 20:00-23:00)
      return currentTime >= startTime && currentTime <= endTime;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tournamentsResponse, cashGamesResponse] = await Promise.all([
          onlyShowCashGames ? Promise.resolve({ ok: true, json: () => [] }) : fetch('/api/tournaments'),
          showCashGames ? fetch('/api/cash-games') : Promise.resolve({ ok: true, json: () => [] })
        ]);

        if (tournamentsResponse.ok && !onlyShowCashGames) {
          const tournamentData = await tournamentsResponse.json();
          // Only show active tournaments (status !== 'inactive')
          const activeTournaments = tournamentData.filter((tournament: Tournament) => 
            tournament.status !== 'inactive'
          );
          setTournaments(activeTournaments);
        }

        if (cashGamesResponse.ok) {
          const cashGameData = await cashGamesResponse.json();
          // Only show active cash games
          const activeCashGames = cashGameData.filter((cashGame: CashGame) => Boolean(cashGame.active));
          
          // Generate scheduled dates for active cash games
          const enhancedCashGames = activeCashGames.map((cashGame: any) => {
            let scheduledDates = [];
            
            // Check if we have specific selected dates first
            if (cashGame.selected_dates) {
              try {
                scheduledDates = typeof cashGame.selected_dates === 'string' 
                  ? JSON.parse(cashGame.selected_dates) 
                  : cashGame.selected_dates;
              } catch (e) {
                console.error('Error parsing selected_dates:', e);
                scheduledDates = [];
              }
            }
            
            // If no specific dates, fall back to week_days logic
            if (!scheduledDates || scheduledDates.length === 0) {
              const today = new Date();
              
              // Parse week_days from the database
              let weekDays = [];
              if (cashGame.week_days) {
                try {
                  weekDays = typeof cashGame.week_days === 'string' 
                    ? JSON.parse(cashGame.week_days) 
                    : cashGame.week_days;
                } catch (e) {
                  console.error('Error parsing week_days:', e);
                  weekDays = [];
                }
              }
              
              // If no week_days specified, default to all days
              if (!weekDays || weekDays.length === 0) {
                weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
              }
              
              // Convert day names to numbers (0 = Sunday, 1 = Monday, etc.)
              const dayMap: { [key: string]: number } = {
                'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
                'thursday': 4, 'friday': 5, 'saturday': 6
              };
              
              const allowedDayNumbers = weekDays.map((day: string) => dayMap[day]).filter((num: number) => num !== undefined);
              
              for (let i = 0; i < 56; i++) { // 8 weeks = 56 days
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dayOfWeek = date.getDay();
                
                // Only add dates that match the selected weekdays
                if (allowedDayNumbers.includes(dayOfWeek)) {
                  // Use local date formatting to avoid timezone shift issues
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  scheduledDates.push(`${year}-${month}-${day}`);
                }
              }
            }
            
            return {
              ...cashGame,
              scheduledDates,
              minBuyIn: cashGame.min_buy_in || cashGame.minBuyIn,
              maxBuyIn: cashGame.max_buy_in || cashGame.maxBuyIn
            };
          });
          
          setCashGames(enhancedCashGames);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showCashGames, onlyShowCashGames]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-set to list view on mobile
      if (window.innerWidth < 768 && selectedView === 'calendar') {
        setSelectedView('list');
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [selectedView]);

  const formatDate = (dateString: string) => {
    // Handle timezone issues by parsing date as local date
    let date;
    if (dateString.includes('T')) {
      // If it's an ISO string, extract just the date part to avoid timezone shifts
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      date = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      // If it's already just a date string (YYYY-MM-DD), parse as local
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day); // month is 0-indexed
    }
    
    const month = date.getMonth();
    const day = date.getDate();
    const weekday = date.getDay();
    
    const shortMonthNames = ['jan', 'feb', 'már', 'ápr', 'máj', 'jún', 'júl', 'aug', 'szep', 'okt', 'nov', 'dec'];
    const shortDayNames = ['vas', 'hét', 'ked', 'sze', 'csü', 'pén', 'szo'];
    
    return `${shortDayNames[weekday]} ${shortMonthNames[month]} ${day}`;
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Generate mobile calendar days (3-day view)
  const generateMobileCalendarDays = () => {
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - 1); // Start with yesterday for context
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 3; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    // Use local date formatting to avoid timezone shift issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    if (onlyShowCashGames) {
      // For cash games, show them only on scheduled dates
      return cashGames
        .filter(cashGame => {
          // Check if cash game is scheduled for this specific date
          // Handle both camelCase and snake_case property names
          const scheduledDates = cashGame.scheduledDates || (cashGame as any).scheduled_dates;
          if (scheduledDates && Array.isArray(scheduledDates)) {
            return scheduledDates.includes(dateStr);
          }
          return false;
        })
        .map(cashGame => ({
          id: cashGame.id,
          title: cashGame.name,
          time: cashGame.schedule,
          type: 'cash-game',
          stakes: cashGame.stakes
        }));
    }
    
    return tournaments.filter(tournament => {
      // Convert tournament date to YYYY-MM-DD format for comparison
      // Use tournament_date field and avoid timezone issues by parsing as local date
      let tournamentDateStr = null;
      if (tournament.date) {
        // If the date contains 'T', it's already an ISO string, use it directly
        if (tournament.date.includes('T')) {
          tournamentDateStr = tournament.date.split('T')[0];
        } else {
          // If it's just a date string, use it directly (YYYY-MM-DD format)
          tournamentDateStr = tournament.date;
        }
      } else if (tournament.tournament_date) {
        // Handle tournament_date field if date is not available
        if (tournament.tournament_date.includes('T')) {
          tournamentDateStr = tournament.tournament_date.split('T')[0];
        } else {
          tournamentDateStr = tournament.tournament_date;
        }
      }
      return tournamentDateStr === dateStr && tournament.status !== 'inactive';
    });
  };

  const getDayOfWeek = (date: Date) => {
    return ['Vas', 'Hét', 'Ked', 'Sze', 'Csü', 'Pén', 'Szo'][date.getDay()];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const navigateMobileDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const startDate = new Date(startOfWeek);
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthYear = (() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = [
      'január', 'február', 'március', 'április', 'május', 'június',
      'július', 'augusztus', 'szeptember', 'október', 'november', 'december'
    ];
    return `${year}. ${monthNames[month]}`;
  })();

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        {/* View Toggle */}
        <div className="flex bg-white rounded-xl p-1 shadow-lg">
          {!isMobile && (
            <button
              className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-sm ${
                selectedView === 'calendar'
                  ? 'bg-poker-primary text-white shadow-lg'
                  : 'text-poker-muted hover:text-poker-dark'
              }`}
              onClick={() => setSelectedView('calendar')}
            >
              📅 Havi
            </button>
          )}
          <button
            className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-sm ${
              (selectedView === 'week' || selectedView === 'mobile')
                ? 'bg-poker-primary text-white shadow-lg'
                : 'text-poker-muted hover:text-poker-dark'
            }`}
            onClick={() => setSelectedView(isMobile ? 'mobile' : 'week')}
          >
            📅 {isMobile ? 'Naptár' : 'Heti'}
          </button>
          <button
            className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-sm ${
              selectedView === 'list'
                ? 'bg-poker-primary text-white shadow-lg'
                : 'text-poker-muted hover:text-poker-dark'
            }`}
            onClick={() => setSelectedView('list')}
          >
            📋 Lista
          </button>
        </div>

        {/* Filter Buttons */}
        {showCashGames && !onlyShowCashGames && (
          <div className="flex bg-white rounded-xl p-1 shadow-lg">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedFilter === 'all'
                  ? 'bg-poker-gold text-poker-dark shadow-lg'
                  : 'text-poker-muted hover:text-poker-dark'
              }`}
              onClick={() => setSelectedFilter('all')}
            >
              Összes
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedFilter === 'tournaments'
                  ? 'bg-poker-gold text-poker-dark shadow-lg'
                  : 'text-poker-muted hover:text-poker-dark'
              }`}
              onClick={() => setSelectedFilter('tournaments')}
            >
              Versenyek
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedFilter === 'cash-games'
                  ? 'bg-poker-gold text-poker-dark shadow-lg'
                  : 'text-poker-muted hover:text-poker-dark'
              }`}
              onClick={() => setSelectedFilter('cash-games')}
            >
              Cash Game
            </button>
          </div>
        )}
      </div>

      {selectedView === 'calendar' || selectedView === 'week' || selectedView === 'mobile' ? (
        /* Calendar/Week View */
        <div className="card-modern p-4 lg:p-8">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => {
                if (selectedView === 'week') {
                  navigateWeek('prev');
                } else if (selectedView === 'mobile') {
                  navigateMobileDay('prev');
                } else {
                  navigateMonth('prev');
                }
              }}
              className="p-3 rounded-xl bg-poker-light hover:bg-poker-accent/20 transition-colors"
            >
              <svg className="w-6 h-6 text-poker-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-2xl lg:text-3xl font-bold text-poker-dark capitalize text-center">
              {selectedView === 'week' ? 
                `${currentDate.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })}` :
                monthYear
              }
            </h2>
            
            <button
              onClick={() => {
                if (selectedView === 'week') {
                  navigateWeek('next');
                } else if (selectedView === 'mobile') {
                  navigateMobileDay('next');
                } else {
                  navigateMonth('next');
                }
              }}
              className="p-3 rounded-xl bg-poker-light hover:bg-poker-accent/20 transition-colors"
            >
              <svg className="w-6 h-6 text-poker-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className={`grid ${selectedView === 'mobile' ? 'grid-cols-3' : 'grid-cols-7'} ${selectedView === 'week' ? 'gap-1 md:gap-2' : selectedView === 'mobile' ? 'gap-3' : 'gap-2 md:gap-3'}`}>
            {/* Day Headers */}
            {selectedView === 'mobile' ? (
              generateMobileCalendarDays().map(day => (
                <div key={day.toISOString()} className="p-2 text-center font-semibold text-poker-muted">
                  {getDayOfWeek(day)}
                </div>
              ))
            ) : (
              ['Vas', 'Hét', 'Ked', 'Sze', 'Csü', 'Pén', 'Szo'].map(day => (
                <div key={day} className={`${selectedView === 'week' ? 'p-2 text-sm md:text-base' : 'p-2 md:p-4 text-sm md:text-base'} text-center font-semibold text-poker-muted`}>
                  {day}
                </div>
              ))
            )}

            {/* Calendar Days */}
            {(selectedView === 'week' ? generateWeekDays() : selectedView === 'mobile' ? generateMobileCalendarDays() : calendarDays).map((day, index) => {
              const events = getEventsForDate(day);
              const hasEvents = events.length > 0;
              
              return (
                <div
                  key={index}
                  className={`${
                    selectedView === 'mobile'
                      ? hasEvents
                        ? 'min-h-40 col-span-1'
                        : 'min-h-20 col-span-1'
                      : selectedView === 'week'
                        ? hasEvents
                          ? 'min-h-36 md:min-h-32'
                          : 'min-h-16 md:min-h-14'
                        : hasEvents
                          ? 'min-h-28 md:min-h-24'
                          : 'min-h-16 md:min-h-14'
                  } p-2 border border-gray-100 rounded-lg transition-all duration-200 ${
                    selectedView === 'week' || selectedView === 'mobile' || isCurrentMonth(day)
                      ? hasEvents
                        ? 'bg-poker-light/30 hover:bg-poker-light/50'
                        : 'bg-white hover:bg-poker-light/20'
                      : 'bg-gray-50 text-black'
                  } ${
                    isToday(day)
                      ? 'ring-2 ring-poker-primary shadow-lg'
                      : ''
                  }`}
                >
                  <div className={`${selectedView === 'mobile' ? 'text-sm' : 'text-xs md:text-sm'} font-semibold mb-1 text-center ${
                    isToday(day) ? 'text-poker-primary' : 'text-poker-dark'
                  }`}>
                    {selectedView === 'week' || selectedView === 'mobile' ? 
                      `${day.getMonth() + 1}/${day.getDate()}` :
                      day.getDate()
                    }
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-1">
                    {events.slice(0, selectedView === 'mobile' ? 3 : selectedView === 'week' ? 4 : 2).map(event => (
                      <Link
                        key={event.id}
                        href={(event as any).type === 'cash-game' ? `/cash-games/${event.id}` : `/tournaments/${event.id}`}
                        className={`block p-2 bg-poker-primary/10 hover:bg-poker-primary/20 rounded text-poker-dark hover:text-poker-primary transition-colors ${
                          selectedView === 'mobile' ? 'text-sm min-h-10' : 'text-xs md:text-sm min-h-8 md:min-h-auto'
                        }`}
                      >
                        <div className={`font-medium truncate ${selectedView === 'mobile' ? 'text-sm' : 'text-xs md:text-sm'}`}>
                          {event.time}
                        </div>
                        <div className={`truncate ${selectedView === 'mobile' ? 'text-sm' : 'text-xs md:text-sm'}`}>
                          {event.title}
                        </div>
                        {(event as any).type === 'cash-game' && (
                          <div className={`text-poker-muted ${selectedView === 'mobile' ? 'text-xs' : 'text-xs'}`}>
                            {(event as any).stakes}
                          </div>
                        )}
                      </Link>
                    ))}
                    {events.length > (selectedView === 'mobile' ? 3 : selectedView === 'week' ? 4 : 2) && (
                      <div className="text-xs text-poker-muted text-center">
                        +{events.length - (selectedView === 'mobile' ? 3 : selectedView === 'week' ? 4 : 2)} több
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-6">
          {/* Tournaments */}
          {!onlyShowCashGames && (selectedFilter === 'all' || selectedFilter === 'tournaments') && (
            <div className="card-modern p-8">
              <h2 className="text-3xl font-bold text-poker-dark mb-6 flex items-center">
                <span className="w-12 h-12 bg-gradient-to-r from-poker-primary to-poker-gold rounded-xl flex items-center justify-center mr-4">
                  🏆
                </span>
                Közelgő Versenyek
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-3 text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary mx-auto"></div>
                    <p className="mt-4 text-poker-muted">Versenyek betöltése...</p>
                  </div>
                ) : tournaments.length === 0 ? (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-poker-muted">Jelenleg nincsenek közelgő versenyek.</p>
                  </div>
                ) : (
                  tournaments.map(tournament => (
                    <div key={tournament.id} className="relative">
                      {/* Calendar Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addTournamentToCalendar(tournament);
                        }}
                        className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                        title="Hozzáadás naptárhoz"
                      >
                        <svg className="w-5 h-5 text-poker-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
                      <Link
                        href={`/tournaments/${tournament.id}`}
                        className="block group"
                      >
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105">
                          {/* Tournament Image */}
                          <div 
                            className="h-32 bg-cover bg-center relative"
                            style={{ backgroundImage: `url(${tournament.image_url || 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400'})` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-poker-primary/80 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="flex items-center justify-between text-white">
                                <span className="bg-poker-gold text-poker-dark px-2 py-1 rounded text-xs font-bold">
                                  {tournament.category}
                                </span>
                                <span className="text-sm font-medium">
                                  {formatDate(tournament.date)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Tournament Info */}
                          <div className="p-4">
                            <h3 className="font-bold text-poker-dark mb-2 group-hover:text-poker-primary transition-colors">
                              {tournament.title}
                            </h3>
                            <p className="text-sm text-poker-muted mb-3 line-clamp-2">
                              {tournament.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-poker-muted">Buy-in / nevezési díj</p>
                                <p className="font-bold text-poker-primary">
                                  {formatCurrency(Number(tournament.buyIn || tournament.buy_in || 0))}
                                </p>
                              </div>
                              {tournament.rebuyPrice && Number(tournament.rebuyPrice) > 0 ? (
                                <div className="text-center">
                                  <p className="text-xs text-poker-muted">Rebuy</p>
                                  <p className="font-bold text-poker-gold">
                                    {formatCurrency(Number(tournament.rebuyPrice))}
                                  </p>
                                  {tournament.rebuyCount && tournament.rebuyCount > 1 && (
                                    <p className="text-xs text-poker-accent">
                                      {tournament.rebuyCount}x
                                    </p>
                                  )}
                                </div>
                              ) : tournament.addonPrice && Number(tournament.addonPrice) > 0 ? (
                                <div className="text-center">
                                  <p className="text-xs text-poker-muted">Add-on</p>
                                  <p className="font-bold text-poker-gold">
                                    {formatCurrency(Number(tournament.addonPrice))}
                                  </p>
                                </div>
                              ) : (
                                <div></div>
                              )}
                              <div className="text-right">
                                <p className="text-xs text-poker-muted">Időpont</p>
                                <p className="font-bold text-poker-dark">{tournament.time || tournament.tournament_time}</p>
                              </div>
                            </div>

                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Cash Games */}
          {((showCashGames && (selectedFilter === 'all' || selectedFilter === 'cash-games')) || onlyShowCashGames) && (
            <div className="card-modern p-8">
              <h2 className="text-3xl font-bold text-poker-dark mb-6 flex items-center">
                <span className="w-12 h-12 bg-gradient-to-r from-poker-green to-poker-darkgreen rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white text-xl">♠</span>
                </span>
                Élő Cash Game Asztalok
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-3 text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary mx-auto"></div>
                    <p className="mt-4 text-poker-muted">Cash game-ek betöltése...</p>
                  </div>
                ) : cashGames.length === 0 ? (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-poker-muted">Jelenleg nincsenek aktív cash game asztalok.</p>
                  </div>
                ) : (
                  cashGames.map(cashGame => {
                    const isLive = isTableLive(cashGame.schedule);
                    return (
                      <div key={cashGame.id} className="relative">
                      {/* Calendar Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addCashGameToCalendar(cashGame);
                        }}
                        className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                        title="Hozzáadás naptárhoz"
                      >
                        <svg className="w-5 h-5 text-poker-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
                      <Link
                        href={`/cash-games/${cashGame.id}`}
                        className="block group"
                      >
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group-hover:scale-105">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-poker-dark group-hover:text-poker-primary transition-colors">{cashGame.name}</h3>
                            <div className="flex items-center">
                              {isLive ? (
                                <div className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full">
                                  <div className="w-2 h-2 bg-green-200 rounded-full mr-2 animate-pulse" />
                                  <span className="text-xs font-bold">ÉLŐ ASZTAL</span>
                                </div>
                              ) : cashGame.active === true && (
                                <div className="flex items-center text-green-600">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                                  <span className="text-xs font-medium">Aktív</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-poker-muted mb-4 line-clamp-2">
                            {cashGame.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-poker-muted">Tét:</span>
                              <span className="font-semibold text-poker-dark">{cashGame.stakes}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-poker-muted">Buy-in / nevezési díj:</span>
                              <span className="font-semibold text-poker-dark">
                                {formatCurrency(cashGame.minBuyIn)} - {formatCurrency(cashGame.maxBuyIn)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-poker-muted">Program:</span>
                              <span className="font-semibold text-poker-dark text-xs">{cashGame.schedule}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}