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
  active: boolean;
  visibleFrom: string;
  visibleUntil: string;
  description: string;
  image: string;
  selectedDates: string[];
}


export default function CreateCashGame() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CashGameFormData>({
    name: '',
    stakes: '',
    gameType: 'NLH',
    minBuyIn: '',
    maxBuyIn: '',
    schedule: '',
    active: true,
    visibleFrom: new Date().toISOString().split('T')[0],
    visibleUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 év múlva
    description: '',
    image: '',
    selectedDates: []
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


  // Generate next 8 weeks of dates
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 56; i++) { // 8 weeks = 56 days
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        dateString: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('hu-HU', { 
          month: 'short', 
          day: 'numeric',
          weekday: 'short'
        }),
        fullDate: date.toLocaleDateString('hu-HU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    return dates;
  };

  const handleDateToggle = (dateString: string) => {
    const currentDates = [...formData.selectedDates];
    const index = currentDates.indexOf(dateString);
    
    if (index > -1) {
      currentDates.splice(index, 1);
    } else {
      currentDates.push(dateString);
    }
    
    setFormData({
      ...formData,
      selectedDates: currentDates
    });
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
        active: formData.active,
        image_url: formData.image || '',
        selected_dates: formData.selectedDates
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
                placeholder="pl. 100/200, 200/400, 500/1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Több tétet vesszővel elválasztva adj meg (pl. 100/200, 200/400) vagy egyszerűen csak egyet (pl. 500/1000).
              </p>
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
              Menetrend (opcionális)
            </label>
            <input
              type="text"
              name="schedule"
              value={formData.schedule}
              onChange={handleInputChange}
              className="admin-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
              placeholder="pl. Hétfő-Vasárnap 18:00-06:00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ha üresen hagyod, nem jelenik meg menetrend a frontenden.
            </p>
          </div>

          {/* Date Selector for next 8 weeks */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dátumok kiválasztása (következő 8 hét) *
            </label>
            
            <div className="space-y-4">
              {/* Quick selection buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, selectedDates: []})}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Összes törlése
                </button>
                <button
                  type="button" 
                  onClick={() => {
                    const allDates = generateDateOptions().map(d => d.dateString);
                    setFormData({...formData, selectedDates: allDates});
                  }}
                  className="px-3 py-1 text-sm bg-poker-green text-white hover:bg-poker-darkgreen rounded"
                >
                  Összes kiválasztása
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const weekendDates = generateDateOptions()
                      .filter(d => d.isWeekend)
                      .map(d => d.dateString);
                    setFormData({...formData, selectedDates: weekendDates});
                  }}
                  className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded"
                >
                  Csak hétvégék
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const weekdayDates = generateDateOptions()
                      .filter(d => !d.isWeekend)
                      .map(d => d.dateString);
                    setFormData({...formData, selectedDates: weekdayDates});
                  }}
                  className="px-3 py-1 text-sm bg-orange-500 text-white hover:bg-orange-600 rounded"
                >
                  Csak hétköznapok
                </button>
              </div>

              {/* Date cards in weekly groups */}
              {Array.from({ length: 8 }, (_, weekIndex) => {
                const weekStart = weekIndex * 7;
                const weekDates = generateDateOptions().slice(weekStart, weekStart + 7);
                
                return (
                  <div key={weekIndex} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      {weekIndex + 1}. hét ({weekDates[0]?.fullDate.split(',')[0]} - {weekDates[6]?.fullDate.split(',')[0]})
                    </h4>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDates.map((date) => (
                        <button
                          key={date.dateString}
                          type="button"
                          onClick={() => handleDateToggle(date.dateString)}
                          className={`p-3 text-center text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                            formData.selectedDates.includes(date.dateString)
                              ? 'bg-poker-green text-white border-poker-green shadow-lg'
                              : date.isWeekend
                              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:border-poker-green hover:bg-poker-green/10'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-poker-green hover:bg-poker-green/10'
                          }`}
                          title={date.fullDate}
                        >
                          <div className="text-xs opacity-75 mb-1">{date.displayDate.split(' ')[0]}</div>
                          <div className="font-bold">{date.displayDate.split(' ')[1]}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              Válaszd ki azokat a konkrét dátumokat, amikor ez a cash game elérhető lesz. 
              Kiválasztva: {formData.selectedDates.length} nap
            </p>
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