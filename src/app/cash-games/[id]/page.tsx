'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CashGame } from '@/types';
import { formatCurrency } from '@/utils/formatters';

export default function CashGameDetailPage() {
  const params = useParams();
  const cashGameId = params?.id as string;
  const [cashGame, setCashGame] = useState<CashGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const fetchCashGame = async () => {
      if (!cashGameId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/cash-games/${cashGameId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Cash game not found');
            return;
          }
          throw new Error('Failed to fetch cash game');
        }
        
        const foundCashGame = await response.json();
        
        if (!foundCashGame) {
          setError('Cash game not found');
          return;
        }
        
        setCashGame(foundCashGame);
      } catch (err) {
        setError('Failed to load cash game details');
        console.error('Error fetching cash game:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCashGame();
  }, [cashGameId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-poker-light to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-green"></div>
      </div>
    );
  }

  if (error || !cashGame) {
    return notFound();
  }

  const isLive = isTableLive(cashGame.schedule);

  const getGameIcon = (game: string) => {
    if (game.toLowerCase().includes('omaha')) return '♦';
    if (game.toLowerCase().includes('hold')) return '♠';
    return '♣';
  };

  const getGameColor = (game: string) => {
    if (game.toLowerCase().includes('omaha')) return 'from-red-500 to-red-600';
    if (game.toLowerCase().includes('hold')) return 'from-poker-darkgreen to-poker-green';
    return 'from-blue-500 to-blue-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-poker-light to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-poker-primary">Főoldal</Link></li>
            <li>/</li>
            <li><Link href="/cash-games" className="hover:text-poker-primary">Cash Games</Link></li>
            <li>/</li>
            <li className="text-gray-900">{cashGame.name}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className={`h-48 bg-gradient-to-r ${getGameColor(cashGame.game)} flex items-center justify-center relative`}>
            <div className="text-center text-white">
              <div className="text-6xl mb-2">{getGameIcon(cashGame.game)}</div>
              <div className="text-3xl font-bold">{cashGame.stakes}</div>
              <div className="text-lg opacity-90">{cashGame.game}</div>
              {isLive && (
                <div className="absolute top-4 right-4 flex items-center bg-green-500 rounded-full px-4 py-2">
                  <div className="w-3 h-3 bg-green-200 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-bold">ÉLŐ ASZTAL</span>
                </div>
              )}
              {cashGame.featured && (
                <div className="absolute top-4 left-4 bg-poker-red rounded-full px-4 py-2">
                  <span className="text-sm font-bold">⭐ KIEMELT</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{cashGame.name}</h1>
            {cashGame.description && (
              <p className="text-xl text-gray-600 mb-6">{cashGame.description}</p>
            )}
            
            {isLive && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-green-800 font-semibold">
                      Ez az asztal jelenleg élő! Gyere be és csatlakozz a játékhoz.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Game Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Játék információk</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Játék típus:</span>
                <span className="font-semibold">{cashGame.game}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Tétek:</span>
                <span className="font-semibold text-poker-primary">{cashGame.stakes}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Min. beszálló:</span>
                <span className="font-semibold text-green-600">{formatCurrency(cashGame.minBuyIn)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Max. beszálló:</span>
                <span className="font-semibold text-poker-gold">{formatCurrency(cashGame.maxBuyIn)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Helyszín:</span>
                <span className="font-semibold">{cashGame.venue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Állapot:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isLive ? 'bg-green-100 text-green-800' :
                  cashGame.active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isLive ? 'ÉLŐ ASZTAL' : cashGame.active ? 'Aktív' : 'Inaktív'}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Menetrend</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {cashGame.schedule}
                </div>
                <div className="text-sm text-gray-600">
                  {isLive ? '🟢 Jelenleg élő asztal' : '⚪ Jelenleg nem aktív'}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Részletek:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ Élő dealer</li>
                  <li>✓ Professzionális környezet</li>
                  <li>✓ Ingyenes italszervíz</li>
                  <li>✓ Kényelmes ülőhelyek</li>
                  <li>✓ Parkolási lehetőség</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Csatlakozás</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="tel:+36309715832"
              className={`flex-1 text-center py-4 px-6 rounded-lg font-semibold transition-colors ${
                isLive 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-poker-primary hover:bg-poker-secondary text-white'
              }`}
            >
              <span className="mr-2">📞</span>
              {isLive ? 'Azonnali helyfoglalás' : 'Helyfoglalás'}
            </a>
            <Link 
              href="/contact" 
              className="flex-1 text-center py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors"
            >
              <span className="mr-2">📧</span>
              Kapcsolat
            </Link>
            <Link 
              href="/cash-games" 
              className="flex-1 text-center py-4 px-6 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              <span className="mr-2">📅</span>
              Vissza a naptárhoz
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-gradient-to-r from-poker-primary to-poker-secondary rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Palace Poker Szombathely</h3>
          <p className="mb-6">Magyarország vezető pókertermében várunk minden szinten!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              <span>9700 Szombathely, Semmelweis u. 2.</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📞</span>
              <span>+36 30 971 5832</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}