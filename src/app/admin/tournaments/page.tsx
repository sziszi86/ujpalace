'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateUniqueId } from '@/utils/idGenerator';
import { formatCurrency } from '@/utils/formatters';
import { Tournament } from '@/types';

type TournamentSortField = 'title' | 'date' | 'buyIn' | 'status';
type TournamentSortDirection = 'asc' | 'desc';

export default function AdminTournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<TournamentSortField>('date');
  const [sortDirection, setSortDirection] = useState<TournamentSortDirection>('desc');
  const itemsPerPage = 50;

  // Mock data - később API-val cseréljük
  useEffect(() => {
    const loadTournaments = async () => {
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
        
        let tournaments: Tournament[] = [];

        if (response.ok) {
          tournaments = await response.json();
        } else {
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            router.push('/admin/login');
            return;
          }
          // Ha az API nem elérhető, üres lista
          console.error('API nem elérhető - Status:', response.status, 'Status Text:', response.statusText);
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          tournaments = [];
        }

        // A szerver automatikusan inaktívvá teszi a lejárt versenyeket
        setTournaments(tournaments);
      } catch (error) {
        console.error('Hiba a versenyek betöltésekor:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTournaments();
  }, []);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}. ${month.toString().padStart(2, '0')}. ${day.toString().padStart(2, '0')}.`;
  };

  const handleSort = (field: TournamentSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: TournamentSortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Közelgő';
      case 'cancelled':
        return 'Törölve';
      case 'inactive':
        return 'Inaktív';
      default:
        return 'Ismeretlen';
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a versenyt?')) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch(`/api/admin/tournaments?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          setTournaments(tournaments.filter(t => t.id !== id));
          alert('Verseny sikeresen törölve!');
        } else {
          alert('Hiba történt a törlés során!');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Hiba történt a törlés során!');
      }
    }
  };

  const toggleFeatured = async (id: number) => {
    try {
      const tournament = tournaments.find(t => t.id === id);
      if (!tournament) return;

      const updatedTournament = { ...tournament, featured: !tournament.featured };
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/tournaments', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTournament)
      });

      if (response.ok) {
        setTournaments(tournaments.map(t => 
          t.id === id ? updatedTournament : t
        ));
      } else {
        alert('Hiba történt a frissítés során!');
      }
    } catch (error) {
      console.error('Toggle featured error:', error);
      alert('Hiba történt a frissítés során!');
    }
  };

  const handleDuplicate = async (tournament: Tournament) => {
    try {
      // Set date to tomorrow by default to avoid validation error
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const duplicateData = {
        title: tournament.title + ' (Másolat)',
        description: tournament.description,
        longDescription: tournament.longDescription || null,
        date: tomorrow.toISOString().split('T')[0], // Tomorrow's date instead of empty string
        time: tournament.time,
        buyIn: tournament.buyIn,
        rebuyPrice: tournament.rebuyPrice || 0,
        rebuyChips: tournament.rebuyChips || 0,
        addonPrice: tournament.addonPrice || 0,
        addonChips: tournament.addonChips || 0,
        guarantee: tournament.guarantee || 0,
        structure: tournament.structure,
        category: tournament.category || null,
        venue: tournament.venue || 'Palace Poker Szombathely',
        startingChips: tournament.startingChips || 0,
        image: tournament.image_url || null,
        specialNotes: tournament.specialNotes || null,
        featured: false,
        status: 'upcoming',
        maxPlayers: tournament.maxPlayers || 80,
        currentPlayers: 0,
        lateRegistration: tournament.lateRegistration === true,
        blindStructure: tournament.blindStructure || '20 perc szintek',
        contactPhone: tournament.contactPhone || '+36 30 971 5832',
        contactEmail: tournament.contactEmail || 'palacepoker kukac hotmail.hu',
        visibleFrom: new Date().toISOString().split('T')[0],
        visibleUntil: tournament.visibleUntil || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/tournaments/${tournament.id}/duplicate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const newTournament = await response.json();
        setTournaments([...tournaments, newTournament]);
        alert('Verseny sikeresen duplikálva! A dátum holnapra lett állítva, szükség esetén módosítsd.');
      } else {
        const errorData = await response.json();
        console.error('Duplicate error response:', errorData);
        alert('Hiba történt a duplikálás során!');
      }
    } catch (error) {
      console.error('Duplicate error:', error);
      alert('Hiba történt a duplikálás során!');
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    // Apply status filter
    let matchesFilter = true;
    if (filter === 'all') matchesFilter = true;
    else if (filter === 'featured') matchesFilter = tournament.featured === true;
    else matchesFilter = tournament.status === filter;
    
    // Apply search filter
    let matchesSearch = true;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matchesSearch = tournament.title.toLowerCase().includes(searchLower) ||
                     tournament.description.toLowerCase().includes(searchLower) ||
                     tournament.structure.toLowerCase().includes(searchLower) ||
                     !!(tournament.category && tournament.category.toLowerCase().includes(searchLower));
    }
    
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'buyIn':
        aValue = a.buyIn || parseInt(a.buy_in || '0') || 0;
        bValue = b.buyIn || parseInt(b.buy_in || '0') || 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = new Date(a.date);
        bValue = new Date(b.date);
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTournaments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTournaments = filteredTournaments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <h1 className="text-3xl font-bold text-gray-900">Versenyek kezelése</h1>
          <p className="text-gray-600 mt-2">Versenyeket adhatsz hozzá, szerkesztheted és törölheted</p>
        </div>
        <Link
          href="/admin/tournaments/new"
          className="bg-poker-primary text-white px-6 py-3 rounded-lg hover:bg-poker-secondary transition-colors font-medium"
        >
          + Új verseny hozzáadása
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Field */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Keresés versenyek között..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-primary"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-poker-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Összes ({tournaments.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Közelgő ({tournaments.filter(t => t.status === 'upcoming').length})
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'featured'
                ? 'bg-poker-gold text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Kiemelt ({tournaments.filter(t => t.featured).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inaktív ({tournaments.filter(t => t.status === 'inactive').length})
          </button>
          </div>
        </div>
      </div>

      {/* Tournaments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>Verseny</span>
                    {getSortIcon('title')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>Dátum & Idő</span>
                    {getSortIcon('date')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('buyIn')}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>Buy-in</span>
                    {getSortIcon('buyIn')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>Státusz</span>
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Műveletek
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTournaments.map((tournament) => (
                <tr key={tournament.id} className={`hover:bg-gray-50 ${tournament.status === 'inactive' ? 'opacity-40' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {/* Tournament Image */}
                      <div className="flex-shrink-0 mr-4">
                        {tournament.image_url ? (
                          <img
                            className="h-12 w-16 object-cover rounded-lg border"
                            src={tournament.image_url}
                            alt={tournament.title}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        {!tournament.image_url && (
                          <div className="h-12 w-16 bg-gray-200 rounded-lg border flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {tournament.image_url && (
                          <div className="h-12 w-16 bg-gray-200 rounded-lg border flex items-center justify-center hidden">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {tournament.title}
                          </div>
                          {tournament.featured === true && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⭐ Kiemelt
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tournament.structure}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(tournament.date)}</div>
                    <div className="text-sm text-gray-500">{tournament.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(tournament.buyIn || parseInt(tournament.buy_in || '0') || 0)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tournament.status)}`}>
                      {getStatusText(tournament.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => toggleFeatured(tournament.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          tournament.featured === true
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={tournament.featured === true ? 'Kiemelt eltávolítása' : 'Kiemelés'}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDuplicate(tournament)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        title="Duplikálás"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <Link
                        href={`/admin/tournaments/edit/${tournament.id}`}
                        className="p-2 rounded-lg bg-poker-primary/10 text-poker-primary hover:bg-poker-primary/20 transition-colors"
                        title="Szerkesztés"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(tournament.id)}
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

        {currentTournaments.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nincsenek versenyek</h3>
            <p className="mt-1 text-sm text-gray-500">Kezdd el az első verseny hozzáadásával.</p>
            <div className="mt-6">
              <Link
                href="/admin/tournaments/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-poker-primary hover:bg-poker-secondary"
              >
                + Új verseny hozzáadása
              </Link>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Előző
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Következő
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{startIndex + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredTournaments.length)}</span>
                  {' '}közül{' '}
                  <span className="font-medium">{filteredTournaments.length}</span>
                  {' '}eredmény
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 7) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 4) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = currentPage - 3 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-poker-primary border-poker-primary text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}