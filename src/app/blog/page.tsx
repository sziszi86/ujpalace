'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  publish_date: string;
  status: string;
  category?: string;
  tags?: string;
  featured: boolean;
  author?: string;
  read_time?: number;
  created_at: string;
  updated_at: string;
}

export default function BlogPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/news?status=published');
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-poker-light py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-poker-dark mb-4">Blog</h1>
            <p className="text-poker-muted">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-poker-light py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Blog & Hírek
          </h1>
          <p className="text-xl text-poker-muted max-w-3xl mx-auto">
            Legfrissebb hírek, beszámolók és történetek a Palace Poker világából
          </p>
        </div>

        {news.length === 0 ? (
          <div className="card-modern p-8 text-center">
            <h2 className="text-2xl font-bold text-poker-dark mb-4">Még nincsenek hírek</h2>
            <p className="text-poker-muted">
              Hamarosan friss tartalommal jelentkezünk!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {news.map((item) => (
              <article key={item.id} className="card-modern overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {item.image && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  {item.featured && (
                    <div className="flex items-center mb-3">
                      <span className="bg-poker-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                        KIEMELT
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-3 text-sm text-poker-muted">
                    <time dateTime={item.publish_date}>
                      {formatDate(item.publish_date)}
                    </time>
                    {item.category && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{item.category}</span>
                      </>
                    )}
                    {item.read_time && (
                      <>
                        <span>•</span>
                        <span>{item.read_time} perc olvasás</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-poker-dark mb-3 line-clamp-2">
                    {item.title}
                  </h2>

                  <p className="text-poker-muted leading-relaxed mb-4">
                    {item.excerpt || truncateContent(item.content)}
                  </p>

                  <div className="flex items-center justify-between">
                    <Link
                      href={`/blog/${item.slug}`}
                      className="btn-primary text-sm inline-flex items-center hover:bg-poker-primary/90 transition-colors"
                    >
                      Tovább olvasom
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    {item.author && (
                      <span className="text-sm text-poker-muted">
                        {item.author}
                      </span>
                    )}
                  </div>

                  {item.tags && (
                    <div className="mt-4 pt-4 border-t border-poker-light/50">
                      <div className="flex flex-wrap gap-2">
                        {item.tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-poker-light text-poker-muted px-2 py-1 rounded-full"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}