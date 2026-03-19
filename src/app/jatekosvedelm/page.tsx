import Link from 'next/link';

export default function PlayerProtectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-poker-light to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Játékosvédelem
          </h1>
          <p className="text-xl text-poker-muted max-w-3xl mx-auto">
            Felelős játékszervezés és játékosvédelmi információk
          </p>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">📞 Játékosvédelmi Zöld Szám</h2>
            <div className="text-4xl font-bold mb-2">+36 80 205 352</div>
            <p className="text-lg">Ingyenes, 0-24 órás segélyvonal</p>
            <p className="text-sm opacity-90 mt-2">
              Szerencsejátékban csak 18 éven felüliek vehetnek részt!<br/>
              A túlzásba vitt szerencsejáték ártalmas, függőséget okozhat!
            </p>
          </div>
        </div>

        {/* Intro Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              A felelős játékszervezés részletes szabályairól szóló 5/2021. (X.21.) SZTFH rendelet 4. §-a alapján a Szabályozott Tevékenységek Felügyeleti Hatósága a felelős játékszervezés és a fogyasztóvédelmi, játékosvédelmi érdekek érvényesülése érdekében a szerencsejáték szervezéséről szóló 1991. évi XXXIV. törvény 1. § (5a)-(6d) bekezdésében és a rendeletben foglaltakkal kapcsolatos bejelentések, panaszok, javaslatok szóbeli előterjesztésére játékosvédelmi zöld számot tart fenn.
            </p>
          </div>
        </div>

        {/* Green Number Detailed Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
            <span className="text-3xl mr-3">☎️</span>
            Játékosvédelmi zöld szám
          </h3>
          <div className="space-y-4 text-gray-700">
            <div className="text-center bg-green-50 p-6 rounded-lg">
              <h4 className="text-3xl font-bold text-green-600 mb-2">+36 80 205 352</h4>
              <p className="text-lg font-semibold text-green-800">Zöld Szám - Ingyenes Országos Segélyvonal</p>
              <p className="text-green-700 mt-2">0-24 órában elérhető • Anonim bejelentés lehetséges</p>
            </div>
            <p>
              A zöld szám 0-24 óráig üzemel, ingyenesen hívható az egész ország területéről. A szám felhívásakor egy rövid üdvözlő üzenetet követően, a sípszó után van lehetőség a bejelentés megtételére, melyre az ügyfeleknek 2 perc áll rendelkezésére.
            </p>
            <p>
              Ezen idő alatt közölni kell minden olyan, az ügyre vonatkozó lényeges információt, ami alapján az SZTFH az eljárást le tudja folytatni.
            </p>
            <p className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
              <strong>Fontos:</strong> A bejelentés megtételének nem feltétele a név és elérhetőség megadása, azonban a közérdekűnek minősülő bejelentéssel összefüggő további tájékoztatás a bejelentő felé kizárólag nevének és lakcímének megadása esetén lehetséges.
            </p>
            <p>
              A játékosvédelmi zöld számot valamennyi szerencsejáték-szervező köteles a honlapján feltüntetni, a távszerencsejáték és online kaszinójáték szervező kivételével a belépésnél és az értékesítési helyen, pénztárnál figyelemfelhívó módon közzétenni.
            </p>
            <div className="text-sm text-gray-600">
              <p><strong>Link:</strong></p>
              <a href="https://sztfh.hu/tevekenysegek/szerencsejatek-felugyelet/jatekosvedelem/" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-poker-accent hover:underline break-all">
                https://sztfh.hu/tevekenysegek/szerencsejatek-felugyelet/jatekosvedelem/
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Player Protection Tools Introduction */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">🛡️</span>
                JÁTÉKOSVÉDELMI TÁJÉKOZTATÓ
              </h3>
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Tájékoztató a játékosvédelmi eszközök bevezetéséről
              </h4>
              <div className="space-y-4 text-gray-700">
                <p>
                  2016. január 1-jétől a szerencsejáték-szervezők a 18 év alattiak, bírósági korlátozás és jelentős önkorlátozás alatt állók fokozott védelme mellett olyan játékosvédelmi eszközöket biztosítanak a játékosoknak, amelyek játék közben is csökkenthetik a túlzásba vitt szerencsejáték káros hatásait.
                </p>
                <p className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  A szervezők a szerencsejáték szolgáltatás nyújtása, kereskedelmi kommunikációja, reklámozása során kötelesek felhívni a játékos figyelmét a túlzásba vitt szerencsejáték ártalmaira és a szenvedélybetegség kialakulásának veszélyeire.
                </p>
                <p>
                  Tájékoztatni kell a játékost arról is, hogy a szervező játékaihoz kapcsolódóan a szerencsejáték káros hatásainak csökkentésére milyen önkorlátozó, önkizáró intézkedések – röviden: játékosvédelmi eszközök – állnak rendelkezésre.
                </p>
                <p>
                  A játékosvédelmi eszközöket a részvételi szabályzatban részletesen be kell mutatni. Minden játékszervező köteles a honlapján és az értékesítő helyen, pénztárnál a játékosvédelmi zöld számot közzétenni.
                </p>
              </div>
            </div>

            {/* 18 Age Restriction */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">🔞</span>
                A 18 ÉV ALATTIAK FOKOZOTT VÉDELME ÉS JÁTÉKTILALMA
              </h3>
              <div className="space-y-4 text-gray-700">
                <p className="font-semibold text-red-600 text-lg">
                  Magyarországon a 18 év alattiak – a nem folyamatosan szervezett sorsolásos játék (tombola) kivételével – szerencsejátékban nem vehetnek részt.
                </p>
                <p>
                  A 18 év alattiak fokozott védelmét a játékszervezők egyrészt a játékosok életkorának ellenőrzésével, másrészt a reklámokban, népszerűsítő anyagokban a 18 év alattiak játéktilalmára figyelmeztető felhívásokkal biztosítják.
                </p>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-semibold text-red-800 mb-2">Személyazonosításhoz kötött játékok:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-700">
                    <li>Játékkaszinó</li>
                    <li>Kártyaterem (pókerterem)</li>
                    <li>Távszerencsejáték</li>
                    <li>Online kaszinójáték</li>
                  </ul>
                </div>
                <p>
                  A személyazonosításhoz kötött játékok esetén a játékszervező – a pénzmosás ellenes szabályok betartása érdekében – a játékost azonosítja és nyilvántartásba veszi. A nyilvántartásba vétel előtt az azonosító adatokat, köztük a játékos életkorát ellenőrizni kell.
                </p>
                <p className="bg-amber-50 p-4 rounded-lg">
                  <strong>Fontos:</strong> Ha az ellenőrzés alapján a játékos a 18. életévét még nem töltötte be, vagy életkora nem állapítható meg, a játékszervező a nyilvántartásba vételét megtagadja.
                </p>
                <div>
                  <p className="font-semibold mb-2">Személyazonosításhoz nem kötött játékok:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Tippmix, Tippmixpro</li>
                    <li>Totó, Góltotó</li>
                    <li>Lóversenyfogadás</li>
                    <li>Lottójátékok, Eurojackpot</li>
                    <li>Kenó, Luxor, Puttó</li>
                    <li>"Kaparós" sorsjegyek</li>
                  </ul>
                </div>
                <p>
                  A játékban való részvételhez ezeknél a szerencsejátékoknál nem kötelező előzetesen a személyazonosságot, életkort igazolvány megtekintésével minden esetben ellenőrizni. A játékszervező kétség esetén vagy szúrópróbaszerűen ellenőrzi a játékos életkorát.
                </p>
              </div>
            </div>

            {/* Required Protection Tools */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">⚙️</span>
                KÖTELEZŐ JÁTÉKOSVÉDELMI ESZKÖZÖK
              </h3>
              <div className="space-y-4 text-gray-700">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Játékkaszinókban:</h4>
                  <p className="text-blue-700">
                    Kötelező biztosítani a játékos belépésének és/vagy a pénztárban vásárolt zseton napi vagy havi összegének korlátozását. A korlátozást a játékos választása szerint 3 hónap, 6 hónap, 1 év vagy 2 év időtartamra kell biztosítani.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Kártyatermekben:</h4>
                  <p className="text-purple-700">
                    A szervező a belépés és/vagy a pénztárban vásárolt zseton napi vagy havi összegének korlátozását és/vagy a készpénzes lebonyolítású kártyajátékok, versenyrendszerű lebonyolítású kártyajáték nevezési díjainak alacsonyabb küszöbértékeit biztosíthatja. Az intézkedést 3 hónap, 6 hónap, 1 év vagy 2 év időtartamban kell biztosítani.
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">Távszerencsejáték és online kaszinójáték:</h4>
                  <p className="text-amber-700 mb-2">A szervezők kötelesek biztosítani:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>Önkizárás intézkedést</li>
                    <li>Befizetés maximális összegének korlátozását</li>
                    <li>Tét maximális összegének meghatározását</li>
                    <li>Veszteség maximális összegének korlátozását</li>
                    <li>Játékban való részvétel maximális időtartamának meghatározását</li>
                    <li>Játékban töltött időről figyelmeztető jelzést</li>
                  </ul>
                </div>

                <p className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <strong>Fontos:</strong> A 180 nap alatti önkizárást nem lehet visszavonni, az ennél hosszabb időtartamú önkizárás 180 nap elteltével vonható vissza.
                </p>
              </div>
            </div>

            {/* Self-Exclusion Options */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">🚫</span>
                JELENTŐS ÖNKORLÁTOZÓ NYILATKOZAT
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  A személyazonosításhoz kötött szerencsejátékokra 2016. január 1-jétől jelentős önkorlátozó nyilatkozat tehető. A nyilatkozattal a játékos a játékkaszinóba, kártyaterembe való belépését, a távszerencsejáték, online kaszinójáték oldalakon való regisztrációját és az ilyen oldalakra való belépését a nyilatkozatban meghatározott időtartamra kizárja.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-blue-800">1 év</h4>
                    <p className="text-sm text-blue-600">Nem vonható vissza</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-orange-800">3 év</h4>
                    <p className="text-sm text-orange-600">2 év után visszavonható</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-red-800">5 év</h4>
                    <p className="text-sm text-red-600">2 év után visszavonható</p>
                  </div>
                </div>

                <p className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <strong>Fontos:</strong> A nyilatkozatban négy szerencsejáték fajta (játékkaszinó, kártyateremben szervezett kártyajáték, távszerencsejáték vagy online kaszinójáték) közül egy vagy több jelölhető meg.
                </p>

                <div>
                  <p className="font-semibold mb-2">Nyilatkozat benyújtása:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Teljes bizonyító erejű magánokiratban postai úton</li>
                    <li>Személyesen az SZTFH-nál</li>
                    <li>Elektronikusan e-Papír szolgáltatás felhasználásával (Ügyfélkapuval rendelkező ügyfelek)</li>
                  </ul>
                </div>

                <p>
                  A hatóság a nyilatkozatot bevezeti a játékosvédelmi nyilvántartásba és a nyilvántartás elektronikus, esetről-esetre lekérdezhető kivonatát a szervezők rendelkezésére bocsátja.
                </p>
              </div>
            </div>

            {/* Court Guardianship */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">⚖️</span>
                BÍRÓSÁGI ÉS JELENTŐS ÖNKORLÁTOZÁS
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  2016. január 1-től a játékkaszinó, a kártyaterem, a távszerencsejáték és az online kaszinójáték szervezők közreműködnek a bírósági korlátozás és a saját döntésük alapján korlátozás alatt álló játékosok fokozott védelmében.
                </p>

                <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                  <h4 className="font-semibold text-amber-800 mb-2">Bírósági korlátozás alatt állók</h4>
                  <p className="text-amber-700">
                    Azok a személyek, akiknek cselekvőképességét a bíróság teljesen vagy – játékfüggőség miatt – részlegesen korlátozta. Önállóan szerződést, így szerencsejátékban való részvételre szóló szerződést nem, vagy csak korlátozott körben köthetnek.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-800 mb-2">Saját döntés alapján korlátozás alatt állók</h4>
                  <p className="text-blue-700">
                    Azok a játékosok, akik saját elhatározásuk alapján – játékfüggőség, problémás játék miatt vagy más okból – jelentős önkorlátozó nyilatkozatot tettek és ezzel a személyazonosság ellenőrzése után igénybe vehető szerencsejátékhoz a hozzáférésüket 1-5 éves időtartamra kizárták.
                  </p>
                </div>

                <p>
                  A játékosvédelmi nyilvántartást a Szerencsejáték Felügyelet (SZF) vezeti. A nyilvántartásban szereplő adatok két forrásból származnak: bírósági korlátozás esetén a bíróság adatszolgáltatásából, saját döntésen alapuló korlátozás esetén pedig a jelentős önkorlátozó nyilatkozatból.
                </p>

                <p className="bg-red-50 p-4 rounded-lg">
                  <strong>Adatvédelem:</strong> A nyilvántartás adatai között a korlátozás oka – játékfüggőség vagy más ok – nem szerepel, így a korlátozás valódi okát, személyes hátterét sem a nyilvántartást vezető hatóság, sem a nyilvántartást használó szervező nem ismerheti meg.
                </p>
              </div>
            </div>

            {/* Q&A Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">❓</span>
                KÉRDÉSEK ÉS VÁLASZOK
              </h3>
              <div className="space-y-6 text-gray-700">
                <div>
                  <h4 className="font-semibold text-poker-dark mb-2">Miért van szükség játékosvédelmi eszközökre?</h4>
                  <p>
                    A szerencsejáték szórakozási lehetőség. A túlzásba vitt szerencsejátéknak azonban súlyos következményei lehetnek: kóros játékfüggőség alakulhat ki, a betegség a játékost és családi, baráti kapcsolatait is tönkreteheti. A játékosvédelmi intézkedések elsősorban a szerencsejáték káros hatásainak csökkentésére, kiküszöbölésére szolgálnak.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-poker-dark mb-2">Mikortól vehetem igénybe a játékosvédelmi eszközöket?</h4>
                  <p>
                    A szervezők játékosvédelmi eszközeiket 2016. január 1-től biztosítják a játékosoknak. Jelentős önkorlátozó nyilatkozatot szintén 2016. január 1-jétől lehet tenni, a játékosvédelmi nyilvántartást a személyazonosításhoz kötött játékok szervezői 2016. január 1-jétől kérdezhetik le.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-poker-dark mb-2">Szükség van orvos, pszichológus szakvéleményére?</h4>
                  <p>
                    Nincs. A játékosvédelmi eszközöket a szerencsejáték szervezők valamennyi játékos részére feltétel nélkül és ingyenesen biztosítják. A játékosvédelmi eszköz igénybevételét nem kell indokolni.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-poker-dark mb-2">Mi a célja a játékosvédelmi nyilvántartásnak?</h4>
                  <p>
                    A játékosvédelmi nyilvántartás a bírósági korlátozás és a jelentős önkorlátozás alatt állók védelmét szolgálja. A bírósági korlátozás alatt állók esetén biztosítható, hogy a cselekvőképességükben korlátozott személyek játékkaszinóban, kártyateremben, online oldalakon szerencsejátékot ne játsszanak. A jelentős önkorlátozás alatt állók esetén a nyilvántartás célja a játékos szerencsejátékhoz való hozzáférését korlátozó döntésének a támogatása.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-poker-dark mb-2">Kérheti-e a házastársam, családtagom a korlátozást helyettem?</h4>
                  <p>
                    Nem, a jelentős önkorlátozó nyilatkozatot kizárólag a játékos, saját nevében, saját döntése alapján teheti meg. A játékos döntéshozatalát a házastárs és a családtagok, barátok bátoríthatják, támogathatják, de a játékos helyett a nyilatkozatot nem tehetik meg.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Services - Community Care */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">🏘️</span>
                SZOCIÁLIS ELLÁTÁS - KÖZÖSSÉGI SZOLGÁLTATÁSOK
              </h3>
              <div className="space-y-4 text-gray-700">
                <p className="text-sm font-semibold">
                  Problémás játékkal és kóros játékszenvedéllyel élő személyek részére közösségi ellátást nyújtó szolgáltatók (pszichiátriai betegek részére)
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Budapest - példák:</h4>
                  <div className="text-sm space-y-1 text-blue-700">
                    <p>• Ébredések Alapítvány (1089 Budapest, Kávária tér 5.)</p>
                    <p>• Soteria Alapítvány Klubházak</p>
                    <p>• Moravcsik Alapítvány</p>
                    <p>• Félsziget Klubház (1126 Budapest)</p>
                    <p>• Harmónia Ház Józsefváros</p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Vidéki szolgáltatók - példák:</h4>
                  <div className="text-sm space-y-1 text-green-700">
                    <p>• RÉV Szenvedélybeteg-segítő Szolgálat (Kecskemét)</p>
                    <p>• Segítő Szolgálat (Szeged)</p>
                    <p>• Pszichiátriai Betegek Nappali Intézménye (Csongrád)</p>
                    <p>• Támogató Szolgálat (Jászberény)</p>
                    <p>• Szivárvány Közösségi Ellátás (Nyíregyháza)</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 italic">
                  A teljes lista minden megyében elérhető szolgáltatókat tartalmaz. Részletes elérhetőségek a hivatalos játékosvédelmi dokumentumokban.
                </p>
              </div>
            </div>

            {/* Day Care Services */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">☀️</span>
                NAPPALI ELLÁTÁST NYÚJTÓ INTÉZMÉNYEK
              </h3>
              <div className="space-y-4 text-gray-700">
                <p className="text-sm font-semibold mb-3">
                  Pszichiátriai és szenvedélybetegek nappali ellátása
                </p>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Pszichiátriai betegek nappali ellátása - Példák:</h4>
                  <div className="text-sm space-y-2 text-purple-700">
                    <div>
                      <p className="font-medium">Budapest:</p>
                      <p className="text-xs">• Félsziget Klubház, Harmónia Ház, Moravcsik Alapítvány intézményei</p>
                    </div>
                    <div>
                      <p className="font-medium">Vidék:</p>
                      <p className="text-xs">• Békés megye: Békési Mentálhigiénés Szolgálat, Gadara Ház (Békéscsaba)</p>
                      <p className="text-xs">• Bács-Kiskun: Sorsok Háza intézményei (Kalocsa, Kiskőrös, stb.)</p>
                      <p className="text-xs">• Hajdú-Bihar: Liget Közösségi Ház (Balmazújváros)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">Szenvedélybetegek nappali ellátása - Példák:</h4>
                  <div className="text-sm space-y-2 text-amber-700">
                    <div>
                      <p className="font-medium">Budapest:</p>
                      <p className="text-xs">• RÉV Szenvedélybeteg-segítő Szolgálat (1115 Budapest, Csóka u. 5.)</p>
                      <p className="text-xs">• Félút Centrum, Írisz Klub, ORCZY Klub</p>
                    </div>
                    <div>
                      <p className="font-medium">Vidék:</p>
                      <p className="text-xs">• Bács-Kiskun: RÉV Szolgálat (Kecskemét), Válasz Központ (Kiskunfélegyháza)</p>
                      <p className="text-xs">• Baranya: Bázis Nappali Szolgálat, INDIT Tisztás Központ (Pécs)</p>
                      <p className="text-xs">• Borsod: Laurus Nappali Ellátás (Miskolc)</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 italic">
                  Minden megyében működnek nappali ellátást nyújtó intézmények. A teljes, naprakész lista az SZTFH hivatalos oldalán érhető el.
                </p>
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
                  <p className="text-2xl font-bold text-green-600">+36 80 205 352</p>
                  <p className="text-sm text-green-700">Ingyenes, 24 órás segélyvonal</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Palace Poker Kapcsolat</h4>
                  <p className="text-blue-700">📧 palacepoker kukac hotmail.hu</p>
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
                <div className="border-l-4 border-poker-accent pl-3">
                  <h4 className="font-semibold text-poker-dark">Emberbarát Alapítvány</h4>
                  <p className="text-sm">1105 Budapest, Cserkesz u. 7-9.</p>
                  <p className="text-sm">Szerencsejáték függőség kezelése és megelőzése</p>
                </div>
                <div className="border-l-4 border-poker-accent pl-3">
                  <h4 className="font-semibold text-poker-dark">Nemzeti Játékos Jogok Egyesülete</h4>
                  <p className="text-sm">Játékosok jogainak védelme és támogatása</p>
                </div>
                <div className="border-l-4 border-poker-accent pl-3">
                  <h4 className="font-semibold text-poker-dark">Lucky Help Közhasznú Alapítvány</h4>
                  <p className="text-sm">Szakszerű segítségnyújtás és rehabilitáció</p>
                </div>
                <div className="border-l-4 border-poker-accent pl-3">
                  <h4 className="font-semibold text-poker-dark">Walnut Alapítvány</h4>
                  <p className="text-sm">Családi támogatás és tanácsadás</p>
                </div>
                <div className="border-l-4 border-poker-accent pl-3">
                  <h4 className="font-semibold text-poker-dark">Játékos Barát Kft.</h4>
                  <p className="text-sm">Komplex szolgáltatások szerencsejáték problémák esetén</p>
                </div>
              </div>
            </div>

            {/* Health Services Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">🏥</span>
                Egészségügyi Ellátás
              </h3>
              <div className="space-y-3 text-gray-700">
                <p className="text-sm font-semibold mb-3">
                  A kóros játékszenvedéllyel élő felnőtt személyek részére pszichiátriai ellátást biztosító szolgáltatók:
                </p>
                
                {/* Collapsible regions */}
                <details className="bg-blue-50 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-blue-800 hover:bg-blue-100">
                    📍 Budapest
                  </summary>
                  <div className="p-3 text-sm space-y-2">
                    <div className="border-l-2 border-blue-300 pl-2">
                      <p className="font-medium">Szent Imre Kórház</p>
                      <p className="text-xs text-gray-600">1115 Budapest, Tétényi út 12-16.</p>
                    </div>
                    <div className="border-l-2 border-blue-300 pl-2">
                      <p className="font-medium">Szent János Kórház és Észak-Budapesti Egyesített Kórházak</p>
                      <p className="text-xs text-gray-600">1125 Budapest, Diós árok 1-3.</p>
                    </div>
                    <div className="border-l-2 border-blue-300 pl-2">
                      <p className="font-medium">Dél-Pesti Centrumkórház</p>
                      <p className="text-xs text-gray-600">1097 Budapest, Gyáli út 17-19.</p>
                    </div>
                    <div className="border-l-2 border-blue-300 pl-2">
                      <p className="font-medium">Jahn Ferenc Dél-Pesti Kórház</p>
                      <p className="text-xs text-gray-600">1204 Budapest, Köves út 1.</p>
                    </div>
                    <div className="border-l-2 border-blue-300 pl-2">
                      <p className="font-medium">Nyírő Gyula Kórház - Országos Pszichiátriai és Addiktológiai Központ</p>
                      <p className="text-xs text-gray-600">1135 Budapest, Lehel utca 59.</p>
                    </div>
                    <div className="border-l-2 border-blue-300 pl-2">
                      <p className="font-medium">Emberbarát Alapítvány</p>
                      <p className="text-xs text-gray-600">1105 Budapest, Cserkesz u. 7-9.</p>
                    </div>
                    <div className="border-l-2 border-blue-300 pl-2">
                      <p className="font-medium">Magyar Honvédség Egészségügyi Központ</p>
                      <p className="text-xs text-gray-600">1121 Budapest, Szanatórium u. 2/A.</p>
                    </div>
                    <div className="border-l-2 border-blue-300 pl-2">
                      <p className="font-medium">Semmelweis Egyetem</p>
                      <p className="text-xs text-gray-600">1083 Budapest, Balassa u. 6.</p>
                    </div>
                  </div>
                </details>

                <details className="bg-green-50 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-green-800 hover:bg-green-100">
                    📍 Bács-Kiskun megye
                  </summary>
                  <div className="p-3 text-sm space-y-2">
                    <div className="border-l-2 border-green-300 pl-2">
                      <p className="font-medium">Bács-Kiskun Megyei Kórház</p>
                      <p className="text-xs text-gray-600">6300 Kalocsa, Kossuth L. utca 34-36.</p>
                    </div>
                    <div className="border-l-2 border-green-300 pl-2">
                      <p className="font-medium">Bács-Kiskun Megyei Kórház</p>
                      <p className="text-xs text-gray-600">6000 Kecskemét, Balaton utca 17.</p>
                    </div>
                    <div className="border-l-2 border-green-300 pl-2">
                      <p className="font-medium">Bajai Szent Rókus Kórház</p>
                      <p className="text-xs text-gray-600">6500 Baja, Rókus utca 10.</p>
                    </div>
                    <div className="border-l-2 border-green-300 pl-2">
                      <p className="font-medium">Kiskunhalasi Semmelweis Kórház</p>
                      <p className="text-xs text-gray-600">6400 Kiskunhalas, Dr. Monszpart L. utca 1.</p>
                    </div>
                  </div>
                </details>

                <details className="bg-purple-50 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-purple-800 hover:bg-purple-100">
                    📍 Baranya megye
                  </summary>
                  <div className="p-3 text-sm space-y-2">
                    <div className="border-l-2 border-purple-300 pl-2">
                      <p className="font-medium">Mohácsi Kórház</p>
                      <p className="text-xs text-gray-600">7700 Mohács, Szepessy tér 7.</p>
                    </div>
                    <div className="border-l-2 border-purple-300 pl-2">
                      <p className="font-medium">Szigetvári Kórház</p>
                      <p className="text-xs text-gray-600">7900 Szigetvár, Szent István ltp. 7.</p>
                    </div>
                  </div>
                </details>

                <details className="bg-amber-50 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-amber-800 hover:bg-amber-100">
                    📍 Békés megye
                  </summary>
                  <div className="p-3 text-sm space-y-2">
                    <div className="border-l-2 border-amber-300 pl-2">
                      <p className="font-medium">Békés Megyei Központi Kórház</p>
                      <p className="text-xs text-gray-600">5700 Gyula, Semmelweis u. 1.</p>
                    </div>
                  </div>
                </details>

                <details className="bg-red-50 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-red-800 hover:bg-red-100">
                    📍 Borsod-Abaúj-Zemplén megye
                  </summary>
                  <div className="p-3 text-sm space-y-2">
                    <div className="border-l-2 border-red-300 pl-2">
                      <p className="font-medium">Sátoraljaújhelyi Kórház</p>
                      <p className="text-xs text-gray-600">3980 Sátoraljaújhely, Mártírok útja 9.</p>
                    </div>
                    <div className="border-l-2 border-red-300 pl-2">
                      <p className="font-medium">Kazincbarcikai Kórház</p>
                      <p className="text-xs text-gray-600">3741 Izsófalva, Mártírok útja 9.</p>
                    </div>
                    <div className="border-l-2 border-red-300 pl-2">
                      <p className="font-medium">Borsod-Abaúj-Zemplén Megyei Központi Kórház</p>
                      <p className="text-xs text-gray-600">3533 Miskolc, Csabai kapu 9-11.</p>
                    </div>
                  </div>
                </details>

                <details className="bg-indigo-50 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-indigo-800 hover:bg-indigo-100">
                    📍 Csongrád megye
                  </summary>
                  <div className="p-3 text-sm space-y-2">
                    <div className="border-l-2 border-indigo-300 pl-2">
                      <p className="font-medium">Csongrád Megyei Egészségügyi Ellátó Központ</p>
                      <p className="text-xs text-gray-600">6900 Makó, Kórház utca 2.</p>
                    </div>
                    <div className="border-l-2 border-indigo-300 pl-2">
                      <p className="font-medium">Szegedi Tudományegyetem</p>
                      <p className="text-xs text-gray-600">6724 Szeged, Kálvária sgt. 57.</p>
                    </div>
                    <div className="border-l-2 border-indigo-300 pl-2">
                      <p className="font-medium">Csongrád Megyei dr. Bugyi István Kórház</p>
                      <p className="text-xs text-gray-600">6600 Szentes, Sima F. utca 44-58.</p>
                    </div>
                  </div>
                </details>

                <details className="bg-pink-50 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-pink-800 hover:bg-pink-100">
                    📍 Fejér megye
                  </summary>
                  <div className="p-3 text-sm space-y-2">
                    <div className="border-l-2 border-pink-300 pl-2">
                      <p className="font-medium">Fejér Megyei Szent György Egyetemi Oktató Kórház</p>
                      <p className="text-xs text-gray-600">8000 Székesfehérvár, Seregélyesi út 3.</p>
                    </div>
                    <div className="border-l-2 border-pink-300 pl-2">
                      <p className="font-medium">Szent Pantaleon Kórház-Rendelőintézet</p>
                      <p className="text-xs text-gray-600">2400 Dunaújváros, Korányi S. utca 4-6.</p>
                    </div>
                  </div>
                </details>

                <details className="bg-cyan-50 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-cyan-800 hover:bg-cyan-100">
                    📍 Győr-Moson-Sopron megye
                  </summary>
                  <div className="p-3 text-sm space-y-2">
                    <div className="border-l-2 border-cyan-300 pl-2">
                      <p className="font-medium">Petz Aladár Megyei Oktató Kórház</p>
                      <p className="text-xs text-gray-600">9024 Győr, Zrínyi utca 13.</p>
                    </div>
                    <div className="border-l-2 border-cyan-300 pl-2">
                      <p className="font-medium">Soproni Erzsébet Oktató Kórház és Rehabilitációs Intézet</p>
                      <p className="text-xs text-gray-600">9400 Sopron, Győri út 15.</p>
                    </div>
                  </div>
                </details>

                <details className="bg-orange-50 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-orange-800 hover:bg-orange-100">
                    📍 Hajdú-Bihar megye
                  </summary>
                  <div className="p-3 text-sm space-y-2">
                    <div className="border-l-2 border-orange-300 pl-2">
                      <p className="font-medium">Gróf Tisza István Kórház</p>
                      <p className="text-xs text-gray-600">4100 Berettyóújfalu, Orbán B. tér 1.</p>
                    </div>
                    <div className="border-l-2 border-orange-300 pl-2">
                      <p className="font-medium">Debreceni Egyetem</p>
                      <p className="text-xs text-gray-600">4032 Debrecen, Nagyerdei körút 98.</p>
                    </div>
                    <div className="border-l-2 border-orange-300 pl-2">
                      <p className="font-medium">Debreceni Egyetem</p>
                      <p className="text-xs text-gray-600">4031 Debrecen, Bartók Béla út 2-26.</p>
                    </div>
                  </div>
                </details>

                <details className="bg-teal-50 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-teal-800 hover:bg-teal-100">
                    📍 További megyék
                  </summary>
                  <div className="p-3 text-sm space-y-3">
                    <div>
                      <p className="font-semibold text-teal-700 mb-1">Heves megye:</p>
                      <p className="text-xs">• Bugát Pál Kórház (Gyöngyös)</p>
                      <p className="text-xs">• Markhot Ferenc Oktatókórház (Eger)</p>
                    </div>
                    <div>
                      <p className="font-semibold text-teal-700 mb-1">Jász-Nagykun-Szolnok megye:</p>
                      <p className="text-xs">• Hetényi Géza Kórház (Szolnok)</p>
                      <p className="text-xs">• Kátai Gábor Kórház (Karcag)</p>
                    </div>
                    <div>
                      <p className="font-semibold text-teal-700 mb-1">Vas megye:</p>
                      <p className="text-xs">• Szent László Kórház (Simaság)</p>
                      <p className="text-xs">• Markusovszky Egyetemi Oktatókórház (Szombathely)</p>
                    </div>
                    <div>
                      <p className="font-semibold text-teal-700 mb-1">Zala megye:</p>
                      <p className="text-xs">• Kanizsai Dorottya Kórház (Nagykanizsa)</p>
                      <p className="text-xs">• Zalai Megyei Kórház (Zalaegerszeg)</p>
                    </div>
                  </div>
                </details>

                <div className="bg-blue-100 p-3 rounded-lg mt-4">
                  <p className="text-xs font-semibold text-blue-800 mb-1">18 év alatti személyek részére:</p>
                  <p className="text-xs text-blue-700">Speciális gyermek- és ifjúságpszichiátriai ellátás is elérhető országszerte (Semmelweis Egyetem, Szent János Kórház, Heim Pál Gyermekkórház, Vadaskert Alapítvány, Debreceni Egyetem, stb.)</p>
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
                  href="/documents/onkizaras-kerelem.pdf" 
                  target="_blank"
                  className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl mr-3">📝</span>
                  <div>
                    <p className="font-semibold text-blue-800">Önkizárás Kérelem</p>
                    <p className="text-sm text-blue-600">Kérelemre letölthető forma</p>
                  </div>
                </a>

                <a 
                  href="http://nav.gov.hu/nav/szerencsejatek/jatekosvedelem/Jelentos_onkorlatozo_20151201.html" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl mr-3">📋</span>
                  <div>
                    <p className="font-semibold text-purple-800">Jelentős Önkorlátozó Nyilatkozat Minta</p>
                    <p className="text-sm text-purple-600">Online nyomtatvány</p>
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

                <a 
                  href="https://sztfh.hu/tevekenysegek/szerencsejatek-felugyelet/jatekosvedelem/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-poker-light hover:bg-poker-accent/20 rounded-lg transition-colors"
                >
                  <span className="font-semibold text-poker-dark">SZTFH Játékosvédelem</span>
                  <p className="text-sm text-poker-muted">Hivatalos hatósági oldal</p>
                </a>
              </div>
            </div>

            {/* Recommended Certification Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-poker-dark mb-4 flex items-center">
                <span className="text-3xl mr-3">✅</span>
                Ajánlott Minősítés
              </h3>
              <div className="space-y-3 text-gray-700">
                <p className="text-sm">
                  2017. január 1-től a szervezők ajánlott felelős játékszervezői minősítést szerezhetnek.
                </p>
                <p className="text-sm">
                  A minősítés a játékosok számára azt jelzi, hogy a szervező a felelős játékszervezés elvének megfelelően működik, a szerencsejáték káros hatásai csökkentése iránt elkötelezett, a játékosok részére a kötelező szint mellett további játékosvédelmi eszközöket is biztosít.
                </p>
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
            <p className="text-amber-700 mb-2">
              A szerencsejáték szórakozás legyen, ne probléma! Ha úgy érzi, hogy 
              elveszítette az irányítást, azonnal kérjen segítséget a fenti elérhetőségeken.
            </p>
            <p className="text-amber-600 text-sm">
              Kérje bejegyzését a játékosvédelmi nyilvántartásba!
            </p>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="mt-8 p-6 bg-gray-100 rounded-xl">
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Kapcsolódó jogszabályok:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>1991. évi XXXIV. törvény a szerencsejáték szervezéséről</li>
              <li>5/2021. (X.21.) SZTFH rendelet a felelős játékszervezés részletes szabályairól</li>
              <li>329/2015. (XI. 10.) Korm. rendelet a felelős játékszervezés részletes szabályairól</li>
              <li>Az Európai Unió vonatkozó irányelvei</li>
              <li>Ptk. gondnokságra vonatkozó szabályai</li>
              <li>Adatvédelmi és fogyasztóvédelmi jogszabályok</li>
            </ul>
            <p className="text-xs pt-4">
              Kiadva a felelős játékszervezés részletes szabályairól szóló 329/2015. (XI. 10.) Korm. rendelet 2. § (1) bekezdés alapján<br/>
              Nemzeti Vagyon Kezeléséért Felelős Tárca Nélküli Miniszter 2018. november 12.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
