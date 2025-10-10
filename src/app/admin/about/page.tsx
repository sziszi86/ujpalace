'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AboutPage {
  id: number;
  title: string;
  content: string;
  features?: string[] | null;
  image?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminAboutPage() {
  const [aboutPages, setAboutPages] = useState<AboutPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutPages = async () => {
      try {
        const response = await fetch('/api/admin/about');
        if (response.ok) {
          const data = await response.json();
          setAboutPages(data);
        } else {
          console.error('Failed to fetch about pages');
        }
      } catch (error) {
        console.error('Error fetching about pages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAboutPages();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt az oldalt?')) {
      try {
        const response = await fetch(`/api/admin/about/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete about page');
        }
        
        setAboutPages(aboutPages.filter(page => page.id !== id));
        alert('Oldal sikeresen törölve!');
      } catch (error) {
        alert('Hiba történt a törlés során!');
      }
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const page = aboutPages.find(p => p.id === id);
      if (!page) return;
      
      const response = await fetch(`/api/admin/about/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: page.title,
          content: page.content,
          features: page.features,
          image: page.image,
          active: !page.active,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle page status');
      }
      
      setAboutPages(aboutPages.map(p => 
        p.id === id ? { ...p, active: !p.active } : p
      ));
    } catch (error) {
      alert('Hiba történt a frissítés során!');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}. ${month.toString().padStart(2, '0')}. ${day.toString().padStart(2, '0')}.`;
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rólunk oldalak kezelése</h1>
          <p className="text-gray-600 mt-2">Rólunk oldal tartalmát adhatsz hozzá, szerkesztheted és törölheted</p>
        </div>
        <Link
          href="/admin/about/edit/new"
          className="bg-poker-primary text-white px-6 py-3 rounded-lg hover:bg-poker-secondary transition-colors font-medium"
        >
          + Új oldal hozzáadása
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oldal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tartalom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tulajdonságok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Státusz
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Műveletek
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aboutPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {page.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        Létrehozva: {formatDate(page.created_at)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Frissítve: {formatDate(page.updated_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <div className="truncate">
                        {page.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </div>
                      {page.image && (
                        <div className="text-xs text-green-600 mt-1">
                          Kép csatolva
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {page.features && page.features.length > 0 ? (
                        <div>
                          <div className="font-medium">Tulajdonságok: {page.features.length}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {page.features.slice(0, 2).map((feature, idx) => (
                              <div key={idx} className="truncate">• {feature}</div>
                            ))}
                            {page.features.length > 2 && (
                              <div className="text-gray-400">...és {page.features.length - 2} további</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Nincs tulajdonság</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      page.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {page.active ? 'Aktív' : 'Inaktív'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => toggleActive(page.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          page.active
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                        title={page.active ? 'Inaktiválás' : 'Aktiválás'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {page.active ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          )}
                        </svg>
                      </button>
                      <Link
                        href={`/admin/about/edit/${page.id}`}
                        className="p-2 rounded-lg bg-poker-primary/10 text-poker-primary hover:bg-poker-primary/20 transition-colors"
                        title="Szerkesztés"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(page.id)}
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

        {aboutPages.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nincsenek oldalak</h3>
            <p className="mt-1 text-sm text-gray-500">Kezdd el az első oldal hozzáadásával.</p>
            <div className="mt-6">
              <Link
                href="/admin/about/edit/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-poker-primary hover:bg-poker-secondary"
              >
                + Új oldal hozzáadása
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}