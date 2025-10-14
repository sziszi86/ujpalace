'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ImageUploader from '@/components/admin/ImageUploader';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
});

interface CashGameFormData {
  name: string;
  stakes: string;
  gameType: string;
  minBuyIn: string;
  maxBuyIn: string;
  schedule: string;
  startDate: string;
  active: boolean;
  visibleFrom: string;
  visibleUntil: string;
  description: string;
  image: string;
  weekDays: string[];
}

export default function EditCashGame() {
  const router = useRouter();
  const params = useParams();
  const cashGameId = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState<CashGameFormData>({
    name: '',
    stakes: '',
    gameType: 'NLH',
    minBuyIn: '',
    maxBuyIn: '',
    schedule: 'Hétfő-Vasárnap 18:00-06:00',
    startDate: new Date().toISOString().split('T')[0],
    active: true,
    visibleFrom: new Date().toISOString().split('T')[0],
    visibleUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    image: '',
    weekDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  });

  useEffect(() => {
    const loadCashGame = async () => {
      try {
        const response = await fetch(`/api/admin/cash-games/${cashGameId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        
        if (response.ok) {
          const cashGameData = await response.json();
          setFormData({
            name: cashGameData.name || '',
            stakes: cashGameData.stakes || '',
            gameType: cashGameData.game_type || 'NLH',
            minBuyIn: cashGameData.min_buyin?.toString() || '',
            maxBuyIn: cashGameData.max_buyin?.toString() || '',
            schedule: cashGameData.schedule || 'Hétfő-Vasárnap 18:00-06:00',
            startDate: cashGameData.start_date || new Date().toISOString().split('T')[0],
            active: cashGameData.active !== undefined ? cashGameData.active : true,
            visibleFrom: cashGameData.visible_from || new Date().toISOString().split('T')[0],
            visibleUntil: cashGameData.visible_until || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: cashGameData.description || '',
            image: cashGameData.image || '',
            weekDays: cashGameData.week_days ? (Array.isArray(cashGameData.week_days) ? cashGameData.week_days : JSON.parse(cashGameData.week_days)) : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          });
        } else {
          alert('Cash Game nem található!');
          router.push('/admin/cash-games');
        }
      } catch (error) {
        console.error('Hiba a cash game betöltésekor:', error);
        alert('Hiba történt a cash game betöltésekor.');
        router.push('/admin/cash-games');
      } finally {
        setPageLoading(false);
      }
    };

    loadCashGame();
  }, [cashGameId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleDescriptionChange = (value: string | undefined) => {
    setFormData({
      ...formData,
      description: value || ''
    });
  };

  const handleWeekDayToggle = (day: string) => {
    const currentDays = [...formData.weekDays];
    const index = currentDays.indexOf(day);
    
    if (index > -1) {
      currentDays.splice(index, 1);
    } else {
      currentDays.push(day);
    }
    
    setFormData({
      ...formData,
      weekDays: currentDays
    });
  };

  const handleImageSelect = (imageUrl: string) => {
    setFormData({
      ...formData,
      image: imageUrl
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cashGameData = {
        id: parseInt(cashGameId),
        name: formData.name,
        stakes: formData.stakes,
        game_type_id: 1, // Default game type ID
        min_buy_in: formData.minBuyIn ? parseInt(formData.minBuyIn) : null,
        max_buy_in: formData.maxBuyIn ? parseInt(formData.maxBuyIn) : null,
        description: formData.description,
        schedule: formData.schedule,
        start_date: formData.startDate,
        active: formData.active ? 1 : 0,
        image_url: formData.image || '',
        week_days: formData.weekDays
      };
      
      const response = await fetch(`/api/admin/cash-games/${cashGameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(cashGameData),
      });

      if (response.ok) {
        alert('Cash Game sikeresen módosítva!');
        router.push('/admin/cash-games');
      } else {
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        try {
          const errorData = await response.json();
          console.error('API hiba:', errorData);
        } catch (parseError) {
          console.error('Response parse error:', parseError);
          const responseText = await response.text();
          console.error('Raw response:', responseText);
        }
        alert('Hiba történt a cash game módosításakor!');
      }
    } catch (error) {
      console.error('Hiba a cash game módosításakor:', error);
      alert('Hiba történt a cash game módosításakor. Kérjük próbálja újra.');
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
    <div className="max-w-4xl mx-auto min-h-screen pb-20">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Game szerkesztése</h1>
          <p className="text-gray-600 mt-2">Cash Game #{cashGameId} módosítása</p>
        </div>
        <Link
          href="/admin/cash-games"
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
                Cash Game név *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                required
                placeholder="pl. No Limit Hold'em"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Játék típusa
              </label>
              <select
                name="gameType"
                value={formData.gameType}
                onChange={handleInputChange}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
              >
                <option value="NLH">No Limit Hold'em</option>
                <option value="PLO">Pot Limit Omaha</option>
                <option value="LHE">Limit Hold'em</option>
                <option value="STUD">7 Card Stud</option>
                <option value="MIXED">Mixed Games</option>
              </select>
            </div>
          </div>

          {/* Stakes and Buy-in */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tétek *
              </label>
              <input
                type="text"
                name="stakes"
                value={formData.stakes}
                onChange={handleInputChange}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                required
                placeholder="pl. 100/200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min. buy-in (Ft)
              </label>
              <input
                type="number"
                name="minBuyIn"
                value={formData.minBuyIn}
                onChange={handleInputChange}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                placeholder="20000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max. buy-in (Ft)
              </label>
              <input
                type="number"
                name="maxBuyIn"
                value={formData.maxBuyIn}
                onChange={handleInputChange}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                placeholder="40000"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menetrend
            </label>
            <input
              type="text"
              name="schedule"
              value={formData.schedule}
              onChange={handleInputChange}
              className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
              placeholder="pl. Hétfő-Vasárnap 18:00-06:00"
            />
          </div>

          {/* Weekly Calendar Day Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Hét napjai (válassz ki a megfelelő napokat) *
            </label>
            <div className="grid grid-cols-7 gap-2">
              {[
                { key: 'monday', label: 'Hétfő' },
                { key: 'tuesday', label: 'Kedd' },
                { key: 'wednesday', label: 'Szerda' },
                { key: 'thursday', label: 'Csütörtök' },
                { key: 'friday', label: 'Péntek' },
                { key: 'saturday', label: 'Szombat' },
                { key: 'sunday', label: 'Vasárnap' }
              ].map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => handleWeekDayToggle(day.key)}
                  className={`p-3 text-center text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                    formData.weekDays.includes(day.key)
                      ? 'bg-poker-green text-white border-poker-green shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-poker-green hover:bg-poker-green/10'
                  }`}
                >
                  <div className="text-xs font-bold">{day.label.substring(0, 3)}</div>
                  <div className="text-xs mt-1">{day.label.substring(3)}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Válaszd ki azokat a napokat, amikor ez a cash game elérhető lesz. Legalább egy napot ki kell választani.
            </p>
          </div>

          {/* Start Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kezdési dátum
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
            />
          </div>

          {/* Visibility Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Látható ettől a dátumtól *
              </label>
              <input
                type="date"
                name="visibleFrom"
                value={formData.visibleFrom}
                onChange={handleInputChange}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Látható eddig a dátumig *
              </label>
              <input
                type="date"
                name="visibleUntil"
                value={formData.visibleUntil}
                onChange={handleInputChange}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kép feltöltése
            </label>
            <ImageUploader onImageSelect={handleImageSelect} currentImage={formData.image} />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leírás
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MDEditor
                value={formData.description}
                onChange={handleDescriptionChange}
                preview="edit"
                height={300}
                data-color-mode="light"
              />
            </div>
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
              href="/admin/cash-games"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Mégse
            </Link>
            <button
              type="submit"
              disabled={loading}
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