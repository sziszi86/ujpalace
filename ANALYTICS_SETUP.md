# Látogatottsági mérés, v2

Az új mérés a régi `analytics_*` és `active_visitors` adatoktól elkülönül.
A régi adatok nem hitelesítettek, ezért nem szerepelnek az új jelentésekben.
A migráció egyetlen üzleti vagy korábbi analitikai táblát sem módosít.

## Bevezetés

1. Az alkalmazás adatbázisán futtasd: `npm run setup-analytics-v2`.
   A script tranzakcióban, ismételhetően hozza létre az új táblákat, hiba esetén visszagörget.
   A környezeti változók elsőbbséget élveznek a helyi `.env.local` értékeivel szemben.
2. Futtasd a teszteket és a buildet: `npm run test:analytics`, `npm run build`.
3. Telepítsd az alkalmazást. A migráció előbb fusson le, mint a kódcsere.
4. Bejelentkezve nyisd meg az `/admin/analytics` oldalt.
   Üres adatbázisnál a felület jelzi, hogy még nem érkezett esemény.
5. Az első valódi, hozzájáruló látogatók után ellenőrizd az utolsó esemény idejét.
   Ne tölts be tesztadatokat az éles táblákba.

A migráció nem fut automatikusan oldalbetöltés vagy API-kérés közben.
Hiányzó táblák / adatbázishiba esetén a jelentés 503 választ ad, nem hamis nullát.

## Beállítások

- Kapcsolat: `ANALYTICS_DATABASE_URL`, majd `DATABASE_PUBLIC_URL`, majd `DATABASE_URL`.
- A jelentések a meglévő admin Bearer tokennel érhetők el; `JWT_SECRET` vagy `NEXTAUTH_SECRET` szükséges.
- Alapértelmezett fogadott domainek: palace-poker.hu, www.palace-poker.hu, palacepoker.hu, www.palacepoker.hu.
  Az `ANALYTICS_ALLOWED_HOSTS` vesszővel elválasztott listával felülírja ezt.
- `ANALYTICS_DISABLED=true`: gyorsan leállítja a mérést, az oldal és az admin többi funkciója tovább működik.
- Fejlesztésben és Vercel preview környezetben a mérés alapból kikapcsolt.
  Az `ANALYTICS_ALLOW_LOCAL=true` csak elkülönített tesztadatbázissal használható.
- Az `ANALYTICS_DB_SSL=false` csak helyi PostgreSQL teszthez szükséges.

## Mit számolunk?

- Látogató: egy véletlen, legfeljebb 90 napig megőrzött böngészőazonosító.
  Több eszköz / inkognitó / törölt tárhely új azonosítót jelent. IP alapján nem vonunk össze embereket.
- Látogatás: böngészőnként közös munkamenet, 30 perc inaktivitás után új.
  Az időszak munkamenetszáma azon látogatások száma, amelyeknek van megtekintése az időszakban.
- Oldalmegtekintés: megjelenített nyilvános útvonal; újratöltés új esemény.
  A beküldés ismétlése ugyanazzal az eseményazonosítóval nem növeli a számot.
- Most aktív: az utolsó 5 percben látható lapról eseményt küldő böngésző.
  A 30 másodperces életjel nem növeli a megtekintéseket. A bezárt lap legfeljebb 5 percig látszik aktívnak.
- Heti/havi egyedi látogató: `COUNT(DISTINCT visitor_id)` az egész időszakra.
- Naphatárok: Europe/Budapest, a 7 nap ma és az előző 6 nap; a mai nap részleges.
- Forrás / kampány: a látogatás belépési forrása, munkamenetenként egyszer.
  Hiányzó referrer: közvetlen / ismeretlen. Csak a domain és az UTM source/medium/campaign kerül tárolásra.
- Eszközmegoszlás: megtekintések szerinti bontás, nem személyek szerinti.

Az engedélyezett nyilvános útvonalakat az `analytics-policy.ts` sorolja fel.
Új nyilvános oldaltípus hozzáadásakor ezt a listát is frissíteni kell.

## Hozzájárulás és adatminőség

Az új, külön `analytics-consent-v2` választás előtt nincs mérés. A korábbi általános sütielfogadás
nem indítja el automatikusan. A lábléc Sütibeállítások gombjával bármikor módosítható.
Elutasításkor a böngészőazonosító törlődik és a további küldés leáll; a korábban beküldött események
a megőrzési szabály szerint maradnak. Az admin tokennel rendelkező böngészőket kihagyjuk.
A `localStorage['analytics-exclude']='true'` manuális belső kizárásra használható.
A Do Not Track és Global Privacy Control jelzéseket is tiszteletben tartjuk.

Ezek mért böngészők, nem bizonyítottan külön emberek. A blokkoló / elutasító látogatókat nem becsüljük fel.
Az ismert robotok, előtöltések és privát útvonalak szűrve vannak; a botfelismerés nem tévedhetetlen.
A nyilvános beküldést domain-, méret-, séma- és böngészőazonosítónkénti sebességkorlát védi.
Célzott visszaélés ellen a hosting peremhálózati korlátozása további védelmet adhat.

Az első esemény előtti napok hiányzó adatként jelennek meg. A sikeres adatlekérdezés nem bizonyítja,
hogy minden látogató mérhető volt; az utolsó esemény ideje külön látható. Történeti adatkimaradást
nem töltünk ki becsléssel. A szervernaplók külön ellenőrzési források, nem egyedi látogatószámok.

## Üzembiztonság és megőrzés

Az analitika külön, legfeljebb 3 kapcsolatos poolt használ, 1,5 másodperces kapcsolódási és 3 másodperces
SQL-időkorláttal. A böngészős küldés 4 másodperc után megszakad, és legfeljebb háromszor próbálja ugyanazt
a megtekintést elküldeni. Minden hibát az analitika kezel, nem állítja meg az oldal renderelését.
A fő adminoldal nem vár az analitikára, hogy a többi funkció betöltődhessen.

A részletes eseményekből a mai és az előző 90 naptári napot őrizzük meg.
A legalább 91 napja inaktív, már nem hivatkozott munkamenetek és böngészőrekordok is törölhetők.
A takarítás naponta, esemény érkezésekor fut. Forgalom nélküli időszakban a következő eseményig késhet.
A takarítás hibája nem görgeti vissza a megtekintést. A korábbi rendszer tábláihoz nem nyúl.
A régi `reset-analytics.js` nem része a v2 bevezetésének; ne futtasd a régi adatok megőrzésekor.

## Tesztelés és visszaállítás

`npm run test:analytics` helyi `initdb` / `pg_ctl` PostgreSQL eszközöket igényel.
Minden futás friss ideiglenes adatbázist indít, és a végén leállítja, eltávolítja azt.
Nem olvassa a projekt adatbázis-hitelesítő adatait. A valódi SQL-t és route-kezelőket teszteli,
beleértve a párhuzamos küldést, duplikációt, időzónát, hozzájárulást, jogosultságot és meghibásodást.

Gyors leállítás: `ANALYTICS_DISABLED=true`, majd az alkalmazás újraindítása/újratelepítése.
Kódvisszaállításkor a v2 táblák megmaradhatnak; nem ütköznek a régi rendszerrel.
Nincs szükség visszafelé törlő migrációra. A régi kód visszaállítása a régi számlálás ismert hibáit is visszahozza.
