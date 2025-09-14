'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import BannerImageUploader from '@/components/admin/BannerImageUploader';
import { useAlert } from '@/components/admin/Alert';

interface BannerFormData {
  title: string;
  description: string;
  image: string;
  active: boolean;
  visibleFrom: string;
  visibleUntil: string;
  order: string;
  url: string;
  customUrl: string;
  openInNewTab: boolean;
  hasExpiryDate: boolean;
}

export default function EditBanner() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { showAlert } = useAlert();
  const currentImageUrlRef = useRef<string>('');
  const [urlOptions, setUrlOptions] = useState<Array<{value: string, label: string, type: string}>>([]);
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    description: '',
    image: '',
    active: true,
    visibleFrom: '',
    visibleUntil: '',
    order: '1',
    url: '',
    customUrl: '',
    openInNewTab: false,
    hasExpiryDate: false
  });

  useEffect(() => {
    const loadUrlOptions = async () => {
      try {
        const response = await fetch('/api/options');
        if (response.ok) {
          const options = await response.json();
          setUrlOptions(options);
        } else {
          console.error('Failed to load URL options');
        }
      } catch (error) {
        console.error('Error loading URL options:', error);
      }
    };

    const loadBanner = async () => {
      try {
        const response = await fetch('/api/banners');
        if (response.ok) {
          const banners = await response.json();
          const banner = banners.find((b: any) => b.id === parseInt(bannerId));
          
          if (banner) {
            console.log('Banner loaded from database:', banner);
            console.log('Banner image URL:', banner.image);
            
            // Initialize ref with loaded image
            currentImageUrlRef.current = banner.image;
            
            setFormData({
              title: banner.title,
              description: banner.description,
              image: banner.image,
              active: banner.active,
              visibleFrom: banner.visibleFrom,
              visibleUntil: banner.visibleUntil,
              order: banner.order.toString(),
              url: banner.url || '',
              customUrl: banner.customUrl || '',
              openInNewTab: banner.openInNewTab || false,
              hasExpiryDate: banner.hasExpiryDate || false
            });
          } else {
            showAlert('Banner nem található!', 'error');
            router.push('/admin/banners');
          }
        } else {
          showAlert('Hiba történt a banner betöltésekor.', 'error');
        }
      } catch (error) {
        console.error('Hiba a banner betöltésekor:', error);
        showAlert('Hiba történt a banner betöltésekor.', 'error');
      } finally {
        setPageLoading(false);
      }
    };

    loadUrlOptions();
    loadBanner();
  }, [bannerId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleImageSelect = (imageUrl: string) => {
    console.log('Banner edit - handleImageSelect called with:', imageUrl);
    
    // Update both state and ref
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }));
    currentImageUrlRef.current = imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('=== BANNER SUBMIT START ===');
    console.log('formData being submitted:', formData);
    console.log('formData.image being submitted:', formData.image);
    console.log('currentImageUrlRef.current:', currentImageUrlRef.current);

    // Use ref value if available, fallback to formData
    const finalImageUrl = currentImageUrlRef.current || formData.image;
    console.log('Final image URL to use:', finalImageUrl);

    try {
      const submitData = {
        id: parseInt(bannerId),
        title: formData.title,
        description: formData.description,
        image: finalImageUrl,
        active: formData.active,
        visibleFrom: formData.visibleFrom,
        visibleUntil: formData.hasExpiryDate ? formData.visibleUntil : null,
        order: parseInt(formData.order),
        url: formData.url,
        customUrl: formData.customUrl,
        openInNewTab: formData.openInNewTab,
        hasExpiryDate: formData.hasExpiryDate
      };
      
      console.log('Final submit data:', submitData);
      
      const response = await fetch('/api/banners', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update banner');
      }

      // Event dispatch for frontend updates
      window.dispatchEvent(new CustomEvent('bannersUpdated'));
      
      showAlert('Banner sikeresen módosítva!', 'success');
      router.push('/admin/banners');
    } catch (error) {
      console.error('Hiba a banner módosításakor:', error);
      showAlert(`Hiba történt a banner módosításakor: ${error instanceof Error ? error.message : 'Ismeretlen hiba'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-green"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner szerkesztése</h1>
          <p className="text-gray-600 mt-2">Banner #{bannerId} módosítása</p>
        </div>
        <Link
          href="/admin/banners"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Vissza
        </Link>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner cím *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                required
                placeholder="pl. Weekend Main Event"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sorrend *
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                required
                min="1"
                placeholder="1"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leírás *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
              required
              placeholder="Rövid leírás a bannerről..."
            />
          </div>

          {/* Visibility Settings */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Látható ettől a dátumtól
                </label>
                <input
                  type="date"
                  name="visibleFrom"
                  value={formData.visibleFrom}
                  onChange={handleInputChange}
                  className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                  placeholder="Opcionális - ha üres, mindig látható"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasExpiryDate"
                  name="hasExpiryDate"
                  checked={formData.hasExpiryDate}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-poker-green focus:ring-poker-green border-gray-300 rounded"
                />
                <label htmlFor="hasExpiryDate" className="ml-2 block text-sm text-gray-900">
                  Van lejárati dátum
                </label>
              </div>
            </div>

            {formData.hasExpiryDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Látható eddig a dátumig *
                </label>
                <input
                  type="date"
                  name="visibleUntil"
                  value={formData.visibleUntil}
                  onChange={handleInputChange}
                  className="admin-input w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                  required={formData.hasExpiryDate}
                />
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner kép *
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Ajánlott méret: 1200x400px vagy hasonló arányú kép
            </p>
            <BannerImageUploader 
              onImageSelect={handleImageSelect} 
              currentImage={formData.image} 
            />
            {!formData.image && (
              <p className="text-sm text-red-600 mt-2">Kép feltöltése kötelező!</p>
            )}
          </div>

          {/* URL Settings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              "Tudjon meg többet" gomb URL-je (opcionális)
            </label>
            <select
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
            >
              {urlOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {formData.url === 'custom' && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Egyedi URL *
                </label>
                <input
                  type="url"
                  name="customUrl"
                  value={formData.customUrl}
                  onChange={handleInputChange}
                  className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                  required={formData.url === 'custom'}
                  placeholder="https://example.com"
                />
              </div>
            )}
            
            {formData.url && formData.url !== '' && (
              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="openInNewTab"
                  name="openInNewTab"
                  checked={formData.openInNewTab}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-poker-green focus:ring-poker-green border-gray-300 rounded"
                />
                <label htmlFor="openInNewTab" className="ml-2 block text-sm text-gray-900">
                  Új ablakban nyíljon meg
                </label>
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="mb-8">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-4 w-4 text-poker-green focus:ring-poker-green border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Aktív
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/banners"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Mégse
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.image}
              className="px-6 py-2 bg-poker-green hover:bg-poker-darkgreen text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Mentés...' : 'Módosítások mentése'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}