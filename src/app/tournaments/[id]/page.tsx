'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Tournament } from '@/types';
import { formatChips, formatCurrency, formatNumber } from '@/utils/formatters';
import { addTournamentToCalendar } from '@/utils/calendar';

interface TournamentStructureLevel {
  id: number;
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationMinutes: number;
  breakAfter: boolean;
  breakDurationMinutes: number;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = params?.id as string;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [structureLevels, setStructureLevels] = useState<TournamentStructureLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/tournaments/${tournamentId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Tournament not found');
            return;
          }
          throw new Error('Failed to fetch tournament');
        }
        
        const foundTournament = await response.json();
        
        if (!foundTournament) {
          setError('Tournament not found');
          return;
        }
        
        setTournament(foundTournament);
        
        // Fetch tournament structure levels
        try {
          const structureResponse = await fetch(`/api/tournament-structures/${tournamentId}`);
          if (structureResponse.ok) {
            const levels = await structureResponse.json();
            setStructureLevels(levels);
          }
        } catch (error) {
          console.error('Error fetching tournament structure:', error);
          // Don't set error for structure - it's optional
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setError('Failed to load tournament details');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  // Countdown timer
  useEffect(() => {
    if (!tournament || !tournament.tournament_date || !tournament.tournament_time) return;

    const updateCountdown = () => {
      const now = new Date();
      const tournamentDate = new Date(`${tournament.tournament_date}T${tournament.tournament_time}`);
      const timeDiff = tournamentDate.getTime() - now.getTime();

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft(null); // Tournament has started or passed
      }
    };

    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [tournament]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  if (error || !tournament) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    return date.toLocaleDateString('hu-HU', options);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
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
    <div className="min-h-screen bg-poker-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-poker-muted hover:text-poker-dark transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vissza a versenyekhez
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="card-modern p-8 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-2">
                    <h1 className="text-3xl font-bold text-poker-dark mr-4">
                      {tournament.title}
                    </h1>
                    {tournament.featured && (
                      <span className="bg-poker-gold text-poker-dark px-3 py-1 rounded-full text-sm font-bold">
                        ⭐ Kiemelt
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-poker-muted">
                    {tournament.description}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(tournament.status)}`}>
                    {getStatusText(tournament.status)}
                  </span>
                  <span className="text-sm text-poker-muted mt-1">
                    {tournament.category}
                  </span>
                </div>
              </div>

              {/* Tournament Image */}
              {tournament.image_url && (
                <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
                  <img
                    src={tournament.image_url}
                    alt={tournament.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm opacity-90 drop-shadow-lg">{tournament.tournament_date ? formatDate(tournament.tournament_date) : ''}</p>
                        <p className="text-2xl font-bold drop-shadow-lg">{tournament.tournament_time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm opacity-90 drop-shadow-lg">Buy-in</p>
                        <p className="text-2xl font-bold drop-shadow-lg">{formatCurrency(Number(tournament.buy_in))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Long Description */}
              {tournament.long_description && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-poker-dark mb-4">Részletek</h2>
                  <div className="text-poker-muted whitespace-pre-line">
                    {tournament.long_description}
                  </div>
                </div>
              )}
            </div>

            {/* Tournament Structure */}
            <div className="card-modern p-8 mb-8">
              <h2 className="text-2xl font-bold text-poker-dark mb-6">Verseny struktúra</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-poker-light/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-poker-dark mb-2">Alapadatok</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-poker-muted">Struktúra:</span>
                      <span className="font-medium">{tournament.structure}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-poker-muted">Max. játékosok:</span>
                      <span className="font-medium">{tournament.max_players || 'Nincs limit'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-poker-muted">Kezdő chipek:</span>
                      <span className="font-medium">{tournament.starting_chips ? formatChips(tournament.starting_chips) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-poker-muted">Blind struktúra:</span>
                      <span className="font-medium">{tournament.blind_structure || 'Standard'}</span>
                    </div>
                  </div>
                </div>

                {(tournament.rebuyPrice || tournament.addonPrice) && (
                  <div className="bg-poker-light/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-poker-dark mb-2">Rebuy & Add-on</h3>
                    <div className="space-y-2 text-sm">
                      {tournament.rebuyPrice && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-poker-muted">Rebuy ár:</span>
                            <span className="font-medium">{formatCurrency(tournament.rebuyPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-poker-muted">Rebuy chipek:</span>
                            <span className="font-medium">{tournament.rebuyChips ? formatChips(tournament.rebuyChips) : 'N/A'}</span>
                          </div>
                          {tournament.rebuyCount && (
                            <div className="flex justify-between">
                              <span className="text-poker-muted">Max rebuy-ok:</span>
                              <span className="font-medium">{tournament.rebuyCount} db</span>
                            </div>
                          )}
                        </>
                      )}
                      {tournament.addonPrice && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-poker-muted">Add-on ár:</span>
                            <span className="font-medium">{formatCurrency(tournament.addonPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-poker-muted">Add-on chipek:</span>
                            <span className="font-medium">{tournament.addonChips ? formatChips(tournament.addonChips) : 'N/A'}</span>
                          </div>
                          {tournament.addonCount && (
                            <div className="flex justify-between">
                              <span className="text-poker-muted">Max add-on-ok:</span>
                              <span className="font-medium">{tournament.addonCount} db</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Blind Levels */}
              {structureLevels.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-poker-dark mb-4">Vaklicit szintek</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Szint</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kisvak</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nagyvak</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ante</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Időtartam</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Szünet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {structureLevels.map((level, index) => (
                          <tr key={level.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {level.level}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {formatNumber(level.smallBlind)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {formatNumber(level.bigBlind)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {level.ante > 0 ? formatNumber(level.ante) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {level.durationMinutes} perc
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {level.breakAfter ? (
                                <span className="text-green-600 font-medium">
                                  {level.breakDurationMinutes} perc
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Special Notes */}
            {tournament.special_notes && (
              <div className="card-modern p-8">
                <h2 className="text-2xl font-bold text-poker-dark mb-4">Fontos tudnivalók</h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 whitespace-pre-line">
                        {tournament.special_notes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Info */}
            <div className="card-modern p-6 mb-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-poker-dark">Verseny információk</h3>
                <button
                  onClick={() => addTournamentToCalendar(tournament)}
                  className="bg-poker-primary hover:bg-poker-secondary text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                  title="Hozzáadás naptárhoz"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Naptár</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-center p-3 bg-poker-light/50 rounded-lg">
                  <svg className="w-5 h-5 text-poker-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-poker-dark">{tournament.tournament_date ? formatDate(tournament.tournament_date) : ''}</p>
                    <p className="text-sm text-poker-muted">{tournament.tournament_time}</p>
                  </div>
                </div>

                {/* Buy-in */}
                <div className="flex items-center p-3 bg-poker-light/50 rounded-lg">
                  <svg className="w-5 h-5 text-poker-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div>
                    <p className="font-semibold text-poker-dark">Buy-in</p>
                    <p className="text-lg font-bold text-poker-primary">{formatCurrency(Number(tournament.buy_in))}</p>
                  </div>
                </div>

                {/* Countdown Timer */}
                {timeLeft && tournament.status === 'upcoming' && (
                  <div className="bg-gradient-to-r from-poker-primary to-poker-secondary p-4 rounded-lg text-white">
                    <h4 className="font-semibold mb-3 text-center">Verseny kezdetéig</h4>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-bold">{timeLeft.days}</div>
                        <div className="text-xs opacity-90">nap</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-bold">{timeLeft.hours}</div>
                        <div className="text-xs opacity-90">óra</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-bold">{timeLeft.minutes}</div>
                        <div className="text-xs opacity-90">perc</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-bold">{timeLeft.seconds}</div>
                        <div className="text-xs opacity-90">mp</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Guarantee */}
                {tournament.guarantee_amount && (
                  <div className="flex items-center p-3 bg-poker-light/50 rounded-lg">
                    <svg className="w-5 h-5 text-poker-green mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-poker-dark">Garantált díjalap</p>
                      <p className="text-lg font-bold text-poker-gold">{formatCurrency(Number(tournament.guarantee_amount))}</p>
                    </div>
                  </div>
                )}

                {/* Late Registration */}
                {tournament.late_registration && tournament.late_registration_until && (
                  <div className="flex items-center p-3 bg-poker-light/50 rounded-lg">
                    <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-poker-dark">Utólagos nevezés</p>
                      <p className="text-sm text-poker-muted">{tournament.late_registration_until}-ig</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}