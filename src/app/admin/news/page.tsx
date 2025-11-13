'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  publish_date: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  featured: boolean;
  author: string;
  read_time: number;
  created_at: string;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchNews();
  }, [filter]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/news?status=${filter}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: number) => {
    if (!confirm('Biztosan törlöd ezt a hírt?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNews(news.filter(item => item.id !== id));
        alert('Hír sikeresen törölve!');
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        alert('Hiba a hír törlésekor: ' + (errorData.error || 'Ismeretlen hiba'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Hiba a hír törlésekor: ' + error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hírek kezelése</h1>
            <p className="text-gray-600 mt-2">Blog és hírek szerkesztése</p>
          </div>
          <Link
            href="/admin/news/create"
            className="bg-poker-primary text-white px-6 py-3 rounded-lg hover:bg-poker-secondary transition-colors"
          >
            + Új hír
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary"
            >
              <option value="all">Minden hír</option>
              <option value="published">Publikált</option>
              <option value="draft">Piszkozat</option>
              <option value="archived">Archivált</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hír
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategória
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Státusz
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publikálás
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Műveletek
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {item.title}
                          {item.featured && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Kiemelt
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.excerpt && item.excerpt.substring(0, 100)}...
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.author} • {item.read_time} perc olvasás
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category || 'Nincs kategória'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'published' ? 'Publikált' : 
                       item.status === 'draft' ? 'Piszkozat' : 'Archivált'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(item.publish_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/news/${item.id}/edit`}
                        className="text-poker-primary hover:text-poker-secondary"
                      >
                        Szerkesztés
                      </Link>
                      <button
                        onClick={() => deleteNews(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Törlés
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {news.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Nincs megjeleníthető hír</div>
            <p className="text-gray-400 mt-2">
              Kezdj el új hírek létrehozásával!
            </p>
            <div className="mt-6">
              <Link
                href="/admin/news/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-poker-primary hover:bg-poker-secondary"
              >
                Első hír létrehozása
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}