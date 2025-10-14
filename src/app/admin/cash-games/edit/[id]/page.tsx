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
  minBuyIn: string;
  maxBuyIn: string;
  schedule: string;
  active: boolean;
  description: string;
  image: string;
  scheduledDates: string[]; // Array of dates in YYYY-MM-DD format
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
    minBuyIn: '',
    maxBuyIn: '',
    schedule: '',
    active: true,
    description: '',
    image: '',
    scheduledDates: []
  });
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
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
            minBuyIn: cashGameData.minBuyIn?.toString() || '',
            maxBuyIn: cashGameData.maxBuyIn?.toString() || '',
            schedule: cashGameData.schedule || '',
            active: cashGameData.active !== undefined ? cashGameData.active : true,
            description: cashGameData.description || '',
            image: cashGameData.image || '',
            scheduledDates: cashGameData.scheduledDates || []
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

  // Helper functions for calendar
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const getCurrentWeekDays = () => {
    const weekStart = getWeekStart(currentWeekStart);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMaxWeek = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setMonth(today.getMonth() + 3); // 3 months ahead
    return getWeekStart(maxDate);
  };

  const canNavigateNext = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    const maxWeek = getMaxWeek();
    return nextWeek <= maxWeek;
  };

  const canNavigatePrev = () => {
    const today = new Date();
    const currentWeek = getWeekStart(currentWeekStart);
    const todayWeek = getWeekStart(today);
    return currentWeek > todayWeek;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && !canNavigatePrev()) return;
    if (direction === 'next' && !canNavigateNext()) return;
    
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  };

  const toggleDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const newScheduledDates = formData.scheduledDates.includes(dateStr)
      ? formData.scheduledDates.filter(d => d !== dateStr)
      : [...formData.scheduledDates, dateStr];
    
    setFormData({
      ...formData,
      scheduledDates: newScheduledDates
    });
  };

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return formData.scheduledDates.includes(dateStr);
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
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
        minBuyIn: parseInt(formData.minBuyIn) || 0,
        maxBuyIn: parseInt(formData.maxBuyIn) || 0,
        schedule: formData.schedule,
        active: formData.active,
        description: formData.description,
        image: formData.image,
        scheduledDates: formData.scheduledDates
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
          <div className="grid grid-cols-1 gap-6 mb-6">
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
                Min. buy-in (Ft) *
              </label>
              <input
                type="number"
                name="minBuyIn"
                value={formData.minBuyIn}
                onChange={handleInputChange}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                required
                placeholder="20000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max. buy-in (Ft) *
              </label>
              <input
                type="number"
                name="maxBuyIn"
                value={formData.maxBuyIn}
                onChange={handleInputChange}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                required
                placeholder="40000"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menetrend *
            </label>
            <input
              type="text"
              name="schedule"
              value={formData.schedule}
              onChange={handleInputChange}
              className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
              required
              placeholder="pl. Hétfő-Vasárnap 18:00-06:00"
            />
          </div>

          {/* Schedule Calendar */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Ütemezés - Válaszd ki azokat a napokat, amikor megjelenjen a cash game *
            </label>
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => navigateWeek('prev')}
                  disabled={!canNavigatePrev()}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h3 className="text-lg font-medium">
                  {getCurrentWeekDays()[0].toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' })}
                  {getCurrentWeekDays()[0].getMonth() !== getCurrentWeekDays()[6].getMonth() && 
                    ` - ${getCurrentWeekDays()[6].toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' })}`
                  }
                </h3>
                
                <button
                  type="button"
                  onClick={() => navigateWeek('next')}
                  disabled={!canNavigateNext()}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Week Days */}
              <div className="grid grid-cols-7 gap-2">
                {['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'].map((dayName, index) => (
                  <div key={index} className="text-center text-sm font-medium text-gray-600 py-2">
                    {dayName}
                  </div>
                ))}
                
                {getCurrentWeekDays().map((date, index) => {
                  const isPast = isDatePast(date);
                  const isSelected = isDateSelected(date);
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isPast && toggleDate(date)}
                      disabled={isPast}
                      className={`
                        p-3 text-sm rounded-lg border transition-all duration-200
                        ${isPast 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-poker-green text-white border-poker-green shadow-md'
                            : 'bg-white hover:bg-poker-light border-gray-300 hover:border-poker-green'
                        }
                      `}
                    >
                      <div className="font-medium">{date.getDate()}</div>
                      {isSelected && <div className="text-xs mt-1">✓</div>}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>🟢 Kiválasztott napok: {formData.scheduledDates.length}</p>
                <p className="mt-1">💡 Kattints a napokra a kiválasztáshoz/eltávolításhoz</p>
              </div>
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