'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StructureLevel {
  id?: number;
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationMinutes: number;
  breakAfter: boolean;
  breakDurationMinutes: number;
}

interface Structure {
  id?: number;
  name: string;
  description: string;
  starting_chips: number;
  level_duration: number;
  late_registration_levels: number;
  is_active: boolean;
  levels: StructureLevel[];
}

export default function StructureEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const isNew = id === 'new';
  
  const [structure, setStructure] = useState<Structure>({
    name: '',
    description: '',
    starting_chips: 10000,
    level_duration: 20,
    late_registration_levels: 0,
    is_active: true,
    levels: [
      {
        level: 1,
        smallBlind: 25,
        bigBlind: 50,
        ante: 0,
        durationMinutes: 15,
        breakAfter: false,
        breakDurationMinutes: 0
      }
    ]
  });
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew) {
      fetchStructure();
    }
  }, [isNew, id]);

  const fetchStructure = async () => {
    try {
      const response = await fetch(`/api/structures/${id}`);
      if (response.ok) {
        const data = await response.json();
        
        // Ensure levels have the correct structure and defaults
        const mappedStructure = {
          ...data,
          levels: (data.levels || []).map((level: any) => ({
            id: level.id,
            level: level.level,
            smallBlind: level.smallBlind || 0,
            bigBlind: level.bigBlind || 0,
            ante: level.ante || 0,
            durationMinutes: level.durationMinutes || 15,
            breakAfter: level.breakAfter || false,
            breakDurationMinutes: level.breakDurationMinutes || 0
          }))
        };
        
        setStructure(mappedStructure);
      } else {
        setError('Struktúra nem található');
      }
    } catch (error) {
      console.error('Error fetching structure:', error);
      setError('Hiba a struktúra betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = isNew ? '/api/structures' : `/api/structures/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      // Ensure proper data format before sending
      const structureData = {
        ...structure,
        levels: structure.levels.map((level, index) => {
          const levelData: any = {
            level: index + 1,
            smallBlind: Number(level.smallBlind) || 0,
            bigBlind: Number(level.bigBlind) || 0,
            ante: Number(level.ante) || 0,
            durationMinutes: Number(level.durationMinutes) || 15,
            breakAfter: Boolean(level.breakAfter),
            breakDurationMinutes: Number(level.breakDurationMinutes) || 0
          };
          
          // Only include id if it exists (for existing levels)
          if (level.id) {
            levelData.id = level.id;
          }
          
          return levelData;
        })
      };

      console.log('Sending structure data:', structureData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(structureData),
      });

      if (response.ok) {
        router.push('/admin/structures');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Hiba történt a mentés során');
      }
    } catch (error) {
      console.error('Error saving structure:', error);
      setError('Hiba történt a mentés során');
    } finally {
      setSaving(false);
    }
  };

  const addLevel = () => {
    const lastLevel = structure.levels[structure.levels.length - 1];
    const newLevel: StructureLevel = {
      level: structure.levels.length + 1,
      smallBlind: lastLevel ? lastLevel.bigBlind : 25,
      bigBlind: lastLevel ? lastLevel.bigBlind * 2 : 50,
      ante: 0,
      durationMinutes: 15,
      breakAfter: false,
      breakDurationMinutes: 0
    };
    
    setStructure(prev => ({
      ...prev,
      levels: [...prev.levels, newLevel]
    }));
  };

  const insertLevel = (insertIndex: number) => {
    const currentLevel = structure.levels[insertIndex];
    const previousLevel = insertIndex > 0 ? structure.levels[insertIndex - 1] : null;
    
    // Calculate reasonable values for the new level
    const newLevel: StructureLevel = {
      level: insertIndex + 1,
      smallBlind: previousLevel ? 
        Math.floor((previousLevel.bigBlind + currentLevel.smallBlind) / 2) : 
        Math.floor(currentLevel.smallBlind / 2) || 25,
      bigBlind: previousLevel ? 
        Math.floor((previousLevel.bigBlind + currentLevel.bigBlind) / 2) : 
        currentLevel.smallBlind || 50,
      ante: currentLevel.ante,
      durationMinutes: currentLevel.durationMinutes,
      breakAfter: false,
      breakDurationMinutes: 0
    };

    // Ensure minimum values
    if (newLevel.smallBlind < 25) newLevel.smallBlind = 25;
    if (newLevel.bigBlind < 50) newLevel.bigBlind = 50;
    if (newLevel.bigBlind <= newLevel.smallBlind) {
      newLevel.bigBlind = newLevel.smallBlind * 2;
    }
    
    setStructure(prev => ({
      ...prev,
      levels: [
        ...prev.levels.slice(0, insertIndex),
        newLevel,
        ...prev.levels.slice(insertIndex)
      ].map((level, i) => ({ ...level, level: i + 1 }))
    }));
  };

  const removeLevel = (index: number) => {
    if (structure.levels.length > 1) {
      setStructure(prev => ({
        ...prev,
        levels: prev.levels
          .filter((_, i) => i !== index)
          .map((level, i) => ({ ...level, level: i + 1 }))
      }));
    }
  };

  const updateLevel = (index: number, field: keyof StructureLevel, value: any) => {
    setStructure(prev => ({
      ...prev,
      levels: prev.levels.map((level, i) => {
        if (i === index) {
          let processedValue = value;
          
          // Handle different field types properly
          if (field === 'breakAfter') {
            processedValue = Boolean(value);
          } else if (['smallBlind', 'bigBlind', 'ante', 'durationMinutes', 'breakDurationMinutes'].includes(field)) {
            processedValue = Number(value) || 0;
          }
          
          return { ...level, [field]: processedValue };
        }
        return level;
      })
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? 'Új struktúra' : 'Struktúra szerkesztése'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isNew ? 'Hozz létre egy új verseny struktúrát' : 'Módosítsd a struktúra beállításait'}
            </p>
          </div>
          <Link
            href="/admin/structures"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Vissza
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alapadatok</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Struktúra neve *
              </label>
              <input
                type="text"
                id="name"
                required
                value={structure.name}
                onChange={(e) => setStructure(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="pl. Mini Turbo"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Leírás *
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={structure.description}
                onChange={(e) => setStructure(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="Rövid leírás a struktúráról"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="starting_chips" className="block text-sm font-medium text-gray-700 mb-2">
                  Kezdő chipek *
                </label>
                <input
                  type="number"
                  id="starting_chips"
                  required
                  min="1000"
                  step="1000"
                  value={structure.starting_chips}
                  onChange={(e) => setStructure(prev => ({ ...prev, starting_chips: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="level_duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Szint időtartam (perc) *
                </label>
                <input
                  type="number"
                  id="level_duration"
                  required
                  min="1"
                  value={structure.level_duration}
                  onChange={(e) => setStructure(prev => ({ ...prev, level_duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="late_registration_levels" className="block text-sm font-medium text-gray-700 mb-2">
                  Késői jelentkezés szintjei
                </label>
                <input
                  type="number"
                  id="late_registration_levels"
                  min="0"
                  value={structure.late_registration_levels}
                  onChange={(e) => setStructure(prev => ({ ...prev, late_registration_levels: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={structure.is_active}
                onChange={(e) => setStructure(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-poker-primary focus:ring-poker-primary border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Aktív struktúra
              </label>
            </div>
          </div>
        </div>

        {/* Levels */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Szintek</h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => insertLevel(0)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                title="Új szint beszúrása az elejére"
              >
                + Beszúrás elejére
              </button>
              <button
                type="button"
                onClick={addLevel}
                className="bg-poker-primary text-white px-4 py-2 rounded-lg hover:bg-poker-secondary transition-colors"
              >
                + Szint hozzáadása végére
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {structure.levels.map((level, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Szint {index + 1}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => insertLevel(index)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Új szint beszúrása ide"
                    >
                      + Beszúrás ide
                    </button>
                    {structure.levels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLevel(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Törlés
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kis vak
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={level.smallBlind}
                      onChange={(e) => updateLevel(index, 'smallBlind', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nagy vak
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={level.bigBlind}
                      onChange={(e) => updateLevel(index, 'bigBlind', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ante
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={level.ante}
                      onChange={(e) => updateLevel(index, 'ante', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Időtartam (perc)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={level.durationMinutes}
                      onChange={(e) => updateLevel(index, 'durationMinutes', parseInt(e.target.value) || 15)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`break_after_${index}`}
                      checked={level.breakAfter}
                      onChange={(e) => updateLevel(index, 'breakAfter', e.target.checked)}
                      className="h-4 w-4 text-poker-primary focus:ring-poker-primary border-gray-300 rounded"
                    />
                    <label htmlFor={`break_after_${index}`} className="ml-2 block text-sm text-gray-700">
                      Szünet utána
                    </label>
                  </div>

                  {level.breakAfter && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Szünet hossza (perc)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={level.breakDurationMinutes}
                        onChange={(e) => updateLevel(index, 'breakDurationMinutes', parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/structures"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Mégse
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-poker-primary text-white rounded-lg hover:bg-poker-secondary transition-colors disabled:opacity-50"
          >
            {saving ? 'Mentés...' : 'Mentés'}
          </button>
        </div>
      </form>
    </div>
  );
}