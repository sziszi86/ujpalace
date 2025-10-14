'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface DayInfo {
  key: string;
  label: string;
  date: Date;
  formattedDate: string;
}

export default function CreateCashGame() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, 1 = next week, etc.
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
    visibleUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 év múlva
    description: '',
    image: '',
    weekDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  });

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

  const handleImageSelect = (imageUrl: string) => {
    setFormData({
      ...formData,
      image: imageUrl
    });
  };

  // Helper function to get the start of the week (Monday)
  const getStartOfWeek = (date: Date, weekOffset: number = 0): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + (weekOffset * 7));
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Helper function to format date in Hungarian format
  const formatHungarianDate = (date: Date): string => {
    const months = [
      'jan', 'feb', 'már', 'ápr', 'máj', 'jún',
      'júl', 'aug', 'szep', 'okt', 'nov', 'dec'
    ];
    return `${months[date.getMonth()]}.${date.getDate()}`;
  };

  // Get days for the current selected week
  const getWeekDays = (): DayInfo[] => {
    const startOfWeek = getStartOfWeek(new Date(), currentWeek);
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];

    return dayKeys.map((key, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        key,
        label: dayLabels[index],
        date,
        formattedDate: formatHungarianDate(date)
      };
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

  const handleWeekChange = (direction: 'prev' | 'next') => {
    if (direction === 'next' && currentWeek < 8) {
      setCurrentWeek(currentWeek + 1);
    } else if (direction === 'prev' && currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cashGameData = {
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

      const response = await fetch('/api/admin/cash-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(cashGameData),
      });

      if (response.ok) {
        alert('Cash Game sikeresen létrehozva!');
        router.push('/admin/cash-games');
      } else {
        const errorData = await response.json();
        console.error('API hiba:', errorData);
        alert('Hiba történt a cash game létrehozásakor!');
      }
    } catch (error) {
      console.error('Hiba a cash game létrehozásakor:', error);
      alert('Hiba történt a cash game létrehozásakor. Kérjük próbálja újra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-20">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Új Cash Game létrehozása</h1>
          <p className="text-gray-600 mt-2">Új cash game asztal hozzáadása a rendszerhez</p>
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
            
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <button
                type="button"
                onClick={() => handleWeekChange('prev')}
                disabled={currentWeek === 0}
                className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Előző hét
              </button>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {currentWeek === 0 ? 'Jelenlegi hét' : `${currentWeek}. hét múlva`}
                </div>
                <div className="text-xs text-gray-500">
                  {(() => {
                    const startOfWeek = getStartOfWeek(new Date(), currentWeek);
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    return `${formatHungarianDate(startOfWeek)} - ${formatHungarianDate(endOfWeek)}`;
                  })()}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => handleWeekChange('next')}
                disabled={currentWeek >= 8}
                className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Következő hét
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Cards with Dates */}
            <div className="grid grid-cols-7 gap-2">
              {getWeekDays().map((day) => (
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
                  <div className="text-xs font-bold">{day.formattedDate}</div>
                  <div className="text-xs mt-1">{day.label}</div>
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
              {loading ? 'Mentés...' : 'Cash Game mentése'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}