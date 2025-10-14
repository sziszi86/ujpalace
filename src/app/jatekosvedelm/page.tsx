import Link from 'next/link';

export default function PlayerProtectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-poker-light to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Játékosvédelmi Tájékoztató
          </h1>
          <p className="text-xl text-poker-muted max-w-3xl mx-auto">
            Felelős szerencsejáték és játékosvédelem - segítségnyújtás a biztonságos játékhoz
          </p>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">🆘 Játékosvédelmi Zöld Szám</h2>
            <div className="text-4xl font-bold mb-2">36 80 205 352</div>
            <p className="text-lg">Ingyenes, országos, 24 órás segélyvonal</p>
            <p className="text-sm opacity-90 mt-2">
              Szerencsejátékban csak 18 éven felüliek vehetnek részt!<br/>
              A túlzásba vitt szerencsejáték ártalmas, függőséget okozhat!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Warning Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">⚠️</span>
                Fontos Figyelmeztetés
              </h3>
              <div className="space-y-4 text-gray-700">
                <p className="font-semibold text-red-600">
                  • Szerencsejátékban csak 18 éven felüliek vehetnek részt!
                </p>
                <p className="font-semibold text-red-600">
                  • A túlzásba vitt szerencsejáték ártalmas, függőséget okozhat!
                </p>
                <p>
                  Ha úgy érzi, hogy a szerencsejáték problémát jelent az életében, 
                  vagy szeretne segítséget kérni, ne habozzon kapcsolatba lépni 
                  a játékosvédelmi szolgálatokkal.
                </p>
              </div>
            </div>

            {/* Player Protection Measures */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">🛡️</span>
                Játékosvédelmi Intézkedések
              </h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-poker-dark mb-2">Önkizárás</h4>
                  <p>Lehetőség van arra, hogy saját maga kérje kizárását a szerencsejáték szervezőknél.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-poker-dark mb-2">Játékidő korlátozás</h4>
                  <p>Beállíthatja a maximális játékidőt és tét összegeket.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-poker-dark mb-2">Családi védelem</h4>
                  <p>Családtagok kérhetik szerettük kizárását megfelelő eljárás keretében.</p>
                </div>
              </div>
            </div>

            {/* Legal Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">⚖️</span>
                Jogi Információk
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  A szerencsejáték szervezése és lebonyolítása szigorú jogszabályi 
                  keretek között történik Magyarországon. A játékosvédelem 
                  biztosítása minden szerencsejáték szervező kötelessége.
                </p>
                <div>
                  <h4 className="font-semibold text-poker-dark mb-2">Kapcsolódó jogszabályok:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>1991. évi XXXIV. törvény a szerencsejáték szervezéséről</li>
                    <li>Az Európai Unió vonatkozó irányelvei</li>
                    <li>Adatvédelmi és fogyasztóvédelmi jogszabályok</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">📞</span>
                Segítség és Kapcsolat
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Játékosvédelmi Zöld Szám</h4>
                  <p className="text-2xl font-bold text-green-600">36 80 205 352</p>
                  <p className="text-sm text-green-700">Ingyenes, 24 órás segélyvonal</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Palace Poker Kapcsolat</h4>
                  <p className="text-blue-700">📧 info@palacepoker.hu</p>
                  <p className="text-blue-700">📞 +36 30 971 5832</p>
                  <p className="text-blue-700">📍 9700 Szombathely, Semmelweis u. 2.</p>
                </div>
              </div>
            </div>

            {/* Support Organizations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">🤝</span>
                Segítő Szervezetek
              </h3>
              <div className="space-y-3 text-gray-700">
                <div>
                  <h4 className="font-semibold text-poker-dark">Emberbarát Alapítvány</h4>
                  <p className="text-sm">Szenvedélybetegek segítése</p>
                </div>
                <div>
                  <h4 className="font-semibold text-poker-dark">Szerencsés Segítség Alapítvány</h4>
                  <p className="text-sm">Játékfüggőség kezelése</p>
                </div>
                <div>
                  <h4 className="font-semibold text-poker-dark">Játékos Barát Kft.</h4>
                  <p className="text-sm">Felelős szerencsejáték támogatása</p>
                </div>
                <div>
                  <h4 className="font-semibold text-poker-dark">Diótörés Alapítvány</h4>
                  <p className="text-sm">Család- és függőségvédelem</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">📋</span>
                Dokumentumok
              </h3>
              <div className="space-y-3">
                <a 
                  href="/documents/jatekosvedelmi-tajekoztato.pdf" 
                  target="_blank"
                  className="flex items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl mr-3">📄</span>
                  <div>
                    <p className="font-semibold text-red-800">Játékosvédelmi Tájékoztató PDF</p>
                    <p className="text-sm text-red-600">Részletes útmutató letöltése</p>
                  </div>
                </a>
                
                <a 
                  href="/documents/onkizaras-kerelm.pdf" 
                  target="_blank"
                  className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl mr-3">📝</span>
                  <div>
                    <p className="font-semibold text-blue-800">Önkizárás Kérelem</p>
                    <p className="text-sm text-blue-600">Kérelemre letölthető forma</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">🔗</span>
                Hasznos Linkek
              </h3>
              <div className="space-y-3">
                <Link 
                  href="/rolunk"
                  className="block p-3 bg-poker-light hover:bg-poker-accent/20 rounded-lg transition-colors"
                >
                  <span className="font-semibold text-poker-dark">Rólunk</span>
                  <p className="text-sm text-poker-muted">Palace Poker bemutatkozás</p>
                </Link>
                
                <Link 
                  href="/contact"
                  className="block p-3 bg-poker-light hover:bg-poker-accent/20 rounded-lg transition-colors"
                >
                  <span className="font-semibold text-poker-dark">Kapcsolat</span>
                  <p className="text-sm text-poker-muted">Elérhetőségek és információk</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="mt-12 p-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl border border-amber-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-amber-800 mb-2">
              ⚠️ Emlékeztető
            </h3>
            <p className="text-amber-700">
              A szerencsejáték szórakozás legyen, ne probléma! Ha úgy érzi, hogy 
              elveszítette az irányítást, azonnal kérjen segítséget a fenti elérhetőségeken.
            </p>
            <p className="text-amber-600 text-sm mt-2">
              Kérje bejegyzését a játékosvédelmi nyilvántartásba!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}