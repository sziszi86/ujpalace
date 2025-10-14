'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface GalleryImage {
  id: number;
  title: string;
  filename: string;
  alt_text?: string;
  category?: string;
  created_at: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Sample static images for now
  const staticImages: GalleryImage[] = [
    {
      id: 1,
      title: "Palace Poker Terem",
      filename: "poker-room-1.jpg",
      alt_text: "A Palace Poker modern játékterme",
      category: "terem",
      created_at: "2025-01-01"
    },
    {
      id: 2,
      title: "Verseny asztalok",
      filename: "tournament-tables.jpg",
      alt_text: "Professzionális verseny asztalok",
      category: "terem",
      created_at: "2025-01-01"
    },
    {
      id: 3,
      title: "Friday Night Bounty",
      filename: "bounty-tournament.jpg",
      alt_text: "Friday Night Bounty verseny pillanatképe",
      category: "versenyek",
      created_at: "2025-01-01"
    },
    {
      id: 4,
      title: "Main Event győztes",
      filename: "main-event-winner.jpg",
      alt_text: "Main Event verseny győztese",
      category: "versenyek",
      created_at: "2025-01-01"
    },
    {
      id: 5,
      title: "Cash Game akció",
      filename: "cash-game-action.jpg",
      alt_text: "Intenzív cash game pillanat",
      category: "cash-game",
      created_at: "2025-01-01"
    },
    {
      id: 6,
      title: "Palace Poker csapat",
      filename: "poker-team.jpg",
      alt_text: "A Palace Poker szakértő csapata",
      category: "csapat",
      created_at: "2025-01-01"
    }
  ];

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          setImages(data);
        } else {
          // Fallback to static images if API fails
          setImages(staticImages);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        // Fallback to static images if fetch fails
        setImages(staticImages);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Show all images, no filtering needed

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-poker-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Galéria
          </h1>
          <p className="text-xl text-poker-muted max-w-3xl mx-auto">
            Tekintsd meg a Palace Poker világát - termünk, versenyeink és közösségünk képekben
          </p>
        </div>


        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="card-modern overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative h-64">
                <Image
                  src={`/api/image/${image.filename}`}
                  alt={image.alt_text || image.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg mb-1">{image.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-poker-muted text-lg">Nincs megjeleníthető kép a galériában.</p>
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white text-2xl hover:text-poker-primary z-10"
              >
                ✕
              </button>
              <Image
                src={`/api/image/${selectedImage.filename}`}
                alt={selectedImage.alt_text || selectedImage.title}
                width={800}
                height={600}
                className="max-w-full max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white font-bold text-xl mb-2">{selectedImage.title}</h3>
                {selectedImage.alt_text && (
                  <p className="text-gray-300">{selectedImage.alt_text}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="card-modern p-8">
            <h2 className="text-3xl font-bold text-poker-dark mb-4">Látogass el hozzánk!</h2>
            <p className="text-poker-muted text-lg mb-6 max-w-2xl mx-auto">
              A képek csak egy kis ízelítőt adnak abból, ami a Palace Poker-ben vár. 
              Gyere el személyesen, és tapasztald meg a profi póker igazi atmoszféráját!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <h4 className="font-semibold text-poker-dark">Cím</h4>
                <p className="text-poker-muted">Palace Poker Szombathely</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-poker-dark">Telefon</h4>
                <p className="text-poker-muted">+36 30 123 4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}