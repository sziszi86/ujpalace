'use client';

import { useState, useEffect } from 'react';

interface AboutPage {
  id: number;
  title: string;
  content: string;
  features?: string[] | null;
  image?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/about');
        if (response.ok) {
          const data = await response.json();
          setAboutData(data);
        } else {
          setError('Nem sikerült betölteni a tartalmat');
        }
      } catch (err) {
        console.error('Error fetching about data:', err);
        setError('Hiba történt a tartalom betöltése során');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-poker-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poker-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-poker-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-poker-dark mb-4">Hiba</h2>
          <p className="text-poker-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-poker-light">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-poker-dark via-poker-secondary to-poker-dark py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold gradient-text mb-6">Palace Poker Szombathely</h1>
          <p className="text-xl text-poker-accent max-w-2xl mx-auto leading-relaxed">
            Nyugat-Magyarország első hivatalos póker klubja
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {aboutData.length === 0 ? (
          <div className="space-y-12">
            {/* Main Content */}
            <div className="card-modern p-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-poker-muted leading-relaxed mb-6 text-lg">
                  <strong className="text-poker-primary">Lépj be a Palace Poker Clubba, és megérted, hogy játékosaink és vendégeink, miért térnek vissza hozzánk újra meg újra!</strong>
                </p>
                
                <p className="text-poker-muted leading-relaxed mb-8">
                  <strong>Szombathely szívében, exkluzív környezetben várjuk régi és új pókerezni vágyó vendégeinket!</strong> 
                  Versenyeink és cash game-jeink széles választékot nyújtanak minden kategóriában.
                </p>

                <div className="bg-gradient-to-r from-poker-primary/10 to-poker-secondary/10 rounded-lg p-6 mb-8">
                  <h3 className="text-2xl font-bold text-poker-primary mb-4 text-center">🎰 Kínálatunk</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-poker-primary text-xl">🏆</span>
                        <span className="text-poker-muted">változatos, népszerű versenyek</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-poker-primary text-xl">💰</span>
                        <span className="text-poker-muted">minden játéknapon cash game (100/200, 200/400, 500/500)</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-poker-primary text-xl">🏢</span>
                        <span className="text-poker-muted">tágas, légkondicionált terem, 6 asztallal</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-poker-primary text-xl">👨‍💼</span>
                        <span className="text-poker-muted">tapasztalt, barátságos személyzet</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-poker-primary text-xl">👥</span>
                        <span className="text-poker-muted">igény szerint baráti társaságoknak/cégeknek külön versenyek és cash game</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-poker-primary text-xl">🍺</span>
                        <span className="text-poker-muted">pókerbár széles választékkal, korrekt árakkal, kedves kiszolgálással</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-poker-primary text-xl">📶</span>
                        <span className="text-poker-muted">internetkapcsolat (Wi-Fi)</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-poker-primary text-xl">🅿️</span>
                        <span className="text-poker-muted">bőséges parkolási lehetőség</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-poker-muted leading-relaxed mb-6">
                  <strong>Osztóink bármikor rendelkezésére állnak a kezdő játékosoknak.</strong> 
                  Pókerbárunkban széles választékkal, korrekt árakkal, különböző italakciókkal és kedves kiszolgálással várunk.
                </p>

                <div className="bg-poker-accent/10 border-l-4 border-poker-accent p-6 rounded-r-lg mb-8">
                  <p className="text-poker-dark font-medium mb-2">📋 Első alkalommal:</p>
                  <p className="text-poker-muted">Kérünk, hozz magaddal fényképes igazolványt a regisztrációhoz!</p>
                </div>

                <p className="text-poker-muted leading-relaxed mb-8 text-lg">
                  <strong>Nem számít, hogy komoly játékos vagy, szórakozásból játszol, vagy csak szeretnél jobban megismerkedni a pókerrel. Mi mindenki számára tartogatunk valamit!</strong>
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="text-red-800 font-bold mb-3">⚠️ FONTOS FIGYELMEZTETÉS</h4>
                  <p className="text-red-700 leading-relaxed">
                    <strong>Felhívjuk a játékosok figyelmét a 18 év alattiak játéktilalmára, a túlzásba vitt szerencsejáték ártalmaira és a szenvedélybetegség kialakulásának veszélyeire!</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="card-modern p-8">
              <h3 className="text-2xl font-bold text-poker-primary mb-6 text-center">📍 Kapcsolat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-poker-dark mb-4">Cím</h4>
                  <p className="text-poker-muted mb-2">Palace Poker Szombathely</p>
                  <p className="text-poker-muted">9700 Szombathely, Semmelweis u. 2.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-poker-dark mb-4">Elérhetőség</h4>
                  <p className="text-poker-muted mb-2">📞 +36 30 971 5832</p>
                  <p className="text-poker-muted">🕒 Sze, P-Szo: 19:00-04:00</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {aboutData.map((page, index) => (
              <div key={page.id}>
                <div className="card-modern overflow-hidden">
                  {page.image && (
                    <div className="h-64 bg-gray-200 relative overflow-hidden">
                      <img 
                        src={page.image} 
                        alt={page.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                  )}
                  <div className="p-8">
                    <h2 className="text-3xl font-bold gradient-text mb-6">{page.title}</h2>
                    <div className="prose prose-lg max-w-none">
                      <div 
                        className="text-poker-muted leading-relaxed prose-strong:text-poker-primary"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                      />
                    </div>
                    {page.features && page.features.length > 0 && (
                      <div className="mt-8 bg-poker-primary/5 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-poker-primary mb-6">✨ Szolgáltatásaink</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {page.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-poker-primary rounded-full mt-2"></div>
                              <span className="text-poker-muted">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}