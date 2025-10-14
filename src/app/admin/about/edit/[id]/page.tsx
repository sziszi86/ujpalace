'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import ImageUploader from '@/components/admin/ImageUploader';

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

export default function EditAboutPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    features: [] as string[],
    image: '',
    active: true
  });
  
  const [newFeature, setNewFeature] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      const fetchAboutPage = async () => {
        try {
          const response = await fetch(`/api/admin/about/${params.id}`);
          if (response.ok) {
            const data = await response.json();
            setFormData({
              title: data.title || '',
              content: data.content || '',
              features: data.features || [],
              image: data.image || '',
              active: data.active
            });
          } else {
            alert('Hiba történt az oldal betöltése során!');
            router.push('/admin/about');
          }
        } catch (error) {
          console.error('Error fetching about page:', error);
          alert('Hiba történt az oldal betöltése során!');
          router.push('/admin/about');
        } finally {
          setLoading(false);
        }
      };
      
      fetchAboutPage();
    }
  }, [isNew, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(
        isNew ? '/api/admin/about' : `/api/admin/about/${params.id}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save about page');
      }

      alert(isNew ? 'Oldal sikeresen létrehozva!' : 'Oldal sikeresen frissítve!');
      router.push('/admin/about');
    } catch (error) {
      console.error('Error saving about page:', error);
      alert('Hiba történt a mentés során!');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
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
        <h1 className="text-3xl font-bold text-gray-900">
          {isNew ? 'Új rólunk oldal' : 'Rólunk oldal szerkesztése'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isNew ? 'Új oldal létrehozása a rólunk szekcióhoz' : 'Meglévő oldal szerkesztése'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Alapadatok</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cím *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="pl. Palace Poker Szombathely"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leírás *
              </label>
              <textarea
                required
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="Írj egy részletes leírást a klubról..."
              />
              <p className="mt-2 text-sm text-gray-500">
                HTML tageket is használhatsz a formázáshoz.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Státusz
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-poker-primary focus:ring-poker-primary border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Aktív (megjelenik a weboldalon)
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Kép feltöltés</h2>
          
          <ImageUploader
            label="Rólunk oldal képe"
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
          />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Szolgáltatások</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Új szolgáltatás hozzáadása
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                  placeholder="pl. Változatos, népszerű versenyek"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-poker-primary text-white rounded-md hover:bg-poker-secondary transition-colors"
                >
                  Hozzáad
                </button>
              </div>
            </div>

            {formData.features.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jelenlegi szolgáltatások
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm text-gray-700">• {feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/about')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Mégse
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-poker-primary text-white rounded-md hover:bg-poker-secondary transition-colors disabled:opacity-50"
          >
            {saving ? 'Mentés...' : (isNew ? 'Létrehozás' : 'Mentés')}
          </button>
        </div>
      </form>
    </div>
  );
}