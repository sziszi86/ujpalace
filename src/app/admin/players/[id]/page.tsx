'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
}

interface Transaction {
  id: number;
  transaction_type: 'deposit' | 'withdrawal';
  amount: number;
  transaction_date: string;
  notes?: string;
  created_at: string;
}

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        setLoading(true);
        
        const [playerResponse, transactionsResponse] = await Promise.all([
          fetch(`/api/admin/players/${playerId}`),
          fetch(`/api/admin/players/${playerId}/transactions`)
        ]);

        if (playerResponse.ok) {
          const playerData = await playerResponse.json();
          setPlayer(playerData);
        } else {
          setError('Játékos nem található');
          return;
        }

        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData);
        } else {
          console.error('Tranzakciók betöltése sikertelen');
          setTransactions([]);
        }
      } catch (error) {
        console.error('Hiba az adatok betöltésekor:', error);
        setError('Hiba történt az adatok betöltésekor');
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      loadPlayerData();
    }
  }, [playerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Játékos nem található'}
          </h1>
          <Link
            href="/admin/players"
            className="bg-poker-primary text-white px-6 py-3 rounded-lg hover:bg-poker-secondary transition-colors"
          >
            Vissza a játékosokhoz
          </Link>
        </div>
      </div>
    );
  }

  const getTransactionIcon = (type: 'deposit' | 'withdrawal') => {
    if (type === 'deposit') {
      return (
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/admin/players"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{player.name}</h1>
              <p className="text-gray-600">Játékos részletek és tranzakciók</p>
            </div>
          </div>
        </div>

        {/* Player Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Játékos adatok</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Név</label>
                <p className="text-gray-900">{player.name}</p>
              </div>
              {player.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <p className="text-gray-900">{player.phone}</p>
                </div>
              )}
              {player.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{player.email}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Státusz</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  player.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {player.active ? 'Aktív' : 'Inaktív'}
                </span>
              </div>
              {player.other_notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Megjegyzés</label>
                  <p className="text-gray-900">{player.other_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Összes befizetés</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(player.total_deposits || 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Összes kifizetés</h3>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(player.total_withdrawals || 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Mérleg</h3>
            <p className={`text-2xl font-bold ${
              (player.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(player.balance || 0)}
            </p>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Tranzakciók összesen</h2>
            <p className="text-gray-600 mt-1">Összes befizetés és kifizetés időrendi sorrendben</p>
          </div>
          
          <div className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Nincs tranzakció</div>
                <p className="text-gray-400 mt-2">Még nincs rögzített tranzakció ehhez a játékoshoz.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.transaction_type === 'deposit' ? 'Befizetés' : 'Kifizetés'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.transaction_date).toLocaleDateString('hu-HU')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      </div>
                      {transaction.notes && (
                        <p className="text-sm text-gray-600 mt-2">{transaction.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}