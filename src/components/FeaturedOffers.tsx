'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';

interface Tournament {
  id: number;
  title: string;
  date?: string;
  time?: string;
  tournament_date?: string;
  tournament_time?: string;
  buyIn?: number;
  buy_in?: string | number;
  guarantee?: number;
  guarantee_amount?: string | number;
  rebuy_count?: number;
  rebuy_price?: string | number;
  addon_price?: string | number;
  category?: string;
  status?: string;
  image?: string;
  image_url?: string;
  featured?: boolean;
}

export default function FeaturedOffers() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const CARDS_PER_PAGE = 3;

  useEffect(() => {
    fetch('/api/tournaments')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        const transformed = data
          .filter((t: any) => t.status === 'upcoming')
          .map((t: any) => ({
            ...t,
            date: t.tournament_date || t.date,
            time: t.tournament_time || t.time,
            buyIn: Number(t.buy_in || t.buyIn || 0),
            guarantee: Number(t.guarantee_amount || t.guarantee || 0),
            image: t.image_url || t.image || '',
          }));
        setTournaments(transformed);
      })
      .catch(err => console.error('Failed to load tournaments:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(tournaments.length / CARDS_PER_PAGE);
  const currentTournaments = tournaments.slice(
    currentPage * CARDS_PER_PAGE,
    (currentPage + 1) * CARDS_PER_PAGE
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const dx = touchStart.x - touchEnd.x;
    const dy = touchStart.y - touchEnd.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0 && currentPage < totalPages - 1) setCurrentPage(p => p + 1);
      if (dx < 0 && currentPage > 0) setCurrentPage(p => p - 1);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#080d0b]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-800 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-gray-800 rounded w-48 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#080d0b] relative overflow-hidden">
      {/* Subtle background poker suit decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <span className="absolute top-8 left-8 text-[120px] text-white/[0.025] font-serif leading-none">♠</span>
        <span className="absolute bottom-8 right-8 text-[120px] text-white/[0.025] font-serif leading-none">♦</span>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] text-white/[0.015] font-serif leading-none">♣</span>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14">
          <div>
            <p className="text-poker-gold text-sm font-semibold uppercase tracking-[0.2em] mb-3">
              Palace Poker Szombathely
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Közelgő <span className="text-poker-gold">Versenyek</span>
            </h2>
            <div className="mt-4 w-16 h-0.5 bg-poker-gold rounded-full" />
          </div>
          <Link
            href="/tournaments"
            className="mt-6 lg:mt-0 inline-flex items-center gap-2 text-poker-gold border border-poker-gold/40 hover:border-poker-gold hover:bg-poker-gold/10 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          >
            Összes verseny
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Cards grid */}
        {tournaments.length === 0 ? (
          <div className="text-center py-16 border border-gray-800 rounded-2xl">
            <span className="text-5xl block mb-4 opacity-30">🏆</span>
            <p className="text-gray-400 text-lg">Jelenleg nincsenek közelgő versenyek.</p>
            <p className="text-gray-600 text-sm mt-1">Hamarosan új versenyeket hirdetünk!</p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {currentTournaments.map((tournament, index) => (
                <TournamentEventCard key={tournament.id} tournament={tournament} index={index} />
              ))}
            </div>

            {/* Swipe hint on mobile */}
            {totalPages > 1 && (
              <p className="md:hidden text-center text-gray-600 text-xs mt-5">
                ← Húzd az ujjad a lapozáshoz →
              </p>
            )}

            {/* Pagination dots + arrows */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="w-9 h-9 rounded-full border border-gray-700 hover:border-poker-gold disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-gray-400 hover:text-poker-gold transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentPage
                          ? 'w-6 h-2.5 bg-poker-gold'
                          : 'w-2.5 h-2.5 bg-gray-700 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="w-9 h-9 rounded-full border border-gray-700 hover:border-poker-gold disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-gray-400 hover:text-poker-gold transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function TournamentEventCard({ tournament, index }: { tournament: Tournament; index: number }) {
  const dateStr = tournament.date || tournament.tournament_date || '';
  const timeStr = tournament.time || tournament.tournament_time || '';
  const buyIn = tournament.buyIn ?? Number(tournament.buy_in ?? 0);
  const guarantee = tournament.guarantee ?? Number(tournament.guarantee_amount ?? 0);
  const rebuyPrice = Number(tournament.rebuy_price ?? 0);
  const rebuyCount = tournament.rebuy_count ?? 0;
  const addonPrice = Number(tournament.addon_price ?? 0);
  const hasImage = !!(tournament.image || tournament.image_url);
  const imageUrl = tournament.image || tournament.image_url || '';

  // Format date nicely
  let formattedDate = '';
  if (dateStr) {
    try {
      formattedDate = formatDate(dateStr);
    } catch {
      formattedDate = dateStr;
    }
  }
  const formattedTime = timeStr ? formatTime(timeStr) : '';

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="group block"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative flex flex-col bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-poker-gold/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)] hover:-translate-y-1 h-full">

        {/* Image / Header */}
        <div className="relative h-44 overflow-hidden flex-shrink-0">
          {hasImage ? (
            <img
              src={imageUrl}
              alt={tournament.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-7xl text-white/10 font-serif select-none">♠</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent" />

          {/* Category badge */}
          {tournament.category && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-poker-gold text-gray-900 text-[11px] font-bold rounded-md uppercase tracking-widest">
                {tournament.category}
              </span>
            </div>
          )}

          {/* Guarantee badge */}
          {guarantee > 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 bg-green-500/20 border border-green-500/40 text-green-400 text-[11px] font-semibold rounded-md">
                {formatCurrency(guarantee)} garancia
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          {/* Title */}
          <h3 className="text-white font-bold text-[17px] leading-snug mb-4 line-clamp-2 group-hover:text-poker-gold transition-colors duration-200">
            {tournament.title}
          </h3>

          {/* Info rows */}
          <div className="space-y-2.5 mb-5 flex-1">
            {/* Date + Time */}
            {(formattedDate || formattedTime) && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-poker-gold/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-poker-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm font-medium">
                  {formattedDate}{formattedTime ? ` · ${formattedTime}` : ''}
                </span>
              </div>
            )}

            {/* Buy-in */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-poker-gold/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-poker-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-500 text-sm">Buy-in</span>
              </div>
              <span className="text-poker-gold font-bold text-base">
                {formatCurrency(buyIn)}
              </span>
            </div>

            {/* Rebuy */}
            {rebuyPrice > 0 && (
              <div className="flex items-center justify-between pl-10">
                <span className="text-gray-600 text-xs">
                  Rebuy{rebuyCount > 1 ? ` (${rebuyCount}×)` : ''}
                </span>
                <span className="text-gray-400 text-xs font-medium">{formatCurrency(rebuyPrice)}</span>
              </div>
            )}

            {/* Addon */}
            {addonPrice > 0 && (
              <div className="flex items-center justify-between pl-10">
                <span className="text-gray-600 text-xs">Add-on</span>
                <span className="text-gray-400 text-xs font-medium">{formatCurrency(addonPrice)}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-800 mb-4" />

          {/* CTA */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 uppercase tracking-widest">Részletek</span>
            <div className="w-8 h-8 rounded-full border border-poker-gold/30 group-hover:border-poker-gold group-hover:bg-poker-gold flex items-center justify-center transition-all duration-200">
              <svg className="w-3.5 h-3.5 text-poker-gold group-hover:text-gray-900 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
