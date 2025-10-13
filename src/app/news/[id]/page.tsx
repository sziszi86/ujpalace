'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image_url?: string;
  publish_date: string;
  author: string;
  status: string;
  category_id?: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const newsId = params?.id as string;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!newsId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/news/${newsId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Article not found');
            return;
          }
          throw new Error('Failed to fetch article');
        }
        
        const foundArticle = await response.json();
        
        if (!foundArticle) {
          setError('Article not found');
          return;
        }
        
        setArticle(foundArticle);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [newsId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  if (error || !article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('hu-HU', options);
  };

  return (
    <div className="min-h-screen bg-poker-light py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-poker-muted hover:text-poker-dark transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vissza a hírekhez
          </button>
        </div>

        {/* Article */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Image */}
          {article.image_url && (
            <div className="relative h-64 md:h-96">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                {article.featured && (
                  <span className="inline-block bg-poker-gold text-poker-dark px-3 py-1 rounded-full text-sm font-bold mb-3">
                    ⭐ Kiemelt cikk
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  {article.title}
                </h1>
                <div className="flex items-center text-white/90 text-sm">
                  <span>{formatDate(article.publish_date)}</span>
                  {article.author && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{article.author}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Title (if no image) */}
            {!article.image_url && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-poker-dark">
                    {article.title}
                  </h1>
                  {article.featured && (
                    <span className="ml-4 bg-poker-gold text-poker-dark px-3 py-1 rounded-full text-sm font-bold">
                      ⭐ Kiemelt
                    </span>
                  )}
                </div>
                <div className="flex items-center text-poker-muted text-sm">
                  <span>{formatDate(article.publish_date)}</span>
                  {article.author && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{article.author}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Excerpt */}
            {article.excerpt && (
              <div className="mb-6 p-4 bg-poker-light/50 border-l-4 border-poker-primary rounded">
                <p className="text-lg text-poker-muted italic">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-poker-muted leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Publikálva: {formatDate(article.publish_date)}
                {article.updated_at !== article.created_at && (
                  <>
                    {' • '}
                    Frissítve: {formatDate(article.updated_at)}
                  </>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.print()}
                  className="text-sm text-poker-muted hover:text-poker-dark transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Nyomtatás
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: article.title,
                        text: article.excerpt || article.title,
                        url: window.location.href
                      });
                    }
                  }}
                  className="text-sm text-poker-muted hover:text-poker-dark transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Megosztás
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related or Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/blog"
            className="inline-flex items-center px-6 py-3 border border-poker-primary text-poker-primary rounded-lg hover:bg-poker-primary hover:text-white transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Összes hír megtekintése
          </a>
        </div>
      </div>
    </div>
  );
}