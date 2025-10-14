# Cookie Banner Tesztelési Útmutató

## Cookie Banner Funkciók

A Palace Poker cookie banner teljes tesztelési útmutatója.

## Tesztelendő Funkciók

### 1. Első Látogatás
- [ ] Cookie banner megjelenik 1.5 másodperc után
- [ ] Szép animációval betöltődik (fade in + scale up)
- [ ] Háttér elmosódik (backdrop blur)
- [ ] Poker témájú designelemek (♠ ♥ ♣ ♦) animációk

### 2. Cookie Banner Tartalma
- [ ] "Süti Kezelés" cím
- [ ] Informatív szöveg a süti használatról
- [ ] "Elfogadás" gomb (zöld, primer szín)
- [ ] "Elutasítás" gomb (fehér, outline)
- [ ] Adatvédelmi szabályzat link

### 3. Elfogadás Funkció
- [ ] "Elfogadás" gombra kattintás után:
  - [ ] Banner eltűnik szép animációval
  - [ ] localStorage-ba mentődik: 'cookie-consent': 'accepted'
  - [ ] localStorage-ba mentődik: 'cookie-consent-date': timestamp
  - [ ] Console log: "Cookies accepted"

### 4. Elutasítás Funkció  
- [ ] "Elutasítás" gombra kattintás után:
  - [ ] Banner eltűnik szép animációval
  - [ ] localStorage-ba mentődik: 'cookie-consent': 'declined'
  - [ ] localStorage-ba mentődik: 'cookie-consent-date': timestamp
  - [ ] Console log: "Cookies declined"

### 5. Visszatérő Látogatás
- [ ] Ha van localStorage 'cookie-consent', akkor banner NEM jelenik meg
- [ ] Admin oldalakon (/admin/*) banner NEM jelenik meg

### 6. Design Elemek
- [ ] Poker kártyaszínek (♠ ♥ ♣ ♦) animálódnak
- [ ] Palace Poker brand színek használata
- [ ] Hover effektek a gombokon
- [ ] Responsive design (mobil/tablet/desktop)

## Tesztelési Lépések

### Első Tesztelés
1. Nyisd meg az oldalt incognito/private módban
2. Várj 1.5 másodpercet
3. Ellenőrizd a banner megjelenését
4. Teszteld az "Elfogadás" funkciót
5. Újítsd fel az oldalt → banner nem jelenik meg

### Második Tesztelés  
1. Töröld a localStorage-t (F12 → Application → Storage → Clear All)
2. Újítsd fel az oldalt
3. Várj 1.5 másodpercet
4. Teszteld az "Elutasítás" funkciót
5. Újítsd fel az oldalt → banner nem jelenik meg

### Mobile Tesztelés
1. Nyisd meg mobil viewportban (F12 → Toggle device)
2. Ellenőrizd a responsivitást
3. Teszteld a touch interakciókat

## localStorage Kulcsok

```javascript
// Elfogadott süti
localStorage.getItem('cookie-consent') // "accepted"
localStorage.getItem('cookie-consent-date') // ISO timestamp

// Elutasított süti  
localStorage.getItem('cookie-consent') // "declined"
localStorage.getItem('cookie-consent-date') // ISO timestamp
```

## Manuális Reset

```javascript
// Console-ban futtatva törli a süti beállításokat
localStorage.removeItem('cookie-consent');
localStorage.removeItem('cookie-consent-date');
location.reload();
```

## Hook Használat

```typescript
import { useCookieConsent } from '@/components/CookieBanner';

const { consent, hasConsented, isAccepted, isDeclined } = useCookieConsent();
```

## Eredmény

✅ Cookie banner sikeresen implementálva
✅ Palace Poker design stílus követése
✅ localStorage alapú süti kezelés
✅ Responsive design
✅ Smooth animációk
✅ Admin oldalakon letiltva