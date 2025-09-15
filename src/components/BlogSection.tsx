'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/utils/formatters';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  category: string;
  publish_date: string;
  created_at: string;
}

export default function BlogSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news?limit=3&status=published');
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hírek & Cikkek
            </h2>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Hírek & Cikkek
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Maradj naprakész a legfrissebb póker hírekkel és tippekkel
          </p>
        </div>

        {news.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>Jelenleg nincsenek elérhető hírek.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {item.image ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-poker-gold to-poker-gold/70 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                      <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z" />
                    </svg>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-poker-gold/10 text-poker-gold">
                      {item.category}
                    </span>
                    <time className="text-sm text-gray-500">
                      {formatDate(item.publish_date || item.created_at)}
                    </time>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {item.excerpt ? 
                      truncateText(item.excerpt) : 
                      truncateText(item.content.replace(/<[^>]*>/g, ''))
                    }
                  </p>

                  <Link
                    href={`/news/${item.id}`}
                    className="inline-flex items-center text-poker-gold hover:text-poker-gold/80 font-medium transition-colors duration-300"
                  >
                    Tovább olvasom
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/news"
            className="inline-flex items-center bg-poker-gold text-white px-8 py-3 rounded-lg font-medium hover:bg-poker-gold/90 transition-all duration-300"
          >
            Összes hír megtekintése
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}