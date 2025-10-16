'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';

interface Tournament {
  id: number;
  title: string;
  tournament_date: string;
  tournament_time: string;
  buy_in: string | number; // API returns string
  guarantee_amount: string | number; // API returns string
  current_players: number;
  max_players: number | null;
  image_url?: string;
  rebuy_count?: number;
  rebuy_price?: string | number;
  addon_price?: string | number;
  addon_chips?: string | number;
}

export default function FeaturedEvents() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments?featured=true&limit=3');
      if (response.ok) {
        const data = await response.json();
        setTournaments(data);
      } else {
        console.error('Failed to fetch tournaments:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching featured tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-poker-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Kiemelt Események
            </h2>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-poker-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Kiemelt Események
          </h2>
          <p className="text-poker-muted max-w-2xl mx-auto">
            Ne maradj le a legnagyobb versenyeinkről és eseményeinkről
          </p>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center text-poker-muted">
            <p>Jelenleg nincsenek kiemelt események.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-gradient-to-br from-poker-dark/95 to-poker-dark border border-poker-accent/30 rounded-xl overflow-hidden hover:border-poker-gold/70 hover:shadow-xl transition-all duration-300"
              >
                {tournament.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={tournament.image_url}
                      alt={tournament.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">
                    {tournament.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-poker-gold font-semibold text-lg">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {formatDate(tournament.tournament_date)} {formatTime(tournament.tournament_time)}
                    </div>
                    
                    <div className="text-white">
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Buy-in / nevezési díj: {formatCurrency(Number(tournament.buy_in))}
                      </div>
                      {(tournament.rebuy_price || tournament.addon_price) && (
                        <div className="text-sm text-poker-accent ml-6 space-y-1">
                          {tournament.rebuy_price && Number(tournament.rebuy_price) > 0 && (
                            <div>
                              Rebuy: {formatCurrency(Number(tournament.rebuy_price))}
                              {tournament.rebuy_count && tournament.rebuy_count > 1 && ` (${tournament.rebuy_count}x)`}
                            </div>
                          )}
                          {tournament.addon_price && Number(tournament.addon_price) > 0 && (
                            <div>Add-on: {formatCurrency(Number(tournament.addon_price))}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>


                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="block w-full bg-poker-gold text-poker-dark text-center font-bold py-3 rounded-lg hover:bg-poker-gold/90 transition-colors duration-300"
                  >
                    Részletek
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/tournaments"
            className="inline-flex items-center bg-transparent border border-poker-gold text-poker-gold px-8 py-3 rounded-lg font-medium hover:bg-poker-gold hover:text-poker-dark transition-all duration-300"
          >
            Összes verseny megtekintése
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}