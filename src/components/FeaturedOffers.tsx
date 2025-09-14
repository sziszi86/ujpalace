'use client';

import { useState, useEffect } from 'react';
import { Tournament, CashGame } from '@/types';
import TournamentCard from './TournamentCard';
import { formatCurrency } from '@/utils/formatters';

const mockTournaments: Tournament[] = [
  {
    id: 1,
    title: 'Weekend Series Main Event',
    description: 'A hétvége fénypontja! Nagy díjalap, mély stackek, lassú struktúra.',
    longDescription: 'A hét legkiemelkedőbb versenye! Csatlakozz hozzánk a Weekend Series Main Event-jére, ahol óriási díjalap és mély stack struktúra vár. Ez egy freeze-out verseny, amely a legjobb élő poker élményt nyújtja Szombathelyen.',
    date: '2025-12-18',
    time: '19:00',
    buyIn: 30000,
    rebuyPrice: 10000,
    rebuyChips: 15000,
    addonPrice: 10000,
    addonChips: 20000,
    guarantee: 500000,
    structure: 'Freeze-out Deep Stack',
    status: 'upcoming',
    maxPlayers: 80,
    currentPlayers: 45,
    category: 'Main Event',
    featured: true,
    venue: 'Palace Poker Szombathely',
    lateRegistration: true,
    lateRegistrationUntil: '21:00',
    blindStructure: '20 perc szintek',
    startingChips: 50000,
    contactPhone: '+36 30 971 5832',
    contactEmail: 'tournaments@palace-poker.hu',
    image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800',
    images: [
      'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800'
    ],
    specialNotes: 'Személyes jelentkezés a helyszínen vagy telefonon keresztül.',
  },
  {
    id: 2,
    title: 'Friday Night Bounty',
    description: 'Fejvadász verseny! Minden kiejtésért bounty + díjalap.',
    longDescription: 'Izgalmas bounty tournament minden pénteken! Minden egyes kiejtett ellenfélért extra pénzt kapsz, miközben a fő díjalapart is megcélozhatod. Tökéletes a kezdők és a tapasztalt játékosok számára egyaránt.',
    date: '2025-12-17',
    time: '20:00',
    buyIn: 25000,
    rebuyPrice: 8000,
    rebuyChips: 12000,
    addonPrice: 8000,
    addonChips: 15000,
    guarantee: 300000,
    structure: 'Progressive Bounty',
    status: 'upcoming',
    maxPlayers: 60,
    currentPlayers: 38,
    category: 'Bounty',
    featured: true,
    venue: 'Palace Poker Szombathely',
    lateRegistration: true,
    lateRegistrationUntil: '22:30',
    blindStructure: '15 perc szintek',
    startingChips: 30000,
    contactPhone: '+36 30 971 5832',
    contactEmail: 'tournaments@palace-poker.hu',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
    ],
    specialNotes: 'Minden kiejtett játékosért 5000 Ft bounty járt!',
  },
  {
    id: 3,
    title: 'Sunday High Roller',
    description: 'Magas tétes verseny tapasztalt játékosoknak. Exkluzív élmény.',
    longDescription: 'Exkluzív high roller esemény csak a legkomolyan vevőknek! Magas buy-in, lassú struktúra és prémium kiszolgálás. Limitált részvételi lehetőség, ezért érdemes időben jelentkezni.',
    date: '2025-12-19',
    time: '18:00',
    buyIn: 50000,
    guarantee: 750000,
    structure: 'High Roller Freeze-out',
    status: 'upcoming',
    maxPlayers: 30,
    currentPlayers: 12,
    category: 'High Roller',
    featured: true,
    venue: 'Palace Poker Szombathely',
    lateRegistration: false,
    blindStructure: '30 perc szintek',
    startingChips: 100000,
    contactPhone: '+36 30 971 5832',
    contactEmail: 'tournaments@palace-poker.hu',
    image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800',
    images: [
      'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
      'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800'
    ],
    specialNotes: 'Exkluzív high roller élmény prémium kiszolgálással.',
  },
];

const mockCashGames: CashGame[] = [
  {
    id: 1,
    name: 'NL Hold\'em 100/200',
    stakes: '100/200 Ft',
    game: 'No Limit Texas Hold\'em',
    minBuyIn: 10000,
    maxBuyIn: 40000,
    description: 'Népszerű cash game asztal minden szinten. Barátságos légkör.',
    schedule: 'Szerda: 19:00-04:00',
    active: true,
  },
  {
    id: 2,
    name: 'NL Hold\'em 200/400',
    stakes: '200/400 Ft',
    game: 'No Limit Texas Hold\'em',
    minBuyIn: 20000,
    maxBuyIn: 80000,
    description: 'Magasabb tétes akció tapasztalt játékosoknak. Izgalmas pot-ok.',
    schedule: 'Péntek-Szombat: 19:30-04:00',
    active: true,
  },
  {
    id: 3,
    name: 'PLO 200/400',
    stakes: '200/400 Ft',
    game: 'Pot Limit Omaha',
    minBuyIn: 20000,
    maxBuyIn: 100000,
    description: 'Omaha akció! Több lehetőség, nagyobb variance, izgalmas játék.',
    schedule: 'Péntek-Szombat: 19:30-04:00',
    active: true,
  },
];

interface FeaturedOffersProps {
  tournaments?: Tournament[];
  cashGames?: CashGame[];
}

export default function FeaturedOffers() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [cashGames, setCashGames] = useState<CashGame[]>([]);
  const [currentTournamentPage, setCurrentTournamentPage] = useState(0);
  const [currentCashGamePage, setCurrentCashGamePage] = useState(0);

  useEffect(() => {
    // Load tournaments from API
    fetch('/api/tournaments')
      .then(res => res.json())
      .then(data => setTournaments(data))
      .catch(err => {
        console.error('Failed to load tournaments:', err);
        setTournaments(mockTournaments);
      });

    // Load cash games from API
    fetch('/api/cash-games')
      .then(res => res.json())
      .then(data => {
        // Convert database format to frontend format
        const formattedCashGames = data.map((game: any) => ({
          id: game.id,
          name: game.name,
          stakes: game.stakes,
          game: game.game_type || game.game || 'NLH',
          minBuyIn: game.min_buy_in || game.minBuyIn,
          maxBuyIn: game.max_buy_in || game.maxBuyIn,
          schedule: game.schedule || 'Szerda: 19:00-04:00, Péntek-Szombat: 19:30-04:00',
          startDate: game.start_date || game.startDate,
          active: game.active === 1 || game.active === true || game.active !== 0,
          description: game.description || '',
          image: game.image_url || game.image || ''
        }));
        // Only show active cash games, limit to 12
        setCashGames(formattedCashGames.filter((game: any) => game.active).slice(0, 12));
      })
      .catch(err => {
        console.error('Failed to load cash games:', err);
        setCashGames(mockCashGames);
      });
  }, []);

  // Filter tournaments to only show upcoming ones (not past) - limit to 12
  const upcomingTournaments = tournaments.filter(tournament => {
    const tournamentDateTime = new Date(`${tournament.date}T${tournament.time}`);
    const now = new Date();
    return tournamentDateTime > now && tournament.status === 'upcoming';
  }).slice(0, 12);

  // Pagination logic - 3 tournaments per page
  const tournamentsPerPage = 3;
  const totalPages = Math.ceil(upcomingTournaments.length / tournamentsPerPage);
  const currentTournaments = upcomingTournaments.slice(
    currentTournamentPage * tournamentsPerPage,
    (currentTournamentPage + 1) * tournamentsPerPage
  );

  const nextTournamentPage = () => {
    if (currentTournamentPage < totalPages - 1) {
      setCurrentTournamentPage(currentTournamentPage + 1);
    }
  };

  const prevTournamentPage = () => {
    if (currentTournamentPage > 0) {
      setCurrentTournamentPage(currentTournamentPage - 1);
    }
  };

  // Cash Games pagination logic - 3 cash games per page  
  const cashGamesPerPage = 3;
  const totalCashGamePages = Math.ceil(cashGames.length / cashGamesPerPage);
  const currentCashGames = cashGames.slice(
    currentCashGamePage * cashGamesPerPage,
    (currentCashGamePage + 1) * cashGamesPerPage
  );

  const nextCashGamePage = () => {
    if (currentCashGamePage < totalCashGamePages - 1) {
      setCurrentCashGamePage(currentCashGamePage + 1);
    }
  };

  const prevCashGamePage = () => {
    if (currentCashGamePage > 0) {
      setCurrentCashGamePage(currentCashGamePage - 1);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-poker-light to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-8xl">♠</div>
        <div className="absolute top-40 right-20 text-6xl">♥</div>
        <div className="absolute bottom-32 left-1/4 text-7xl">♣</div>
        <div className="absolute bottom-20 right-1/3 text-5xl">♦</div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold gradient-text mb-6">
            Élő Poker Események
          </h2>
          <p className="text-xl text-poker-muted max-w-4xl mx-auto leading-relaxed">
            Csatlakozz Szombathely legizgalmasabb élő poker eseményeihez! 
            Versenyek, cash game asztalok és exkluzív események várnak rád.
          </p>
          <div className="flex justify-center mt-8">
            <div className="w-24 h-1 bg-gradient-to-r from-poker-primary to-poker-gold rounded-full"></div>
          </div>
        </div>

        {/* Tournaments Section */}
        <div className="mb-20 animate-slide-up">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12">
            <div>
              <h3 className="text-4xl font-bold text-poker-dark flex items-center mb-2">
                <div className="w-16 h-16 bg-gradient-to-r from-poker-primary to-poker-gold rounded-2xl flex items-center justify-center mr-4 shadow-xl animate-bounce-subtle">
                  <span className="text-2xl">🏆</span>
                </div>
                Közelgő Versenyek
              </h3>
              <p className="text-poker-muted text-lg">Jelentkezz be és vegyél részt a következő nagy eseményeken</p>
            </div>
            <a 
              href="/tournaments" 
              className="btn-outline mt-4 lg:mt-0 group"
            >
              <span>Összes verseny</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentTournaments.map((tournament, index) => (
              <div key={tournament.id} className="animate-scale-in" style={{animationDelay: `${index * 0.2}s`}}>
                <TournamentCard tournament={tournament} />
              </div>
            ))}
          </div>
          
          {/* Tournament Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={prevTournamentPage}
                disabled={currentTournamentPage === 0}
                className={`p-3 rounded-full transition-all duration-300 ${
                  currentTournamentPage === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-poker-primary text-white hover:bg-poker-secondary shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTournamentPage(i)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i === currentTournamentPage
                        ? 'bg-poker-primary scale-125'
                        : 'bg-gray-300 hover:bg-poker-primary/50'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextTournamentPage}
                disabled={currentTournamentPage === totalPages - 1}
                className={`p-3 rounded-full transition-all duration-300 ${
                  currentTournamentPage === totalPages - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-poker-primary text-white hover:bg-poker-secondary shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          
          {upcomingTournaments.length === 0 && (
            <div className="text-center py-12 bg-white/50 rounded-xl">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-poker-dark mb-2">Jelenleg nincsenek közelgő versenyek</h3>
              <p className="text-poker-muted">Hamarosan új versenyeket hirdetünk meg!</p>
            </div>
          )}
        </div>

        {/* Cash Games Section */}
        <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12">
            <div>
              <h3 className="text-4xl font-bold text-poker-dark flex items-center mb-2">
                <div className="w-16 h-16 bg-gradient-to-r from-poker-green to-poker-darkgreen rounded-2xl flex items-center justify-center mr-4 shadow-xl animate-float">
                  <span className="text-2xl text-white">♠</span>
                </div>
                Élő Cash Game
              </h3>
              <p className="text-poker-muted text-lg">Ülj le az asztalhoz és játssz a saját tempódban</p>
            </div>
            <a 
              href="/cash-games" 
              className="btn-outline mt-4 lg:mt-0 group"
            >
              <span>Összes asztal</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentCashGames.map((cashGame, index) => (
              <div key={cashGame.id} className="animate-scale-in" style={{animationDelay: `${(index + 3) * 0.2}s`}}>
                <a href={`/cash-games/${cashGame.id}`} className="block group">
                  <div className="card-modern p-8 h-full transition-all duration-300 hover:scale-105 group-hover:shadow-2xl">
                    {/* Live Status Indicator */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600">Élő asztal</span>
                      </div>
                      <div className="text-2xl transform group-hover:scale-110 transition-transform">♠</div>
                    </div>

                    {/* Cash Game Info */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-poker-dark mb-2 group-hover:text-poker-primary transition-colors">
                        {cashGame.name}
                      </h3>
                      <p className="text-poker-muted mb-4">
                        {cashGame.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-poker-muted">Tétek:</span>
                          <span className="font-bold text-poker-primary text-lg">{cashGame.stakes}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-poker-muted">Buy-in:</span>
                          <span className="font-semibold text-poker-dark">
                            {formatCurrency(cashGame.minBuyIn)} - {formatCurrency(cashGame.maxBuyIn)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-poker-muted">Program:</span>
                          <span className="font-semibold text-poker-dark text-sm">{cashGame.schedule}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Hint */}
                    <div className="flex items-center justify-center mt-6 pt-6 border-t border-poker-light/30">
                      <span className="text-poker-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Részletek megtekintése →
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
          
          {/* Cash Games Pagination */}
          {totalCashGamePages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={prevCashGamePage}
                disabled={currentCashGamePage === 0}
                className={`p-3 rounded-full transition-all duration-300 ${
                  currentCashGamePage === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-poker-green text-white hover:bg-poker-darkgreen shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: totalCashGamePages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentCashGamePage(i)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i === currentCashGamePage
                        ? 'bg-poker-green scale-125'
                        : 'bg-gray-300 hover:bg-poker-green/50'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextCashGamePage}
                disabled={currentCashGamePage === totalCashGamePages - 1}
                className={`p-3 rounded-full transition-all duration-300 ${
                  currentCashGamePage === totalCashGamePages - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-poker-green text-white hover:bg-poker-darkgreen shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          
          {cashGames.length === 0 && (
            <div className="text-center py-12 bg-white/50 rounded-xl">
              <div className="text-6xl mb-4">♠</div>
              <h3 className="text-xl font-semibold text-poker-dark mb-2">Jelenleg nincsenek aktív cash game asztalok</h3>
              <p className="text-poker-muted">Hamarosan új asztalok nyílnak!</p>
            </div>
          )}
        </div>

        {/* Call to Action - Enhanced */}
        <div className="mt-20 text-center animate-fade-in" style={{animationDelay: '0.8s'}}>
          <div className="relative bg-gradient-to-br from-poker-primary via-poker-secondary to-poker-darkgreen p-16 rounded-3xl overflow-hidden shadow-2xl animate-glow">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-4 left-4 text-6xl animate-bounce-subtle text-poker-gold">♠</div>
              <div className="absolute top-8 right-8 text-5xl animate-float text-poker-accent" style={{animationDelay: '0.5s'}}>♥</div>
              <div className="absolute bottom-8 left-8 text-5xl animate-float text-poker-gold" style={{animationDelay: '1s'}}>♣</div>
              <div className="absolute bottom-4 right-4 text-6xl animate-bounce-subtle text-poker-accent" style={{animationDelay: '1.5s'}}>♦</div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5 animate-pulse">🃏</div>
            </div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <h3 className="text-5xl font-bold text-white mb-6 drop-shadow-lg animate-glow">
                  Készen állsz az akcióra?
                </h3>
                <div className="w-32 h-1 bg-gradient-to-r from-poker-gold to-poker-accent rounded-full mx-auto mb-6 animate-pulse"></div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
                <p className="text-2xl text-white mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
                  Csatlakozz Szombathely legjobb poker közösségéhez! 
                </p>
                
                {/* Highlight Cash Games */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-poker-green to-poker-darkgreen p-6 rounded-xl border-2 border-poker-accent/30 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-poker-gold rounded-full flex items-center justify-center mr-3 animate-bounce-subtle">
                        <span className="text-poker-dark font-bold">♠</span>
                      </div>
                      <h4 className="text-xl font-bold text-white">Cash Game Asztalok</h4>
                    </div>
                    <p className="text-poker-accent text-lg">
                      Élő cash game akció! Szerda 19:00-04:00, Péntek-Szombat 19:30-04:00.
                      100/200 Ft-tól a high stakes asztalokig.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-poker-primary to-poker-secondary p-6 rounded-xl border-2 border-poker-gold/30 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-poker-gold rounded-full flex items-center justify-center mr-3 animate-bounce-subtle">
                        <span className="text-poker-dark font-bold">🏆</span>
                      </div>
                      <h4 className="text-xl font-bold text-white">Versenyek</h4>
                    </div>
                    <p className="text-poker-accent text-lg">
                      Heti versenyek garantált díjalapal, 
                      bounty és high roller események!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-8">
                <a href="/cash-games" className="bg-gradient-to-r from-poker-gold to-amber-400 text-poker-dark font-bold py-4 px-8 rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-2xl animate-bounce-subtle">
                  <span className="flex items-center text-lg">
                    ♠ Cash Game Asztalok
                  </span>
                </a>
                <a href="/tournaments" className="bg-white text-poker-primary font-bold py-4 px-8 rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-2xl">
                  <span className="flex items-center text-lg">
                    🏆 Versenyekre jelentkezés
                  </span>
                </a>
                <a href="/contact" className="glass-effect text-white font-bold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30">
                  <span className="flex items-center text-lg">
                    📞 Kapcsolat
                  </span>
                </a>
              </div>
              
              {/* Enhanced Live indicator */}
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xl font-bold text-white animate-bounce-subtle">Most is játszanak nálunk!</span>
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-poker-accent font-medium">
                  📍 Szombathely, Semmelweis u. 2. | 📞 +36 30 971 5832
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}