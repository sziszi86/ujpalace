'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAlert } from '@/components/admin/Alert';
import ImageUploader from '@/components/admin/ImageUploader';

// Rich text editor dinamikus betöltése (SSR problémák elkerülésére)
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <div className="border rounded-lg h-32 flex items-center justify-center">Editor betöltése...</div>
});

interface NewsCategory {
  id: number;
  name: string;
}

export default function CreateNewsPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'published',
    category_id: '',
    tags: '',
    featured: false,
    read_time: 5,
    author: 'Palace Poker'
  });
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/news-categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Auto-generate slug from title
    if (name === 'title' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[áàâäã]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòôöõ]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/[ő]/g, 'o')
        .replace(/[ű]/g, 'u')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }

    // Auto-calculate read time from content
    if (name === 'content') {
      const wordCount = value.split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute
      setFormData(prev => ({ ...prev, read_time: readTime }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          published: formData.status === 'published'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showAlert('Hír sikeresen létrehozva!', 'success');
        router.push('/admin/news');
      } else {
        const result = await response.json();
        if (response.status === 401) {
          setError('Nincs érvényes bejelentkezés. Kérlek jelentkezz be újra.');
          showAlert('Nincs érvényes bejelentkezés. Kérlek jelentkezz be újra.', 'error');
          setTimeout(() => router.push('/admin/login'), 2000);
        } else {
          setError(result.error || 'Hiba a hír létrehozásakor');
          showAlert(result.error || 'Hiba a hír létrehozásakor', 'error');
        }
      }
    } catch (error) {
      setError('Hiba a hír létrehozásakor');
      showAlert('Hiba a hír létrehozásakor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/news"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Vissza a hírekhez
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Új hír létrehozása</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Cím *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="Hír címe"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                URL slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="url-friendly-slug"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                Kategória
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
              >
                <option value="">Válassz kategóriát...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Először hozz létre kategóriákat a{' '}
                  <Link 
                    href="/admin/news-categories" 
                    className="text-poker-primary hover:text-poker-secondary"
                    target="_blank"
                  >
                    kategóriák kezelése
                  </Link>{' '}
                  oldalon.
                </p>
              )}
            </div>

            {/* Excerpt */}
            <div className="md:col-span-2">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Rövid leírás
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="Rövid leírás a hírről..."
              />
            </div>

            {/* Content */}
            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Tartalom * (Markdown Editor)
              </label>
              <div data-color-mode="light" style={{color: '#000000'}}>
                <MDEditor
                  value={formData.content}
                  onChange={(content) => setFormData({...formData, content: content || ''})}
                  preview="edit"
                  height={400}
                  data-color-mode="light"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <ImageUploader
                label="Cikk képe"
                value={formData.featured_image}
                onChange={(url) => setFormData({...formData, featured_image: url})}
                category="news"
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Szerző
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Státusz
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
              >
                <option value="published">Publikált</option>
                <option value="draft">Piszkozat</option>
                <option value="archived">Archivált</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Címkék
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
                placeholder="címke1, címke2, címke3"
              />
            </div>

            {/* Read Time */}
            <div>
              <label htmlFor="read_time" className="block text-sm font-medium text-gray-700 mb-2">
                Olvasási idő (perc)
              </label>
              <input
                type="number"
                id="read_time"
                name="read_time"
                value={formData.read_time}
                onChange={handleChange}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-primary focus:border-transparent"
              />
            </div>

            {/* Featured */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-poker-primary focus:ring-poker-primary border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Kiemelt hír (megjelenik a főoldalon)
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <Link
              href="/admin/news"
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Mégse
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-poker-primary text-white rounded-lg hover:bg-poker-secondary disabled:opacity-50 transition-colors"
            >
              {loading ? 'Mentés...' : 'Hír létrehozása'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}