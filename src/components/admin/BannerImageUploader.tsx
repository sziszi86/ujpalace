'use client';

import { useState } from 'react';

interface BannerImageUploaderProps {
  onImageChange?: (file: File | null, preview: string | null) => void;
  onImageSelect?: (imageUrl: string) => void;
  currentImage?: string;
}

export default function BannerImageUploader({
  onImageChange,
  onImageSelect,
  currentImage
}: BannerImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (file: File | null) => {
    if (file) {
      setUploading(true);
      
      // Create preview for immediate display
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        // Upload the file to the server
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'banner');

        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          const imageUrl = `/images/banners/${result.data.filename}`;
          
          // Update with the final image URL
          onImageChange?.(file, imageUrl);
          onImageSelect?.(imageUrl);
          setPreview(imageUrl);
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        // Keep the preview but notify of error
        onImageChange?.(file, preview);
        onImageSelect?.(preview || '');
      } finally {
        setUploading(false);
      }
    } else {
      setPreview(null);
      onImageChange?.(null, null);
      onImageSelect?.('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileChange(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Banner kép
      </label>
      
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Banner előnézet"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={() => handleFileChange(null)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragOver 
              ? 'border-poker-gold bg-poker-gold/10' 
              : uploading
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-300 hover:border-poker-gold'
          }`}
        >
          <div className="space-y-4">
            <div className="text-gray-400">
              {uploading ? (
                <div className="mx-auto w-12 h-12 animate-spin">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <svg className="mx-auto w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-gray-600">
                {uploading ? (
                  'Kép feltöltése...'
                ) : (
                  <>
                    Húzza ide a képet vagy{' '}
                    <label className="text-poker-gold hover:text-poker-gold/80 cursor-pointer font-medium">
                      tallózza
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </>
                )}
              </p>
              <p className="text-sm text-gray-400">
                PNG, JPG, JPEG formátumok (max. 10MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}