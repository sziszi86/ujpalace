import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adatvédelmi Tájékoztató | Palace Poker Szombathely',
  description: 'Palace Poker Szombathely adatvédelmi tájékoztatója és cookie policy.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-poker-light to-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-r from-poker-primary to-poker-gold rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-poker-dark mb-4">
            Adatvédelmi Tájékoztató
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-poker-primary to-poker-gold rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-poker-muted max-w-2xl mx-auto">
            Palace Poker Szombathely adatvédelmi és cookie kezelési tájékoztatója
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-2xl border border-poker-light/50 overflow-hidden">
          <div className="p-8 md:p-12">
            
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-poker-dark mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-poker-primary to-poker-gold rounded-full mr-4"></div>
                Általános Információk
              </h2>
              <div className="space-y-4 text-poker-muted leading-relaxed">
                <p>
                  A Palace Poker Club kártyatermet üzemeltető <strong className="text-poker-dark">Pannon Póker Kft.</strong>
                  (9700 Szombathely, Semmelweis u. 2.) adatvédelmi tájékoztatója.
                </p>
                <p>
                  A kártyatermet látogató személy az alábbi tájékoztató tartalmát elfogadja és erről a kártyateremben 
                  történő regisztrációkor írásos nyilatkozatot tesz.
                </p>
              </div>
            </section>

            {/* Website Data */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-poker-dark mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-poker-primary to-poker-gold rounded-full mr-4"></div>
                Weboldal Adatkezelés
              </h2>
              <div className="bg-poker-light/30 rounded-xl p-6 border border-poker-primary/10">
                <p className="text-poker-muted leading-relaxed">
                  A <strong className="text-poker-dark">www.palacepoker.hu</strong> honlap minimális adatokat tárol látogatóiról. 
                  Csak a technikai működéshez szükséges sütiket használjuk, amelyek nem tartalmaznak személyes adatokat.
                </p>
              </div>
            </section>

            {/* Video Surveillance */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-poker-dark mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-poker-primary to-poker-gold rounded-full mr-4"></div>
                Kamera- és Hangfelvétel
              </h2>
              <div className="space-y-4 text-poker-muted leading-relaxed">
                <p>
                  A kártyaterem <strong className="text-poker-dark">kép- és hangfelvételt rögzít</strong>, melyet 
                  <strong className="text-poker-dark"> 45 napig tárol</strong>.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">Felvételekhez való hozzáférés:</h3>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>A Szerencsejáték Felügyelet ellenőrzési feladatai céljából</li>
                    <li>Az üzemeltető kijelölt személyei a biztonságos működés érdekében</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Personal Data */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-poker-dark mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-poker-primary to-poker-gold rounded-full mr-4"></div>
                Személyes Adatok Kezelése
              </h2>
              <div className="space-y-6">
                <p className="text-poker-muted leading-relaxed">
                  A kártyaterem szolgáltatások igénybevételéhez szükséges, hogy megadja bizonyos személyes adatait.
                  Az adatvédelmi tájékoztató célja, hogy közzétegye az adatkezelési alapelveket, célokat és tényeket.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-4">Rögzítendő Adatok</h3>
                    <ul className="space-y-2 text-blue-700">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        Név
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        Születési adatok
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        Anyja neve
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        Lakcím
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        Állampolgárság
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        Azonosító okmány adatai
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        Fénykép
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h3 className="font-bold text-green-800 mb-4">Adatkezelés Céljai</h3>
                    <ul className="space-y-2 text-green-700">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        Ügyfél-átvilágítás
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        Játékosvédelem
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        Jogszabályi kötelezettségek
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        Biztonságos működés
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Cookie Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-poker-dark mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-poker-primary to-poker-gold rounded-full mr-4"></div>
                Süti (Cookie) Kezelés
              </h2>
              <div className="space-y-6">
                <p className="text-poker-muted leading-relaxed">
                  Weboldalunk sütiket használ a legjobb felhasználói élmény biztosítása érdekében.
                </p>
                
                <div className="bg-poker-light/30 rounded-xl p-6 border border-poker-primary/10">
                  <h3 className="font-bold text-poker-dark mb-4">Milyen sütiket használunk?</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-poker-primary pl-4">
                      <h4 className="font-semibold text-poker-dark">Technikailag szükséges sütik</h4>
                      <p className="text-sm text-poker-muted">Az oldal alapvető működéséhez szükséges sütik.</p>
                    </div>
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-poker-dark">Analitikai sütik</h4>
                      <p className="text-sm text-poker-muted">Látogatói statisztikák és oldal teljesítmény mérése.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Rights */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-poker-dark mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-poker-primary to-poker-gold rounded-full mr-4"></div>
                Jogok és Kapcsolat
              </h2>
              <div className="space-y-6">
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="font-bold text-purple-800 mb-4">Adatkezelési Jogok</h3>
                  <ul className="space-y-2 text-purple-700">
                    <li>• Hozzáférés jogának gyakorlása</li>
                    <li>• Helyesbítés kérése</li>
                    <li>• Törlés kérése (\"elfeledtetéshez való jog\")</li>
                    <li>• Adatkezelés korlátozása</li>
                    <li>• Adathordozhatóság</li>
                    <li>• Tiltakozás joga</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4">Kapcsolat</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Pannon Póker Kft.</strong></p>
                    <p>📍 9700 Szombathely, Semmelweis u. 2.</p>
                    <p>📞 +36 30 971 5832</p>
                    <p>📧 palacepoker kukac hotmail.hu</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Last Updated */}
            <div className="text-center pt-8 border-t border-poker-light/50">
              <p className="text-sm text-poker-muted">
                Utoljára frissítve: 2024. október 14.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}