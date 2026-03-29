'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  summary: {
    totalViews: number;
    totalVisitors: number;
    avgDailyViews: number;
    growth: number;
  };
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  dailyStats: Array<{
    date: string;
    total_views: number;
    unique_visitors: number;
    mobile_views: number;
    desktop_views: number;
    tablet_views: number;
  }>;
  topPages: Array<{
    path: string;
    title: string;
    total_views: number;
    unique_visitors: number;
  }>;
  referrers: Array<{
    referrer_domain: string;
    total_views: number;
  }>;
  today: any;
  yesterday: any;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics?days=${period}`);
        if (response.ok) {
          const analyticsData = await response.json();
          setData(analyticsData);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Hiba történt az adatok betöltése során.</p>
        <p className="text-sm text-gray-500 mt-2">Ellenőrizd, hogy futott-e a migration.</p>
      </div>
    );
  }

  const maxViews = Math.max(...data.dailyStats.map(d => d.total_views), 1);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📈 Látogatottsági Statisztikák</h1>
            <p className="text-gray-600 mt-2">Saját analitika - PostgreSQL (Railway)</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPeriod(7)}
              className={`px-4 py-2 rounded ${
                period === 7 ? 'bg-poker-primary text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              7 nap
            </button>
            <button
              onClick={() => setPeriod(30)}
              className={`px-4 py-2 rounded ${
                period === 30 ? 'bg-poker-primary text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              30 nap
            </button>
            <button
              onClick={() => setPeriod(90)}
              className={`px-4 py-2 rounded ${
                period === 90 ? 'bg-poker-primary text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              90 nap
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Összes megtekintés</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.summary.totalViews.toLocaleString('hu-HU')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Átlag: {data.summary.avgDailyViews.toLocaleString('hu-HU')} / nap
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          {data.summary.growth !== 0 && (
            <div className={`mt-2 text-sm ${
              data.summary.growth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.summary.growth > 0 ? '↑' : '↓'} {Math.abs(data.summary.growth)}% vs tegnap
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Eszköz megoszlás</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Desktop
                  </span>
                  <span className="font-medium">{data.deviceBreakdown.desktop}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Mobile
                  </span>
                  <span className="font-medium">{data.deviceBreakdown.mobile}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Tablet
                  </span>
                  <span className="font-medium">{data.deviceBreakdown.tablet}%</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Mai nap</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.today?.total_views || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.today?.unique_visitors || 0} egyedi látogató
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          {data.yesterday && (
            <div className="mt-2 text-xs text-gray-500">
              Tegnap: {data.yesterday.total_views} megtekintés
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Top források</p>
              <div className="mt-2 space-y-1">
                {data.referrers.slice(0, 3).map((ref, i) => (
                  <div key={i} className="text-xs text-gray-600 flex items-center justify-between">
                    <span className="truncate max-w-[100px]">{ref.referrer_domain}</span>
                    <span className="font-medium">{ref.total_views}</span>
                  </div>
                ))}
                {data.referrers.length === 0 && (
                  <p className="text-xs text-gray-400">Nincs adat</p>
                )}
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Napi megtekintések</h2>
        <div className="h-64 flex items-end space-x-2">
          {data.dailyStats.map((day) => (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center group relative"
            >
              <div
                className="w-full bg-gradient-to-t from-poker-primary to-poker-secondary rounded-t transition-all duration-200 group-hover:opacity-80"
                style={{ height: `${(day.total_views / maxViews) * 200}px` }}
              ></div>
              <div className="mt-2 text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                {formatDate(day.date)}
              </div>
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                <div>{day.total_views} megtekintés</div>
                <div>{day.unique_visitors} látogató</div>
                <div className="text-gray-300 text-xs">
                  M: {day.mobile_views} | D: {day.desktop_views} | T: {day.tablet_views}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">📄 Legnézettebb oldalak</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {data.topPages.map((page, i) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {page.title || page.path}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{page.path}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{page.total_views}</p>
                    <p className="text-xs text-gray-500">{page.unique_visitors} egyedi</p>
                  </div>
                </div>
              ))}
              {data.topPages.length === 0 && (
                <p className="text-gray-500 text-center py-4">Nincs adat</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">🔗 Források</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {data.referrers.map((ref, i) => (
                <div
                  key={ref.referrer_domain}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ref.referrer_domain}
                    </p>
                    <p className="text-xs text-gray-500">Külső hivatkozás</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{ref.total_views}</p>
                    <p className="text-xs text-gray-500">megtekintés</p>
                  </div>
                </div>
              ))}
              {data.referrers.length === 0 && (
                <p className="text-gray-500 text-center py-4">Nincs külső forrás adat</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-blue-900">🎉 Saját, ingyenes analitika!</h3>
            <div className="mt-2 text-sm text-blue-800">
              <ul className="list-disc list-inside space-y-1">
                <li>Nincs havidíj (Railway PostgreSQL-en)</li>
                <li>Az adatok nálad maradnak (GDPR barát)</li>
                <li>Nem használ sütiket (nincs cookie banner)</li>
                <li>IP címek hashelve vannak tárolva</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
