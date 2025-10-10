'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingTime, setLoadingTime] = useState(0);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to admin if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  // Auto-refresh timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (authLoading) {
      interval = setInterval(() => {
        setLoadingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 25) {
            setShowRefreshMessage(true);
            // Auto refresh after 25 seconds
            setTimeout(() => {
              window.location.reload();
            }, 3000); // Wait 3 seconds to show the message, then refresh
          }
          return newTime;
        });
      }, 1000);
    } else {
      setLoadingTime(0);
      setShowRefreshMessage(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authLoading]);

  // Show loading while checking auth with auto-refresh after 25 seconds
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Betöltés...</p>
          {showRefreshMessage ? (
            <div className="mt-2">
              <p className="text-sm text-red-600 font-medium">Túl sokáig tart, automatikusan frissítjük az oldalt...</p>
              <p className="text-xs text-gray-500 mt-1">3 másodperc múlva...</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              {loadingTime < 20 ? `Betöltés... (${loadingTime}s)` : 'Ha túl sokáig tart, hamarosan automatikusan frissítjük az oldalt.'}
            </p>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        // Automatikus frissítés a bejelentkezés után
        window.location.href = '/admin';
      } else {
        setError('Helytelen email vagy jelszó!');
      }
    } catch (error) {
      setError('Bejelentkezési hiba történt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Palace Poker Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bejelentkezés a kezelőfelületbe
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email cím
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Jelszó
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Teszt bejelentkezés
                </span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Teszt admin:</p>
              <p>Email: admin@palace-poker.hu</p>
              <p>Jelszó: admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}