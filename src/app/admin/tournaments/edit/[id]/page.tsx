'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import ImageUploader from '../../../../../components/admin/ImageUploader';
import { useAlert } from '../../../../../components/admin/Alert';
import { generateUniqueIdForArray } from '../../../../../utils/idGenerator';

// Rich text editor dinamikus betöltése (SSR problémák elkerülésére)
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <div className="border rounded-lg h-32 flex items-center justify-center">Editor betöltése...</div>
});

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
  rebuyCount: string;
  rebuyAmounts: string;
  structure: string;
  category: string;
  venue: string;
  startingChips: string;
  imageUrl: string;
  specialNotes: string;
  visibleFrom: string;
  visibleUntil: string;
  featured: boolean;
  status: 'upcoming' | 'cancelled' | 'inactive';
  guarantee: string;
}

interface Structure {
  id: number;
  name: string;
  description: string;
  starting_chips: number;
  is_active: boolean;
}

export default function EditTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
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
    rebuyCount: '1',
    rebuyAmounts: '',
    structure: 'Freeze-out',
    category: '',
    venue: 'Palace Poker Szombathely',
    startingChips: '',
    imageUrl: '',
    specialNotes: '',
    visibleFrom: new Date().toISOString().split('T')[0],
    visibleUntil: '',
    featured: false,
    status: 'upcoming',
    guarantee: '',
  });

  // API adatok betöltése
  useEffect(() => {
    const loadTournament = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch('/api/admin/tournaments', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            router.push('/admin/login');
            return;
          }
          throw new Error('Failed to load tournaments');
        }
        
        const tournaments = await response.json();
        
        // Find tournament by ID - convert both to string for comparison
        const tournament = tournaments.find((t: any) => t.id.toString() === params.id);
        
        if (tournament) {
          // Convert API format to form format
          // Extract date and time from tournament_date
          let dateValue = '';
          let timeValue = '20:00';
          
          if (tournament.tournament_date || tournament.date) {
            const fullDate = new Date(tournament.tournament_date || tournament.date);
            dateValue = fullDate.toISOString().split('T')[0];
            // Get hours and minutes
            const hours = fullDate.getHours().toString().padStart(2, '0');
            const minutes = fullDate.getMinutes().toString().padStart(2, '0');
            timeValue = `${hours}:${minutes}`;
          }
          
          setFormData({
            title: tournament.title || '',
            description: tournament.description || '',
            longDescription: tournament.long_description || tournament.longDescription || '',
            date: dateValue,
            time: timeValue,
            buyIn: (tournament.buyin_amount || tournament.buyIn || tournament.buy_in || '').toString(),
            rebuyPrice: (tournament.rebuy_price || tournament.rebuyPrice || '').toString(),
            rebuyChips: (tournament.rebuy_chips || tournament.rebuyChips || '').toString(),
            addonPrice: (tournament.addon_price || tournament.addonPrice || '').toString(),
            addonChips: (tournament.addon_chips || tournament.addonChips || '').toString(),
            rebuyCount: (tournament.rebuy_count || tournament.rebuyCount || '1').toString(),
            rebuyAmounts: tournament.rebuy_amounts || tournament.rebuyAmounts || '',
            structure: tournament.structure || 'Freeze-out',
            category: tournament.category || '',
            venue: tournament.venue || 'Palace Poker Szombathely',
            startingChips: (tournament.starting_chips || tournament.startingChips || '').toString(),
            imageUrl: tournament.image_url || tournament.image || tournament.imageUrl || '',
            specialNotes: tournament.special_notes || tournament.specialNotes || '',
            visibleFrom: tournament.visible_from || tournament.visibleFrom || new Date().toISOString().split('T')[0],
            visibleUntil: tournament.visible_until || tournament.visibleUntil || dateValue || '',
            featured: tournament.featured || false,
            status: tournament.status || 'upcoming',
            guarantee: (tournament.guarantee || '').toString(),
          });
        } else {
          showAlert('Verseny nem található!', 'error');
          router.push('/admin/tournaments');
        }
      } catch (error) {
        console.error('Error loading tournament:', error);
        showAlert('Hiba történt a verseny betöltése során!', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadTournament();
  }, [params.id, router]);

  // Struktúrák betöltése
  useEffect(() => {
    const loadStructures = async () => {
      try {
        const response = await fetch('/api/structures');
        if (response.ok) {
          const structuresData = await response.json();
          // Only show active structures
          setStructures(structuresData.filter((s: Structure) => s.is_active));
        }
      } catch (error) {
        console.error('Error loading structures:', error);
      }
    };

    loadStructures();
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
    setSaving(true);

    // Validáció: Struktúra kötelező
    if (!formData.structure) {
      showAlert('A struktúra kiválasztása kötelező!', 'error');
      setSaving(false);
      return;
    }

    try {
      // Convert form data to API format
      // Combine date and time into a proper timestamp
      const tournamentDateTime = formData.date && formData.time 
        ? `${formData.date} ${formData.time}:00` 
        : formData.date;
      
      const tournamentData = {
        id: parseInt(params.id as string),
        title: formData.title,
        description: formData.description,
        long_description: formData.longDescription,
        date: tournamentDateTime,
        tournament_date: tournamentDateTime,
        tournament_time: formData.time,
        buyin_amount: parseInt(formData.buyIn) || 0,
        buy_in: parseInt(formData.buyIn) || 0,
        rebuy_price: parseInt(formData.rebuyPrice) || 0,
        rebuy_chips: parseInt(formData.rebuyChips) || 0,
        addon_price: parseInt(formData.addonPrice) || 0,
        addon_chips: parseInt(formData.addonChips) || 0,
        structure: formData.structure,
        category: formData.category,
        venue: formData.venue,
        starting_chips: parseInt(formData.startingChips) || 0,
        startingChips: parseInt(formData.startingChips) || 0,
        image_url: formData.imageUrl,
        image: formData.imageUrl,
        special_notes: formData.specialNotes,
        featured: formData.featured,
        status: formData.status,
        max_players: 80,
        maxPlayers: 80,
        current_players: 0,
        currentPlayers: 0,
        guarantee: parseInt(formData.guarantee) || 0,
        late_registration: false,
        lateRegistration: false,
        blind_structure: '20 perc szintek',
        blindStructure: '20 perc szintek',
        contact_phone: '+36 30 971 5832',
        contactPhone: '+36 30 971 5832',
        contact_email: 'tournaments@palace-poker.hu',
        contactEmail: 'tournaments@palace-poker.hu',
      };

      // API mentés
      const response = await fetch('/api/admin/tournaments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(tournamentData),
      });

      if (!response.ok) {
        throw new Error('Failed to update tournament');
      }
      
      showAlert('Verseny sikeresen frissítve!', 'success');
      router.push('/admin/tournaments');
    } catch (error) {
      console.error('Error updating tournament:', error);
      showAlert('Hiba történt a verseny frissítése során!', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    
    try {
      // Convert form data to API format for duplication
      const duplicateData = {
        title: formData.title + ' (Másolat)',
        description: formData.description,
        longDescription: formData.longDescription,
        date: '', // Clear date for duplicate
        time: formData.time,
        buyIn: parseInt(formData.buyIn) || 0,
        rebuyPrice: parseInt(formData.rebuyPrice) || 0,
        rebuyChips: parseInt(formData.rebuyChips) || 0,
        addonPrice: parseInt(formData.addonPrice) || 0,
        addonChips: parseInt(formData.addonChips) || 0,
        structure: formData.structure,
        category: formData.category,
        venue: formData.venue,
        startingChips: parseInt(formData.startingChips) || 0,
        image: formData.imageUrl,
        specialNotes: formData.specialNotes,
        featured: formData.featured,
        status: 'upcoming' as const,
        maxPlayers: 80,
        currentPlayers: 0,
        guarantee: parseInt(formData.guarantee) || 0,
        lateRegistration: false,
        blindStructure: '20 perc szintek',
        contactPhone: '+36 30 971 5832',
        contactEmail: 'tournaments@palace-poker.hu',
      };

      const response = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(duplicateData),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate tournament');
      }

      const newTournament = await response.json();
      
      showAlert('Verseny sikeresen duplikálva! Állítsd be az új dátumot.', 'success');
      router.push(`/admin/tournaments/edit/${newTournament.id}`);
      
    } catch (error) {
      console.error('Error duplicating tournament:', error);
      showAlert('Hiba történt a verseny duplikálása során!', 'error');
    } finally {
      setDuplicating(false);
    }
  };

  const handleToggleInactive = async () => {
    const newStatus = formData.status === 'inactive' ? 'upcoming' : 'inactive';
    setFormData(prev => ({
      ...prev,
      status: newStatus
    }));

    try {
      // Update via API
      const tournamentData = {
        id: parseInt(params.id as string),
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
        structure: formData.structure,
        category: formData.category,
        venue: formData.venue,
        startingChips: parseInt(formData.startingChips) || 0,
        image: formData.imageUrl,
        specialNotes: formData.specialNotes,
        featured: formData.featured,
        status: newStatus,
        maxPlayers: 80,
        currentPlayers: 0,
        guarantee: 0,
        lateRegistration: false,
        blindStructure: '20 perc szintek',
        contactPhone: '+36 30 971 5832',
        contactEmail: 'tournaments@palace-poker.hu',
      };

      const response = await fetch('/api/admin/tournaments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(tournamentData),
      });

      if (!response.ok) {
        throw new Error('Failed to update tournament status');
      }
      
      showAlert(`Verseny ${newStatus === 'inactive' ? 'inaktívvá' : 'aktívvá'} téve!`, 'success');
    } catch (error) {
      console.error('Error updating tournament status:', error);
      showAlert('Hiba történt a státusz változtatás során!', 'error');
      // Revert status on error
      setFormData(prev => ({
        ...prev,
        status: formData.status
      }));
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
        <span className="ml-4">Verseny betöltése...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verseny szerkesztése</h1>
          <p className="text-gray-600 mt-2">ID: {params.id} - {formData.title}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleToggleInactive}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              formData.status === 'inactive'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {formData.status === 'inactive' ? 'Aktiválás' : 'Inaktiválás'}
          </button>
          <Link
            href="/admin/tournaments"
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            ← Vissza a listához
          </Link>
        </div>
      </div>

      {/* Status indicator */}
      {formData.status === 'inactive' && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          ⚠️ Ez a verseny jelenleg inaktív állapotban van és nem jelenik meg a weboldalon.
        </div>
      )}

      {/* Top Action Buttons */}
      <div className="mb-6 flex justify-end space-x-4">
        <Link
          href="/admin/tournaments"
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          Mégse
        </Link>
        <button
          type="button"
          onClick={handleDuplicate}
          disabled={duplicating}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
        >
          {duplicating ? 'Duplikálás...' : '📋 Duplikálás'}
        </button>
        <button
          type="submit"
          form="tournament-form"
          disabled={saving}
          className="px-6 py-3 bg-poker-primary text-white rounded-lg hover:bg-poker-secondary transition-colors font-medium disabled:opacity-50"
        >
          {saving ? 'Mentés...' : '💾 Módosítás'}
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


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Státusz
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
              >
                <option value="upcoming">Közelgő</option>
                <option value="cancelled">Törölve</option>
                <option value="inactive">Inaktív</option>
              </select>
            </div>
          </div>
        </div>

        {/* Időpontok és láthatóság */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Időpontok és láthatóság</h3>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-poker-primary admin-input"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                Rebuyok száma *
              </label>
              <input
                type="number"
                name="rebuyCount"
                value={formData.rebuyCount}
                onChange={handleInputChange}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                required
              />
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

            {parseInt(formData.rebuyCount) > 1 && (
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rebuy összegek (Ft) - opcionális
                </label>
                <input
                  type="text"
                  name="rebuyAmounts"
                  value={formData.rebuyAmounts}
                  onChange={handleInputChange}
                  placeholder="pl. 5000, 10000, 15000 (vesszővel elválasztva)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-poker-primary admin-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ha több rebuy összeg lehetséges, add meg vesszővel elválasztva.
                </p>
              </div>
            )}
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



            <div className="md:col-span-2">
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
            type="button"
            onClick={handleDuplicate}
            disabled={duplicating}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
          >
            {duplicating ? 'Duplikálás...' : '📋 Duplikálás'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-poker-primary text-white rounded-lg hover:bg-poker-secondary transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'Mentés...' : '💾 Módosítás'}
          </button>
        </div>
      </form>
    </div>
  );
}