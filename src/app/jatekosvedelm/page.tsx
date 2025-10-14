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
            {/* Age Restrictions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">🔞</span>
                Korhatár Megkötések
              </h3>
              <div className="space-y-4 text-gray-700">
                <p className="font-semibold text-red-600 text-lg">
                  • Szerencsejátékban kizárólag 18 éven felüliek vehetnek részt!
                </p>
                <p>
                  A szerencsejáték szervezők kötelesek a regisztráció és belépési pontokon 
                  ellenőrizni a résztvevők életkorát. A 18 éven aluliak számára a 
                  szerencsejáték tevékenységek szigorúan tilosak.
                </p>
                <p className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <strong>Figyelem:</strong> A korhatár ellenőrzés minden esetben kötelező, 
                  és a szervezők felelősek ennek betartásáért.
                </p>
              </div>
            </div>

            {/* Responsible Gambling Helpline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">📞</span>
                Felelős Szerencsejáték Segélyvonal
              </h3>
              <div className="space-y-4 text-gray-700">
                <div className="text-center bg-green-50 p-6 rounded-lg">
                  <h4 className="text-3xl font-bold text-green-600 mb-2">80/205-352</h4>
                  <p className="text-lg font-semibold text-green-800">Zöld Szám - Ingyenes Országos Segélyvonal</p>
                  <p className="text-green-700 mt-2">24 órában elérhető • Anonim bejelentés lehetséges</p>
                </div>
                <p>
                  A segélyvonal 2 perces időkeretet biztosít a problémák bejelentésére. 
                  A szolgáltatás ingyenes, országosan elérhető, és lehetőség van 
                  anonim bejelentésre is.
                </p>
              </div>
            </div>

            {/* Self-Exclusion Options */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">🚫</span>
                Önkizárási Lehetőségek
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  A játékosok önkéntesen korlátozhatják szerencsejáték hozzáférésüket. 
                  Az alábbi opciók állnak rendelkezésre:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-blue-800">1 év</h4>
                    <p className="text-sm text-blue-600">Rövid távú kizárás</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-orange-800">3 év</h4>
                    <p className="text-sm text-orange-600">Középtávú kizárás</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-red-800">5 év</h4>
                    <p className="text-sm text-red-600">Hosszú távú kizárás</p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  <li>Korlátozható specifikus játéktípusok vagy szerencsejáték szervezők</li>
                  <li>Vonatkozik kaszinókra, kártyatermekre és online szerencsejátékra</li>
                  <li>A kizárás időtartama alatt nem változtatható meg</li>
                </ul>
              </div>
            </div>

            {/* Support Resources */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">🤝</span>
                Támogató Források
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  5 szervezet nyújt segítséget szerencsejáték függőség esetén:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-poker-dark mb-2">Emberbarát Alapítvány</h4>
                    <p className="text-sm">Szerencsejáték függőség kezelése és megelőzése</p>
                  </div>
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-poker-dark mb-2">Nemzeti Játékos Jogok Egyesülete</h4>
                    <p className="text-sm">Játékosok jogainak védelme és támogatása</p>
                  </div>
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-poker-dark mb-2">Lucky Help Közhasznú Alapítvány</h4>
                    <p className="text-sm">Szakszerű segítségnyújtás és rehabilitáció</p>
                  </div>
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-poker-dark mb-2">Walnut Alapítvány</h4>
                    <p className="text-sm">Családi támogatás és tanácsadás</p>
                  </div>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-poker-dark mb-2">Játékos Barát Kft.</h4>
                  <p className="text-sm">Komplex szolgáltatások szerencsejáték problémák esetén</p>
                </div>
              </div>
            </div>

            {/* Legal Protection Mechanisms */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">⚖️</span>
                Jogi Védelmi Mechanizmusok
              </h3>
              <div className="space-y-4 text-gray-700">
                <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                  <h4 className="font-semibold text-amber-800 mb-2">Bírósági Gondnokság</h4>
                  <p className="text-amber-700">
                    Súlyos szerencsejáték függőség esetén lehetőség van bírósági 
                    gondnokság alá helyezésre, amely korlátozza az egyén pénzügyi 
                    döntéshozatali képességét.
                  </p>
                </div>
                <p>
                  Ez a mechanizmus védelmet nyújt azoknak, akik elvesztették az 
                  irányítást szerencsejáték szokásaik felett, és családjuk vagy 
                  önmaguk védelmére van szükség.
                </p>
                <div>
                  <h4 className="font-semibold text-poker-dark mb-2">Kapcsolódó jogszabályok:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>1991. évi XXXIV. törvény a szerencsejáték szervezéséről</li>
                    <li>Az Európai Unió vonatkozó irányelvei</li>
                    <li>Ptk. gondnokságra vonatkozó szabályai</li>
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
                  <p className="text-sm">Szerencsejáték függőség kezelése és megelőzése</p>
                </div>
                <div>
                  <h4 className="font-semibold text-poker-dark">Nemzeti Játékos Jogok Egyesülete</h4>
                  <p className="text-sm">Játékosok jogainak védelme és támogatása</p>
                </div>
                <div>
                  <h4 className="font-semibold text-poker-dark">Lucky Help Közhasznú Alapítvány</h4>
                  <p className="text-sm">Szakszerű segítségnyújtás és rehabilitáció</p>
                </div>
                <div>
                  <h4 className="font-semibold text-poker-dark">Walnut Alapítvány</h4>
                  <p className="text-sm">Családi támogatás és tanácsadás</p>
                </div>
                <div>
                  <h4 className="font-semibold text-poker-dark">Játékos Barát Kft.</h4>
                  <p className="text-sm">Komplex szolgáltatások szerencsejáték problémák esetén</p>
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