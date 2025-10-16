'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StructureLevel {
  id?: number;
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  bigBlindAnte: number;
  durationMinutes: number;
  breakAfter: boolean;
  breakDurationMinutes: number;
}

interface Structure {
  id: number;
  name: string;
  description: string;
  starting_chips: number;
  created_at: string;
  is_active: boolean;
  levels?: StructureLevel[];
}

export default function AdminStructuresPage() {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStructures = async () => {
      try {
        const response = await fetch('/api/structures');
        if (response.ok) {
          const data = await response.json();
          setStructures(data);
        } else {
          console.error('Failed to fetch structures');
        }
      } catch (error) {
        console.error('Error fetching structures:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStructures();
  }, []);


  const handleDelete = async (id: number) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a struktúrát?')) {
      try {
        const response = await fetch(`/api/structures/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete structure');
        }
        
        setStructures(structures.filter(s => s.id !== id));
        alert('Struktúra sikeresen törölve!');
      } catch (error) {
        alert('Hiba történt a törlés során!');
      }
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const structure = structures.find(s => s.id === id);
      if (!structure) return;
      
      const response = await fetch(`/api/structures/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: structure.name,
          description: structure.description,
          starting_chips: structure.starting_chips,
          is_active: !structure.is_active,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle structure status');
      }
      
      setStructures(structures.map(s => 
        s.id === id ? { ...s, is_active: !s.is_active } : s
      ));
    } catch (error) {
      alert('Hiba történt a frissítés során!');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const response = await fetch(`/api/structures/${id}/duplicate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to duplicate structure');
      }
      
      const newStructure = await response.json();
      setStructures([...structures, newStructure]);
      alert('Struktúra sikeresen duplikálva!');
    } catch (error) {
      alert('Hiba történt a duplikálás során!');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}. ${month.toString().padStart(2, '0')}. ${day.toString().padStart(2, '0')}.`;
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
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Struktúrák kezelése</h1>
          <p className="text-gray-600 mt-2">Verseny struktúrákat adhatsz hozzá, szerkesztheted és törölheted</p>
        </div>
        <Link
          href="/admin/structures/edit/new"
          className="bg-poker-primary text-white px-6 py-3 rounded-lg hover:bg-poker-secondary transition-colors font-medium"
        >
          + Új struktúra hozzáadása
        </Link>
      </div>


      {/* Structures Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Struktúra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beállítások
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Szintek száma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Státusz
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Műveletek
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {structures.map((structure) => (
                <tr key={structure.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {structure.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {structure.description}
                      </div>
                      <div className="text-xs text-gray-400">
                        Létrehozva: {formatDate(structure.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Kezdő chip: {structure.starting_chips.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Szünetek: {structure.levels ? structure.levels.filter(l => l.breakAfter).length : 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {structure.levels ? structure.levels.length : 0} szint
                    </div>
                    {structure.levels && structure.levels.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {structure.levels[0].smallBlind}/{structure.levels[0].bigBlind} - {structure.levels[structure.levels.length-1].smallBlind}/{structure.levels[structure.levels.length-1].bigBlind}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      structure.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {structure.is_active ? 'Aktív' : 'Inaktív'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => toggleActive(structure.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          structure.is_active
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                        title={structure.is_active ? 'Inaktiválás' : 'Aktiválás'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {structure.is_active ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          )}
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDuplicate(structure.id)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        title="Duplikálás"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <Link
                        href={`/admin/structures/edit/${structure.id}`}
                        className="p-2 rounded-lg bg-poker-primary/10 text-poker-primary hover:bg-poker-primary/20 transition-colors"
                        title="Szerkesztés"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(structure.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                        title="Törlés"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {structures.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nincsenek struktúrák</h3>
            <p className="mt-1 text-sm text-gray-500">Kezdd el az első struktúra hozzáadásával.</p>
            <div className="mt-6">
              <Link
                href="/admin/structures/edit/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-poker-primary hover:bg-poker-secondary"
              >
                + Új struktúra hozzáadása
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}