'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CashGame } from '@/types';
import { formatCurrency } from '@/utils/formatters';

export default function CashGameListPage() {
  const [cashGames, setCashGames] = useState<CashGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('stakes');

  useEffect(() => {
    const loadCashGames = async () => {
      try {
        const response = await fetch('/api/cash-games');
        if (response.ok) {
          const cashGamesData = await response.json();
          // Convert database format to frontend format
          const formattedCashGames = cashGamesData.map((game: any) => ({
            id: game.id,
            name: game.name,
            stakes: game.stakes,
            game: game.game_type || 'NLH',
            minBuyIn: game.min_buy_in,
            maxBuyIn: game.max_buy_in,
            schedule: game.schedule || 'Hétfő-Vasárnap 18:00-06:00',
            startDate: game.start_date,
            active: game.active === 1 || game.active === true || game.active !== 0,
            description: game.description || '',
            image: game.image_url || ''
          }));
          setCashGames(formattedCashGames.filter((game: any) => game.active));
        } else {
          console.error('Failed to load cash games from database');
        }
      } catch (error) {
        console.error('Hiba a cash games betöltésekor:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCashGames();
  }, []);

  const getGameIcon = (game: string) => {
    if (game.toLowerCase().includes('omaha')) {
      return '♦';
    } else if (game.toLowerCase().includes('hold')) {
      return '♠';
    } else {
      return '♣';
    }
  };

  const getGameColor = (game: string) => {
    if (game.toLowerCase().includes('omaha')) {
      return 'from-red-500 to-red-600';
    } else if (game.toLowerCase().includes('hold')) {
      return 'from-poker-darkgreen to-poker-green';
    } else {
      return 'from-blue-500 to-blue-600';
    }
  };

  const filteredCashGames = cashGames.filter(cashGame => {
    if (filterActive === 'all') return true;
    return filterActive === 'active' ? cashGame.active : !cashGame.active;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-poker-light to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Cash Game Asztalok
          </h1>
          <p className="text-xl text-poker-muted max-w-3xl mx-auto">
            Élő cash game asztaljaink részletes információkkal. 
            Válaszd ki a neked megfelelő tétlimitet és játékot!
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Szűrés:</label>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poker-primary"
                >
                  <option value="all">Összes asztal</option>
                  <option value="active">Aktív asztalok</option>
                  <option value="inactive">Inaktív asztalok</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rendezés:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poker-primary"
                >
                  <option value="stakes">Tétek szerint</option>
                  <option value="game">Játék szerint</option>
                  <option value="minBuyIn">Min. buy-in szerint</option>
                </select>
              </div>
            </div>
            <Link
              href="/cash-games"
              className="btn-outline"
            >
              📅 Naptár nézet
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-green"></div>
          </div>
        )}

        {/* Cash Game List */}
        {!loading && (
          <div className="space-y-4">
            {filteredCashGames.map((cashGame) => (
            <div key={cashGame.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col lg:flex-row">
                {/* Game Type Header */}
                <div className="lg:w-1/4">
                  <div className={`h-48 lg:h-full bg-gradient-to-r ${getGameColor(cashGame.game)} flex items-center justify-center relative`}>
                    <div className="text-center text-white">
                      <div className="text-6xl mb-2">{getGameIcon(cashGame.game)}</div>
                      <div className="text-xl font-bold">{cashGame.stakes}</div>
                      <div className="text-sm opacity-90">{cashGame.game}</div>
                      {cashGame.active && (
                        <div className="absolute top-4 right-4 flex items-center">
                          <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-sm font-medium">Aktív</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cash Game Info */}
                <div className="lg:w-3/4 p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
                    <div className="mb-4 lg:mb-0">
                      <h2 className="text-2xl font-bold text-poker-dark mb-2">{cashGame.name}</h2>
                      <p className="text-gray-600 mb-3">{cashGame.description}</p>
                    </div>
                  </div>

                  {/* Cash Game Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Kategória</p>
                      <p className="font-bold text-sm text-poker-dark">Cash Game</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Tétek</p>
                      <p className="font-bold text-sm text-poker-primary">{cashGame.stakes}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Min. beszálló</p>
                      <p className="font-bold text-sm text-poker-green">{formatCurrency(cashGame.minBuyIn)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Kezdési dátum</p>
                      <p className="font-bold text-sm text-poker-dark">
                        {(cashGame as any).startDate ? new Date((cashGame as any).startDate).toLocaleDateString('hu-HU') : 'Nincs megadva'}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Menetrend</p>
                      <p className="font-bold text-sm text-poker-dark">{cashGame.schedule}</p>
                    </div>
                  </div>

                  {/* Game Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      ✓ Professzionális környezet
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      ✓ Élő dealer
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                      ✓ Ingyenes italszervíz
                    </span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      Max: {formatCurrency(cashGame.maxBuyIn)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a 
                      href="tel:+36309715832"
                      className="flex-1 btn-outline text-center"
                    >
                      <span className="mr-2">📞</span>
                      <span>Helyfoglalás</span>
                    </a>
                    
                    <Link href={`/cash-games/${cashGame.id}`} className="flex-1">
                      <button className="w-full btn-primary text-center">
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

        {!loading && filteredCashGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">♠</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nincs cash game asztal a kiválasztott szűrővel</h3>
            <p className="text-gray-500">Próbálj meg más szűrő beállításokat.</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-12 bg-gradient-to-r from-poker-primary to-poker-secondary rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Helyfoglalás és információ</h3>
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