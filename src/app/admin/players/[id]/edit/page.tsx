'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Player {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  other_notes?: string;
  active: boolean;
}

export default function EditPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    other_notes: '',
    active: true
  });

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        const response = await fetch(`/api/admin/players/${playerId}`);
        if (response.ok) {
          const player: Player = await response.json();
          setFormData({
            name: player.name,
            phone: player.phone || '',
            email: player.email || '',
            other_notes: player.other_notes || '',
            active: player.active
          });
        } else {
          setError('Játékos nem található');
        }
      } catch (error) {
        console.error('Error loading player:', error);
        setError('Hiba történt a játékos betöltésekor');
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      loadPlayer();
    }
  }, [playerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/players');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Hiba történt a játékos frissítésekor');
      }
    } catch (error) {
      console.error('Error updating player:', error);
      setError('Hiba történt a játékos frissítésekor');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Játékos szerkesztése</h1>
              <p className="text-gray-600">Módosítsa a játékos adatait</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Név *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="Adja meg a játékos nevét"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="Adja meg a telefonszámot"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="Adja meg az email címet"
              />
            </div>

            <div>
              <label htmlFor="other_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Megjegyzés
              </label>
              <textarea
                id="other_notes"
                name="other_notes"
                rows={4}
                value={formData.other_notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="Opcionális megjegyzés a játékoshoz"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-poker-primary focus:ring-poker-primary border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Aktív játékos
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/players"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Mégse
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-poker-primary text-white rounded-md hover:bg-poker-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Mentés...' : 'Változások mentése'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}