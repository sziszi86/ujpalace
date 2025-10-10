'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatters';

interface Player {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  other_notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  total_deposits?: number;
  total_withdrawals?: number;
  balance?: number;
  transaction_count?: number;
  recent_transactions?: Transaction[];
}

interface Transaction {
  transaction_type: 'deposit' | 'withdrawal';
  amount: number;
  transaction_date: string;
  notes?: string;
}

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionNotes, setTransactionNotes] = useState('');
  const itemsPerPage = 50;

  const formatTooltip = (transaction: Transaction) => {
    const type = transaction.transaction_type === 'deposit' ? 'Befizetés' : 'Kifizetés';
    const amount = formatCurrency(transaction.amount);
    const date = new Date(transaction.transaction_date).toLocaleDateString('hu-HU');
    const notes = transaction.notes ? `\nMegjegyzés: ${transaction.notes}` : '';
    return `${type}: ${amount}\nDátum: ${date}${notes}`;
  };

  const exportToCSV = () => {
    const csvHeaders = [
      'ID',
      'Név',
      'Telefon',
      'Email',
      'Jegyzet',
      'Státusz',
      'Befizetések',
      'Kibefizetések',
      'Mérleg',
      'Tranzakciók száma',
      'Létrehozva',
      'Frissítve'
    ].join(',');

    const csvData = filteredPlayers.map(player => [
      player.id,
      `"${player.name}"`,
      `"${player.phone || ''}"`,
      `"${player.email || ''}"`,
      `"${player.other_notes || ''}"`,
      player.active ? 'Aktív' : 'Inaktív',
      player.total_deposits || 0,
      player.total_withdrawals || 0,
      player.balance || 0,
      player.transaction_count || 0,
      new Date(player.created_at).toLocaleDateString('hu-HU'),
      new Date(player.updated_at).toLocaleDateString('hu-HU')
    ].join(',')).join('\n');

    const csvContent = csvHeaders + '\n' + csvData;
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `jatekosok_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadPlayers = async () => {
    try {
      const response = await fetch('/api/admin/players');
      let players: Player[] = [];
      
      if (response.ok) {
        players = await response.json();
      } else {
        console.error('API nem elérhető');
        players = [];
      }
      
      setPlayers(players);
    } catch (error) {
      console.error('Hiba a játékosok betöltésekor:', error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const handleTransaction = (player: Player, type: 'deposit' | 'withdrawal') => {
    setSelectedPlayer(player);
    setTransactionType(type);
    setTransactionAmount('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setTransactionNotes('');
    setShowTransactionModal(true);
  };

  const handleSubmitTransaction = async () => {
    if (!selectedPlayer || !transactionAmount) return;

    try {
      const response = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: selectedPlayer.id,
          transaction_type: transactionType,
          amount: parseFloat(transactionAmount),
          transaction_date: transactionDate,
          notes: transactionNotes || null
        })
      });

      if (response.ok) {
        setShowTransactionModal(false);
        loadPlayers(); // Refresh the list
      } else {
        alert('Hiba történt a tranzakció rögzítésekor');
      }
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Hiba történt a tranzakció rögzítésekor');
    }
  };

  const handleDeletePlayer = async (player: Player) => {
    if (!confirm(`Biztosan törölni szeretné ${player.name} játékost?`)) return;

    try {
      const response = await fetch(`/api/admin/players/${player.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadPlayers(); // Refresh the list
      } else {
        alert('Hiba történt a játékos törlésekor');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Hiba történt a játékos törlésekor');
    }
  };


  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (player.phone || '').includes(searchTerm) ||
                         (player.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && player.active) ||
                         (filter === 'inactive' && !player.active);
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Játékosok kezelése</h1>
              <p className="text-gray-600 mt-2">Játékosok és tranzakcióik kezelése</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <Link
                href="/admin/players/new"
                className="bg-poker-primary text-white px-6 py-3 rounded-lg hover:bg-poker-secondary transition-colors"
              >
                + Új játékos
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Keresés név, telefon vagy email alapján..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary"
                >
                  <option value="all">Minden játékos</option>
                  <option value="active">Aktív</option>
                  <option value="inactive">Inaktív</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Játékos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Legutóbbi aktivitás
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Befizetések
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kibefizetések
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mérleg
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-poker-primary flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {player.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {player.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-1">
                        {player.recent_transactions && player.recent_transactions.length > 0 ? (
                          player.recent_transactions.map((transaction, index) => (
                            <div key={index} className="flex items-center space-x-1">
                              {transaction.transaction_type === 'deposit' ? (
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center" title={formatTooltip(transaction)}>
                                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center" title={formatTooltip(transaction)}>
                                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">Nincs aktivitás</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency(player.total_deposits || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {formatCurrency(player.total_withdrawals || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`${
                        (player.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(player.balance || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTransaction(player, 'deposit')}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Befizetés"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleTransaction(player, 'withdrawal')}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Kifizetés"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <Link
                          href={`/admin/players/${player.id}`}
                          className="text-poker-primary hover:text-poker-secondary p-1"
                          title="Részletek"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/players/${player.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Szerkesztés"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeletePlayer(player)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Törlés"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {currentPlayers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Nincs megjeleníthető játékos</div>
              <p className="text-gray-400 mt-2">
                {searchTerm ? 'Próbálj meg más keresési feltételekkel.' : 'Még nincs hozzáadva játékos.'}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {startIndex + 1}-{Math.min(endIndex, filteredPlayers.length)} / {filteredPlayers.length} játékos
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Előző
                </button>
                <span className="px-3 py-2 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Következő
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {transactionType === 'deposit' ? 'Befizetés' : 'Kifizetés'} - {selectedPlayer?.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Összeg (Ft)
                  </label>
                  <input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                    placeholder="Adja meg az összeget"
                    min="1"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dátum
                  </label>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Megjegyzés (opcionális)
                  </label>
                  <textarea
                    value={transactionNotes}
                    onChange={(e) => setTransactionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                    placeholder="Opcionális megjegyzés"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Mégse
                </button>
                <button
                  onClick={handleSubmitTransaction}
                  disabled={!transactionAmount}
                  className={`px-4 py-2 rounded-md text-white ${
                    transactionType === 'deposit' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {transactionType === 'deposit' ? 'Befizetés rögzítése' : 'Kifizetés rögzítése'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}