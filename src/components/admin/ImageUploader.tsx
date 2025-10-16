'use client';

import { useState, useRef, useEffect } from 'react';
import { useAlert } from './Alert';

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  currentImage?: string;
  onImageSelect?: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, currentImage, onImageSelect, label = "Kép" }: ImageUploaderProps) {
  // Simple state management - use currentImage or value directly
  const imageValue = currentImage !== undefined ? currentImage : (value || '');
  
  const handleImageChange = (url: string) => {
    console.log('ImageUploader - handleImageChange called with:', url);
    
    if (onImageSelect) {
      onImageSelect(url);
    } else if (onChange) {
      onChange(url);
    }
  };
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useAlert();

  // Banner képek galéria az adatbázisból
  const [galleryImages, setGalleryImages] = useState<Array<{id: number, url: string, originalName: string}>>([]);

  // Galéria képek betöltése az adatbázisból
  const loadGalleryImages = async () => {
    try {
      const response = await fetch('/api/images');
      if (response.ok) {
        const images = await response.json();
        setGalleryImages(images);
      } else {
        console.error('Hiba a galéria betöltésekor:', response.statusText);
        setGalleryImages([]);
      }
    } catch (error) {
      console.error('Hiba a galéria betöltésekor:', error);
      setGalleryImages([]);
    }
  };

  // Komponens betöltésekor töltse be a galériát
  useEffect(() => {
    loadGalleryImages();
  }, []);


  // Ékezetes karakterek eltávolítása és fájlnév normalizálása
  const normalizeFileName = (fileName: string): string => {
    // Ékezetes karakterek lecserélése
    const accentsMap: { [key: string]: string } = {
      'á': 'a', 'Á': 'A', 'é': 'e', 'É': 'E', 'í': 'i', 'Í': 'I',
      'ó': 'o', 'Ó': 'O', 'ő': 'o', 'Ő': 'O', 'ú': 'u', 'Ú': 'U',
      'ű': 'u', 'Ű': 'U', 'ü': 'u', 'Ü': 'U', 'ö': 'o', 'Ö': 'O'
    };

    let normalized = fileName;
    
    // Ékezetes karakterek cseréje
    for (const [accented, plain] of Object.entries(accentsMap)) {
      normalized = normalized.replace(new RegExp(accented, 'g'), plain);
    }
    
    // Speciális karakterek eltávolítása, szóközök lecserélése
    normalized = normalized
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_') // Speciális karakterek -> underscore
      .replace(/_+/g, '_') // Több underscore -> egy
      .replace(/^_|_$/g, ''); // Elején/végén underscore eltávolítása
    
    // Ha túl hosszú, rövidítjük (max 30 karakter a kiterjesztés nélkül)
    const lastDotIndex = normalized.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const name = normalized.substring(0, lastDotIndex);
      const extension = normalized.substring(lastDotIndex);
      if (name.length > 30) {
        // Megtartjuk az első 20 karaktert + timestamp + kiterjesztés  
        const timestamp = Date.now().toString().slice(-6);
        normalized = name.substring(0, 20) + '_' + timestamp + extension;
        console.log('Fájlnév lerövidítve:', fileName, '->', normalized); // Debug
      }
    } else if (normalized.length > 30) {
      normalized = normalized.substring(0, 30);
    }
    
    return normalized;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Fájlméret ellenőrzés (3MB)
    if (file.size > 3 * 1024 * 1024) {
      showAlert('A fájl túl nagy! Maximum 3MB méret engedélyezett.', 'error');
      return;
    }

    // Támogatott fájltípusok
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedTypes.includes(file.type)) {
      showAlert('Nem támogatott fájltípus! Támogatott formátumok: JPG, JPEG, PNG, GIF, WebP.', 'error');
      return;
    }

    setUploading(true);

    try {
      // Fájlnév normalizálása
      const normalizedName = normalizeFileName(file.name);
      
      // FormData létrehozása az API híváshoz
      const formData = new FormData();
      formData.append('image', file);

      // Kép feltöltése az API-n keresztül
      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Feltöltési hiba');
      }

      const result = await response.json();
      const imageUrl = result.url; // /api/images/123
      console.log('Upload successful, imageUrl:', imageUrl);
      
      console.log('Calling handleImageChange with uploaded image URL...');
      handleImageChange(imageUrl);
      console.log('handleImageChange called for upload');
      showAlert(`Kép sikeresen feltöltve! (${normalizedName})`, 'success');
      
      // Galéria frissítése
      loadGalleryImages();
      
    } catch (error) {
      console.error('Hiba a kép feltöltése során:', error);
      showAlert(`Hiba történt a kép feltöltése során: ${error instanceof Error ? error.message : 'Ismeretlen hiba'}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleGallerySelect = (imageUrl: string) => {
    console.log('=== GALLERY SELECT START ===');
    console.log('Gallery select called with:', imageUrl);
    console.log('Current imageValue before change:', imageValue);
    
    handleImageChange(imageUrl);
    
    showAlert('Kép sikeresen kiválasztva a galériából!', 'success');
    setShowGallery(false);
    console.log('=== GALLERY SELECT END ===');
  };

  // Kép törlése a galériából (adatbázisból)
  const handleDeleteFromGallery = async (imageId: number) => {
    // Megerősítés kérése
    if (window.confirm('Biztosan törölni akarod ezt a képet a galériából?\n\nA kép véglegesen törlődik az adatbázisból!')) {
      try {
        const response = await fetch(`/api/images/${imageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        
        if (response.ok) {
          loadGalleryImages(); // Galéria frissítése
          showAlert('Kép sikeresen törölve a galériából!', 'success');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Törlési hiba');
        }
      } catch (error) {
        console.error('Hiba a kép törlésekor:', error);
        showAlert(`Hiba történt a kép törlésekor: ${error instanceof Error ? error.message : 'Ismeretlen hiba'}`, 'error');
      }
    }
  };


  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Jelenlegi kép előnézete */}
      {imageValue && (
        <div className="relative">
          <img 
            src={imageValue} 
            alt="Kép előnézet" 
            className="h-32 w-48 object-cover rounded-lg border"
            onLoad={() => console.log('Image preview loaded successfully:', imageValue)}
            onError={(e) => {
              console.warn('Image preview failed to load:', imageValue);
              // SVG base64 képek esetén ne rejtse el a képet
              if (imageValue && !imageValue.startsWith('data:image/svg+xml')) {
                e.currentTarget.style.display = 'none';
              }
            }}
          />
          <button
            type="button"
            onClick={() => handleImageChange('')}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}
      {!imageValue && (
        <div className="text-gray-400 text-sm">
          Nincs kép kiválasztva
        </div>
      )}

      {/* Feltöltési opciók */}
      <div className="flex flex-wrap gap-2">
        {/* Fájl feltöltés */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>{uploading ? 'Feltöltés...' : 'Feltöltés'}</span>
        </button>

        {/* Galéria böngészés */}
        <button
          type="button"
          onClick={() => setShowGallery(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Galéria</span>
        </button>
      </div>


      {/* Rejtett file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Galéria modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Válassz képet a galériából</h3>
                <p className="text-sm text-gray-600 mt-1">Kattints a képre a kiválasztáshoz, vagy a piros X-re a törléshez</p>
              </div>
              <button
                onClick={() => setShowGallery(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((image) => (
                <div 
                  key={image.id} 
                  className="relative group cursor-pointer" 
                  onClick={(e) => {
                    // Ha nem a törlés gombra kattintottak
                    if (!(e.target as HTMLElement).closest('button')) {
                      console.log('Gallery div clicked:', image.url);
                      handleGallerySelect(image.url);
                    }
                  }}
                >
                  <img
                    src={image.url}
                    alt={`${image.originalName}`}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      console.log('Gallery image clicked:', image.url);
                      console.log('Event target:', e.target);
                      console.log('Current target:', e.currentTarget);
                      handleGallerySelect(image.url);
                    }}
                    onError={(e) => {
                      console.log('Image failed to load:', image.url);
                      // Hibás kép esetén placeholder megjelenítése
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const placeholder = target.parentElement!.querySelector('.image-placeholder');
                      if (placeholder) {
                        (placeholder as HTMLElement).style.display = 'flex';
                      }
                    }}
                    onLoad={() => console.log('Gallery image loaded:', image.url)}
                  />
                  {/* Placeholder hibás képek esetén */}
                  <div 
                    className="image-placeholder w-full h-32 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors items-center justify-center text-gray-500 text-sm hidden"
                    onClick={() => handleGallerySelect(image.url)}
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>Kép betöltési hiba</div>
                      <div className="text-xs">{image.originalName}</div>
                    </div>
                  </div>
                  {/* Törlésgomb - kis piros X */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Ne válassza ki a képet törléskor
                      handleDeleteFromGallery(image.id);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Kép törlése a galériából"
                  >
                    ×
                  </button>
                  {/* Select overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center pointer-events-none">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {/* Image name tooltip */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity truncate pointer-events-none">
                    {image.originalName}
                  </div>
                </div>
              ))}
            </div>

            {galleryImages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Nincsenek feltöltött képek a galériában</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Információ */}
      <p className="text-xs text-gray-500">
        Támogatott formátumok: JPG, JPEG, PNG, GIF, WebP. Maximum fájlméret: 3MB. Az ékezetes fájlnevek automatikusan át lesznek írva.
      </p>
    </div>
  );
}