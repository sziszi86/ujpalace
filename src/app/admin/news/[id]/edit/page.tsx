'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAlert } from '@/components/admin/Alert';
import ImageUploader from '@/components/admin/ImageUploader';

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image_url?: string;
  publish_date: string;
  author: string;
  status: string;
  featured: boolean;
}

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params?.id as string;
  const { showAlert } = useAlert();

  const [article, setArticle] = useState<NewsArticle>({
    id: 0,
    title: '',
    content: '',
    excerpt: '',
    image_url: '',
    publish_date: new Date().toISOString().split('T')[0],
    author: 'Palace Poker',
    status: 'draft',
    featured: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!newsId) return;
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch(`/api/admin/news/${newsId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setArticle(data);
        } else {
          showAlert('Hiba történt a cikk betöltésekor!', 'error');
          router.push('/admin/news');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        showAlert('Hiba történt a cikk betöltésekor!', 'error');
        router.push('/admin/news');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [newsId, router, showAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/news/${newsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(article)
      });

      if (response.ok) {
        showAlert('Cikk sikeresen frissítve!', 'success');
        router.push('/admin/news');
      } else {
        const errorData = await response.json();
        showAlert(errorData.error || 'Hiba történt a mentés során!', 'error');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      showAlert('Hiba történt a mentés során!', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a cikket?')) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/news/${newsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showAlert('Cikk sikeresen törölve!', 'success');
        router.push('/admin/news');
      } else {
        showAlert('Hiba történt a törlés során!', 'error');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      showAlert('Hiba történt a törlés során!', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-green"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cikk szerkesztése</h1>
          <p className="text-gray-600 mt-2">Módosítsd a cikk adatait</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Törlés
          </button>
          <Link
            href="/admin/news"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Mégse
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Cím *
            </label>
            <input
              type="text"
              id="title"
              value={article.title}
              onChange={(e) => setArticle({...article, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-green"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
              Bevezető szöveg
            </label>
            <textarea
              id="excerpt"
              value={article.excerpt}
              onChange={(e) => setArticle({...article, excerpt: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-green"
              placeholder="Rövid bevezető a cikkhez..."
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Tartalom *
            </label>
            <textarea
              id="content"
              value={article.content}
              onChange={(e) => setArticle({...article, content: e.target.value})}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-green"
              required
              placeholder="A cikk teljes tartalma..."
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Image Upload */}
            <div>
              <ImageUploader
                label="Cikk képe"
                value={article.image_url || ''}
                onChange={(url) => setArticle({...article, image_url: url})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Szerző
              </label>
              <input
                type="text"
                id="author"
                value={article.author}
                onChange={(e) => setArticle({...article, author: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-green"
              />
            </div>

            {/* Publish Date */}
            <div>
              <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700 mb-2">
                Publikálás dátuma *
              </label>
              <input
                type="date"
                id="publish_date"
                value={article.publish_date}
                onChange={(e) => setArticle({...article, publish_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-green"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Státusz
              </label>
              <select
                id="status"
                value={article.status}
                onChange={(e) => setArticle({...article, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-green"
              >
                <option value="draft">Piszkozat</option>
                <option value="published">Publikált</option>
                <option value="archived">Archivált</option>
              </select>
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={article.featured}
              onChange={(e) => setArticle({...article, featured: e.target.checked})}
              className="h-4 w-4 text-poker-green focus:ring-poker-green border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              Kiemelt cikk (megjelenik a főoldalon)
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-poker-green text-white px-6 py-3 rounded-lg hover:bg-poker-darkgreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Mentés...' : 'Cikk frissítése'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}