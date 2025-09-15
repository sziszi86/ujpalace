'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAlert } from '@/components/admin/Alert';

interface Banner {
  id: number;
  title: string;
  description: string;
  image_url: string;
  active: number;
  visible_from: string;
  visible_until: string;
  order_position: number;
}

export default function BannersAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          // Redirect to login if no token
          window.location.href = '/admin/login';
          return;
        }

        const response = await fetch('/api/admin/banners', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setBanners(data);
        } else {
          console.error('Failed to fetch banners:', response.statusText);
          setBanners([]);
        }
      } catch (error) {
        console.error('Error loading banners:', error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  const reloadBanners = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('/api/admin/banners', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
        // Event dispatch for frontend updates
        window.dispatchEvent(new CustomEvent('bannersUpdated'));
      }
    } catch (error) {
      console.error('Error reloading banners:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Biztosan törölni szeretnéd ezt a bannert?')) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          showAlert('Nem vagy bejelentkezve!', 'error');
          return;
        }

        const response = await fetch(`/api/admin/banners?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          await reloadBanners();
          showAlert('Banner sikeresen törölve!', 'success');
        } else {
          throw new Error('Failed to delete banner');
        }
      } catch (error) {
        showAlert('Hiba történt a törlés során!', 'error');
        console.error('Delete error:', error);
      }
    }
  };

  const handleToggleActive = async (id: number) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        showAlert('Nem vagy bejelentkezve!', 'error');
        return;
      }

      const response = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: banner.id,
          title: banner.title,
          description: banner.description,
          image_url: banner.image_url,
          active: banner.active === 1 ? 0 : 1,
          visible_from: banner.visible_from,
          visible_until: banner.visible_until,
          order_position: banner.order_position,
        }),
      });

      if (response.ok) {
        await reloadBanners();
      } else {
        throw new Error('Failed to update banner');
      }
    } catch (error) {
      showAlert('Hiba történt a frissítés során!', 'error');
      console.error('Toggle active error:', error);
    }
  };

  const handleDuplicate = async (banner: Banner) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        showAlert('Nem vagy bejelentkezve!', 'error');
        return;
      }

      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `${banner.title} (másolat)`,
          description: banner.description,
          image_url: banner.image_url,
          active: banner.active,
          visible_from: banner.visible_from,
          visible_until: banner.visible_until,
          order_position: Math.max(...banners.map(b => b.order_position)) + 1,
        }),
      });

      if (response.ok) {
        await reloadBanners();
        showAlert('Banner sikeresen duplikálva!', 'success');
      } else {
        throw new Error('Failed to duplicate banner');
      }
    } catch (error) {
      showAlert('Hiba történt a duplikálás során!', 'error');
      console.error('Duplicate error:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Banner kezelés</h1>
          <p className="text-gray-600 mt-2">Bannerek létrehozása és kezelése</p>
        </div>
        <Link
          href="/admin/banners/create"
          className="bg-poker-green hover:bg-poker-darkgreen text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Új Banner
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Összes Banner</p>
              <p className="text-2xl font-bold text-gray-900">{banners.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{banners.filter(b => b.active === 1).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-400 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inaktív</p>
              <p className="text-2xl font-bold text-gray-900">{banners.filter(b => b.active === 0).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Bannerek ({banners.length})</h2>
        </div>
        
        {banners.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nincsenek bannerek</h3>
            <p className="mt-2 text-gray-500">Kezdj egy új banner létrehozásával.</p>
            <div className="mt-6">
              <Link
                href="/admin/banners/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-poker-green hover:bg-poker-darkgreen"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Új Banner
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {banners
              .sort((a, b) => a.order_position - b.order_position)
              .map((banner) => (
              <div key={banner.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {/* Banner Image */}
                  <div className="flex-shrink-0">
                    {banner.image_url ? (
                      <img
                        className="h-20 w-32 object-cover rounded-lg border"
                        src={banner.image_url}
                        alt={banner.title}
                      />
                    ) : (
                      <div className="h-20 w-32 bg-gray-200 rounded-lg border flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Banner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {banner.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {banner.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-400 mt-2 space-x-4">
                          <span>Sorrend: {banner.order_position}</span>
                          <span>{banner.visible_from} - {banner.visible_until || 'Nincs határidő'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(banner.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        banner.active === 1
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {banner.active === 1 ? 'Aktív' : 'Inaktív'}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/banners/edit/${banner.id}`}
                        className="p-2 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        title="Szerkesztés"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      
                      <button
                        onClick={() => handleDuplicate(banner)}
                        className="p-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                        title="Duplikálás"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                        title="Törlés"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}