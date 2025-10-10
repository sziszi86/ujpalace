'use client';

import { useState, useEffect } from 'react';
import { useAlert } from '@/components/admin/Alert';
import Image from 'next/image';

interface GalleryImage {
  id: number;
  title: string;
  filename: string;
  alt_text?: string;
  category?: string;
  size?: number;
  created_at: string;
  active: number;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { showAlert } = useAlert();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/gallery', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        showAlert('Hiba a képek betöltésekor', 'error');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      showAlert('Hiba a képek betöltésekor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const token = localStorage.getItem('authToken');

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'gallery');

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          showAlert(`${file.name} sikeresen feltöltve!`, 'success');
        } else {
          showAlert(`Hiba a ${file.name} feltöltésekor`, 'error');
        }
      } catch (error) {
        console.error('Upload error:', error);
        showAlert(`Hiba a ${file.name} feltöltésekor`, 'error');
      }
    }

    setUploading(false);
    loadImages(); // Reload images after upload
    
    // Clear the file input
    event.target.value = '';
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a képet?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/gallery?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showAlert('Kép sikeresen törölve!', 'success');
        loadImages();
      } else {
        showAlert('Hiba a kép törlésekor', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showAlert('Hiba a kép törlésekor', 'error');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const image = images.find(img => img.id === id);
      if (!image) return;

      const response = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          active: image.active === 1 ? 0 : 1,
        }),
      });

      if (response.ok) {
        showAlert('Kép státusza frissítve!', 'success');
        loadImages();
      } else {
        showAlert('Hiba a státusz frissítésekor', 'error');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      showAlert('Hiba a státusz frissítésekor', 'error');
    }
  };

  const categories = Array.from(new Set(images.map(img => img.category).filter(Boolean)));
  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-poker-dark mb-2">Galéria kezelő</h1>
        <p className="text-poker-muted">Képek feltöltése és kezelése a galériában</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-poker-dark mb-4">Új képek feltöltése</h2>
        <div className="border-2 border-dashed border-poker-light rounded-lg p-8 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label 
            htmlFor="file-upload" 
            className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
          >
            <div className="text-poker-muted mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-lg font-medium text-poker-dark mb-2">
              {uploading ? 'Feltöltés folyamatban...' : 'Kattints vagy húzd ide a képeket'}
            </div>
            <div className="text-sm text-poker-muted">
              JPG, PNG, WebP fájlok • Max 10MB • Automatikus optimalizálás
            </div>
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-poker-primary/20 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-poker-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-poker-muted">Összes kép</p>
              <p className="text-2xl font-bold text-poker-dark">{images.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-poker-muted">Aktív</p>
              <p className="text-2xl font-bold text-poker-dark">{images.filter(img => img.active === 1).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-poker-muted">Kategóriák</p>
              <p className="text-2xl font-bold text-poker-dark">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-poker-primary text-white'
              : 'bg-white text-poker-dark hover:bg-poker-light border border-poker-light'
          }`}
        >
          Összes ({images.length})
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category || 'all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              selectedCategory === category
                ? 'bg-poker-primary text-white'
                : 'bg-white text-poker-dark hover:bg-poker-light border border-poker-light'
            }`}
          >
            {category} ({images.filter(img => img.category === category).length})
          </button>
        ))}
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map((image) => (
          <div key={image.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-48">
              <Image
                src={`/images/gallery/${image.filename}`}
                alt={image.alt_text || image.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleToggleActive(image.id)}
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    image.active === 1
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {image.active === 1 ? 'Aktív' : 'Inaktív'}
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-poker-dark mb-1 truncate">{image.title}</h3>
              {image.category && (
                <span className="inline-block bg-poker-light text-poker-primary text-xs px-2 py-1 rounded-full capitalize mb-2">
                  {image.category}
                </span>
              )}
              {image.size && (
                <p className="text-xs text-poker-muted mb-2">
                  Méret: {(image.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Törlés
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-poker-muted mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-poker-dark mb-2">Nincsenek képek</h3>
          <p className="text-poker-muted mb-4">
            {selectedCategory === 'all' 
              ? 'Még nincsenek feltöltött képek.' 
              : `Nincsenek képek a "${selectedCategory}" kategóriában.`
            }
          </p>
        </div>
      )}
    </div>
  );
}