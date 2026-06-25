'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ImageUploader from '../../../../components/admin/ImageUploader';
import { useAlert } from '../../../../components/admin/Alert';
import { generateUniqueIdForArray } from '../../../../utils/idGenerator';

// Markdown editor dinamikus betöltése
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <div className="border rounded-lg h-32 flex items-center justify-center">Editor betöltése...</div>
});

interface Structure {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface TournamentFormData {
  title: string;
  description: string;
  longDescription: string;
  date: string;
  time: string;
  buyIn: string;
  rebuyPrice: string;
  rebuyChips: string;
  addonPrice: string;
  addonChips: string;
  guarantee: string;
  rebuyCount: string;
  rebuyAmounts: string; // Több rebuy összeg vesszővel elválasztva
  structure: string;
  category: string;
  startingChips: string;
  imageUrl: string;
  specialNotes: string;
  visibleFrom: string;
  visibleUntil: string;
  featured: boolean;
  isClosure: boolean;
}

export default function NewTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const [structures, setStructures] = useState<Structure[]>([]);
  const [formData, setFormData] = useState<TournamentFormData>({
    title: '',
    description: '',
    longDescription: '',
    date: '',
    time: '20:00',
    buyIn: '',
    rebuyPrice: '',
    rebuyChips: '',
    addonPrice: '',
    addonChips: '',
    guarantee: '',
    rebuyCount: '0',
    rebuyAmounts: '',
    structure: '',
    category: '',
    startingChips: '',
    imageUrl: '',
    specialNotes: '',
    visibleFrom: new Date().toISOString().split('T')[0],
    visibleUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // másnap
    featured: false,
    isClosure: false,
  });

  // Load structures from API
  useEffect(() => {
    const fetchStructures = async () => {
      try {
        const response = await fetch('/api/structures');
        if (response.ok) {
          const data = await response.json();
          setStructures(data.filter((structure: Structure) => structure.is_active));
        } else {
          console.error('Failed to fetch structures');
        }
      } catch (error) {
        console.error('Error fetching structures:', error);
      }
    };
    
    fetchStructures();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let updatedData: any = {
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    };

    // Ha a verseny dátuma változik, akkor a látható eddig dátumot is frissítjük másnap
    if (name === 'date' && value) {
      const tournamentDate = new Date(value);
      const dayAfterTournament = new Date(tournamentDate.getTime() + 24 * 60 * 60 * 1000);
      updatedData.visibleUntil = dayAfterTournament.toISOString().split('T')[0];
    }

    setFormData(updatedData);
  };

  const handleEditorChange = (content: string = '') => {
    setFormData(prev => ({
      ...prev,
      longDescription: content
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validáció: Struktúra kötelező
    if (!formData.structure) {
      showAlert('A struktúra kiválasztása kötelező!', 'error');
      setLoading(false);
      return;
    }

    try {
      // Convert form data to API format
      const tournamentData = {
        title: formData.title,
        description: formData.description,
        longDescription: formData.longDescription,
        date: formData.date,
        time: formData.time,
        buyIn: parseInt(formData.buyIn) || 0,
        rebuyPrice: parseInt(formData.rebuyPrice) || 0,
        rebuyChips: parseInt(formData.rebuyChips) || 0,
        addonPrice: parseInt(formData.addonPrice) || 0,
        addonChips: parseInt(formData.addonChips) || 0,
        guarantee: parseInt(formData.guarantee) || 0,
        structure: formData.structure,
        category: formData.category,
        venue: 'Palace Poker Szombathely',
        startingChips: parseInt(formData.startingChips) || 0,
        image: formData.imageUrl,
        specialNotes: formData.specialNotes,
        featured: formData.featured,
        isClosure: formData.isClosure,
        status: 'upcoming',
        maxPlayers: 80,
        currentPlayers: 0,
        visibleFrom: formData.visibleFrom,
        visibleUntil: formData.visibleUntil,
        lateRegistration: true,
        blindStructure: '20 perc szintek',
        contactPhone: '+36 30 971 5832',
        contactEmail: 'palacepoker kukac hotmail.hu',
      };

      // API hívás
      const response = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(tournamentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create tournament');
      }

      const newTournament = await response.json();
      
      console.log('Tournament created:', newTournament);
      
      showAlert('Verseny sikeresen létrehozva!', 'success');
      router.push('/admin/tournaments');
    } catch (error) {
      console.error('Hiba a verseny létrehozásakor:', error);
      showAlert('Hiba történt a verseny létrehozása során!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Új verseny hozzáadása</h1>
          <p className="text-gray-600 mt-2">Töltsd ki az alábbi mezőket a verseny létrehozásához</p>
        </div>
        <Link
          href="/admin/tournaments"
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          ← Vissza a listához
        </Link>
      </div>

      {/* Top Action Buttons */}
      <div className="mb-6 flex justify-end space-x-4">
        <Link
          href="/admin/tournaments"
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          Mégse
        </Link>
        <button
          type="submit"
          form="tournament-form"
          disabled={loading}
          className="px-6 py-3 bg-poker-primary text-white rounded-lg hover:bg-poker-secondary transition-colors font-medium disabled:opacity-50"
        >
          {loading ? 'Mentés...' : '💾 Létrehozás'}
        </button>
      </div>

      {/* Form */}
      <form id="tournament-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Alapadatok */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Alapadatok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verseny címe *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rövid leírás *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Részletes leírás (Markdown Editor)
              </label>
              <div data-color-mode="light" style={{color: '#000000'}}>
                <MDEditor
                  value={formData.longDescription}
                  onChange={handleEditorChange}
                  preview="edit"
                  height={300}
                  data-color-mode="light"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategória
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                placeholder="pl. Main Event, Bounty, High Roller"
              />
            </div>

          </div>
        </div>

        {/* Időpontok */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Időpontok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verseny dátuma *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kezdés időpontja *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Látható ettől a dátumtól *
                <small className="block text-gray-500">Mikortól jelenjen meg a weboldalon</small>
              </label>
              <input
                type="date"
                name="visibleFrom"
                value={formData.visibleFrom}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Látható eddig a dátumig *
                <small className="block text-gray-500">Automatikusan a verseny utáni napra állítva</small>
              </label>
              <input
                type="date"
                name="visibleUntil"
                value={formData.visibleUntil}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Pénzügyek */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Pénzügyi adatok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buy-in (Ft) *
              </label>
              <input
                type="number"
                name="buyIn"
                value={formData.buyIn}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rebuy-ok száma *
              </label>
              <input
                type="number"
                name="rebuyCount"
                value={formData.rebuyCount}
                onChange={handleInputChange}
                min="0"
                max="10"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                placeholder="0 = Freezeout, 1+ = Rebuy verseny"
              />
              <p className="text-xs text-gray-500 mt-1">
                0 = Freezeout verseny, 1+ = Rebuy verseny
              </p>
            </div>

            {/* Rebuy összegek mező - csak ha rebuyCount > 1 */}
            {parseInt(formData.rebuyCount) > 1 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rebuy összegek (Ft) - opcionális
                </label>
                <input
                  type="text"
                  name="rebuyAmounts"
                  value={formData.rebuyAmounts}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                  placeholder="pl. 5000, 10000, 15000 (vesszővel elválasztva)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Különböző rebuy összegek vesszővel elválasztva. Ha üres, akkor az alapértelmezett rebuy ár használatos.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rebuy ár (Ft)
              </label>
              <input
                type="number"
                name="rebuyPrice"
                value={formData.rebuyPrice}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rebuy chipek
              </label>
              <input
                type="number"
                name="rebuyChips"
                value={formData.rebuyChips}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add-on ár (Ft)
              </label>
              <input
                type="number"
                name="addonPrice"
                value={formData.addonPrice}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add-on chipek
              </label>
              <input
                type="number"
                name="addonChips"
                value={formData.addonChips}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
              />
            </div>
          </div>
        </div>

        {/* Verseny beállítások */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Verseny beállítások</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Struktúra *
              </label>
              <select
                name="structure"
                value={formData.structure}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                required
              >
                <option value="">Válassz struktúrát...</option>
                {structures.map((structure) => (
                  <option key={structure.id} value={structure.name}>
                    {structure.name} - {structure.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                A struktúrákat a <Link href="/admin/structures" className="text-poker-primary hover:underline">Struktúrák</Link> menüpontban kezelheted.
              </p>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kezdőzseton
              </label>
              <input
                type="number"
                name="startingChips"
                value={formData.startingChips}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
              />
            </div>


            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-poker-primary focus:ring-poker-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Kiemelt verseny</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isClosure"
                  checked={formData.isClosure}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">🚫 Szünet/Zárvatartás</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Jelölje be, ha ez a nap zárvatartást jelöl (nem valódi verseny)
              </p>
            </div>
          </div>
        </div>

        {/* Egyéb beállítások */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Egyéb beállítások</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <ImageUploader
                label="Verseny képe"
                value={formData.imageUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                category="tournament"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speciális megjegyzések
              </label>
              <textarea
                name="specialNotes"
                value={formData.specialNotes}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                placeholder="Különleges szabályok, információk..."
              />
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/tournaments"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Mégse
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-poker-primary text-white rounded-lg hover:bg-poker-secondary transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Mentés...' : '💾 Létrehozás'}
          </button>
        </div>
      </form>
    </div>
  );
}