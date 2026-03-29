'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardData {
  statistics: {
    tournaments: { total: number; upcoming: number; active: number; featured: number };
    cashGames: { total: number; active: number };
    structures: { total: number; active: number };
    banners: { total: number; active: number };
  };
  popularContent: {
    tournaments: Array<{ category: string; count: number; avgBuyIn: number }>;
    cashGames: Array<{ stakes: string; count: number; avgMinBuyIn: number }>;
  };
  upcomingEvents: Array<{
    title: string;
    date: string;
    time: string;
    buyIn: number;
    category: string;
    type: string;
  }>;
  playerStats?: {
    topDepositor: {
      id: number;
      name: string;
      total_deposits: number;
    };
    totalDeposits: number;
    totalWithdrawals: number;
    resetDate?: string;
    recentTransactions: Array<{
      type: 'deposit' | 'withdrawal';
      playerName: string;
      amount: number;
      date: string;
    }>;
  };
  systemStatus: {
    database: { status: string; lastCheck: string };
    website: { status: string; uptime: string; currentVisitors?: number };
    backup: { status: string; lastBackup: string; nextScheduled: string };
  };
}

interface AnalyticsSummary {
  currentOnline: number;
  lastWeekVisitors: number;
  topTournament?: {
    title: string;
    views: number;
  };
}


export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data);
        console.log('Recent transactions:', data.playerStats?.recentTransactions);
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics?days=7');
      if (response.ok) {
        const data = await response.json();
        setAnalytics({
          currentOnline: data.currentOnline || 0,
          lastWeekVisitors: data.lastWeek?.totalVisitors || 0,
          topTournament: data.topTournaments?.[0] ? {
            title: data.topTournaments[0].title || data.topTournaments[0].path,
            views: data.topTournaments[0].total_views,
          } : undefined,
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchDashboardData();
      await fetchAnalytics();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleResetTotals = async () => {
    if (!confirm('Biztosan nullázni szeretnéd az összes pénzügyi összesítőt? Ez új számláló periódust indít, de a tranzakciók megmaradnak.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/dashboard/reset-totals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: `Manuális nullázás - ${new Date().toLocaleDateString('hu-HU')}`
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        await fetchDashboardData();
      } else {
        alert('Hiba a nullázás során');
      }
    } catch (error) {
      alert('Hiba a nullázás során');
      console.error('Reset error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU') + ' ' + date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU').format(amount) + ' Ft';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Hiba történt az adatok betöltése során.</div>;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Palace Poker Szombathely tartalomkezelő rendszer</p>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Most Online */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">🔴 Most online</p>
              <p className="text-4xl font-bold text-green-600 mt-1">
                {analytics?.currentOnline || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                látogató (utolsó 5 percben)
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Múlt heti látogatók */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">📊 Múlt hét (7 nap)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {analytics?.lastWeekVisitors || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                egyedi látogató
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Legnézettebb verseny */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">🏆 Legnézettebb verseny</p>
              {analytics?.topTournament ? (
                <>
                  <p className="text-lg font-bold text-gray-900 mt-1 truncate max-w-[180px]">
                    {analytics.topTournament.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.topTournament.views} megtekintés
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 mt-1">Nincs adat</p>
              )}
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-poker-gold rounded-lg">
              <svg className="w-6 h-6 text-poker-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Közelgő versenyek</h3>
              <p className="text-3xl font-bold text-poker-primary">{dashboardData.statistics.tournaments.upcoming}</p>
              <p className="text-sm text-black">Összes: {dashboardData.statistics.tournaments.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Cash Game-ek</h3>
              <p className="text-3xl font-bold text-blue-500">{dashboardData.statistics.cashGames.active}</p>
              <p className="text-sm text-black">Összes: {dashboardData.statistics.cashGames.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Struktúrák</h3>
              <p className="text-3xl font-bold text-purple-500">{dashboardData.statistics.structures.active}</p>
              <p className="text-sm text-black">Összes: {dashboardData.statistics.structures.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Bannerek</h3>
              <p className="text-3xl font-bold text-green-500">{dashboardData.statistics.banners.active}</p>
              <p className="text-sm text-black">Összes: {dashboardData.statistics.banners.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Player Statistics & Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Depositing Player */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Legtöbbet befizető játékos</h2>
          </div>
          <div className="p-6">
            {dashboardData.playerStats?.topDepositor ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">
                    {dashboardData.playerStats.topDepositor.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 text-lg">
                  {dashboardData.playerStats.topDepositor.name}
                </h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(dashboardData.playerStats.topDepositor.total_deposits)}
                </p>
                <p className="text-sm text-gray-500 mt-1">összes befizetés</p>
                <div className="mt-4">
                  <Link
                    href={`/admin/players/${dashboardData.playerStats.topDepositor.id}`}
                    className="text-poker-primary hover:text-poker-secondary font-medium text-sm"
                  >
                    Részletek megtekintése →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Nincs adat</p>
              </div>
            )}
          </div>
        </div>

        {/* Total Financial Summary */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Pénzügyi összesítő</h2>
              <div className="flex space-x-2">
                <Link
                  href="/admin/financial-archive"
                  className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded"
                  title="Archívum megtekintése"
                >
                  📊 Archívum
                </Link>
                <button
                  onClick={handleResetTotals}
                  className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                  title="Összesítő nullázása"
                >
                  Nullázás
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Összes befizetés</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardData.playerStats?.totalDeposits || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Összes kifezetés</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(dashboardData.playerStats?.totalWithdrawals || 0)}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-500">Mérleg</p>
                <p className={`text-2xl font-bold ${
                  (dashboardData.playerStats?.totalDeposits || 0) >= (dashboardData.playerStats?.totalWithdrawals || 0)
                    ? 'text-blue-600' 
                    : 'text-orange-600'
                }`}>
                  {formatCurrency((dashboardData.playerStats?.totalDeposits || 0) - (dashboardData.playerStats?.totalWithdrawals || 0))}
                </p>
              </div>
              {dashboardData.playerStats?.resetDate && (
                <div className="text-xs text-gray-400">
                  Utolsó nullázás: {formatDate(dashboardData.playerStats.resetDate)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Legutóbbi aktivitás</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.playerStats?.recentTransactions && dashboardData.playerStats.recentTransactions.length > 0 ? (
                dashboardData.playerStats.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {transaction.playerName || transaction.playername || 'Ismeretlen játékos'}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <p className={`font-medium ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  <p>Nincs közeli aktivitás</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Link
                href="/admin/players"
                className="text-poker-primary hover:text-poker-secondary font-medium text-sm"
              >
                Összes játékos kezelése →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Rendszer állapot</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  dashboardData.systemStatus.database.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Adatbázis kapcsolat</p>
                  <p className="text-xs text-black">
                    {dashboardData.systemStatus.database.status === 'online' ? 'Működik' : 'Hiba'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Weboldal</p>
                  <p className="text-xs text-black">
                    Online ({dashboardData.systemStatus.website.uptime})
                    {dashboardData.systemStatus.website.currentVisitors !== undefined && (
                      <> • {dashboardData.systemStatus.website.currentVisitors} aktív látogató</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Gyors műveletek</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/news/create"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-poker-primary hover:bg-poker-primary/5 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 0a2 2 0 00-2-2H9.5a2 2 0 00-2 2v12a2 2 0 002 2H17a2 2 0 002-2V7z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Új hír</span>
            </Link>

            <Link
              href="/admin/tournaments/new"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-poker-primary hover:bg-poker-primary/5 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Új verseny</span>
            </Link>
            
            <Link
              href="/admin/cash-games/create"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-poker-primary hover:bg-poker-primary/5 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Új Cash Game</span>
            </Link>
            
            <Link
              href="/admin/banners/create"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-poker-primary hover:bg-poker-primary/5 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Új banner</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Additional Quick Actions */}
      <div className="bg-white rounded-lg shadow mt-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Média kezelés</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href="/admin/gallery"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-poker-primary hover:bg-poker-primary/5 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Galéria kezelés</span>
            </Link>

            <Link
              href="/gallery"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-poker-primary hover:bg-poker-primary/5 transition-colors"
              target="_blank"
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Galéria megtekintése</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}