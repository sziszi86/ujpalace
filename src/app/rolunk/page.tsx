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
  const [aboutData, setAboutData] = useState<AboutPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        // Fetch only the first about page (ID 1)
        const response = await fetch('/api/admin/about/1');
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
        {!aboutData ? (
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
            <div className="card-modern overflow-hidden">
              {aboutData.image && (
                <div className="h-80 bg-gray-200 relative overflow-hidden">
                  <img 
                    src={aboutData.image} 
                    alt={aboutData.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      {aboutData.title}
                    </h2>
                  </div>
                </div>
              )}
              
              <div className="p-8">
                {!aboutData.image && (
                  <h2 className="text-4xl font-bold gradient-text mb-8 text-center">
                    {aboutData.title}
                  </h2>
                )}
                
                <div className="prose prose-lg max-w-none mb-8">
                  <div 
                    className="text-poker-muted leading-relaxed prose-strong:text-poker-primary prose-p:mb-6 prose-headings:text-poker-primary"
                    dangerouslySetInnerHTML={{ __html: aboutData.content }}
                  />
                </div>
                
                {aboutData.features && aboutData.features.length > 0 && (
                  <div className="bg-gradient-to-br from-poker-primary/5 to-poker-secondary/5 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-poker-primary mb-8 text-center">
                      ✨ Szolgáltatásaink és jellemzőink
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {aboutData.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-4 bg-white/50 rounded-lg p-4">
                          <div className="flex-shrink-0 w-3 h-3 bg-poker-primary rounded-full mt-1.5"></div>
                          <span className="text-poker-dark font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional info sections */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-6">
                <h3 className="text-xl font-bold text-poker-primary mb-4 flex items-center">
                  <span className="text-2xl mr-3">📍</span>
                  Elérhetőség
                </h3>
                <div className="space-y-3 text-poker-muted">
                  <p><strong>Cím:</strong> 9700 Szombathely, Semmelweis u. 2.</p>
                  <p><strong>Telefon:</strong> +36 30 971 5832</p>
                  <p><strong>Nyitva:</strong> Sze, P-Szo: 19:00-04:00</p>
                </div>
              </div>
              
              <div className="card-modern p-6">
                <h3 className="text-xl font-bold text-poker-primary mb-4 flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  Fontos tudnivalók
                </h3>
                <div className="space-y-2 text-poker-muted text-sm">
                  <p>• 18 éven aluliak nem játszhatnak</p>
                  <p>• Első alkalommal hozd magaddal a személyigazolványod</p>
                  <p>• A túlzásba vitt szerencsejáték ártalmas</p>
                  <p>• <a href="/jatekosvedelm" className="text-poker-primary hover:underline">Játékosvédelmi információk</a></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}