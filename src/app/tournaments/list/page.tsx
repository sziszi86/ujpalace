'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tournament } from '@/types';
import { formatChips, formatCurrency } from '@/utils/formatters';

export default function TournamentListPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tournaments');
        
        if (response.ok) {
          const tournamentData = await response.json();
          // Only show active tournaments (status !== 'inactive')
          const activeTournaments = tournamentData.filter((tournament: Tournament) => 
            tournament.status !== 'inactive'
          );
          setTournaments(activeTournaments);
        } else {
          console.error('Failed to fetch tournaments from database');
        }
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournaments();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const monthNames = [
      'január', 'február', 'március', 'április', 'május', 'június',
      'július', 'augusztus', 'szeptember', 'október', 'november', 'december'
    ];
    
    return `${year}. ${monthNames[month]} ${day}.`;
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

  const filteredTournaments = tournaments.filter(tournament => {
    if (filterStatus === 'all') return true;
    return tournament.status === filterStatus;
  });

  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.tournament_date || a.date).getTime() - new Date(b.tournament_date || b.date).getTime();
      case 'buyIn':
        return Number(a.buy_in || a.buyIn || 0) - Number(b.buy_in || b.buyIn || 0);
      case 'guarantee':
        return Number(b.guarantee_amount || b.guarantee || 0) - Number(a.guarantee_amount || a.guarantee || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-poker-light to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Versenyek Lista
          </h1>
          <p className="text-xl text-poker-muted max-w-3xl mx-auto">
            Minden versenyünk részletes információkkal egy helyen. 
            Jelentkezz a következő élő poker versenyekre!
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Szűrés:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poker-primary"
                >
                  <option value="all">Összes verseny</option>
                  <option value="upcoming">Közelgő</option>
                  <option value="ongoing">Folyamatban</option>
                  <option value="completed">Befejezett</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rendezés:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poker-primary"
                >
                  <option value="date">Dátum szerint</option>
                  <option value="buyIn">Buy-in szerint</option>
                  <option value="guarantee">Díjalap szerint</option>
                </select>
              </div>
            </div>
            <Link
              href="/tournaments"
              className="btn-outline"
            >
              📅 Naptár nézet
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
          </div>
        )}

        {/* Tournament List */}
        {!loading && (
          <div className="space-y-4">
            {sortedTournaments.map((tournament) => (
              <div key={tournament.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col lg:flex-row">
                  {/* Tournament Image */}
                  <div className="lg:w-1/4">
                    {tournament.image ? (
                      <div 
                        className="h-48 lg:h-full bg-cover bg-center relative"
                        style={{backgroundImage: `url(${tournament.image})`}}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-poker-primary/80 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="h-48 lg:h-full bg-gradient-to-br from-poker-primary via-poker-secondary to-poker-primary flex items-center justify-center">
                        <span className="text-4xl text-white">🏆</span>
                      </div>
                    )}
                  </div>

                  {/* Tournament Info */}
                  <div className="lg:w-3/4 p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
                      <div className="mb-4 lg:mb-0">
                        <div className="flex items-center mb-2">
                          <h2 className="text-2xl font-bold text-poker-dark mr-3">{tournament.title}</h2>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tournament.status)}`}>
                            {getStatusText(tournament.status)}
                          </span>
                          {tournament.category && (
                            <span className="ml-2 px-3 py-1 bg-poker-gold text-poker-dark text-xs font-bold rounded-full">
                              {tournament.category}
                            </span>
                          )}
                          {tournament.featured && (
                            <span className="ml-2 px-3 py-1 bg-poker-red text-white text-xs font-bold rounded-full">
                              ⭐ Kiemelt
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{tournament.description}</p>
                      </div>
                    </div>

                    {/* Tournament Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-black mb-1">Dátum</p>
                        <p className="font-bold text-sm text-poker-dark">{formatDate(tournament.tournament_date || tournament.date)}</p>
                        <p className="text-xs text-gray-600">{tournament.tournament_time || tournament.time}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-black mb-1">Buy-in</p>
                        <p className="font-bold text-sm text-poker-primary">{formatCurrency(Number(tournament.buy_in || tournament.buyIn))}</p>
                        {(tournament.starting_chips || tournament.startingChips) && (
                          <p className="text-xs text-gray-600">{formatChips(Number(tournament.starting_chips || tournament.startingChips || 0))}</p>
                        )}
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-black mb-1">Jelentkezők</p>
                        <p className="font-bold text-sm text-poker-dark">
                          {tournament.currentPlayers || tournament.current_players || 0}/{tournament.maxPlayers || tournament.max_players || '∞'}
                        </p>
                        <p className="text-xs text-gray-600">{tournament.structure}</p>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tournament.rebuyPrice && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Rebuy: {formatCurrency(Number(tournament.rebuyPrice))} 
                          {tournament.rebuyCount && tournament.rebuyCount > 1 && ` (${tournament.rebuyCount}x)`}
                        </span>
                      )}
                      {tournament.addonPrice && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Add-on: {formatCurrency(Number(tournament.addonPrice))}
                          {tournament.addonChips && ` (${formatChips(Number(tournament.addonChips))})`}
                        </span>
                      )}
                      {tournament.blindStructure && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {tournament.blindStructure}
                        </span>
                      )}
                      {tournament.lateRegistration && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Utólagos nevezés: {tournament.lateRegistrationUntil}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                      <a 
                        href="tel:+36309715832"
                        className="btn-outline text-center"
                      >
                        <span className="mr-2">📞</span>
                        <span>Jelentkezés</span>
                      </a>
                      <Link href={`/tournaments/${tournament.id}`}>
                        <button className="w-full btn-primary px-6 py-2 text-sm">
                          <span className="mr-2">📋</span>
                          <span>Részletek</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sortedTournaments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nincs verseny a kiválasztott szűrővel</h3>
            <p className="text-black">Próbálj meg más szűrő beállításokat.</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-12 bg-gradient-to-r from-poker-primary to-poker-secondary rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Jelentkezés és információ</h3>
          <p className="mb-6">Hívj minket a +36 30 971 5832 számon, vagy gyere be személyesen!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              <span>9700 Szombathely, Semmelweis u. 2.</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">🕐</span>
              <span>Hétfő-Vasárnap 18:00-06:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}