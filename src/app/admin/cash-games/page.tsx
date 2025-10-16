'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatters';
import { CashGame } from '@/types';

export default function CashGamesAdmin() {
  const [cashGames, setCashGames] = useState<CashGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCashGames = async () => {
      try {
        const response = await fetch('/api/admin/cash-games', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (response.ok) {
          const cashGamesData = await response.json();
          // Convert database format to admin format
          const formattedCashGames = cashGamesData.map((game: any) => ({
            id: game.id,
            name: game.name,
            stakes: game.stakes,
            game: game.game || game.game_type || 'NLH',
            minBuyIn: Number(game.min_buyin) || Number(game.minBuyIn) || 0,
            maxBuyIn: Number(game.max_buyin) || Number(game.maxBuyIn) || 0,
            schedule: game.schedule || 'Hétfő-Vasárnap 18:00-06:00',
            active: game.active === 1 || game.active === true || game.active !== 0,
            featured: game.featured === 1 || game.featured === true || game.featured !== 0,
            visibleFrom: '2025-01-01',
            visibleUntil: '2025-12-31',
            description: game.description || '',
            image: game.image_url || game.image || ''
          }));
          setCashGames(formattedCashGames);
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

  const handleDelete = async (id: number) => {
    if (confirm('Biztosan törölni szeretnéd ezt a cash game-et?')) {
      try {
        const response = await fetch(`/api/admin/cash-games/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (response.ok) {
          setCashGames(cashGames.filter(game => game.id !== id));
        } else {
          console.error('Failed to delete cash game');
        }
      } catch (error) {
        console.error('Error deleting cash game:', error);
      }
    }
  };

  const handleToggleActive = async (id: number) => {
    const game = cashGames.find(g => g.id === id);
    if (!game) return;
    
    try {
      const response = await fetch(`/api/admin/cash-games/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          name: game.name,
          stakes: game.stakes,
          minBuyIn: game.minBuyIn,
          maxBuyIn: game.maxBuyIn,
          schedule: game.schedule,
          description: game.description || '',
          image: game.image || '',
          active: !game.active,
          featured: game.featured,
          scheduledDates: []
        })
      });
      if (response.ok) {
        setCashGames(cashGames.map(game => 
          game.id === id ? { ...game, active: !game.active } : game
        ));
      } else {
        console.error('Failed to update cash game status');
      }
    } catch (error) {
      console.error('Error updating cash game status:', error);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    const game = cashGames.find(g => g.id === id);
    if (!game) return;
    
    try {
      const response = await fetch(`/api/admin/cash-games/${id}/featured`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ featured: !game.featured })
      });
      
      const responseData = await response.json();
      console.log('Response:', response.status, responseData);
      
      if (response.ok) {
        setCashGames(cashGames.map(game => 
          game.id === id ? { ...game, featured: !game.featured } : game
        ));
      } else {
        console.error('Failed to update cash game featured status:', responseData);
      }
    } catch (error) {
      console.error('Error updating cash game featured status:', error);
    }
  };

  const handleDuplicate = async (cashGame: CashGame) => {
    try {
      const response = await fetch(`/api/admin/cash-games/${cashGame.id}/duplicate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
      });
      if (response.ok) {
        const newCashGameData = await response.json();
        // Convert API response to frontend format
        const newCashGame = {
          id: newCashGameData.id,
          name: newCashGameData.name,
          stakes: newCashGameData.stakes,
          game: cashGame.game,
          minBuyIn: newCashGameData.min_buyin,
          maxBuyIn: newCashGameData.max_buyin,
          schedule: newCashGameData.schedule,
          active: newCashGameData.active,
          visibleFrom: '2025-01-01',
          visibleUntil: '2025-12-31',
          description: newCashGameData.description,
          image: ''
        };
        setCashGames([...cashGames, newCashGame]);
        alert('Cash game sikeresen duplikálva!');
      } else {
        console.error('Failed to duplicate cash game');
        alert('Hiba történt a duplikálás során!');
      }
    } catch (error) {
      console.error('Error duplicating cash game:', error);
      alert('Hiba történt a duplikálás során!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-green"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Game kezelés</h1>
          <p className="text-gray-600 mt-2">Cash game asztalok létrehozása és kezelése</p>
        </div>
        <Link
          href="/admin/cash-games/create"
          className="bg-poker-green hover:bg-poker-darkgreen text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Új Cash Game
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-poker-green rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Összes Cash Game</p>
              <p className="text-2xl font-bold text-gray-900">{cashGames.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktív</p>
              <p className="text-2xl font-bold text-gray-900">{cashGames.filter(g => g.active).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kiemelt</p>
              <p className="text-2xl font-bold text-gray-900">{cashGames.filter(g => g.featured).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Games List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Cash Game asztalok ({cashGames.length})</h2>
        </div>
        
        {cashGames.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nincsenek cash game asztalok</h3>
            <p className="mt-2 text-gray-500">Kezdj egy új cash game asztal létrehozásával.</p>
            <div className="mt-6">
              <Link
                href="/admin/cash-games/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-poker-green hover:bg-poker-darkgreen"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Új Cash Game
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cash Game
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tétek
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buy-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Menetrend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Látható
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Állapot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kiemelt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cashGames.map((cashGame) => (
                  <tr key={cashGame.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cashGame.name}</div>
                        <div className="text-sm text-gray-500">{cashGame.game}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cashGame.stakes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(cashGame.minBuyIn)} - {formatCurrency(cashGame.maxBuyIn)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cashGame.schedule}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {cashGame.visibleFrom} - {cashGame.visibleUntil}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(cashGame.id)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          cashGame.active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {cashGame.active ? 'Aktív' : 'Inaktív'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(cashGame.id)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          cashGame.featured
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {cashGame.featured ? '⭐ Kiemelt' : 'Normál'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/cash-games/edit/${cashGame.id}`}
                          className="p-2 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                          title="Szerkesztés"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        
                        <button
                          onClick={() => handleDuplicate(cashGame)}
                          className="p-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                          title="Duplikálás"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleDelete(cashGame.id)}
                          className="p-2 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                          title="Törlés"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}