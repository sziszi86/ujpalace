'use client';

import { useState, useEffect } from 'react';

interface AboutPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description?: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AboutPage() {
  const [aboutPages, setAboutPages] = useState<AboutPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutPages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/about');
        
        if (!response.ok) {
          throw new Error('Failed to fetch about pages');
        }
        
        const data = await response.json();
        setAboutPages(data);
      } catch (error) {
        console.error('Error fetching about pages:', error);
        setError('Failed to load about pages');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutPages();
  }, []);

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
            <h1 className="text-4xl font-bold text-poker-dark mb-4">Rólunk</h1>
            <p className="text-poker-muted">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const mainPage = aboutPages.find(page => page.slug === 'introduction') || aboutPages[0];

  return (
    <div className="min-h-screen bg-poker-light py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Rólunk
          </h1>
          <p className="text-xl text-poker-muted max-w-3xl mx-auto">
            Ismerd meg a Palace Poker történetét és csapatát
          </p>
        </div>

        {mainPage ? (
          <div className="card-modern p-8 mb-8">
            <h2 className="text-3xl font-bold text-poker-dark mb-6">{mainPage.title}</h2>
            <div 
              className="prose max-w-none text-poker-muted leading-relaxed"
              dangerouslySetInnerHTML={{ __html: mainPage.content }}
            />
          </div>
        ) : (
          <div className="card-modern p-8 mb-8">
            <h2 className="text-3xl font-bold text-poker-dark mb-6">Palace Poker Szombathely</h2>
            <div className="prose max-w-none text-poker-muted leading-relaxed space-y-6">
              <p>
                Üdvözöljük a Palace Poker Szombathely hivatalos weboldalán! 
                Mi vagyunk Vas megye legmodernebb és legfelszereltebb pókertermének büszke üzemeltetői.
              </p>
              
              <p>
                A Palace Poker nem csupán egy hely, ahol kártyázni lehet - ez egy közösség, 
                ahol a póker szerelmesei találkozhatnak, versenyezhetnek és fejlődhetnek együtt.
              </p>

              <h3 className="text-xl font-semibold text-poker-dark mt-8 mb-4">Miért válassz minket?</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-poker-primary mr-3">🎯</span>
                  <span>Professzionális környezet tapasztalt dealerekkel</span>
                </li>
                <li className="flex items-start">
                  <span className="text-poker-primary mr-3">🏆</span>
                  <span>Rendszeres versenyek és tornák minden szintű játékos számára</span>
                </li>
                <li className="flex items-start">
                  <span className="text-poker-primary mr-3">💰</span>
                  <span>Vonzó cash game-ek és versenystruktúrák</span>
                </li>
                <li className="flex items-start">
                  <span className="text-poker-primary mr-3">👥</span>
                  <span>Barátságos és befogadó közösség</span>
                </li>
                <li className="flex items-start">
                  <span className="text-poker-primary mr-3">🏢</span>
                  <span>Modern és komfortos terem kényelmes asztalokkal</span>
                </li>
              </ul>

              <p>
                Csatlakozz hozzánk, és tapasztald meg a póker igazi varázsát! 
                Legyen szó kezdő vagy profi szintről, nálunk mindenki megtalálja a számítását.
              </p>
            </div>
          </div>
        )}

        {aboutPages.filter(page => page.slug !== 'introduction').map((page) => (
          <div key={page.id} className="card-modern p-8 mb-8">
            <h2 className="text-2xl font-bold text-poker-dark mb-4">{page.title}</h2>
            <div 
              className="prose max-w-none text-poker-muted leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        ))}

        <div className="text-center mt-12">
          <div className="card-modern p-8">
            <h3 className="text-2xl font-bold text-poker-dark mb-4">Kapcsolat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-poker-dark mb-2">Cím</h4>
                <p className="text-poker-muted">Palace Poker Szombathely</p>
                <p className="text-poker-muted">9700 Szombathely</p>
              </div>
              <div>
                <h4 className="font-semibold text-poker-dark mb-2">Elérhetőség</h4>
                <p className="text-poker-muted">📞 +36 30 123 4567</p>
                <p className="text-poker-muted">✉️ palacepoker kukac hotmail.hu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}