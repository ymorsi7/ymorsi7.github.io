# BidetBeacon — Full Cursor Rebuild Prompt

Build a full-stack web app called **BidetBeacon** — a community-driven bidet finder for Muslims. Users see mosques and restaurants on an interactive map, filter by bidet status, search, and add/verify locations.

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript (same port, Vite proxies API)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI)
- **Routing**: Wouter
- **State/Data fetching**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **Map**: React Leaflet + react-leaflet-cluster
- **Validation**: Zod (shared between frontend and backend)
- **No real database needed** — use in-memory storage (Map)

---

## Branding & Design

- **App name**: BidetBeacon (نظافة = "cleanliness" in Arabic)
- **Tagline**: 🚿 Clean Bidet Spaces Worldwide
- **Primary**: Emerald green (#10B981, #059669)
- **Accent/CTA**: Gold (#F59E0B, #D97706)
- **Background**: gradient from-emerald-50 via-teal-50 to-blue-50
- **Header**: dark emerald gradient bg, mosque logo icon with gold sparkle badge, centered search input, gold "Add Location" button
- **Islamic aesthetic**: subtle faint rotating border/circle shapes in background (opacity-5), emerald color scheme throughout
- **Icons**: Font Awesome (fas fa-mosque, fas fa-utensils, fas fa-search, fas fa-map-marker-alt, fas fa-plus, fas fa-times)

Load in index.html HEAD:
- Leaflet CSS: https://unpkg.com/leaflet@1.9.4/dist/leaflet.css
- Font Awesome: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css
- Google Fonts Inter: https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap

---

## Data Types (shared types file)

```typescript
type BidetStatus = "verified" | "no_bidet" | "warmed" | "unknown";
type LocationType = "mosque" | "restaurant";
type ServiceStatus = "open" | "closed" | "temporarily_closed";

interface Masjid {
  id: string;
  name: string;
  address: string;
  latitude: string;   // stored as string decimal e.g. "34.01141"
  longitude: string;
  city: string;
  country: string;
  type: LocationType;
  bidetStatus: BidetStatus;
  serviceStatus: ServiceStatus;
  operatingHours?: string | null;
  phoneNumber?: string | null;
  website?: string | null;
  amenities?: string | null;
  bidetType?: string | null;
  isApproved: boolean;
  isFromGoogleMaps: boolean;
  googlePlaceId?: string | null;
  masjidPhotoUrl?: string | null;
  bidetPhotoUrl?: string | null;
  createdAt: Date;
}

interface Verification {
  id: string;
  masjidId: string;
  bidetStatus: "verified" | "no_bidet" | "warmed";
  comment?: string | null;
  verifierName?: string | null;
  isApproved: boolean;
  createdAt: Date;
}
```

---

## Backend API Routes

```
GET  /api/masajid
     query params: includeUnknown=true|false, lat, lng, radiusMiles
     Returns all isApproved:true locations, filtered by radius if lat/lng given

GET  /api/masajid/:id

POST /api/masajid
     body: { name, address, latitude(number), longitude(number), city, country, type, bidetStatus, ... }
     Validate with Zod, store, return 201

PATCH /api/masajid/:id
     body: { bidetStatus }
     Updates bidet status only

GET  /api/masajid/:id/verifications
POST /api/verifications
GET  /api/verifications/pending
GET  /api/stats   → { totalMasajid, withBidets, warmed }
                    same query params as GET /api/masajid
```

---

## In-Memory Storage

```typescript
class MemStorage {
  private masajid = new Map<string, Masjid>();
  private verifications = new Map<string, Verification>();

  constructor() { this.seedData(); }

  async getMasajid(includeUnknown = true, userLocation?, radiusMiles = 25) {
    let results = [...this.masajid.values()].filter(m => m.isApproved);
    if (!includeUnknown) results = results.filter(m => m.bidetStatus !== 'unknown');
    if (userLocation) {
      results = results.filter(m => {
        const dist = haversineDistanceMiles(userLocation, {
          lat: parseFloat(m.latitude), lng: parseFloat(m.longitude)
        });
        return dist <= radiusMiles;
      });
    }
    return results;
  }

  async createMasjid(data): Promise<Masjid> {
    const id = crypto.randomUUID();
    const masjid = { ...data, id, latitude: String(data.latitude),
      longitude: String(data.longitude), isApproved: true, createdAt: new Date() };
    this.masajid.set(id, masjid);
    return masjid;
  }

  async updateMasjid(id, updates) {
    const existing = this.masajid.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.masajid.set(id, updated);
    return updated;
  }

  // seed 2010 locations in constructor — see seed data section below
}
```

Haversine distance helper (miles):
```typescript
function haversineDistanceMiles(a: {lat:number,lng:number}, b: {lat:number,lng:number}) {
  const R = 3959;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat/2)**2 +
    Math.cos(a.lat * Math.PI/180) * Math.cos(b.lat * Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
```

---

## Map Component

Use MapContainer + TileLayer (OpenStreetMap) + MarkerClusterGroup from react-leaflet-cluster.

Fix default Leaflet icons at top of file:
```typescript
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
```

Custom emoji marker icons (colored circle + emoji via L.divIcon):
```typescript
// ✅ #10B981 green  = verified bidet
// ❌ #EF4444 red    = no bidet
// 🔥 #F59E0B amber  = heated/warmed bidet
// ❓ #6B7280 gray   = unknown status
// 🔍 #3B82F6 blue   = unknown, from Google Maps

function createCustomIcon(color, emoji) {
  return L.divIcon({
    html: '<div style="background:linear-gradient(135deg,' + color + ',' + color + 'dd);border:2px solid white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.2);font-size:14px;">' + emoji + '</div>',
    className: 'custom-marker',
    iconSize: [28,28], iconAnchor: [14,14], popupAnchor: [0,-14],
  });
}
```

Cluster icon: custom green circle with count number.

Before rendering markers, filter invalid coords:
```typescript
masajid.filter(m => {
  const lat = parseFloat(m.latitude), lng = parseFloat(m.longitude);
  return !isNaN(lat) && !isNaN(lng) && lat>=-90 && lat<=90 && lng>=-180 && lng<=180;
})
```

Default map center: [39.8283, -98.5795] zoom 4 (USA).
If userLocation available: center there at zoom 12.
Emit map bounds to parent on moveend + zoomend (north/south/east/west + center).

---

## Home Page Layout

```
Header
  [mosque logo + sparkle] [BidetBeacon / tagline]  [===== search =====]  [+ Add Location]

Filter Bar
  [Show all locations ●] [Use my location ●] [Category ▼] [Radius ▼]  1234 locations available

Stats Row
  [ 🕌 2010 Total Locations ]  [ ✅ 38 With Bidets ]

Main Grid (lg: 2 cols map + 1 col sidebar)
  ┌─────────────────────────┐  ┌──────────────────┐
  │                         │  │ [Map|Add|Verify]  │
  │   React Leaflet Map     │  │ ─────────────────│
  │                         │  │ location cards   │
  └─────────────────────────┘  └──────────────────┘
```

**Location list card** (sidebar):
- Left: emerald circle icon (mosque or utensils)
- Name (bold, highlighted if matches search)
- City + country (smaller text)
- Right: bidet badge (colored pill), distance if location enabled
- Hover: lift + border accent
- Click: opens modal

**Modal** on location click:
- Name, type, address, city/country
- Bidet status badge (large)
- Operating hours, phone, website if available
- "Verify Bidet Status" button → opens verification form

---

## Frontend Filter Logic

```typescript
const masajid = allMasajid.filter(m => {
  if (selectedCategory !== "all" && m.type !== selectedCategory) return false;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q)
        || m.city.toLowerCase().includes(q)
        || m.address.toLowerCase().includes(q)
        || m.country.toLowerCase().includes(q);
    // search bypasses map bounds — shows global results
  }

  if (mapBounds) {
    const lat = parseFloat(m.latitude), lng = parseFloat(m.longitude);
    return lat >= mapBounds.south - 0.1 && lat <= mapBounds.north + 0.1
        && lng >= mapBounds.west  - 0.1 && lng <= mapBounds.east  + 0.1;
  }

  return true;
});
```

---

## Key Features Checklist

- [x] Interactive map with clustering (react-leaflet-cluster)
- [x] Emoji markers: ✅❌🔥❓🔍 per bidet status
- [x] Search (name/city/address/country), highlights matched text in yellow
- [x] "Show all locations" toggle (hide/show unknown-status pins)
- [x] "Use my location" toggle + radius dropdown
- [x] Category filter: All / Mosques / Other Establishments
- [x] Map-bounds-aware sidebar list (updates as you pan/zoom)
- [x] Add location form (click map to set coords)
- [x] Verification form (submit bidet status report)
- [x] Stats bar: total locations + count with bidets
- [x] Mobile responsive (stack layout on small screens)
- [x] Location modal with full details

---

## Seed Data — 2,010 Locations (USA, Canada, UK)

Verified bidets shown on the map (curated seed only):
Islamic Society of Baltimore (Windsor Mill MD), King Fahad Mosque (LA), Berkeley Masjid (CA),
Islamic Center of San Diego, Muslim Community Center San Diego, Muslim Community Association (Santa Clara only),
Islamic Center of Irvine, Islamic Society of Colorado Springs, Masjid Al Ansar (Anaheim), Cairo Restaurant (Anaheim).
London Central Mosque has bidetStatus "warmed" (heated seat).
Other seed rows may share similar names (e.g. other MCAs) but are not verified unless manually confirmed.

Seed your MemStorage constructor with this array:

```javascript
const locations = [
  {
    "name": "King Fahad Mosque",
    "address": "10980 Washington Blvd, Culver City, CA 90232",
    "latitude": "34.01141",
    "longitude": "-118.41012",
    "city": "Los Angeles, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "verified"
  },
  {
    "name": "Masjid Al Ansar",
    "address": "1000 N State College Blvd, Anaheim, CA 92806",
    "latitude": "33.8366",
    "longitude": "-117.9143",
    "city": "Anaheim, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "verified"
  },
  {
    "name": "Islamic Center of San Diego",
    "address": "7050 Eckstrom Ave, San Diego, CA 92111",
    "latitude": "32.8206",
    "longitude": "-117.1655",
    "city": "San Diego, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "verified"
  },
  {
    "name": "Muslim Community Center San Diego",
    "address": "9445 Activity Rd, San Diego, CA 92126",
    "latitude": "32.8312",
    "longitude": "-117.0225",
    "city": "San Diego, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "verified"
  },
  {
    "name": "Muslim Community Association",
    "address": "3003 Scott Blvd, Santa Clara, CA 95054",
    "latitude": "37.37708",
    "longitude": "-121.95946",
    "city": "Santa Clara, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "verified"
  },
  {
    "name": "Fiji Jamaat Mosque",
    "address": "Near South San Francisco, CA",
    "latitude": "37.6624",
    "longitude": "-122.4897",
    "city": "Near South SF, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "no_bidet"
  },
  {
    "name": "London Central Mosque",
    "address": "146 Park Rd, London NW8 7RG, UK",
    "latitude": "51.5074",
    "longitude": "-0.1278",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "warmed"
  },
  {
    "name": "Islamic Society of Colorado Springs",
    "address": "2125 N Chestnut St, Colorado Springs, CO 80907",
    "latitude": "38.8339",
    "longitude": "-104.8214",
    "city": "Colorado Springs, CO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "verified"
  },
  {
    "name": "Islamic Center of Irvine",
    "address": "9752 13th St, Garden Grove, CA 92844",
    "latitude": "33.755837",
    "longitude": "-117.958866",
    "city": "Irvine, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "verified"
  },
  {
    "name": "Berkeley Masjid",
    "address": "2716 Derby St, Berkeley, CA 94705",
    "latitude": "37.8717",
    "longitude": "-122.2656",
    "city": "Berkeley, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "verified"
  },
  {
    "name": "Cairo Restaurant and Cafe",
    "address": "Anaheim, CA",
    "latitude": "33.8366",
    "longitude": "-117.9143",
    "city": "Anaheim, CA",
    "country": "USA",
    "type": "restaurant",
    "bidetStatus": "verified"
  },
  {
    "name": "Masjid Ilalif",
    "address": "Masjid Ilalif",
    "latitude": "38.41356",
    "longitude": "-93.40143",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ourida",
    "address": "Masjid Ourida",
    "latitude": "38.36302",
    "longitude": "-93.36726",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "As-Salam Mosque",
    "address": "As-Salam Mosque",
    "latitude": "37.8030002",
    "longitude": "-122.2852014",
    "city": "As-Salam",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "MAS Community Center",
    "address": "MAS Community Center",
    "latitude": "40.1339214",
    "longitude": "-88.1781016",
    "city": "MAS",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Uzbek American Association of Chicago",
    "address": "1111 Van Street, Elgin, IL 60123",
    "latitude": "42.0329188",
    "longitude": "-88.3063989",
    "city": "Elgin, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque of Umar",
    "address": "11407 South Michigan Avenue, Chicago, IL 60628",
    "latitude": "41.6867432",
    "longitude": "-87.6206672",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ahmadiyya Movement In Islam",
    "address": "Ahmadiyya Movement In Islam",
    "latitude": "42.4569128",
    "longitude": "-87.8387762",
    "city": "Ahmadiyya",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markham Islamic Center",
    "address": "Markham Islamic Center",
    "latitude": "41.5975341",
    "longitude": "-87.7000479",
    "city": "Markham",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Clinton Islamic Center",
    "address": "Clinton Islamic Center",
    "latitude": "41.8460094",
    "longitude": "-90.2211826",
    "city": "Clinton",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Utah",
    "address": "Islamic Society of Utah",
    "latitude": "40.7532795",
    "longitude": "-111.8716021",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dallas Masjid of al-Islam",
    "address": "Dallas Masjid of al-Islam",
    "latitude": "32.7668737",
    "longitude": "-96.7786768",
    "city": "Dallas",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Allahs House of Islam",
    "address": "Allahs House of Islam",
    "latitude": "32.7154121",
    "longitude": "-96.7441971",
    "city": "Allahs",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Greater Houston",
    "address": "Islamic Society of Greater Houston",
    "latitude": "29.6335",
    "longitude": "-95.2079",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Greater Houston",
    "address": "Islamic Society of Greater Houston",
    "latitude": "29.9558",
    "longitude": "-95.4484",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Greater Houston",
    "address": "Islamic Society of Greater Houston",
    "latitude": "29.6595",
    "longitude": "-95.5672",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Makkah Masjid of Greater Houston",
    "address": "Makkah Masjid of Greater Houston",
    "latitude": "29.7233963",
    "longitude": "-95.6042421",
    "city": "Makkah",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-MuMinun",
    "address": "4412 South Third Street, Memphis, TN 38109",
    "latitude": "35.027537",
    "longitude": "-90.080338",
    "city": "Memphis, TN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Noor",
    "address": "3529 Mynders Avenue, Memphis, TN 38111",
    "latitude": "35.117416",
    "longitude": "-89.944375",
    "city": "Memphis, TN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Students Association of Memphis",
    "address": "Muslim Students Association of Memphis",
    "latitude": "35.1175533",
    "longitude": "-89.9445091",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Aiken Masjid",
    "address": "Aiken Masjid",
    "latitude": "33.5779158",
    "longitude": "-81.7506647",
    "city": "Aiken",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Center of Rhode Island",
    "address": "Muslim Community Center of Rhode Island",
    "latitude": "41.7952603",
    "longitude": "-71.4094042",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jaffa Mosque",
    "address": "Jaffa Mosque",
    "latitude": "40.5069979",
    "longitude": "-78.409428",
    "city": "Jaffa",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Youngstown Islamic Center",
    "address": "239 Trumbull Avenue, Youngstown, OH",
    "latitude": "41.1406122",
    "longitude": "-80.6581258",
    "city": "Youngstown, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "American Muslim Mission Center",
    "address": "American Muslim Mission Center",
    "latitude": "41.0811667",
    "longitude": "-81.5528963",
    "city": "American",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Omar Ibn El-Khattab",
    "address": "580 Riverside Drive, Columbus, 43202",
    "latitude": "40.0245085",
    "longitude": "-83.0287955",
    "city": "Columbus",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Cleveland",
    "address": "9400 Detroit Avenue",
    "latitude": "41.4804985",
    "longitude": "-81.747796",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid As-Sahaba",
    "address": "Masjid As-Sahaba",
    "latitude": "40.0144444",
    "longitude": "-82.9888889",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Information Center",
    "address": "Islamic Information Center",
    "latitude": "36.0921792",
    "longitude": "-115.1364809",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jami Masjid Buffalo",
    "address": "1955 Genesee Street, Buffalo, NY 14211",
    "latitude": "42.9138468",
    "longitude": "-78.8094964",
    "city": "Buffalo, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Long Island Muslim Society of East Meadow",
    "address": "Long Island Muslim Society of East Meadow",
    "latitude": "40.7130375",
    "longitude": "-73.5579102",
    "city": "Long",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Bayridge",
    "address": "Islamic Society of Bayridge",
    "latitude": "40.6337294",
    "longitude": "-74.0206856",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque of American Mohammedan Society",
    "address": "Mosque of American Mohammedan Society",
    "latitude": "40.7119444",
    "longitude": "-73.9466667",
    "city": "Mosque",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Mahdi Foundation",
    "address": "Al-Mahdi Foundation",
    "latitude": "40.6386111",
    "longitude": "-73.9683333",
    "city": "Al-Mahdi",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bosnian Islamic Association of Utica",
    "address": "306 Court Street, Utica, NY 13502",
    "latitude": "43.1005556",
    "longitude": "-75.2355556",
    "city": "Utica, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center",
    "address": "Islamic Center",
    "latitude": "42.802488",
    "longitude": "-73.9248831",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Center of Union County (MCCUC)",
    "address": "964 Magie Avenue, Elizabeth, NJ 07208",
    "latitude": "40.6728438",
    "longitude": "-74.2442538",
    "city": "Elizabeth, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dibra Community Center of New Jersey",
    "address": "Dibra Community Center of New Jersey",
    "latitude": "40.2560513",
    "longitude": "-74.279479",
    "city": "Dibra",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jam E-Masjid Islamic Center",
    "address": "Jam E-Masjid Islamic Center",
    "latitude": "40.8995433",
    "longitude": "-74.4082083",
    "city": "Jam",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Passaic County",
    "address": "152 Derrom Avenue, Paterson, 07504",
    "latitude": "40.9175987",
    "longitude": "-74.1401434",
    "city": "Paterson",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "New Brunswick Islamic Center",
    "address": "1330 Livingston Avenue, North Brunswick Township, NJ 08902",
    "latitude": "40.4615447",
    "longitude": "-74.4775427",
    "city": "North Brunswick Township, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Asbury Park",
    "address": "Islamic Center of Asbury Park",
    "latitude": "40.2158333",
    "longitude": "-74.0122222",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nebraska Islamic Foundation",
    "address": "7125 Douglas Street, Lincoln, NE 68507",
    "latitude": "40.8596699",
    "longitude": "-96.6230646",
    "city": "Lincoln, NE",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Omaha",
    "address": "Islamic Center of Omaha",
    "latitude": "41.2744428",
    "longitude": "-96.02585",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Center of Islamic Education in North America",
    "address": "Center of Islamic Education in North America",
    "latitude": "38.9361571",
    "longitude": "-94.5415117",
    "city": "Center",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammed Temple",
    "address": "Muhammed Temple",
    "latitude": "38.6295601",
    "longitude": "-75.859935",
    "city": "Muhammed",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Southwest Florida",
    "address": "Islamic Center of Southwest Florida",
    "latitude": "26.6162",
    "longitude": "-81.8674",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Central Brevard",
    "address": "Islamic Center of Central Brevard",
    "latitude": "28.3511385",
    "longitude": "-80.7008276",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Osceola County",
    "address": "Islamic Center of Osceola County",
    "latitude": "28.317992",
    "longitude": "-81.408632",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Majid al-Ihsaan",
    "address": "6309 Pershing Avenue, Orlando, FL 32822",
    "latitude": "28.498648",
    "longitude": "-81.295457",
    "city": "Orlando, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bosnian Muslim Mosque",
    "address": "Bosnian Muslim Mosque",
    "latitude": "27.96734",
    "longitude": "-82.749069",
    "city": "Bosnian",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bay Area Islamic Center",
    "address": "330 Carlston Street, Richmond, CA 94805",
    "latitude": "37.9326784",
    "longitude": "-122.3210499",
    "city": "Richmond, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammad Mosque 72",
    "address": "Muhammad Mosque 72",
    "latitude": "37.93548",
    "longitude": "-122.365249",
    "city": "Muhammad",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Sacramento",
    "address": "Islamic Center of Sacramento",
    "latitude": "38.5694664",
    "longitude": "-121.5066257",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Annur",
    "address": "Masjid Annur",
    "latitude": "38.5393509",
    "longitude": "-121.4174531",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center",
    "address": "Islamic Center",
    "latitude": "37.9765903",
    "longitude": "-121.2180006",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Development Center",
    "address": "Islamic Development Center",
    "latitude": "33.937517",
    "longitude": "-117.2355947",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Monterey County",
    "address": "Islamic Society of Monterey County",
    "latitude": "36.5938242",
    "longitude": "-121.8799762",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shia Ithnaasheri Islamic Center",
    "address": "Shia Ithnaasheri Islamic Center",
    "latitude": "33.9683333",
    "longitude": "-118.1022222",
    "city": "Shia",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ahmadiyya Muslim Center",
    "address": "Ahmadiyya Muslim Center",
    "latitude": "33.9125",
    "longitude": "-118.3441667",
    "city": "Ahmadiyya",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Hawthorne",
    "address": "Islamic Center of Hawthorne",
    "latitude": "33.9213889",
    "longitude": "-118.3538889",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid of Antelope Valley",
    "address": "Masjid of Antelope Valley",
    "latitude": "34.5797222",
    "longitude": "-118.1086111",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Rribat Al Aslami",
    "address": "Al Rribat Al Aslami",
    "latitude": "32.7708073",
    "longitude": "-117.043655",
    "city": "Al",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammad Mosque Eight",
    "address": "Muhammad Mosque Eight",
    "latitude": "32.7066577",
    "longitude": "-117.1288173",
    "city": "Muhammad",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Lakeside",
    "address": "Islamic Center of Lakeside",
    "latitude": "32.865053",
    "longitude": "-116.956789",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammed Mosque",
    "address": "Muhammed Mosque",
    "latitude": "38.869851",
    "longitude": "-76.960771",
    "city": "Muhammed",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masojid Religious Worship Temple",
    "address": "Masojid Religious Worship Temple",
    "latitude": "35.3978685",
    "longitude": "-94.4085477",
    "city": "Masojid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Center",
    "address": "Islamic Community Center",
    "latitude": "41.1812079",
    "longitude": "-73.1903898",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Center",
    "address": "MD",
    "latitude": "39.1054428",
    "longitude": "-77.0033682",
    "city": "Unknown, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Cultural Center of Greater Chicago",
    "address": "1800 Pfingsten Road, Northbrook, IL 60062",
    "latitude": "42.1199314",
    "longitude": "-87.8492547",
    "city": "Northbrook, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Omar Al-Farooq",
    "address": "Masjid Omar Al-Farooq",
    "latitude": "47.7831272",
    "longitude": "-122.3079334",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Staten Island Islamic Masjid",
    "address": "Staten Island Islamic Masjid",
    "latitude": "40.6352241",
    "longitude": "-74.076386",
    "city": "Staten",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Majlis of Staten Island",
    "address": "Muslim Majlis of Staten Island",
    "latitude": "40.6111875",
    "longitude": "-74.0874469",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Noor Al-Islam Society",
    "address": "Noor Al-Islam Society",
    "latitude": "40.6380141",
    "longitude": "-74.1619309",
    "city": "Noor",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Ihsan",
    "address": "Masjid Al-Ihsan",
    "latitude": "40.6398052",
    "longitude": "-74.0776046",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Jamia",
    "address": "Al-Jamia",
    "latitude": "39.9547086",
    "longitude": "-75.2085041",
    "city": "Al-Jamia",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Atlanta Masjid of Al Islam",
    "address": "Atlanta Masjid of Al Islam",
    "latitude": "33.738643",
    "longitude": "-84.3107519",
    "city": "Atlanta",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of San Diego",
    "address": "7050 Eckstrom Avenue, San Diego, 92111",
    "latitude": "32.8205766",
    "longitude": "-117.165236",
    "city": "San Diego",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Daar-Ul-Islam",
    "address": "517 Weidman Road, Ballwin, 63011",
    "latitude": "38.6029313",
    "longitude": "-90.4959216",
    "city": "Ballwin",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Wichita",
    "address": "Islamic Society of Wichita",
    "latitude": "37.7461752",
    "longitude": "-97.2585406",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar-ul-Islah",
    "address": "Dar-ul-Islah",
    "latitude": "40.8716448",
    "longitude": "-74.0013893",
    "city": "Dar-ul-Islah",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Fatiha",
    "address": "Masjid Al-Fatiha",
    "latitude": "34.1242029",
    "longitude": "-117.8896045",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid As-Sunnah",
    "address": "Masjid As-Sunnah",
    "latitude": "43.1627639",
    "longitude": "-77.582778",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Da'wa Center",
    "address": "Islamic Da'wa Center",
    "latitude": "43.1104915",
    "longitude": "-87.9500654",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center",
    "address": "Islamic Center",
    "latitude": "36.1299338",
    "longitude": "-115.071606",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of NE Florida",
    "address": "Islamic Center of NE Florida",
    "latitude": "30.3072373",
    "longitude": "-81.5245228",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gadsden Islamic Society",
    "address": "Gadsden Islamic Society",
    "latitude": "34.0010573",
    "longitude": "-85.9853583",
    "city": "Gadsden",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Laramie",
    "address": "Islamic Center of Laramie",
    "latitude": "41.3095945",
    "longitude": "-105.588733",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Riverside",
    "address": "Islamic Center of Riverside",
    "latitude": "33.978857",
    "longitude": "-117.33443",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Birch Street Masjid",
    "address": "Birch Street Masjid",
    "latitude": "40.9064028",
    "longitude": "-74.4106151",
    "city": "Birch",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar El Salaam Islamic Center",
    "address": "Dar El Salaam Islamic Center",
    "latitude": "32.7569927",
    "longitude": "-97.1117016",
    "city": "Dar",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid As Sabireen",
    "address": "610 Brand Lane, Stafford, TX",
    "latitude": "29.6187181",
    "longitude": "-95.5791782",
    "city": "Stafford, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Macon",
    "address": "Islamic Center of Macon",
    "latitude": "32.8446263",
    "longitude": "-83.6535777",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Natchitoches",
    "address": "125 Caspari Street, Natchitoches, LA 71457",
    "latitude": "31.7540139",
    "longitude": "-93.0942445",
    "city": "Natchitoches",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Rawdah Mosque (Somali Cultural Institute)",
    "address": "Rawdah Mosque (Somali Cultural Institute)",
    "latitude": "44.9557389",
    "longitude": "-93.2365569",
    "city": "Rawdah",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "McKinney Islamic Center",
    "address": "McKinney Islamic Center",
    "latitude": "33.1692169",
    "longitude": "-96.6626104",
    "city": "McKinney",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Murfreesboro",
    "address": "2605 Veals Road, Murfreesboro, 37129",
    "latitude": "35.8136895",
    "longitude": "-86.3497098",
    "city": "Murfreesboro",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Şefkat Mosque",
    "address": "1393 Southeast Maynard Road, Cary, NC 27511",
    "latitude": "35.7886359",
    "longitude": "-78.7644816",
    "city": "Cary",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Tampa Bay Area",
    "address": "7326 East Sligh Avenue, Tampa, 33610",
    "latitude": "28.0111656",
    "longitude": "-82.3736474",
    "city": "Tampa",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal",
    "address": "Masjid Bilal",
    "latitude": "41.5043614",
    "longitude": "-81.6367228",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Ambridge",
    "address": "Islamic Center of Ambridge",
    "latitude": "40.582092",
    "longitude": "-80.2249547",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid At-Taqea",
    "address": "1266 Bedford Avenue, 11216",
    "latitude": "40.6805342",
    "longitude": "-73.9535427",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Mission Center",
    "address": "87-26 175th Street, Jamaica, NY 11432",
    "latitude": "40.7108915",
    "longitude": "-73.7875791",
    "city": "Jamaica, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "United American Muslim Association",
    "address": "5911 8th Avenue, 11220",
    "latitude": "40.6357055",
    "longitude": "-74.0091295",
    "city": "United",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ibaadu'rrahman Central Mosque",
    "address": "380 Myrtle Avenue, 11205",
    "latitude": "40.6930569",
    "longitude": "-73.9710254",
    "city": "Ibaadu'rrahman",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al Taufiq",
    "address": "41-02 Forley Street, 11373",
    "latitude": "40.7468855",
    "longitude": "-73.8793177",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Apex Mosque",
    "address": "Center Street, Apex, NC 27502",
    "latitude": "35.729689",
    "longitude": "-78.8410507",
    "city": "Apex",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Rindge Ave",
    "address": "388 Rindge Avenue, Cambridge, 02140",
    "latitude": "42.3937907",
    "longitude": "-71.1390291",
    "city": "Cambridge",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Burlington",
    "address": "130 Lexington Street, Burlington, 01803",
    "latitude": "42.4877506",
    "longitude": "-71.2138006",
    "city": "Burlington",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of North Jersey",
    "address": "354 US Hwy 46 W, Hackettstown, 07840",
    "latitude": "40.8573452",
    "longitude": "-74.7701805",
    "city": "Hackettstown",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North Bronx Islamic Center",
    "address": "216 East 206th Street, Bronx, NY 10467",
    "latitude": "40.8750571",
    "longitude": "-73.8801588",
    "city": "Bronx, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Shuhada",
    "address": "2952 Downing Street, Denver, CO 80205",
    "latitude": "39.7592684",
    "longitude": "-104.9728878",
    "city": "Denver",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Furqaan",
    "address": "1208 Atlantic Avenue",
    "latitude": "39.362861",
    "longitude": "-74.4258317",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Nur Al Islam",
    "address": "21 Church Avenue, Brooklyn, NY 11218",
    "latitude": "40.6417191",
    "longitude": "-73.9823825",
    "city": "Brooklyn, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Karam",
    "address": "1724 Woodlawn Drive, Gwynn Oak, MD 21207",
    "latitude": "39.3149046",
    "longitude": "-76.7395561",
    "city": "Gwynn Oak, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Santa Cruz",
    "address": "Islamic Center of Santa Cruz",
    "latitude": "36.9677011",
    "longitude": "-121.984814",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Greenpoint Islamic Center",
    "address": "602 Leonard Street, Brooklyn, NY 11222",
    "latitude": "40.725338",
    "longitude": "-73.950519",
    "city": "Brooklyn, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ideal Islamic Center",
    "address": "Ideal Islamic Center",
    "latitude": "42.3933897",
    "longitude": "-83.057236",
    "city": "Ideal",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Iowa City Mosque",
    "address": "1812 West Benton Street, Iowa City, IA 52246",
    "latitude": "41.6499128",
    "longitude": "-91.5652514",
    "city": "Iowa City, IA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Southern Texas",
    "address": "Islamic Society of Southern Texas",
    "latitude": "27.6946449",
    "longitude": "-97.3363715",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "5 Points Islamic Center (Masjid Jami Islamic Center)",
    "address": "105 Broad Street Southwest, Atlanta, GA 30303",
    "latitude": "33.751802",
    "longitude": "-84.3934938",
    "city": "Atlanta, GA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Salam Islamic Education and Information Center",
    "address": "John F. Kennedy Boulevard",
    "latitude": "40.731597",
    "longitude": "-74.0663759",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Huda",
    "address": "7108 Northeast Glisan Street, Portland, OR 97213",
    "latitude": "45.5263399",
    "longitude": "-122.5894631",
    "city": "Portland, OR",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "House of Peace",
    "address": "1420 Pilgrim Avenue, West Deptford, NJ 08096",
    "latitude": "39.8583433",
    "longitude": "-75.1422615",
    "city": "West Deptford, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Manhattan",
    "address": "30 Cliff Street, New York, 10038",
    "latitude": "40.708192",
    "longitude": "-74.0050705",
    "city": "New York",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bosnian Islamic Center Masjid",
    "address": "318 Lemay Ferry Road, St. Louis, MO 63125",
    "latitude": "38.541756",
    "longitude": "-90.2769481",
    "city": "St. Louis, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Center",
    "address": "4666 Lansdowne Avenue, St. Louis, MO 63116",
    "latitude": "38.5871022",
    "longitude": "-90.2735235",
    "city": "St. Louis, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal",
    "address": "3843 West Pine Boulevard, St. Louis, MO 63108",
    "latitude": "38.6377931",
    "longitude": "-90.2404455",
    "city": "St. Louis, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "West Florissant Masjid",
    "address": "6809 West Florissant Avenue, St. Louis, 63136",
    "latitude": "38.7167718",
    "longitude": "-90.2597485",
    "city": "St. Louis",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Umar Masjid",
    "address": "63136",
    "latitude": "38.6925178",
    "longitude": "-90.2413434",
    "city": "Umar",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Grand Islamic Center",
    "address": "3415 South Grand Boulevard, St. Louis, MO 63118",
    "latitude": "38.5953159",
    "longitude": "-90.2439415",
    "city": "St. Louis, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hazrat Abu Bakr Masjid",
    "address": "4700 South Grand Boulevard, St. Louis, MO 63111",
    "latitude": "38.5742864",
    "longitude": "-90.2492011",
    "city": "St. Louis, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar AlJalal Islamic Center",
    "address": "8945 Dunn Road, Hazelwood, 63042",
    "latitude": "38.777389",
    "longitude": "-90.346472",
    "city": "Hazelwood",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Belleville Masjid & Islamic Education Center",
    "address": "4525 Old Collinsville Road, Belleville, IL 62226",
    "latitude": "38.5652963",
    "longitude": "-89.965124",
    "city": "Belleville, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Grand Forks",
    "address": "Islamic Center of Grand Forks",
    "latitude": "47.9043667",
    "longitude": "-97.0582233",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darul Imam Islamic Foundation",
    "address": "556 Grand Canyon Drive",
    "latitude": "43.054198",
    "longitude": "-89.4969587",
    "city": "Darul",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Umm Barakah",
    "address": "314 North 2nd Street, Richmond, VA 23219",
    "latitude": "37.5452119",
    "longitude": "-77.439726",
    "city": "Richmond, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ar-Rahman",
    "address": "15 West 29th Street, 10016",
    "latitude": "40.7458905",
    "longitude": "-73.9879269",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al-ahad",
    "address": "Masjid al-ahad",
    "latitude": "29.8322662",
    "longitude": "-95.7044448",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imam Ali Islamic Center",
    "address": "Imam Ali Islamic Center",
    "latitude": "42.3434226",
    "longitude": "-83.2012869",
    "city": "Imam",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center Hoda Academy",
    "address": "Islamic Center Hoda Academy",
    "latitude": "29.6047795",
    "longitude": "-82.3428435",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Norman",
    "address": "420 East Lindsey Street, Norman, OK 73069",
    "latitude": "35.2035954",
    "longitude": "-97.4371735",
    "city": "Norman, OK",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Dar-ul Furqan",
    "address": "Masjid Dar-ul Furqan",
    "latitude": "40.7503951",
    "longitude": "-73.8940379",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Springfield",
    "address": "3000 South Stanton Street, Springfield, IL 62703",
    "latitude": "39.7619506",
    "longitude": "-89.6248737",
    "city": "Springfield, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Shrine",
    "address": "Marne Avenue, Sterling Heights, MI 48313",
    "latitude": "42.5867127",
    "longitude": "-82.9895999",
    "city": "Sterling Heights, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Inglewood",
    "address": "Islamic Center of Inglewood",
    "latitude": "33.9530392",
    "longitude": "-118.3509708",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ahlul Quran Wal Hadeeth",
    "address": "Masjid Ahlul Quran Wal Hadeeth",
    "latitude": "38.9326931",
    "longitude": "-76.979324",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "As-Sabiqun",
    "address": "4603 Benning Road, Washington, DC 20019",
    "latitude": "38.8863361",
    "longitude": "-76.9364289",
    "city": "Washington, DC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "East Texas Islamic Society",
    "address": "East Texas Islamic Society",
    "latitude": "32.3290554",
    "longitude": "-95.2349539",
    "city": "East",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Mill Valley",
    "address": "62 Shell Road, Mill Valley, CA 94941",
    "latitude": "37.9064825",
    "longitude": "-122.5221382",
    "city": "Mill Valley, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nation of Islam Muhammad Mosque",
    "address": "873 Vance Avenue, Memphis, TN 38126",
    "latitude": "35.1332565",
    "longitude": "-90.0325041",
    "city": "Memphis, TN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Rasool Center",
    "address": "5315 Stage Road, Memphis, TN 38134",
    "latitude": "35.2053847",
    "longitude": "-89.8864123",
    "city": "Memphis, TN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Memphis Islamic Center",
    "address": "10225 Humphrey Road, Cordova, TN 38018",
    "latitude": "35.1453826",
    "longitude": "-89.7217246",
    "city": "Cordova, TN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Salam - Muslim Society of Memphis",
    "address": "1065 Stratford Road, Memphis, TN 38122",
    "latitude": "35.1602162",
    "longitude": "-89.9065852",
    "city": "Memphis, TN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid At-Taqwa",
    "address": "1819 Winchester Road, Memphis, TN 38116",
    "latitude": "35.0531701",
    "longitude": "-90.0038814",
    "city": "Memphis, TN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamatkhana",
    "address": "10660 Collierville Road, Collierville, TN 38107",
    "latitude": "35.0293299",
    "longitude": "-89.707466",
    "city": "Collierville, TN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Vermont",
    "address": "182 Hegeman Avenue, Colchester, VT 05446",
    "latitude": "44.5074796",
    "longitude": "-73.1495962",
    "city": "Colchester",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "ISNF Masjid An-Noor",
    "address": "745 Heim Rd",
    "latitude": "43.0203622",
    "longitude": "-78.7439278",
    "city": "ISNF",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjidul Allah",
    "address": "216-11 90th Avenue",
    "latitude": "40.7248701",
    "longitude": "-73.7448912",
    "city": "Masjidul",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Taha Services",
    "address": "1285 Hammerwood Avenue",
    "latitude": "37.4096064",
    "longitude": "-121.9906328",
    "city": "Taha",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Salam",
    "address": "911 Longwood Avenue",
    "latitude": "40.818681",
    "longitude": "-73.8997507",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid E Mohammedi",
    "address": "Masjid E Mohammedi",
    "latitude": "29.8618504",
    "longitude": "-95.6794511",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Martinsburg Mosque",
    "address": "312 Wilson Street, Martinsburg, WV 25401",
    "latitude": "39.4460058",
    "longitude": "-77.9705781",
    "city": "Martinsburg, WV",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Hernando County",
    "address": "6307 Barclay Avenue, Spring Hill, FL 34609",
    "latitude": "28.5224297",
    "longitude": "-82.4923987",
    "city": "Spring Hill, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al Agha",
    "address": "Masjid al Agha",
    "latitude": "28.3321898",
    "longitude": "-81.4825885",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Qamar Oshkosh Mosque",
    "address": "Masjid Qamar Oshkosh Mosque",
    "latitude": "44.0218524",
    "longitude": "-88.5719326",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "IALFM Mosque",
    "address": "IALFM Mosque",
    "latitude": "33.0344387",
    "longitude": "-97.0830864",
    "city": "IALFM",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Nigerian Islamic Center of Chicago",
    "address": "932 West Sheridan Road, Chicago, IL 60613",
    "latitude": "41.9528225",
    "longitude": "-87.6534959",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center at NYU",
    "address": "238 Thompson Street",
    "latitude": "40.7300708",
    "longitude": "-73.9980317",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Unionport Jame Masjid",
    "address": "2119 Chatterton Avenue",
    "latitude": "40.8281232",
    "longitude": "-73.8525209",
    "city": "Unionport",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Boston Cultural Center",
    "address": "100 Malcolm X Boulevard, Roxbury, MA 02120",
    "latitude": "42.3309021",
    "longitude": "-71.0933788",
    "city": "Roxbury, MA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Imam Al Albani",
    "address": "Masjid Al Imam Al Albani",
    "latitude": "40.6710861",
    "longitude": "-73.9911355",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Muhammad Abdul Wahab",
    "address": "1032 Spruce Street, Camden, NJ 08103",
    "latitude": "39.9358719",
    "longitude": "-75.1094218",
    "city": "Camden, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Fajr",
    "address": "2009 West 3rd Street, Chester, PA 19013",
    "latitude": "39.8359963",
    "longitude": "-75.3827538",
    "city": "Chester, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nation of Islam Chester Study Group",
    "address": "1301 West 3rd Street, Chester, PA 19013",
    "latitude": "39.8398645",
    "longitude": "-75.3753176",
    "city": "Chester, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Chester",
    "address": "14 East 7th Street, Chester, PA 19013",
    "latitude": "39.8504593",
    "longitude": "-75.3617029",
    "city": "Chester, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid As-Sabiqun",
    "address": "1105 Concord Avenue, Chester, PA 19013",
    "latitude": "39.8499133",
    "longitude": "-75.3759192",
    "city": "Chester, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Mosque",
    "address": "1609 West 9th Street, Chester, PA 19013",
    "latitude": "39.8429373",
    "longitude": "-75.3825474",
    "city": "Chester, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sheepshead Bay Muslim Center",
    "address": "2812 Voorhies Avenue, Brooklyn, NY 11235",
    "latitude": "40.5869936",
    "longitude": "-73.9408233",
    "city": "Brooklyn, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Jannah",
    "address": "Baitul Jannah",
    "latitude": "40.6402086",
    "longitude": "-73.9787331",
    "city": "Baitul",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jame Masjid",
    "address": "503 McDonald Avenue",
    "latitude": "40.6380962",
    "longitude": "-73.9783502",
    "city": "Jame",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Grand Strand Islamic Center",
    "address": "Grand Strand Islamic Center",
    "latitude": "33.7375887",
    "longitude": "-78.9474801",
    "city": "Grand",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "masjid Al-kadir (mosque)",
    "address": "masjid Al-kadir (mosque)",
    "latitude": "41.1135261",
    "longitude": "-74.047574",
    "city": "masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Schuylkill County",
    "address": "1055 East Norwegian Street, Mechanicsville, PA 17901",
    "latitude": "40.6918627",
    "longitude": "-76.1809923",
    "city": "Mechanicsville, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Flint Islamic Center",
    "address": "9447 West Corunna Road, Flint, 48473",
    "latitude": "43.0002032",
    "longitude": "-83.8679302",
    "city": "Flint",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Majid Tiba",
    "address": "25-01 48th Street",
    "latitude": "40.7647483",
    "longitude": "-73.905315",
    "city": "Majid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Majid",
    "address": "32-13 57th Street",
    "latitude": "40.7552963",
    "longitude": "-73.9040665",
    "city": "Majid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Majid al-Hikmah",
    "address": "48-01 31st Avenue, 11103",
    "latitude": "40.7583509",
    "longitude": "-73.9103293",
    "city": "Majid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Majid Fatima",
    "address": "57-18 37th Avenue",
    "latitude": "40.7500945",
    "longitude": "-73.9045663",
    "city": "Majid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Astoria Islamic Center",
    "address": "18-22 Astoria Boulevard, Astoria, NY 11102",
    "latitude": "40.7720415",
    "longitude": "-73.9263246",
    "city": "Astoria, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Adams Community Center",
    "address": "4700 Rochester Road, Troy, MI 48085",
    "latitude": "42.5877927",
    "longitude": "-83.1283441",
    "city": "Troy, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid At-Tawheed",
    "address": "48 Academy Street, Wilkes-Barre, PA 18702",
    "latitude": "41.2405165",
    "longitude": "-75.8943714",
    "city": "Wilkes-Barre, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Noor",
    "address": "991 Scott Street, Wilkes-Barre, PA 18705",
    "latitude": "41.2563961",
    "longitude": "-75.8423619",
    "city": "Wilkes-Barre, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Muslim Unity Center",
    "address": "1830 West Square Lake Road, Bloomfield Hills, MI 48302",
    "latitude": "42.6051386",
    "longitude": "-83.3157039",
    "city": "Bloomfield Hills, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "House of Allah",
    "address": "House of Allah",
    "latitude": "31.2192594",
    "longitude": "-81.3886938",
    "city": "House",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ul Kawthar",
    "address": "695 Nostrand Avenue, Brooklyn, NY 11216",
    "latitude": "40.6735367",
    "longitude": "-73.9500175",
    "city": "Brooklyn, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Hamdililah",
    "address": "121-03 Sutphin Boulevard",
    "latitude": "40.6771981",
    "longitude": "-73.7907266",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammad Mosque #12 Nation of Islam",
    "address": "2508 North Broad Street, Philadelphia, PA 19132",
    "latitude": "39.9913044",
    "longitude": "-75.1553744",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gawsiah Jame Masjid",
    "address": "25-86 31st Street, Astoria, NY 11102",
    "latitude": "40.7686036",
    "longitude": "-73.9200494",
    "city": "Astoria, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shahjalal Masjid",
    "address": "25-67 31st Street, Astoria, NY 11102",
    "latitude": "40.768726",
    "longitude": "-73.9193541",
    "city": "Astoria, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bangla Bazar Masjid",
    "address": "1351 Odell Street, Bronx, NY 10462",
    "latitude": "40.8354935",
    "longitude": "-73.8542545",
    "city": "Bronx, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Hashar",
    "address": "2823 North 22nd Street, Philadelphia, PA 19132",
    "latitude": "39.9977346",
    "longitude": "-75.1669861",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Whatcom County",
    "address": "1244 Nevada Street",
    "latitude": "48.7440991",
    "longitude": "-122.4595707",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Majid on the Van Wyck",
    "address": "109-06 Van Wyck Expressway",
    "latitude": "40.6867563",
    "longitude": "-73.8083037",
    "city": "Majid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Little Rock - West",
    "address": "Islamic Center of Little Rock - West",
    "latitude": "34.7511466",
    "longitude": "-92.4375131",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Lewiston",
    "address": "Islamic Center of Lewiston",
    "latitude": "44.0981787",
    "longitude": "-70.2179726",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Mumin",
    "address": "1011 Washington Avenue, Titusville, 32780",
    "latitude": "28.6048777",
    "longitude": "-80.8073473",
    "city": "Titusville",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Abu Bakr Al-Siddiq",
    "address": "29414 Mission Boulevard, Hayward, CA",
    "latitude": "37.6321251",
    "longitude": "-122.0485436",
    "city": "Hayward, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mimar Sinan Mosque",
    "address": "45-06 Skillman Avenue",
    "latitude": "40.7464954",
    "longitude": "-73.9186805",
    "city": "Mimar",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque",
    "address": "Mosque",
    "latitude": "34.1398669",
    "longitude": "-117.9810568",
    "city": "Mosque",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ahlil Hadeeth",
    "address": "Masjid Ahlil Hadeeth",
    "latitude": "39.9236016",
    "longitude": "-75.2375683",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Mujahideen",
    "address": "Masjid Mujahideen",
    "latitude": "39.9551035",
    "longitude": "-75.2420037",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Turning Paige's Islamic Learning Center",
    "address": "Turning Paige's Islamic Learning Center",
    "latitude": "39.9610248",
    "longitude": "-75.2407538",
    "city": "Turning",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ahlus-Sunnah Wal-Jammah",
    "address": "Masjid Ahlus-Sunnah Wal-Jammah",
    "latitude": "39.9249046",
    "longitude": "-75.2292504",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Germantown Masjid",
    "address": "Germantown Masjid",
    "latitude": "40.0289319",
    "longitude": "-75.1634755",
    "city": "Germantown",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ar-Rahman Islamic Center",
    "address": "7641 Sierra Avenue, Fontana, CA 92336",
    "latitude": "34.1150035",
    "longitude": "-117.434793",
    "city": "Fontana, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Association of Cincinnati",
    "address": "3668 Clifton Avenue, Cincinnati, OH",
    "latitude": "39.1493473",
    "longitude": "-84.5180047",
    "city": "Cincinnati, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Salaam",
    "address": "Masjid Salaam",
    "latitude": "39.9740949",
    "longitude": "-75.2066478",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Williamsport Islamic Centre",
    "address": "322 Locust Street, Williamsport, PA 17701",
    "latitude": "41.2389646",
    "longitude": "-77.0116699",
    "city": "Williamsport, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bawa Muhaiyaddeen Fellowship",
    "address": "Bawa Muhaiyaddeen Fellowship",
    "latitude": "39.9908888",
    "longitude": "-75.2418653",
    "city": "Bawa",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Quba",
    "address": "447 Jackson Avenue, NY",
    "latitude": "40.8106316",
    "longitude": "-73.9101564",
    "city": "Unknown, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Rahman",
    "address": "1844 Forest Avenue, Portland, ME 04103",
    "latitude": "43.699737",
    "longitude": "-70.3182687",
    "city": "Portland, ME",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Attawba",
    "address": "734 Riverside Street, Portland, ME 04103",
    "latitude": "43.7007153",
    "longitude": "-70.322429",
    "city": "Portland, ME",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bay Ridge Islamic Center",
    "address": "9126 5th Avenue, 11209",
    "latitude": "40.6181424",
    "longitude": "-74.029287",
    "city": "Bay",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Muhammad",
    "address": "Masjid Muhammad",
    "latitude": "40.0373118",
    "longitude": "-75.1625574",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "New Gethsemane Baptist Church",
    "address": "New Gethsemane Baptist Church",
    "latitude": "40.0475166",
    "longitude": "-75.1630546",
    "city": "New",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nasir Mosque",
    "address": "Nasir Mosque",
    "latitude": "40.0306901",
    "longitude": "-75.1396094",
    "city": "Nasir",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Grace and Peace Community Fellowship",
    "address": "Grace and Peace Community Fellowship",
    "latitude": "40.0213088",
    "longitude": "-75.134363",
    "city": "Grace",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Hidayah",
    "address": "Masjid Al-Hidayah",
    "latitude": "40.0109976",
    "longitude": "-75.1244371",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Istijabah Masjid",
    "address": "4 Montgomery Place, Trenton, NJ 08618",
    "latitude": "40.227927",
    "longitude": "-74.7792859",
    "city": "Trenton, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Louisville Islamic Center of Compassion",
    "address": "Louisville Islamic Center of Compassion",
    "latitude": "38.2909274",
    "longitude": "-85.6788157",
    "city": "Louisville",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Uthaymeen",
    "address": "39 East Paul Avenue, Trenton, NJ 08638",
    "latitude": "40.2344514",
    "longitude": "-74.7564339",
    "city": "Trenton, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid As Saffat",
    "address": "25 Oxford Street, Trenton, NJ 08638",
    "latitude": "40.2287837",
    "longitude": "-74.7585426",
    "city": "Trenton, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjidut Taqwa",
    "address": "1001 East State Street, Trenton, NJ 08608",
    "latitude": "40.2247878",
    "longitude": "-74.7430689",
    "city": "Trenton, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Alhedayah Masjid & Islamic Center",
    "address": "20 Cushing Street, Stamford, CT 06907",
    "latitude": "41.0932435",
    "longitude": "-73.5167134",
    "city": "Stamford, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Cultural Center of East Erie",
    "address": "2426 Parade Street, Erie, PA 16503",
    "latitude": "42.1160232",
    "longitude": "-80.0660689",
    "city": "Erie, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Castroville in Castroville",
    "address": "Islamic Center of Castroville in Castroville",
    "latitude": "36.7681875",
    "longitude": "-121.76037",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albanian American Cultural Center Struga",
    "address": "90 Riverdale Road, Riverdale, NJ 07457",
    "latitude": "40.9882397",
    "longitude": "-74.2956461",
    "city": "Riverdale, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mohammed Temple #3",
    "address": "3341 Montgomery Road",
    "latitude": "39.1391108",
    "longitude": "-84.4745763",
    "city": "Mohammed",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Association of East Erie",
    "address": "2419 Holland Street, Erie, PA 16503",
    "latitude": "42.1147701",
    "longitude": "-80.0703704",
    "city": "Erie, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "MN Muslims Community Center",
    "address": "MN Muslims Community Center",
    "latitude": "45.1115316",
    "longitude": "-93.3026279",
    "city": "MN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "South Bay Islamic Association",
    "address": "2345 Harris Way, San Jose, CA 95131",
    "latitude": "37.4029072",
    "longitude": "-121.9053011",
    "city": "San Jose, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Cultural Center",
    "address": "691 South Milpitas Boulevard, Milpitas, CA 95035",
    "latitude": "37.4235296",
    "longitude": "-121.8944765",
    "city": "Milpitas, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Milpitas Musallah",
    "address": "90 Dempsey Road, Milpitas, CA 95035",
    "latitude": "37.4335176",
    "longitude": "-121.8855331",
    "city": "Milpitas, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Khulafa Mosque",
    "address": "Al-Khulafa Mosque",
    "latitude": "42.9276196",
    "longitude": "-78.8909918",
    "city": "Al-Khulafa",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Greater Lynchburg Islamic Association",
    "address": "1101 Airport Road, Lynchburg, VA 24502",
    "latitude": "37.3309685",
    "longitude": "-79.2035629",
    "city": "Lynchburg, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Omar Islamic Center",
    "address": "24 Broad Street, Middletown, CT 06457",
    "latitude": "41.5570278",
    "longitude": "-72.64965",
    "city": "Middletown, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Umar Ibn Al Khattab",
    "address": "2017 Main Street, Hartford, CT 06120",
    "latitude": "41.7822342",
    "longitude": "-72.6761788",
    "city": "Hartford, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abu-Bakr Mosque",
    "address": "Abu-Bakr Mosque",
    "latitude": "47.5521354",
    "longitude": "-122.289007",
    "city": "Abu-Bakr",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Darus Salaam",
    "address": "374 Turquoise Street, Milpitas, CA 95035",
    "latitude": "37.4266066",
    "longitude": "-121.8962479",
    "city": "Milpitas, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center Of Vernon",
    "address": "27 Naek Road, Vernon, CT 06066",
    "latitude": "41.839044",
    "longitude": "-72.4927229",
    "city": "Vernon, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Nasr",
    "address": "383 Oldham Road, Wayne, NJ 07470",
    "latitude": "40.9383038",
    "longitude": "-74.2013319",
    "city": "Wayne, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North Shore Islamic Center",
    "address": "820 Willis Avenue, Albertson, NY 11507",
    "latitude": "40.7662976",
    "longitude": "-73.6470735",
    "city": "Albertson, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Huda Islamic Center",
    "address": "10 Cayuga Vista Drive, Lansing, NY 14882",
    "latitude": "42.5337355",
    "longitude": "-76.5012772",
    "city": "Lansing, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Salah Ad-Deen",
    "address": "5645 Hillcroft Avenue, Houston, TX 77036",
    "latitude": "29.722096",
    "longitude": "-95.4999141",
    "city": "Houston, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Worcester Islamic Center",
    "address": "Worcester Islamic Center",
    "latitude": "42.3153986",
    "longitude": "-71.773788",
    "city": "Worcester",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ibrahim Bethany Musalla",
    "address": "15188 Northwest Central Drive, Portland, OR 97229",
    "latitude": "45.5543042",
    "longitude": "-122.833187",
    "city": "Portland, OR",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Darussalam",
    "address": "21W525 North Avenue, Lombard, IL 60148",
    "latitude": "41.903063",
    "longitude": "-88.0452796",
    "city": "Lombard, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ali Khan Islamic Center",
    "address": "4831 Silver Hill Road, Suitland, MD 20746",
    "latitude": "38.8500024",
    "longitude": "-76.9230286",
    "city": "Suitland, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjidul Taqwa San Diego",
    "address": "2575 Imperial Avenue, San Diego, 92113",
    "latitude": "32.7061023",
    "longitude": "-117.138477",
    "city": "San Diego",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Delmarva",
    "address": "7843 Jersey Road, Salisbury, MD 21801",
    "latitude": "38.4079231",
    "longitude": "-75.6024779",
    "city": "Salisbury, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center Of Melville",
    "address": "Islamic Center Of Melville",
    "latitude": "40.7825879",
    "longitude": "-73.400646",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque",
    "address": "Mosque",
    "latitude": "40.8514614",
    "longitude": "-81.4272712",
    "city": "Mosque",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Triad",
    "address": "1203 Francis Daily Court",
    "latitude": "36.1087019",
    "longitude": "-79.9861771",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Jackson Heights",
    "address": "7120 Roosevelt Avenue, Woodside, NY 11372",
    "latitude": "40.7464072",
    "longitude": "-73.8940781",
    "city": "Woodside, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sunnyside Woodside Jame Masjid",
    "address": "45-18 48th Avenue, 11377",
    "latitude": "40.739204",
    "longitude": "-73.9197046",
    "city": "Sunnyside",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Center of New York",
    "address": "137-58 Geranium Avenue, Flushing, NY 11355",
    "latitude": "40.7509032",
    "longitude": "-73.8204899",
    "city": "Flushing, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "MCC Muslim Womens Center",
    "address": "MCC Muslim Womens Center",
    "latitude": "40.645956",
    "longitude": "-74.0168306",
    "city": "MCC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Zakariya",
    "address": "Masjid Zakariya",
    "latitude": "42.8990951",
    "longitude": "-78.8329126",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Allston Brighton Islamic Center",
    "address": "Allston Brighton Islamic Center",
    "latitude": "42.3544876",
    "longitude": "-71.1378352",
    "city": "Allston",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hershey Islamic Center",
    "address": "35 East 2nd Street, Hummelstown, PA 17036",
    "latitude": "40.2665594",
    "longitude": "-76.70675",
    "city": "Hummelstown, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Kamal-e-Rasool",
    "address": "Masjid Kamal-e-Rasool",
    "latitude": "40.7884511",
    "longitude": "-76.5483953",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "American Muslim Diversity Association",
    "address": "American Muslim Diversity Association",
    "latitude": "42.6226261",
    "longitude": "-83.0701799",
    "city": "American",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Musab",
    "address": "Masjid Musab",
    "latitude": "34.2161917",
    "longitude": "-84.1518701",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Aisha",
    "address": "12th Street",
    "latitude": "37.400699",
    "longitude": "-79.1605581",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal",
    "address": "Masjid Bilal",
    "latitude": "34.0109468",
    "longitude": "-118.2562323",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Logan Islamic Center",
    "address": "Logan Islamic Center",
    "latitude": "41.7454773",
    "longitude": "-111.8188177",
    "city": "Logan",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ayesha",
    "address": "4502 Watts Plantation Road, Missouri City, TX 77459",
    "latitude": "29.5255736",
    "longitude": "-95.5204875",
    "city": "Missouri City, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Salam",
    "address": "Masjid Al-Salam",
    "latitude": "42.3163864",
    "longitude": "-83.1747939",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bakhit Islamic Center",
    "address": "Bakhit Islamic Center",
    "latitude": "40.6304932",
    "longitude": "-74.0219538",
    "city": "Bakhit",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Jannah Islamic Center",
    "address": "Masjid Al Jannah Islamic Center",
    "latitude": "32.4869083",
    "longitude": "-84.8772833",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana",
    "address": "14362 Carlson Circle, Tampa, FL 33626",
    "latitude": "28.0631311",
    "longitude": "-82.6481409",
    "city": "Tampa, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al-Huda South Milwaukee",
    "address": "1800 16th Avenue, South Milwaukee, WI",
    "latitude": "42.9130048",
    "longitude": "-87.873437",
    "city": "South Milwaukee, WI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Education Center",
    "address": "1269 Goodrich Avenue, Glendale Heights, IL 60139",
    "latitude": "41.9058275",
    "longitude": "-88.057152",
    "city": "Glendale Heights, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid As-Salam Mosque",
    "address": "Masjid As-Salam Mosque",
    "latitude": "42.6640843",
    "longitude": "-73.7719846",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Cape Coral - Masjid Quba",
    "address": "1404 Del Prado Blvd S, Cape Coral, FL 33990",
    "latitude": "26.6262457",
    "longitude": "-81.942162",
    "city": "Cape Coral, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Eastside",
    "address": "Islamic Center of Eastside",
    "latitude": "47.6291396",
    "longitude": "-122.151019",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imam Al-Khoei Foundation",
    "address": "89-89 Van Wyck Expressway, Jamaica, NY 11435",
    "latitude": "40.7010459",
    "longitude": "-73.8149837",
    "city": "Jamaica, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Arafa Islamic Center",
    "address": "181-12 Hillside Avenue, Jamaica, NY 11432",
    "latitude": "40.7129224",
    "longitude": "-73.7813032",
    "city": "Jamaica, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of North Seattle",
    "address": "12528 Lake City Way Northeast, Seattle, 98125",
    "latitude": "47.720093",
    "longitude": "-122.2941588",
    "city": "Seattle",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "San Ramon Valley Islamic Center",
    "address": "2232",
    "latitude": "37.7767909",
    "longitude": "-121.9692118",
    "city": "San",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Wadood",
    "address": "Masjid Al-Wadood",
    "latitude": "40.6096773",
    "longitude": "-74.147402",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Umm-al-qura",
    "address": "Masjid Umm-al-qura",
    "latitude": "40.6419227",
    "longitude": "-73.9697655",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque of Williamsburg Virginia",
    "address": "1505 Richmond Road, Williamsburg, VA 23185",
    "latitude": "37.2908109",
    "longitude": "-76.7226783",
    "city": "Williamsburg, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ibadurahman Mosque",
    "address": "Ibadurahman Mosque",
    "latitude": "33.4658117",
    "longitude": "-111.9722747",
    "city": "Ibadurahman",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "South Brooklyn Islamic Center",
    "address": "South Brooklyn Islamic Center",
    "latitude": "40.6304946",
    "longitude": "-74.0283508",
    "city": "South",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Cultural Center",
    "address": "Ismaili Cultural Center",
    "latitude": "33.5061802",
    "longitude": "-112.0349318",
    "city": "Ismaili",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of North America",
    "address": "6555 S County Road 750 East, Plainfield, IN 46168",
    "latitude": "39.6630708",
    "longitude": "-86.3857376",
    "city": "Plainfield, IN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal Ypsilanti",
    "address": "4891 West Michigan Avenue",
    "latitude": "42.2163044",
    "longitude": "-83.6646623",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Lansing",
    "address": "Islamic Center of Lansing",
    "latitude": "42.7462548",
    "longitude": "-84.5374654",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Euless",
    "address": "203 South Ector Drive, Euless, TX 76040",
    "latitude": "32.8352985",
    "longitude": "-97.0899187",
    "city": "Euless, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Wali",
    "address": "Masjid Al-Wali",
    "latitude": "40.5663309",
    "longitude": "-74.3884288",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Tuscaloosa",
    "address": "1416 Paul W Bryant Drive, Tuscaloosa, AL 35401",
    "latitude": "33.2068703",
    "longitude": "-87.5558456",
    "city": "Tuscaloosa, AL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Iqra Academy",
    "address": "Iqra Academy",
    "latitude": "40.5513376",
    "longitude": "-74.4332487",
    "city": "Iqra",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Madina Masjid",
    "address": "1502 Woodlawn Drive, Woodlawn, MD 21207",
    "latitude": "39.3074793",
    "longitude": "-76.7346954",
    "city": "Woodlawn, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Alkhair Islamic Society of RGV",
    "address": "1910 West Elsham Avenue, Edinburg, Texas 78577",
    "latitude": "26.2524372",
    "longitude": "-98.1926782",
    "city": "Edinburg, Texas",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Andover Islamic Center",
    "address": "204 Andover Street, Andover, MA 01810",
    "latitude": "42.627328",
    "longitude": "-71.1581765",
    "city": "Andover, MA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centro Islámico de Puerto Rico - Masjid Río Piedras",
    "address": "217 Calle Padre Colón, San Juan, PR 00925",
    "latitude": "18.3993057",
    "longitude": "-66.045019",
    "city": "San Juan, PR",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Fatih Mosque",
    "address": "5911 8th Avenue, 11220",
    "latitude": "40.6353757",
    "longitude": "-74.0091126",
    "city": "Fatih",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Southeast Islamic Center",
    "address": "Southeast Islamic Center",
    "latitude": "34.0901493",
    "longitude": "-84.2912073",
    "city": "Southeast",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Woodside Baitul Jannah Masjid",
    "address": "62-01 39th Avenue, Woodside, 11377",
    "latitude": "40.7470533",
    "longitude": "-73.9014014",
    "city": "Woodside",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Ummah Center",
    "address": "24050 Royalton Road, Columbia Station, OH 44028",
    "latitude": "41.3132922",
    "longitude": "-81.8985447",
    "city": "Columbia Station, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Valley Ranch Islamic Center",
    "address": "351 Ranchview Drive, Irving, TX",
    "latitude": "32.9172725",
    "longitude": "-96.9478424",
    "city": "Irving, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Khulafa’a Rashideen",
    "address": "6400 Southwest Freeway Frontage Road, Houston, TX 77074",
    "latitude": "29.7205228",
    "longitude": "-95.497174",
    "city": "Houston, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Saba",
    "address": "4415 Fortran Court, San Jose, CA 95134",
    "latitude": "37.4211734",
    "longitude": "-121.9581733",
    "city": "San Jose, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society Of Santa Barbara",
    "address": "302 North Los Carneros Road, Goleta, 93117",
    "latitude": "34.4404737",
    "longitude": "-119.852525",
    "city": "Goleta",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Faizan-e-Madinah",
    "address": "Faizan-e-Madinah",
    "latitude": "33.9041218",
    "longitude": "-84.1551271",
    "city": "Faizan-e-Madinah",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-Al-Ihsaan",
    "address": "Masjid-Al-Ihsaan",
    "latitude": "40.683021",
    "longitude": "-73.9640484",
    "city": "Masjid-Al-Ihsaan",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Yusuf Mosque",
    "address": "186 Chestnut Hill Avenue, Brighton, MA 02135",
    "latitude": "42.3408864",
    "longitude": "-71.1545465",
    "city": "Brighton, MA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Boston",
    "address": "204 Prospect Street",
    "latitude": "42.3702733",
    "longitude": "-71.1000727",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Arabic Jumaa Mosque",
    "address": "41 Quint Avenue",
    "latitude": "42.3517072",
    "longitude": "-71.1343998",
    "city": "Arabic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Madeena",
    "address": "827 164th Avenue Northeast, Bellevue, WA 98008",
    "latitude": "47.6178515",
    "longitude": "-122.1222275",
    "city": "Bellevue, WA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Cultural Center of Northern California",
    "address": "1453 Madison Street",
    "latitude": "37.8023404",
    "longitude": "-122.2640805",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of San Francisco",
    "address": "20 Jones Street",
    "latitude": "37.7814413",
    "longitude": "-122.4118068",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Tucson",
    "address": "901 East 1st Street, Tucson, AZ 85719",
    "latitude": "32.2346345",
    "longitude": "-110.9576512",
    "city": "Tucson",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Association",
    "address": "3003",
    "latitude": "37.3771918",
    "longitude": "-121.959468",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Prince William Islamic Center",
    "address": "9002 Mathis Avenue, Manassas, VA 20110",
    "latitude": "38.7601208",
    "longitude": "-77.4641184",
    "city": "Manassas",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid an-Noor al-Muhammadi",
    "address": "3620 Tryon Road, Raleigh, NC 27606",
    "latitude": "35.7475248",
    "longitude": "-78.6978873",
    "city": "Raleigh, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "As Salaam Islamic Center",
    "address": "110 Lord Anson Drive, Raleigh, NC 27610",
    "latitude": "35.7780557",
    "longitude": "-78.6074929",
    "city": "Raleigh, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Association of Raleigh",
    "address": "808 Atwater Street, Raleigh, NC 27607",
    "latitude": "35.7898238",
    "longitude": "-78.69123",
    "city": "Raleigh, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamat Khana",
    "address": "Carriage Place Court, Scottdale, GA 30033",
    "latitude": "33.7974024",
    "longitude": "-84.2783605",
    "city": "Scottdale, GA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Fresno",
    "address": "Masjid Fresno",
    "latitude": "36.8082712",
    "longitude": "-119.7516539",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Association of Puget Sound",
    "address": "Muslim Association of Puget Sound",
    "latitude": "47.6657948",
    "longitude": "-122.1065921",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "American Fazl Mosque",
    "address": "2141 Leroy Place Northwest, Washington, DC 20008",
    "latitude": "38.9155228",
    "longitude": "-77.0482411",
    "city": "Washington, DC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mercy Center Masjid Alrahma",
    "address": "2647 Bloomington Avenue South, Minneapolis, 55407",
    "latitude": "44.9540959",
    "longitude": "-93.2520817",
    "city": "Minneapolis",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Muhammad",
    "address": "1519 4th Street Northwest",
    "latitude": "38.9103218",
    "longitude": "-77.0158875",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "First Hijrah Muslim Community Center",
    "address": "4324 Georgia Avenue Northwest, Washington, DC 20011",
    "latitude": "38.9436358",
    "longitude": "-77.0262388",
    "city": "Washington",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Al-Qalam Islamic Center",
    "address": "81 Northeast Lowry Avenue, Minneapolis, MN 55418",
    "latitude": "45.0134331",
    "longitude": "-93.2685465",
    "city": "Minneapolis, MN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic and Education Center Ezan",
    "address": "6206 Douglas Avenue, 50322",
    "latitude": "41.6290809",
    "longitude": "-93.7033072",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Al Farooq Islamic Center",
    "address": "8201 Park Avenue South, Bloomington, MN 55420",
    "latitude": "44.8548177",
    "longitude": "-93.2645099",
    "city": "Bloomington, MN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Yaseen Foundation",
    "address": "621 Masonic Way, Belmont, CA 94002",
    "latitude": "37.5226739",
    "longitude": "-122.2745003",
    "city": "Belmont, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Falah",
    "address": "Masjid Al-Falah",
    "latitude": "38.6288631",
    "longitude": "-77.2762017",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Alnoor Islamic Community Center",
    "address": "5404 Hoadly Road, Manassas, VA 20112",
    "latitude": "38.676657",
    "longitude": "-77.370284",
    "city": "Manassas",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masroor Mosque",
    "address": "5640 Hoadly Road, Manassas, VA 20112",
    "latitude": "38.6759581",
    "longitude": "-77.3741715",
    "city": "Manassas, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "IMAAM Center",
    "address": "9100 Georgia Avenue, Silver Spring, MD 20910",
    "latitude": "39.0042569",
    "longitude": "-77.0374682",
    "city": "Silver Spring, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Tawfiq Islamic Center",
    "address": "2400 Minnehaha Avenue, Minneapolis, 55404",
    "latitude": "44.9587473",
    "longitude": "-93.2422673",
    "city": "Minneapolis",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Des Moines",
    "address": "6201 Franklin Avenue, 50322",
    "latitude": "41.6116282",
    "longitude": "-93.7030668",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamaat Ibad Ar-Rahman",
    "address": "3034 Fayetteville Street, Durham, NC 27707",
    "latitude": "35.9628825",
    "longitude": "-78.9085616",
    "city": "Durham, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Darul Ehsan",
    "address": "Masjid Darul Ehsan",
    "latitude": "41.1155445",
    "longitude": "-74.1498543",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Morgantown",
    "address": "434 Harding Ave, 26508",
    "latitude": "39.6498265",
    "longitude": "-79.9618458",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Masjid Al Jamea",
    "address": "33330 Peace Terrace, Fremont",
    "latitude": "37.5808102",
    "longitude": "-122.0547439",
    "city": "Fremont",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Elfarouq Mosque",
    "address": "Elfarouq Mosque",
    "latitude": "29.7893434",
    "longitude": "-95.5497392",
    "city": "Elfarouq",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Fargo",
    "address": "Islamic Center of Fargo",
    "latitude": "46.8684126",
    "longitude": "-96.8254382",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imam Ali Center",
    "address": "Imam Ali Center",
    "latitude": "38.7436594",
    "longitude": "-77.1905865",
    "city": "Imam",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Illinois Mosque and Islamic Center",
    "address": "106 South Lincoln Avenue, 61801",
    "latitude": "40.1116578",
    "longitude": "-88.2189395",
    "city": "Central",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Towhid Islamic Community Center",
    "address": "430 Dale Street",
    "latitude": "44.9542326",
    "longitude": "-93.1257866",
    "city": "Towhid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Minnesota Da’wah Institute",
    "address": "478 University Avenue, 55103",
    "latitude": "44.9554754",
    "longitude": "-93.1203238",
    "city": "Minnesota",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Makki Masjid",
    "address": "3418 West Ainslie Street, Chicago, IL 60625",
    "latitude": "41.970391",
    "longitude": "-87.7143636",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Center",
    "address": "Muslim Community Center",
    "latitude": "39.1054628",
    "longitude": "-77.0031254",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Downtown Islamic Center",
    "address": "231 South State Street, Chicago, IL 60604",
    "latitude": "41.8786982",
    "longitude": "-87.6272677",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Tawheed Mosque",
    "address": "1227 Sutter Street",
    "latitude": "37.7874343",
    "longitude": "-122.4206115",
    "city": "Al",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Chester County",
    "address": "1001 Pottstown Pike, West Goshen Township, PA 19380",
    "latitude": "39.9754058",
    "longitude": "-75.6149654",
    "city": "West Goshen Township, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Association of Hawaii",
    "address": "1935 Aleo Place, 96822",
    "latitude": "21.3085134",
    "longitude": "-157.8213766",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Al-Farooq",
    "address": "983 Southeast 17th Avenue, Minneapolis, MN 55414",
    "latitude": "44.9872684",
    "longitude": "-93.2288796",
    "city": "Minneapolis, MN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Redmond (ICOR)",
    "address": "Islamic Center of Redmond (ICOR)",
    "latitude": "47.6678274",
    "longitude": "-122.098031",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Coachella Valley",
    "address": "84650 Avenue 49, Coachella, CA 92236",
    "latitude": "33.6931881",
    "longitude": "-116.1875012",
    "city": "Coachella",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Faatir",
    "address": "1200 East 47th Street, Chicago, IL 60653",
    "latitude": "41.8100364",
    "longitude": "-87.5964276",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "MASOM",
    "address": "4353 West Lawrence Avenue, Chicago, IL 60630",
    "latitude": "41.9678982",
    "longitude": "-87.7374784",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Al-Hadith",
    "address": "4809 North Elston Avenue, Chicago, IL 60630",
    "latitude": "41.9684706",
    "longitude": "-87.7402953",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Center of Illinois (ICCI)",
    "address": "6435 West Belmont Avenue, Chicago, IL 60634",
    "latitude": "41.93801",
    "longitude": "-87.7877443",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Chicago Mosque",
    "address": "6201 West Peterson Avenue",
    "latitude": "41.9898929",
    "longitude": "-87.7830662",
    "city": "Chicago",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Rumija Islamic Center",
    "address": "6023 North Northwest Highway, Chicago, IL 60631",
    "latitude": "41.9909331",
    "longitude": "-87.7959702",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Muhajireen",
    "address": "3777 West Columbus Avenue, Chicago, IL 60652",
    "latitude": "41.7397941",
    "longitude": "-87.7155605",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Chicago Central Mosque & Islamic Center",
    "address": "3617 West Belle Plaine Avenue, Chicago, IL 60618",
    "latitude": "41.9554321",
    "longitude": "-87.7187227",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madinah Masjid (sunni sufi qadri)",
    "address": "4850 North Saint Louis Avenue, Chicago, IL 60625",
    "latitude": "41.9699715",
    "longitude": "-87.7162101",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Chicago",
    "address": "5933 North Lincoln Avenue, Chicago, IL 60659",
    "latitude": "41.9892167",
    "longitude": "-87.7049563",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Biloxi Islamic Center",
    "address": "201 Keller Avenue, Biloxi, 39501",
    "latitude": "30.3997172",
    "longitude": "-88.8785544",
    "city": "Biloxi",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jaam'e Masjid Bellmore",
    "address": "1425 Newbridge Road, Bellmore, NY 11710",
    "latitude": "40.6850818",
    "longitude": "-73.5402105",
    "city": "Bellmore, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Las Cruces",
    "address": "1065 East Boutz Road, NM",
    "latitude": "32.2956967",
    "longitude": "-106.7625967",
    "city": "Unknown, NM",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Masjid al-Zainee",
    "address": "349 Dunhams Corner Rd, East Brunswick Township, NJ 08816",
    "latitude": "40.4146721",
    "longitude": "-74.4437004",
    "city": "East Brunswick Township, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Las Cruces Islamic Center",
    "address": "1025 South Solano Drive, NM",
    "latitude": "32.3021094",
    "longitude": "-106.762755",
    "city": "Unknown, NM",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Noor",
    "address": "Masjid Al-Noor",
    "latitude": "37.3504818",
    "longitude": "-121.9554364",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar-us-Sunnah Masjid and Community Center",
    "address": "2045 Brown Avenue, Evanston, IL 60201",
    "latitude": "42.0553831",
    "longitude": "-87.6999538",
    "city": "Evanston, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-E-Suffah",
    "address": "8201 Karlov Avenue, Skokie, IL 60076",
    "latitude": "42.0300502",
    "longitude": "-87.730141",
    "city": "Skokie, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Faizan E Madinah Baltimore",
    "address": "1109 Ingleside Avenue, Gwynn Oak, MD 21207",
    "latitude": "39.2931764",
    "longitude": "-76.7298279",
    "city": "Gwynn Oak, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque Maryam",
    "address": "7351 South Stony Island Avenue, Chicago, IL 60649",
    "latitude": "41.7609068",
    "longitude": "-87.5850184",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Naperville Al-Hidayah",
    "address": "Islamic Center of Naperville Al-Hidayah",
    "latitude": "41.7682981",
    "longitude": "-88.120145",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center",
    "address": "2071 South Parker Road, Denver, CO 80231",
    "latitude": "39.678928",
    "longitude": "-104.8770003",
    "city": "Denver",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid AbuBakr Al-Seddiq",
    "address": "17 North Broadway Avenue, Rochester, MN",
    "latitude": "44.0241368",
    "longitude": "-92.4634816",
    "city": "Rochester, MN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Boulder",
    "address": "5495 Baseline Road, Boulder, CO 80303",
    "latitude": "40.0005831",
    "longitude": "-105.2259282",
    "city": "Boulder",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Topeka",
    "address": "2701 Southeast Kentucky Avenue, Topeka, KS 66605",
    "latitude": "39.0187397",
    "longitude": "-95.6626545",
    "city": "Topeka, KS",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Center",
    "address": "8601 Menard Avenue, Morton Grove, IL 60053",
    "latitude": "42.0377323",
    "longitude": "-87.7709727",
    "city": "Morton Grove, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Islamic Institute of Minnesota - Burnsville Mosque",
    "address": "1350 Riverwood Drive, 55337",
    "latitude": "44.7849573",
    "longitude": "-93.2555888",
    "city": "The",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Institute of Minnesota - Eden Prairie Mosque",
    "address": "6861 Flying Cloud Drive, 55344",
    "latitude": "44.8789536",
    "longitude": "-93.4126735",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Assalam Mosque",
    "address": "1460 Skillman Avenue East, 55109",
    "latitude": "45.002538",
    "longitude": "-93.0387877",
    "city": "Assalam",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Cultural Community Center – Masjid Al Huda",
    "address": "2534 Central Avenue Northeast, Minneapolis, 55418",
    "latitude": "45.0143374",
    "longitude": "-93.2478826",
    "city": "Minneapolis",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid An-Noor",
    "address": "1300 Fairfield Avenue, Bridgeport, CT 06605",
    "latitude": "41.1741658",
    "longitude": "-73.2089927",
    "city": "Bridgeport, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mother Mosque of America",
    "address": "1335 9th Street Northwest, Cedar Rapids, IA 52405",
    "latitude": "41.9863539",
    "longitude": "-91.6843056",
    "city": "Cedar Rapids, IA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Darul-Qur'an",
    "address": "2514 West Thorndale Avenue, Chicago, IL 60659",
    "latitude": "41.9887956",
    "longitude": "-87.692774",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar ul Eimaan Islamic Community Center",
    "address": "2315 West Devon Avenue, Chicago, IL 60659",
    "latitude": "41.9975474",
    "longitude": "-87.6880996",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid of Chicago",
    "address": "6340 North Campbell Avenue, Chicago, IL 60659",
    "latitude": "41.9970337",
    "longitude": "-87.6929139",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Faizan-e-Madinah Mosque",
    "address": "6821 North Western Avenue, Chicago, IL 60645",
    "latitude": "42.0058943",
    "longitude": "-87.6896649",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bosnian Educational & Cultural Center of America",
    "address": "7022 North Western Avenue, Chicago, IL 60645",
    "latitude": "42.0093921",
    "longitude": "-87.6905642",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Rahmat E Alam Foundation",
    "address": "7045 North Western Avenue, Chicago, IL 60645",
    "latitude": "42.0101538",
    "longitude": "-87.6898552",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mehdavia Islamic Center of Chicago",
    "address": "7419 North Western Avenue, Chicago, IL 60645",
    "latitude": "42.0162675",
    "longitude": "-87.6897998",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Madinah Islamic Center",
    "address": "1701-1709 West Wallen Avenue",
    "latitude": "42.002335",
    "longitude": "-87.6729569",
    "city": "Al-Madinah",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid e Noor",
    "address": "6151 North Greenview Avenue, Chicago, IL 60660",
    "latitude": "41.994182",
    "longitude": "-87.6674771",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-e-Abubakr",
    "address": "1017 West Roscoe Street, Chicago, IL 60657",
    "latitude": "41.943426",
    "longitude": "-87.6551329",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Center",
    "address": "6259 North Broadway, Chicago, IL 60660",
    "latitude": "41.9961738",
    "longitude": "-87.6599977",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Ihsan",
    "address": "321-329 East Pershing Road, Chicago, IL 60653",
    "latitude": "41.8236462",
    "longitude": "-87.6182636",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North Shore Islamic Center",
    "address": "130;132 Essex Street",
    "latitude": "42.472739",
    "longitude": "-70.9316001",
    "city": "North",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center Of Pittsfield",
    "address": "40 Melville Street",
    "latitude": "42.4523225",
    "longitude": "-73.2508987",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Waltham Islamic Society",
    "address": "16 Park Place, Waltham, MA 02452",
    "latitude": "42.3776524",
    "longitude": "-71.2350462",
    "city": "Waltham, MA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Boston",
    "address": "126 Boston Post Road",
    "latitude": "42.3612472",
    "longitude": "-71.3429048",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Lawrence",
    "address": "1917 Naismith Drive, Lawrence, KS 66046",
    "latitude": "38.9495426",
    "longitude": "-95.2516008",
    "city": "Lawrence, KS",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Fajr",
    "address": "2846 Cold Spring Road, Indianapolis, 46222",
    "latitude": "39.8049325",
    "longitude": "-86.2042141",
    "city": "Indianapolis",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque of Nasreen",
    "address": "1136 Walnut, CA",
    "latitude": "35.2865496",
    "longitude": "-120.6623532",
    "city": "Unknown, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jaffarya Center",
    "address": "10300 Transit Road, Amherst, NY 14051",
    "latitude": "43.0501754",
    "longitude": "-78.6982011",
    "city": "Amherst",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "American Albanian Islamic Center of Wisconsin",
    "address": "6001 88th Avenue, Kenosha",
    "latitude": "42.5816878",
    "longitude": "-87.914143",
    "city": "Kenosha",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darul Huda",
    "address": "6666 Commerce Street, Springfield, VA 22150",
    "latitude": "38.779841",
    "longitude": "-77.175831",
    "city": "Springfield, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Central New York",
    "address": "925 Comstock Avenue, Syracuse, NY 13210",
    "latitude": "43.0322649",
    "longitude": "-76.1290031",
    "city": "Syracuse",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal",
    "address": "118 Anderson Street, Portland, ME 04101",
    "latitude": "43.6665571",
    "longitude": "-70.2560124",
    "city": "Portland, ME",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic House",
    "address": "4625 22nd Avenue Northeast, Seattle, WA 98105",
    "latitude": "47.6625959",
    "longitude": "-122.3047038",
    "city": "Seattle, WA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "All Dulles Area Muslim Society Center",
    "address": "46903 Sugarland Road, Herndon, VA 20164",
    "latitude": "39.0065164",
    "longitude": "-77.3792966",
    "city": "Herndon, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "ISTABA",
    "address": "ISTABA",
    "latitude": "28.0126277",
    "longitude": "-82.3742276",
    "city": "ISTABA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of America",
    "address": "Islamic Center of America",
    "latitude": "42.3303454",
    "longitude": "-83.229784",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic School of Seattle and Masjid Al Taqwa",
    "address": "720 25th Avenue, Seattle, WA 98122",
    "latitude": "47.6087105",
    "longitude": "-122.2998208",
    "city": "Seattle, WA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Mustafa Islamic Center",
    "address": "21 Passaic Avenue, Pompton Lakes, NJ 07442",
    "latitude": "41.0001079",
    "longitude": "-74.2879799",
    "city": "Pompton Lakes, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Institute of Knowledge",
    "address": "Islamic Institute of Knowledge",
    "latitude": "42.3364368",
    "longitude": "-83.1776794",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjed Islamic Centre",
    "address": "4420 Shirley Gate Road, 22030",
    "latitude": "38.8459498",
    "longitude": "-77.341451",
    "city": "Masjed",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Idris Mosque",
    "address": "1420 Northeast Northgate Way, Seattle, WA 98125",
    "latitude": "47.7087226",
    "longitude": "-122.3128315",
    "city": "Seattle",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hometown Mercy Mosque",
    "address": "8925 South Kostner Avenue, Hometown, IL 60456",
    "latitude": "41.7301192",
    "longitude": "-87.7333826",
    "city": "Hometown, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Al-Hijrah Islamic Center",
    "address": "3159 Row Street, Falls Church, VA 22044",
    "latitude": "38.8613725",
    "longitude": "-77.1466798",
    "city": "Falls Church, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Centre of Fort Collins",
    "address": "925 West Lake Street, Fort Collins, CO 80521",
    "latitude": "40.5684217",
    "longitude": "-105.0943688",
    "city": "Fort Collins",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar-Ul-Ilm Foundation",
    "address": "2360 Lakewood Boulevard, Hoffman Estates, IL 60195",
    "latitude": "42.0747316",
    "longitude": "-88.1388731",
    "city": "Hoffman Estates",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Northwest Indiana Islamic Center",
    "address": "9803 Colorado Street, Crown Point, IN 46307",
    "latitude": "41.4396233",
    "longitude": "-87.2948159",
    "city": "Crown Point, IN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Falah Institute & Masjid",
    "address": "38325 West 14 Mile Road",
    "latitude": "42.5256335",
    "longitude": "-83.4279074",
    "city": "Al",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Aman",
    "address": "203 Forbell Street, Brooklyn, NY 11208",
    "latitude": "40.6781601",
    "longitude": "-73.8636915",
    "city": "Brooklyn, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Zawiyat Sof'watful Islam",
    "address": "435 Franklin Avenue, 11216",
    "latitude": "40.6839636",
    "longitude": "-73.956033",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Brooklyn Islamic Center",
    "address": "722 Church Avenue, 11218",
    "latitude": "40.6455069",
    "longitude": "-73.9724694",
    "city": "Brooklyn",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Ikhlas",
    "address": "21-23 30th Drive, Astoria, NY 11101",
    "latitude": "40.768169",
    "longitude": "-73.9280542",
    "city": "Astoria, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Mosque",
    "address": "Muslim Community Mosque",
    "latitude": "42.498955",
    "longitude": "-83.4012107",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albanian Islamic Cultural Center",
    "address": "307 Victory Boulevard, 10301",
    "latitude": "40.6347521",
    "longitude": "-74.086084",
    "city": "Albanian",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "ICNK Community Center",
    "address": "ICNK Community Center",
    "latitude": "39.0002587",
    "longitude": "-84.6494719",
    "city": "ICNK",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baituz-Zafar",
    "address": "188-15 Mc Laughlin Avenue, Hollis, NY 11423",
    "latitude": "40.722064",
    "longitude": "-73.7760968",
    "city": "Hollis, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid El-ijsan",
    "address": "65 Utica Avenue, 11233",
    "latitude": "40.6768588",
    "longitude": "-73.9300952",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamaica Muslim Center",
    "address": "85-37 168th Street, Jamaica, NY 11432",
    "latitude": "40.7125837",
    "longitude": "-73.7957335",
    "city": "Jamaica, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Fultoli Islamic Center",
    "address": "84-51 Parsons Boulevard, 11432",
    "latitude": "40.7128617",
    "longitude": "-73.8064006",
    "city": "Fultoli",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darus Salaam Masjid",
    "address": "148-16 87th Road, Jamaica, NY 11435",
    "latitude": "40.7066496",
    "longitude": "-73.8086582",
    "city": "Jamaica, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Fultoli Islamic Center",
    "address": "83-16 Parsons Boulevard, Jamaica, NY 11432",
    "latitude": "40.7152391",
    "longitude": "-73.8079213",
    "city": "Jamaica, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "American Turkish Eyup Sultan Cultural Center",
    "address": "2814 Brighton 3rd Street, Brooklyn, NY 11235",
    "latitude": "40.5826336",
    "longitude": "-73.9657405",
    "city": "Brooklyn, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Mustafa Islamic Center Masjid",
    "address": "735 Ocean View Avenue, 11235",
    "latitude": "40.5801237",
    "longitude": "-73.9602469",
    "city": "Al",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Muneer Community Center",
    "address": "195-04 Hillside Avenue, Hollis, NY",
    "latitude": "40.7168688",
    "longitude": "-73.7678229",
    "city": "Hollis, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Icna Al-Markaz Masjid",
    "address": "166-26 89th Avenue, Jamaica, NY 11432",
    "latitude": "40.7081702",
    "longitude": "-73.7943087",
    "city": "Jamaica, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Assafa Islamic Center",
    "address": "172 Eldridge Street, 10002",
    "latitude": "40.72015",
    "longitude": "-73.9906749",
    "city": "Assafa",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ar Rahman",
    "address": "Masjid Ar Rahman",
    "latitude": "40.7140571",
    "longitude": "-73.7492974",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hollis Muslim Center",
    "address": "109-01 205th Place, NY 11412",
    "latitude": "40.7085053",
    "longitude": "-73.7524408",
    "city": "Unknown, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ibrahim",
    "address": "2265 McDonald Avenue, Brooklyn, NY 11223",
    "latitude": "40.5973611",
    "longitude": "-73.9728877",
    "city": "Brooklyn, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Abou Bakr",
    "address": "115 Foster Avenue, 11230",
    "latitude": "40.6280596",
    "longitude": "-73.9761456",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al - Mustafa Islamic Center",
    "address": "4705 8th Avenue, 11220",
    "latitude": "40.6424816",
    "longitude": "-74.0019139",
    "city": "Al",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Beit El-Maqdis Islamic Center",
    "address": "6224 6th Avenue, 11220",
    "latitude": "40.6368856",
    "longitude": "-74.0156952",
    "city": "Beit",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "MCC Brooklyn",
    "address": "5320 3rd Avenue, 11220",
    "latitude": "40.6458078",
    "longitude": "-74.0171732",
    "city": "MCC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darul Jannah",
    "address": "6 Avenue C, 11218",
    "latitude": "40.6400628",
    "longitude": "-73.9796507",
    "city": "Darul",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Nur Islamic Center of Olympia",
    "address": "4324 20th Lane Northeast, Olympia, WA 98516",
    "latitude": "47.0634813",
    "longitude": "-122.8283456",
    "city": "Olympia, WA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albanian American Islamic Center of Queens",
    "address": "72-24 Myrtle Avenue, Glendale, NY 11385",
    "latitude": "40.7020195",
    "longitude": "-73.8772894",
    "city": "Glendale",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Baltimore",
    "address": "6631 Johnnycake Road, Windsor Mill, MD 21244",
    "latitude": "39.3034707",
    "longitude": "-76.7480735",
    "city": "Windsor Mill, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "verified"
  },
  {
    "name": "Islamic Center of Davis",
    "address": "539 Russell Boulevard",
    "latitude": "38.5465108",
    "longitude": "-121.756333",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ad Da'wah Ilat Tawheed",
    "address": "1125 Appleton Street, Baltimore, MD 21217",
    "latitude": "39.3018091",
    "longitude": "-76.6483102",
    "city": "Baltimore",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Central Pennsylvania",
    "address": "709 West Park Avenue, State College, PA 16803",
    "latitude": "40.7917803",
    "longitude": "-77.8782848",
    "city": "State College, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjed of Kent",
    "address": "Masjed of Kent",
    "latitude": "41.1576028",
    "longitude": "-81.353845",
    "city": "Masjed",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Da'wah Center",
    "address": "201 Travis Street, Houston, TX",
    "latitude": "29.762962",
    "longitude": "-95.3605815",
    "city": "Houston, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ash-Shaheed",
    "address": "400 West Sugar Creek Road, Charlotte, NC 28213",
    "latitude": "35.2641019",
    "longitude": "-80.7936227",
    "city": "Charlotte, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Berkeley Masjid",
    "address": "2716 Derby Street",
    "latitude": "37.8619319",
    "longitude": "-122.2526933",
    "city": "Berkeley",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nigerian American Muslim Integrated Community",
    "address": "801 Dean Street, 11238",
    "latitude": "40.6794868",
    "longitude": "-73.9633826",
    "city": "Nigerian",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitush Sharf Jame Masjid & Islamic Center",
    "address": "769 Bergen Street, 11238",
    "latitude": "40.6784902",
    "longitude": "-73.9626948",
    "city": "Baitush",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Cultural Center of New York",
    "address": "1711 3rd Avenue, New York, 10029",
    "latitude": "40.7854708",
    "longitude": "-73.948571",
    "city": "New York",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Farooq Masjid of Atlanta",
    "address": "442 14th Street Northwest, Atlanta, 30318-7944",
    "latitude": "33.7858323",
    "longitude": "-84.4015416",
    "city": "Atlanta",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Malcolm Shabazz",
    "address": "102 West 116th Street, New York, NY 10026",
    "latitude": "40.8019891",
    "longitude": "-73.9501962",
    "city": "New York, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Mu'minun",
    "address": "1127 Hank Aaron Drive Southwest, Atlanta, GA 30315",
    "latitude": "33.7236772",
    "longitude": "-84.3884839",
    "city": "Atlanta, GA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Quran",
    "address": "500 McDonough Boulevard Southeast, Atlanta, 30315",
    "latitude": "33.7142048",
    "longitude": "-84.3717896",
    "city": "Atlanta",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of San Francisco",
    "address": "400 Crescent Avenue, San Francisco, CA 94110",
    "latitude": "37.7347308",
    "longitude": "-122.4166813",
    "city": "San Francisco, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Tawheed Center",
    "address": "29707 West 10 Mile Road",
    "latitude": "42.4699077",
    "longitude": "-83.3407089",
    "city": "Tawheed",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Kalamazoo Islamic Center",
    "address": "1520 West Michigan Avenue, Kalamazoo, MI 49006",
    "latitude": "42.2864376",
    "longitude": "-85.6058296",
    "city": "Kalamazoo, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamia Sunna Wal Jam'ah",
    "address": "24 Mt Hope Place, 10453",
    "latitude": "40.8489987",
    "longitude": "-73.9101615",
    "city": "Islamia",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Anjuman Hefazatul Islam",
    "address": "365 East 198th Street, 10458",
    "latitude": "40.866977",
    "longitude": "-73.8864508",
    "city": "Anjuman",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Naperville",
    "address": "25W530 75th Street, Naperville, IL 60565",
    "latitude": "41.7492399",
    "longitude": "-88.1215739",
    "city": "Naperville, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ahlul Bayt Mission Masjid",
    "address": "41-02 55th Street, 11377",
    "latitude": "40.7451",
    "longitude": "-73.9096921",
    "city": "Ahlul",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Amin Jame Masjid",
    "address": "35-19 36th Street, 11106",
    "latitude": "40.754973",
    "longitude": "-73.9257415",
    "city": "Al-Amin",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Society of Queens - Dar Al-Dawah",
    "address": "35-13 23rd Avenue, 11105",
    "latitude": "40.772991",
    "longitude": "-73.9104124",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Madni Masjid",
    "address": "24-04 89th Street, East Elmhurst, NY 11369",
    "latitude": "40.7654354",
    "longitude": "-73.8803228",
    "city": "East Elmhurst, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ahmadiyya Mosque",
    "address": "3421 White Plains Road, 10467",
    "latitude": "40.8759802",
    "longitude": "-73.8673265",
    "city": "Ahmadiyya",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Jama",
    "address": "94-17 102nd Street, 11416",
    "latitude": "40.6887844",
    "longitude": "-73.8419779",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ahlul Qur'aan Wa Sunnah",
    "address": "135-11 125th Street, 11420",
    "latitude": "40.6688953",
    "longitude": "-73.8142421",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Ansar",
    "address": "161-34 Foch Boulevard, Queens, NY 11434",
    "latitude": "40.6839189",
    "longitude": "-73.7834132",
    "city": "Queens, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Alfalah",
    "address": "42-12 National Street, 11368",
    "latitude": "40.7472243",
    "longitude": "-73.8638591",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Rockaway Islamic Center",
    "address": "53-08 Rockaway Beach Boulevard, 11691",
    "latitude": "40.5927591",
    "longitude": "-73.7839929",
    "city": "Rockaway",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Chico",
    "address": "1316 Nord Avenue, Chico, CA 95926",
    "latitude": "39.734023",
    "longitude": "-121.8626478",
    "city": "Chico, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Findlay Masjid",
    "address": "Findlay, OH 45840",
    "latitude": "41.0517277",
    "longitude": "-83.6507235",
    "city": "Findlay, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Eman",
    "address": "2842 Country Club Boulevard, Stockton",
    "latitude": "37.9630214",
    "longitude": "-121.3389365",
    "city": "Stockton",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Samaha Islamic Center",
    "address": "214 Holmes Street South, Shakopee, MN 55379",
    "latitude": "44.7971536",
    "longitude": "-93.5271471",
    "city": "Shakopee, MN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Johnson County",
    "address": "9001 West 151st Street, Overland Park",
    "latitude": "38.8538343",
    "longitude": "-94.6905556",
    "city": "Overland Park",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "McLean Islamic Center",
    "address": "8800 Jarrett Valley Drive, 22182",
    "latitude": "38.9355992",
    "longitude": "-77.2488139",
    "city": "McLean",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Northern Baltimore",
    "address": "495 West Padonia Road, Lutherville, MD 21093",
    "latitude": "39.4520475",
    "longitude": "-76.6546725",
    "city": "Lutherville, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imam Mahdi Islamic Education Center of Baltimore",
    "address": "2406 Putty Hill Avenue, Parkville, MD 21234",
    "latitude": "39.3902589",
    "longitude": "-76.5429437",
    "city": "Parkville, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bait-ul-Ilm",
    "address": "485 South Bartlett Road, Streamwood, IL 60107",
    "latitude": "42.0241085",
    "longitude": "-88.180701",
    "city": "Streamwood, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bait-us-Samad",
    "address": "7302 Philadelphia Road, Rosedale, MD 21237",
    "latitude": "39.311149",
    "longitude": "-76.5291314",
    "city": "Rosedale, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Zamzam Dundalk Community Center",
    "address": "1501 Lynch Road, Dundalk, MD 21222",
    "latitude": "39.2720899",
    "longitude": "-76.4947523",
    "city": "Dundalk",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Randallstown Islamic Center",
    "address": "3117 Rices Lane, Windsor Mill, MD 21244",
    "latitude": "39.3458438",
    "longitude": "-76.7788734",
    "city": "Windsor Mill, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Fatima",
    "address": "1928 Powers Lane, Catonsville, MD 21228",
    "latitude": "39.2858424",
    "longitude": "-76.7551869",
    "city": "Catonsville, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Southern Maryland Islamic Center",
    "address": "1050 North Solomons Island Road North, Prince Frederick, MD 20678",
    "latitude": "38.559975",
    "longitude": "-76.5995712",
    "city": "Prince Frederick, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jafaria Association of Connecticut",
    "address": "1 Meriden Road, Middlefield, CT 06455",
    "latitude": "41.548454",
    "longitude": "-72.6938794",
    "city": "Middlefield, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid At-Taqwa",
    "address": "Masjid At-Taqwa",
    "latitude": "39.3509451",
    "longitude": "-74.452693",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Wheaton Islamic Center",
    "address": "Wheaton Islamic Center",
    "latitude": "41.8876036",
    "longitude": "-88.0933008",
    "city": "Wheaton",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Lighthouse Mosque",
    "address": "620 42nd Street, Oakland, CA",
    "latitude": "37.831622",
    "longitude": "-122.267671",
    "city": "Oakland",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Merced",
    "address": "2322 North Ashby Road, Merced, 95348",
    "latitude": "37.3218197",
    "longitude": "-120.5395375",
    "city": "Merced",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ar-Razzaq Islamic Center",
    "address": "1009 West Chapel Hill Street, Durham, NC 27701",
    "latitude": "35.9966474",
    "longitude": "-78.915537",
    "city": "Durham, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid An-Nur",
    "address": "1729 North Lyndale Avenue, Minneapolis, MN 55411",
    "latitude": "44.9972252",
    "longitude": "-93.2883703",
    "city": "Minneapolis, MN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center",
    "address": "15571 Joy Road, Detroit, MI 48228",
    "latitude": "42.3574833",
    "longitude": "-83.1991376",
    "city": "Detroit, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Institute of America",
    "address": "26305 Ford Road",
    "latitude": "42.3259517",
    "longitude": "-83.2982527",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Anjuman-e-Najmi",
    "address": "Anjuman-e-Najmi",
    "latitude": "42.4462657",
    "longitude": "-83.35662",
    "city": "Anjuman-e-Najmi",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Isa Ibn Maryam",
    "address": "501 Park Street, Syracuse, NY 13203",
    "latitude": "43.062728",
    "longitude": "-76.1403287",
    "city": "Syracuse",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Greater Charlotte",
    "address": "Islamic Society of Greater Charlotte",
    "latitude": "35.2572316",
    "longitude": "-80.7399315",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Northeast Denver Islamic Center",
    "address": "3400 North Albion Street, Denver, CO 80207",
    "latitude": "39.7646863",
    "longitude": "-104.9389322",
    "city": "Denver",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albanian Islamic Cultural Center of Clearwater",
    "address": "Albanian Islamic Cultural Center of Clearwater",
    "latitude": "27.9689045",
    "longitude": "-82.7996869",
    "city": "Albanian",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Ihsan Mosque",
    "address": "6650 Old Collamer Road, East Syracuse, NY 13057",
    "latitude": "43.0940951",
    "longitude": "-76.0833195",
    "city": "East Syracuse, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bilal Masjid",
    "address": "4115 Southwest 160th Avenue, Beaverton, OR 97078",
    "latitude": "45.4901263",
    "longitude": "-122.8426823",
    "city": "Beaverton, OR",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "El-Zahra Islamic Center - Midland Park",
    "address": "218 Irving Street, Midland Park, NJ 07432",
    "latitude": "41.0011911",
    "longitude": "-74.1435654",
    "city": "Midland Park, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dahira Touba-Baltimore",
    "address": "3019 Ailsa Avenue, Baltimore, MD 21214",
    "latitude": "39.3457274",
    "longitude": "-76.564524",
    "city": "Baltimore",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamaat al-Muslimeen",
    "address": "4624 York Road, Baltimore, MD 21212",
    "latitude": "39.3451021",
    "longitude": "-76.6098748",
    "city": "Baltimore",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal",
    "address": "3735 South Hanover Street, Baltimore, MD 21225",
    "latitude": "39.2365358",
    "longitude": "-76.6102301",
    "city": "Baltimore",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Us Salaam",
    "address": "240 North Howard Street, Baltimore, MD 21201",
    "latitude": "39.2927037",
    "longitude": "-76.619966",
    "city": "Baltimore",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ul-Haqq",
    "address": "514 Islamic Way, Baltimore, MD 21217",
    "latitude": "39.3050179",
    "longitude": "-76.6331315",
    "city": "Baltimore, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid as-Saffat",
    "address": "1335 West North Avenue, Baltimore, MD 21217",
    "latitude": "39.3099908",
    "longitude": "-76.6392857",
    "city": "Baltimore",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bait Allah",
    "address": "200 South Calhoun Street, Baltimore, MD 21223",
    "latitude": "39.2853271",
    "longitude": "-76.6399747",
    "city": "Baltimore, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hasbuna Allahu Islamic Center",
    "address": "3306 Liberty Heights Avenue, Baltimore, MD 21215",
    "latitude": "39.3247212",
    "longitude": "-76.6723092",
    "city": "Baltimore",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gwynn Oak Islamic Community",
    "address": "3723 Gwynn Oak Avenue, Baltimore, MD 21207",
    "latitude": "39.3343893",
    "longitude": "-76.6936424",
    "city": "Baltimore",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Muslim Communnity Center of Louisville",
    "address": "The Muslim Communnity Center of Louisville",
    "latitude": "38.2787133",
    "longitude": "-85.5999067",
    "city": "The",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Nur Mosque",
    "address": "2815 South 4th Street, Louisville, KY 40208",
    "latitude": "38.2084234",
    "longitude": "-85.7646745",
    "city": "Louisville, KY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abdul-Majid Karim Hasan Islamic Center",
    "address": "870 Dixwell Avenue, Hamden, CT 06514",
    "latitude": "41.3368966",
    "longitude": "-72.9355709",
    "city": "Hamden, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Alzahrah Islamic Center",
    "address": "4010 Bishop Lane",
    "latitude": "38.1885657",
    "longitude": "-85.6927237",
    "city": "Alzahrah",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "South Valley Islamic Center",
    "address": "14770 Columbet Avenue, San Martin, CA 94046",
    "latitude": "37.1099885",
    "longitude": "-121.6018155",
    "city": "San Martin, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammad Mosque Number Six",
    "address": "3306 Garrison Boulevard, Baltimore, MD 21216",
    "latitude": "39.3269136",
    "longitude": "-76.6828475",
    "city": "Baltimore",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Center",
    "address": "131 East 6th Street, Tempe, AZ 85281",
    "latitude": "33.424044",
    "longitude": "-111.9370514",
    "city": "Tempe",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al-Maalik",
    "address": "Masjid al-Maalik",
    "latitude": "24.5507946",
    "longitude": "-81.8037757",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Assalam Center",
    "address": "1499 Northwest 4th Avenue, Boca Raton, FL 33432",
    "latitude": "26.3644771",
    "longitude": "-80.0942043",
    "city": "Boca Raton, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Greater Toldeo",
    "address": "25877 Scheider Road, Perrysburg, OH 43551",
    "latitude": "41.5281761",
    "longitude": "-83.6185684",
    "city": "Perrysburg, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Zainabia Islamic Center",
    "address": "1100 Hope Road, Atlanta, GA 30350",
    "latitude": "33.9893504",
    "longitude": "-84.3505319",
    "city": "Atlanta, GA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Porltand Rizwan Mosque",
    "address": "9925 Southwest 35th Avenue, Portland, OR 97219",
    "latitude": "45.453359",
    "longitude": "-122.7131332",
    "city": "Portland, OR",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Fatiha",
    "address": "2844 Temple Street, Detroit, MI",
    "latitude": "42.3399954",
    "longitude": "-83.0636669",
    "city": "Detroit, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imam Mahdi Center",
    "address": "6940 Southwest Hall Boulevard, Beaverton, 97008",
    "latitude": "45.4696122",
    "longitude": "-122.8035442",
    "city": "Beaverton",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Northwest Florida",
    "address": "3445 East Johnson Avenue, Pensacola, FL 32514",
    "latitude": "30.5167218",
    "longitude": "-87.1954481",
    "city": "Pensacola, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Portland",
    "address": "10323 Southwest 43rd Avenue, Portland, OR 97219",
    "latitude": "45.450822",
    "longitude": "-122.7218963",
    "city": "Portland, OR",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Khadeeja Islamic Center",
    "address": "1019 West Parkway Avenue, West Valley City, UT 84119",
    "latitude": "40.7169839",
    "longitude": "-111.9226277",
    "city": "West Valley City, UT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hadee Moque",
    "address": "Hadee Moque",
    "latitude": "40.2907266",
    "longitude": "-76.9021427",
    "city": "Hadee",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Huda",
    "address": "73 Portland Street, Portland, ME 04101",
    "latitude": "43.6581061",
    "longitude": "-70.2647793",
    "city": "Portland, ME",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Omar Bin Alkhetab Masjid",
    "address": "978 Washington Avenue, Portland, ME 04103",
    "latitude": "43.689401",
    "longitude": "-70.2756352",
    "city": "Portland, ME",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid u Salaam",
    "address": "256 Bartlett Street, Lewiston, ME 04240",
    "latitude": "44.0918885",
    "longitude": "-70.2076965",
    "city": "Lewiston, ME",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Greater Augusta",
    "address": "11 North Pearl Street, Augusta, ME 04330",
    "latitude": "44.3235997",
    "longitude": "-69.7614438",
    "city": "Augusta, ME",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albanian-American Islamic Center",
    "address": "Saint Charles Road, Berkeley, IL 60163",
    "latitude": "41.8890806",
    "longitude": "-87.9141882",
    "city": "Berkeley, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "West Valley Muslim Association",
    "address": "16769 Farley Road, Los Gatos, CA 95032",
    "latitude": "37.2406589",
    "longitude": "-121.9634745",
    "city": "Los Gatos, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centro Islámico del Caribe",
    "address": "Centro Islámico del Caribe",
    "latitude": "18.3348747",
    "longitude": "-66.0635403",
    "city": "Centro",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Muslim Center",
    "address": "1605 Davison Freeway, Detroit, MI 48238",
    "latitude": "42.3968182",
    "longitude": "-83.1110833",
    "city": "Detroit, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Center of Hillsboro",
    "address": "7270 Northwest Helvetia Road, Hillsboro, OR 97124",
    "latitude": "45.5722059",
    "longitude": "-122.923113",
    "city": "Hillsboro, OR",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Greater Cincinnati",
    "address": "Islamic Center of Greater Cincinnati",
    "latitude": "39.3477059",
    "longitude": "-84.3837925",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Fremont",
    "address": "4039 Irvington Avenue, Fremont, CA 94538",
    "latitude": "37.5313946",
    "longitude": "-121.9597159",
    "city": "Fremont, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Foundation North",
    "address": "1751 O'Plaine Road, Libertyville, IL 60048",
    "latitude": "42.3279311",
    "longitude": "-87.9131364",
    "city": "Libertyville, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjidullah",
    "address": "7401 Limekiln Pike, Philadelphia, PA 19138",
    "latitude": "40.0675889",
    "longitude": "-75.1583902",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Jalalabad",
    "address": "61 Van Houten Street, Paterson, NJ 07505",
    "latitude": "40.918517",
    "longitude": "-74.1741029",
    "city": "Paterson, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Tri Cities",
    "address": "2900 Bombing Range Road, West Richland, WA 99353",
    "latitude": "46.2748502",
    "longitude": "-119.3456786",
    "city": "West Richland, WA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Columbia Islamic Center",
    "address": "Columbia Islamic Center",
    "latitude": "38.949335",
    "longitude": "-92.3322176",
    "city": "Columbia",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nueces Mosque",
    "address": "1908 Nueces Street, Austin, TX",
    "latitude": "30.283198",
    "longitude": "-97.744345",
    "city": "Austin, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Greater Austin",
    "address": "5110 Manor Road, Austin, TX 78723",
    "latitude": "30.2996687",
    "longitude": "-97.6867872",
    "city": "Austin, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Central Virginia",
    "address": "708 Pine Street, Charlottesville, VA 22903",
    "latitude": "38.0271505",
    "longitude": "-78.4945099",
    "city": "Charlottesville, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North Austin Muslim Community Center",
    "address": "11900 North Lamar Boulevard, Austin, TX 78753",
    "latitude": "30.3903686",
    "longitude": "-97.6840079",
    "city": "Austin, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Muqeet Mosque - Ahmadiyya Muslim Community",
    "address": "800 Deep Wood Drive, Round Rock, TX 78681",
    "latitude": "30.5010461",
    "longitude": "-97.6985957",
    "city": "Round Rock, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid AlMadina",
    "address": "Masjid AlMadina",
    "latitude": "34.680033",
    "longitude": "-86.753596",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Hafeez Mosque",
    "address": "4529 Emerson Avenue, St. Louis, MO 63120",
    "latitude": "38.6904874",
    "longitude": "-90.2538569",
    "city": "St. Louis, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammad Mosque",
    "address": "5967 West Florissant Avenue, St. Louis, 63147",
    "latitude": "38.7085797",
    "longitude": "-90.250567",
    "city": "St. Louis",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Muminoon Masjid",
    "address": "1434 North Grand Boulevard, Saint Louis, MO 63106",
    "latitude": "38.6475952",
    "longitude": "-90.2260194",
    "city": "Saint Louis, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Quoba Masjid",
    "address": "1925 Allen Avenue, St Louis, MO 63104",
    "latitude": "38.6104131",
    "longitude": "-90.2146398",
    "city": "St Louis, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Northwest Islamic Center",
    "address": "10543 Lackland Road, St. Louis, MO 63114",
    "latitude": "38.6969805",
    "longitude": "-90.3943532",
    "city": "St. Louis, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Ahad",
    "address": "297 Center Road, Bedford, OH 44146",
    "latitude": "41.4018353",
    "longitude": "-81.5376438",
    "city": "Bedford, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Community of Bosniaks, Georgia",
    "address": "Community of Bosniaks, Georgia",
    "latitude": "33.9255288",
    "longitude": "-83.9735027",
    "city": "Community",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque and Islamic Center of Hampton Roads",
    "address": "22 Tide Mill Lane, Hampton, 23666",
    "latitude": "37.0540161",
    "longitude": "-76.3759709",
    "city": "Hampton",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Islamic Society of Milwaukee University Center",
    "address": "2223 East Kenwood Boulevard, Milwaukee, WI 53211",
    "latitude": "43.0743451",
    "longitude": "-87.8819799",
    "city": "Milwaukee",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "SALAM",
    "address": "SALAM",
    "latitude": "38.6473448",
    "longitude": "-121.351168",
    "city": "SALAM",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "An-noor Educational Foundation and Islamic Study Center",
    "address": "106 10th Street Northwest, Charlottesville, VA 22903",
    "latitude": "38.0329343",
    "longitude": "-78.4944111",
    "city": "Charlottesville, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dawoodi Bohra Al Masjid Al Ezzi Anjuman-e-Burhanee",
    "address": "Dawoodi Bohra Al Masjid Al Ezzi Anjuman-e-Burhanee",
    "latitude": "34.1736493",
    "longitude": "-118.6436906",
    "city": "Dawoodi",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Oakland Islamic Center",
    "address": "515 31st Street, Oakland, 94609",
    "latitude": "37.8198018",
    "longitude": "-122.2677563",
    "city": "Oakland",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "United Islamic Center of Arizona",
    "address": "United Islamic Center of Arizona",
    "latitude": "33.6614922",
    "longitude": "-112.1352308",
    "city": "United",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of New Mexico",
    "address": "1100 Yale Boulevard Southeast, Albuquerque, NM 87106",
    "latitude": "35.0683401",
    "longitude": "-106.6216882",
    "city": "Albuquerque, NM",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Maine",
    "address": "151 Park Street, Orono, ME 04473",
    "latitude": "44.894341",
    "longitude": "-68.6583437",
    "city": "Orono, ME",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Lexington",
    "address": "1240 Armstrong Mill Road, Lexington, KY",
    "latitude": "37.9782063",
    "longitude": "-84.4857396",
    "city": "Lexington, KY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Tawheed Islamic Center",
    "address": "984 West Side Avenue, Jersey City, NJ 07306",
    "latitude": "40.7331815",
    "longitude": "-74.0717844",
    "city": "Jersey City, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community of Bryan",
    "address": "417 Stasney Street, College Station, TX 77840",
    "latitude": "30.6222578",
    "longitude": "-96.3474684",
    "city": "College Station, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Daw Center of Masjid Umar",
    "address": "Daw Center of Masjid Umar",
    "latitude": "34.0185669",
    "longitude": "-118.2924402",
    "city": "Daw",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Sadiq Mosque",
    "address": "4448 South Wabash Avenue, Chicago, IL 60653",
    "latitude": "41.8132752",
    "longitude": "-87.6249039",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Newark",
    "address": "Islamic Center of Newark",
    "latitude": "40.7348476",
    "longitude": "-74.1737912",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana",
    "address": "1590 Arrington Road, College Station, TX 77845",
    "latitude": "30.549281",
    "longitude": "-96.2600921",
    "city": "College Station, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Falah",
    "address": "309 South Serrano Avenue, CA 90020",
    "latitude": "34.068638",
    "longitude": "-118.3069725",
    "city": "Unknown, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Minhaj ul Quran International",
    "address": "Minhaj ul Quran International",
    "latitude": "33.0133608",
    "longitude": "-96.8875328",
    "city": "Minhaj",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madinah Masjid of Carrollton",
    "address": "2180 Old Denton Road, Carrollton, TX 75006",
    "latitude": "32.9751557",
    "longitude": "-96.9093891",
    "city": "Carrollton, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abou Ben Adhem Shrine Mosque",
    "address": "601 East Saint Louis Street, Springfield, MO 65806",
    "latitude": "37.2093929",
    "longitude": "-93.2862561",
    "city": "Springfield, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "First Cleveland Mosque",
    "address": "First Cleveland Mosque",
    "latitude": "41.460529",
    "longitude": "-81.5908217",
    "city": "First",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Amarillo",
    "address": "Islamic Center of Amarillo",
    "latitude": "35.2113128",
    "longitude": "-101.9108193",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "MTO Shahmaghsoudi (School of Islamic Sufism)",
    "address": "MTO Shahmaghsoudi (School of Islamic Sufism)",
    "latitude": "34.2018552",
    "longitude": "-118.5257954",
    "city": "MTO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Granada Hills Mosque",
    "address": "Granada Hills Mosque",
    "latitude": "34.2785755",
    "longitude": "-118.5165247",
    "city": "Granada",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center Northridge",
    "address": "Islamic Center Northridge",
    "latitude": "34.223597",
    "longitude": "-118.5531562",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imam Bukhari Mosque",
    "address": "Parthenia Street, North Hills, CA 91343",
    "latitude": "34.2280031",
    "longitude": "-118.474704",
    "city": "North Hills",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bait-ul-zikr",
    "address": "360 Main Street, Fitchburg, MA",
    "latitude": "42.5823138",
    "longitude": "-71.7975077",
    "city": "Fitchburg, MA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Burbank",
    "address": "Islamic Center of Burbank",
    "latitude": "34.2136945",
    "longitude": "-118.3597473",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Ihsaan",
    "address": "10180 Southwest 168th Street, Miami, FL 33157",
    "latitude": "25.6131666",
    "longitude": "-80.3558929",
    "city": "Miami, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Racine Islamic Center",
    "address": "419 High Street, Racine, WI",
    "latitude": "42.7422124",
    "longitude": "-87.7857846",
    "city": "Racine, WI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Stillwater",
    "address": "Islamic Society of Stillwater",
    "latitude": "36.1292743",
    "longitude": "-97.0699697",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Bosniaks in Utah",
    "address": "425 700 West, Salt Lake City, UT 84116",
    "latitude": "40.7787982",
    "longitude": "-111.9115561",
    "city": "Salt Lake City",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Center (MCC) - East Bay",
    "address": "5724 West Las Positas Boulevard",
    "latitude": "37.6855217",
    "longitude": "-121.8911404",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Rahim",
    "address": "Masjid Al-Rahim",
    "latitude": "28.5423505",
    "longitude": "-81.4460032",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "La Mirada Masjid",
    "address": "14225 Imperial Highway, La Mirada, CA 90638",
    "latitude": "33.9174639",
    "longitude": "-118.0283588",
    "city": "La Mirada, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Downey",
    "address": "11022 Old River School Road, Downey, CA 90241",
    "latitude": "33.9490006",
    "longitude": "-118.1470618",
    "city": "Downey, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bab-Ul-Ilm Islamic Center",
    "address": "5950 Heliotrope Circle, Maywood, CA 90270",
    "latitude": "33.9852914",
    "longitude": "-118.1794611",
    "city": "Maywood, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Midcities",
    "address": "12428 Benedict Avenue, Downey, CA 90242",
    "latitude": "33.917978",
    "longitude": "-118.1186732",
    "city": "Downey, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Mukarram Masjid",
    "address": "2116 South Nelson Street, 22204",
    "latitude": "38.8495913",
    "longitude": "-77.0905485",
    "city": "Baitul",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Diyanet Center of America",
    "address": "9704 Good Luck Road, Lanham-Seabrook, MD 20706",
    "latitude": "38.9834205",
    "longitude": "-76.8438188",
    "city": "Lanham-Seabrook, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Center of Middlesex",
    "address": "Muslim Center of Middlesex",
    "latitude": "40.5295875",
    "longitude": "-74.4685166",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque",
    "address": "Mosque",
    "latitude": "40.0617272",
    "longitude": "-74.8479653",
    "city": "Mosque",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Warith Deen",
    "address": "7301 Superior Avenue",
    "latitude": "41.5196469",
    "longitude": "-81.6379283",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitus Salaam Mosque",
    "address": "520 Pacifica Avenue, Bay Point, CA 94565",
    "latitude": "38.0346267",
    "longitude": "-121.9758185",
    "city": "Bay Point, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Alameda",
    "address": "901 Santa Clara Avenue, Alameda, 94501",
    "latitude": "37.7733761",
    "longitude": "-122.270209",
    "city": "Alameda",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Jumu'ah",
    "address": "Masjid Al-Jumu'ah",
    "latitude": "41.6880985",
    "longitude": "-88.1181756",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Mukarram Jame Masjid",
    "address": "3296 Bailey Avenue, Buffalo, NY 14215",
    "latitude": "42.9446585",
    "longitude": "-78.8141634",
    "city": "Buffalo, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Noor",
    "address": "1032 Park Avenue, Huntington, NY 11743",
    "latitude": "40.8393593",
    "longitude": "-73.3664772",
    "city": "Huntington, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Glendale",
    "address": "700 S. Adams St., Glendale, CA 91205",
    "latitude": "34.1387408",
    "longitude": "-118.2414103",
    "city": "Glendale, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Center",
    "address": "1888 East Fort Union Boulevard, Cottonwood Heights, UT 84121",
    "latitude": "40.6242614",
    "longitude": "-111.8378297",
    "city": "Cottonwood Heights, UT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Santa Clarita Valley",
    "address": "28877 Bouquet Canyon Road, Santa Clarita, CA 91390",
    "latitude": "34.4620873",
    "longitude": "-118.4837913",
    "city": "Santa Clarita, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Avondale Islamic Center",
    "address": "Avondale Islamic Center",
    "latitude": "38.9462968",
    "longitude": "-76.977118",
    "city": "Avondale",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Germantown",
    "address": "19825 Blunt Road, Germantown, MD 20876",
    "latitude": "39.1811893",
    "longitude": "-77.2359344",
    "city": "Germantown, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Prince Georges Muslim Association",
    "address": "9150 Lanham Severn Road, Lanham, MD 20706",
    "latitude": "38.9674914",
    "longitude": "-76.8560895",
    "city": "Lanham, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Two Rivers Mosque",
    "address": "801 Gunnison Avenue, Grand Junction, CO 81501",
    "latitude": "39.0731142",
    "longitude": "-108.5591307",
    "city": "Grand Junction, CO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Michiana",
    "address": "Islamic Society of Michiana",
    "latitude": "41.7014824",
    "longitude": "-86.2027535",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Northwest Arkansas",
    "address": "1420 West Center Street, Fayetteville, AR 72701",
    "latitude": "36.0634441",
    "longitude": "-94.1806515",
    "city": "Fayetteville",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Abu Bakar",
    "address": "948 62nd Street, CA",
    "latitude": "37.8463325",
    "longitude": "-122.2771532",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Huda",
    "address": "1081 West Irving Park Road, Schaumburg, IL 60193",
    "latitude": "41.9977793",
    "longitude": "-88.1185722",
    "city": "Schaumburg, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Salman Alfarisi Islamic Center",
    "address": "Salman Alfarisi Islamic Center",
    "latitude": "44.5739162",
    "longitude": "-123.2755113",
    "city": "Salman",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Rahman",
    "address": "1110 36th Street, Richmond, CA",
    "latitude": "37.9495512",
    "longitude": "-122.3326262",
    "city": "Richmond",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Manteca",
    "address": "Islamic Center of Manteca",
    "latitude": "37.7886673",
    "longitude": "-121.2334839",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Madina Association",
    "address": "Al Madina Association",
    "latitude": "44.7530604",
    "longitude": "-93.1063462",
    "city": "Al",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North Hudson Islamic Educational Center",
    "address": "6413 Cottage Place, Union City, NJ 07087",
    "latitude": "40.7812549",
    "longitude": "-74.0234687",
    "city": "Union City, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Islamic Center of the Shenandoah Valley",
    "address": "1330 Country Club Road, Harrisonburg City, VA 22802",
    "latitude": "38.4406473",
    "longitude": "-78.8482925",
    "city": "Harrisonburg City, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Queresha Masjid",
    "address": "1489 Country Club Road, Gillette, WY 82718",
    "latitude": "44.2763863",
    "longitude": "-105.4783683",
    "city": "Gillette, WY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjidul Mu'meneen",
    "address": "Masjidul Mu'meneen",
    "latitude": "29.6584513",
    "longitude": "-95.5315656",
    "city": "Masjidul",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madrasah Islamiah Masjid Noor",
    "address": "6665 Bintliff Drive, Houston, TX 77074",
    "latitude": "29.7071981",
    "longitude": "-95.5048381",
    "city": "Houston, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Inshirah Islamic Center",
    "address": "Al-Inshirah Islamic Center",
    "latitude": "39.059397",
    "longitude": "-94.5721929",
    "city": "Al-Inshirah",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Anjuman-e-Saifee Chicago",
    "address": "10S252 Kingery Highway, Willowbrook, IL 60527",
    "latitude": "41.7255269",
    "longitude": "-87.9457946",
    "city": "Willowbrook",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ibraham",
    "address": "315 South Ford Boulevard, Ypsilanti, MI 48197",
    "latitude": "42.2389606",
    "longitude": "-83.579326",
    "city": "Ypsilanti, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bait-ul-Qayyum Mosque",
    "address": "2801 Miller Avenue, Fort Worth, TX 76105",
    "latitude": "32.7177157",
    "longitude": "-97.2623461",
    "city": "Fort Worth, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "South Metro Islamic Center",
    "address": "15400 Robert Trail South, Rosemount, MN 55068",
    "latitude": "44.726631",
    "longitude": "-93.1314148",
    "city": "Rosemount",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shia Ithna'asheri Jamaat of PA",
    "address": "Shia Ithna'asheri Jamaat of PA",
    "latitude": "40.6090979",
    "longitude": "-75.5642584",
    "city": "Shia",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Association of Lehigh Valley",
    "address": "1988 Schadt Avenue, Whitehall, PA 18052",
    "latitude": "40.6372905",
    "longitude": "-75.5064551",
    "city": "Whitehall, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Huda Center",
    "address": "141 Van Brunt Boulevard, Kansas City, MO 64123",
    "latitude": "39.1111526",
    "longitude": "-94.5253213",
    "city": "Kansas City, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Education Center of Pennsylvania",
    "address": "6635 Tilghman Street, Allentown, PA 18106",
    "latitude": "40.5895543",
    "longitude": "-75.6042275",
    "city": "Allentown, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Springfield",
    "address": "Islamic Center of Springfield",
    "latitude": "37.2268241",
    "longitude": "-93.2531419",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abubakar As-Saddique Islamic Center",
    "address": "Abubakar As-Saddique Islamic Center",
    "latitude": "44.9508757",
    "longitude": "-93.2569517",
    "city": "Abubakar",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Noor",
    "address": "518 Green Street, Norristown, PA 19401",
    "latitude": "40.1153259",
    "longitude": "-75.339815",
    "city": "Norristown, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of East Valley",
    "address": "425 North Alma School Road, Chandler, AZ 85224",
    "latitude": "33.3109725",
    "longitude": "-111.8576136",
    "city": "Chandler, AZ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bait-ul-Aman Mosque",
    "address": "2035 West Elliot Road, Chandler, AZ 85224",
    "latitude": "33.349196",
    "longitude": "-111.8779535",
    "city": "Chandler, AZ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Greater Houston",
    "address": "3110 Eastside Street, Houston, TX 77098",
    "latitude": "29.7368871",
    "longitude": "-95.4250552",
    "city": "Houston, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Baton Rouge",
    "address": "285 East Airport Avenue, Baton Rouge, LA 70806",
    "latitude": "30.4492363",
    "longitude": "-91.1008717",
    "city": "Baton Rouge, LA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abu-Bakr",
    "address": "Abu-Bakr",
    "latitude": "47.4768623",
    "longitude": "-122.2843697",
    "city": "Abu-Bakr",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "IEC Masjid of Tampa",
    "address": "4450 West Ohio Avenue, Tampa, FL 33614",
    "latitude": "27.9771711",
    "longitude": "-82.5179712",
    "city": "Tampa, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Islamic Center of Chattanooga",
    "address": "The Islamic Center of Chattanooga",
    "latitude": "35.0322701",
    "longitude": "-85.2958168",
    "city": "The",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of South Texas",
    "address": "7341 McArdle Road, Corpus Christi, TX 78412",
    "latitude": "27.6942569",
    "longitude": "-97.3366009",
    "city": "Corpus Christi, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of South Texas",
    "address": "Islamic Society of South Texas",
    "latitude": "27.6946377",
    "longitude": "-97.3363631",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Center of Laurel",
    "address": "7306 Contee Road, Laurel, 20707",
    "latitude": "39.0805759",
    "longitude": "-76.8800252",
    "city": "Laurel",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "ISGH Masjid At-Taqwa",
    "address": "10415 Synott Road, Sugar Land, TX 77498",
    "latitude": "29.665285",
    "longitude": "-95.6157566",
    "city": "Sugar Land, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "al-Masjid al-Awwal",
    "address": "1911 Wylie Avenue, Pittsburgh, PA 15219",
    "latitude": "40.4441085",
    "longitude": "-79.9817444",
    "city": "Pittsburgh, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Pittsburgh",
    "address": "4100 Bigelow Boulevard, Pittsburgh, PA 15213",
    "latitude": "40.4487826",
    "longitude": "-79.9557498",
    "city": "Pittsburgh, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Yakima",
    "address": "311 South 10th Avenue, Yakima, WA 98902",
    "latitude": "46.5938673",
    "longitude": "-120.5201842",
    "city": "Yakima, WA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-e-Ali",
    "address": "47 Cedar Grove Lane, Somerset, NJ 08873",
    "latitude": "40.5309738",
    "longitude": "-74.5142459",
    "city": "Somerset, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Santa Rosa",
    "address": "Islamic Society of Santa Rosa",
    "latitude": "38.4430969",
    "longitude": "-122.7165293",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al-Muslimiin",
    "address": "1929 Gervais Street, Columbia, SC 29201",
    "latitude": "34.0057066",
    "longitude": "-81.0212858",
    "city": "Columbia, SC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "ICCNY Islamic Center Masjid",
    "address": "1558 Washington Boulevard, Stamford, CT 06902",
    "latitude": "41.0606605",
    "longitude": "-73.5443125",
    "city": "Stamford, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Pullman Islamic Center",
    "address": "Pullman Islamic Center",
    "latitude": "46.7370238",
    "longitude": "-117.1656086",
    "city": "Pullman",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Mosque",
    "address": "Masjid Mosque",
    "latitude": "40.2075879",
    "longitude": "-74.8253724",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Boise",
    "address": "3077 North Christine Street, Boise, ID 83704",
    "latitude": "43.6327943",
    "longitude": "-116.2874583",
    "city": "Boise, ID",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Rochester",
    "address": "727 Westfall Road, Rochester, NY 14620",
    "latitude": "43.1144679",
    "longitude": "-77.6018841",
    "city": "Rochester, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Islah Islamic Center",
    "address": "2733 Caniff Street, Hamtramck, 48212",
    "latitude": "42.3997798",
    "longitude": "-83.0606739",
    "city": "Hamtramck",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Noor Foundation",
    "address": "14522 Goldenwest Street, Westminster, CA 92683",
    "latitude": "33.7512827",
    "longitude": "-118.0064907",
    "city": "Westminster, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Taqwa Masjid Islamic Center",
    "address": "1418 East la Salle Avenue, Barron, WI 54812",
    "latitude": "45.3995293",
    "longitude": "-91.8368052",
    "city": "Barron, WI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Socorro",
    "address": "1208 El Camino Real Street, Socorro, NM 87801",
    "latitude": "34.0741561",
    "longitude": "-106.8991081",
    "city": "Socorro, NM",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Markaz-ul-Murtazawi (Anjuman-e-Husami)",
    "address": "Al Markaz-ul-Murtazawi (Anjuman-e-Husami)",
    "latitude": "33.9537319",
    "longitude": "-81.0817335",
    "city": "Al",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic House of Wisdom",
    "address": "22575 Ann Arbor Trail, Dearborn Heights, MI 48127",
    "latitude": "42.3397668",
    "longitude": "-83.2617332",
    "city": "Dearborn Heights, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Macomb",
    "address": "Islamic Center of Macomb",
    "latitude": "40.4668779",
    "longitude": "-90.6940969",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal",
    "address": "425 Fulton Street, Farmingdale, NY 11735",
    "latitude": "40.7303918",
    "longitude": "-73.4518776",
    "city": "Farmingdale, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Omar Ibn Sayyiid Mosque",
    "address": "2700 Murchison Road",
    "latitude": "35.0918345",
    "longitude": "-78.9095132",
    "city": "Omar",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Long Island",
    "address": "835 Brush Hollow Road, Westbury, NY 11590",
    "latitude": "40.7658668",
    "longitude": "-73.5707666",
    "city": "Westbury, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Charlotte",
    "address": "1700 Progress Lane, Charlotte, NC 28205",
    "latitude": "35.2085631",
    "longitude": "-80.7690389",
    "city": "Charlotte, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center at UConn",
    "address": "28 North Eagleville Road, Storrs, CT 06269",
    "latitude": "41.8120188",
    "longitude": "-72.2521087",
    "city": "Storrs, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "A.I.C. Islamic Center",
    "address": "4431 Walnut Street, Philadelphia, PA 19104",
    "latitude": "39.9554733",
    "longitude": "-75.2113489",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bayt Ul-Mamur Mosque",
    "address": "Bayt Ul-Mamur Mosque",
    "latitude": "41.7700468",
    "longitude": "-72.5188194",
    "city": "Bayt",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bait-ul-Ikram Mosque",
    "address": "1850 Hedgcoxe Road, Allen, TX 75013",
    "latitude": "33.0865402",
    "longitude": "-96.7228994",
    "city": "Allen, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "ISCNY Islamic Community Center",
    "address": "5833 East Seneca Turnpike, Jamesville, NY 13078",
    "latitude": "42.9981883",
    "longitude": "-76.1162311",
    "city": "Jamesville, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ibrahim",
    "address": "8521 W TX 71, Austin, TX 78735",
    "latitude": "30.2482314",
    "longitude": "-97.8921154",
    "city": "Austin, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammads Mosque",
    "address": "360 Clinton Avenue, Albany, NY 12206",
    "latitude": "42.6614835",
    "longitude": "-73.7630841",
    "city": "Albany, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hillside Islamic Center",
    "address": "300 Hillside Avenue, New Hyde Park, NY 11040",
    "latitude": "40.7399117",
    "longitude": "-73.6982555",
    "city": "New Hyde Park, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of the Quad Cities",
    "address": "Islamic Center of the Quad Cities",
    "latitude": "41.4789601",
    "longitude": "-90.4561161",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Madany Islamic Center of Norwalk",
    "address": "1 Union Park Place, Norwalk, CT 06850",
    "latitude": "41.1157943",
    "longitude": "-73.4171674",
    "city": "Norwalk, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Oxford Masjid",
    "address": "401 McElroy Drive, Oxford, MS 38655",
    "latitude": "34.3810653",
    "longitude": "-89.5332006",
    "city": "Oxford, MS",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mustafa Center",
    "address": "6844 Braddock Road, Annandale, VA 22003",
    "latitude": "38.8125174",
    "longitude": "-77.1832794",
    "city": "Annandale, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "MAS",
    "address": "MAS",
    "latitude": "45.191329",
    "longitude": "-93.2324867",
    "city": "MAS",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Hamtramck",
    "address": "11347 Joseph Campau Street, Hamtramck, MI 48212",
    "latitude": "42.4003053",
    "longitude": "-83.0606779",
    "city": "Hamtramck, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Greater Saint Joseph",
    "address": "2325 Messanie Street, Saint Joseph, MO 64501",
    "latitude": "39.7627693",
    "longitude": "-94.8318424",
    "city": "Saint Joseph, MO",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Millard Islamic Foundation",
    "address": "5135 Marshall Drive, Omaha, NE 68137",
    "latitude": "41.2058907",
    "longitude": "-96.1311888",
    "city": "Omaha, NE",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Center of Paramus",
    "address": "Muslim Community Center of Paramus",
    "latitude": "40.9628953",
    "longitude": "-74.0590488",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bait-ul-Hadi Mosque",
    "address": "27 South Street, Old Bridge, NJ 08857",
    "latitude": "40.3841807",
    "longitude": "-74.3428879",
    "city": "Old Bridge, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Idara Jaferia Islamic Center",
    "address": "3140 Spencerville Road, Burtonsville, MD 20866",
    "latitude": "39.108651",
    "longitude": "-76.9445011",
    "city": "Burtonsville, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "American Muslim Institute",
    "address": "Faith Plaza, Omaha, NE 68144",
    "latitude": "41.243556",
    "longitude": "-96.1183556",
    "city": "Omaha, NE",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Manhattan",
    "address": "1224 Hylton Heights Road, Manhattan, KS 66502",
    "latitude": "39.1926591",
    "longitude": "-96.6042439",
    "city": "Manhattan, KS",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of East Lansing",
    "address": "920 South Harrison Road, 48823-5164",
    "latitude": "42.7241423",
    "longitude": "-84.494678",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Knoxville Jamatkhana",
    "address": "Knoxville Jamatkhana",
    "latitude": "35.9435145",
    "longitude": "-84.1565046",
    "city": "Knoxville",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Hira",
    "address": "2426 Atlantic Avenue, Atlantic City",
    "latitude": "39.3563001",
    "longitude": "-74.4413042",
    "city": "Atlantic City",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Mahdi Islamic Center",
    "address": "Al-Mahdi Islamic Center",
    "latitude": "36.1357141",
    "longitude": "-86.761133",
    "city": "Al-Mahdi",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center Of Five Towns Masjid Hewlett",
    "address": "437 Hamilton Avenue, Hewlett, NY 11557",
    "latitude": "40.6426425",
    "longitude": "-73.7065689",
    "city": "Hewlett, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Adams Community Center",
    "address": "4700 Rochester Road, Troy, MI 48085",
    "latitude": "42.587775",
    "longitude": "-83.1283464",
    "city": "Troy, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Nashville",
    "address": "Islamic Center of Nashville",
    "latitude": "36.1242804",
    "longitude": "-86.7899956",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "IAGD - Islamic Association of Greater Detroit",
    "address": "879 West Auburn Road, Rochester Hills, MI 48307",
    "latitude": "42.6348092",
    "longitude": "-83.1491766",
    "city": "Rochester Hills, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Academy of San Antonio",
    "address": "8638 Fairhaven Street, San Antonio",
    "latitude": "29.5216118",
    "longitude": "-98.5631983",
    "city": "San Antonio",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center",
    "address": "Islamic Center",
    "latitude": "39.9669717",
    "longitude": "-82.962791",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jafaria Islamic Society",
    "address": "1546 East La Palma Avenue, Anaheim, CA 92805",
    "latitude": "33.8469003",
    "longitude": "-117.8956131",
    "city": "Anaheim, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid As-Sabur",
    "address": "Masjid As-Sabur",
    "latitude": "38.5383581",
    "longitude": "-121.4480782",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darul Arqum Islamic Centre",
    "address": "1212 Iowa Avenue, Ames, IA 50014",
    "latitude": "42.0338601",
    "longitude": "-93.6585261",
    "city": "Ames, IA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Muslim Unity Center",
    "address": "The Muslim Unity Center",
    "latitude": "42.6051588",
    "longitude": "-83.3156493",
    "city": "The",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community of Western Suburbs",
    "address": "40440 Palmer Road, Canton, MI 48188",
    "latitude": "42.2949872",
    "longitude": "-83.4391904",
    "city": "Canton, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "New Islamic Generation Foundation",
    "address": "New Islamic Generation Foundation",
    "latitude": "32.7131211",
    "longitude": "-97.0969495",
    "city": "New",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Association of Cincinnati",
    "address": "3668 Clifton Avenue, Cincinnati, OH 45220",
    "latitude": "39.1493504",
    "longitude": "-84.5180318",
    "city": "Cincinnati, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Qur'an",
    "address": "11723 West Brown Deer Road, Milwaukee, WI 53224",
    "latitude": "43.1765827",
    "longitude": "-88.0583411",
    "city": "Milwaukee, WI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baymeadows Islamic Center",
    "address": "Baymeadows Islamic Center",
    "latitude": "30.2200694",
    "longitude": "-81.5725121",
    "city": "Baymeadows",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal Canton",
    "address": "1525 North Ridge Road, Canton, MI 48187",
    "latitude": "42.3165925",
    "longitude": "-83.5301074",
    "city": "Canton, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Community Center and Jamatkhana",
    "address": "3750 North 92nd Street, Milwaukee, WI 53222",
    "latitude": "43.0852776",
    "longitude": "-88.0272866",
    "city": "Milwaukee, WI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammadi Masjid",
    "address": "681 Elmont Road, Elmont, NY 11003",
    "latitude": "40.69303",
    "longitude": "-73.7180676",
    "city": "Elmont, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque Foundation",
    "address": "7360 West 93rd Street, Bridgeview, IL 60455",
    "latitude": "41.7228415",
    "longitude": "-87.802971",
    "city": "Bridgeview, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Prayer Center of Orland Park",
    "address": "16530 104th Avenue, Orland Park, IL 60467",
    "latitude": "41.5895674",
    "longitude": "-87.872411",
    "city": "Orland Park, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Cultural Center of Des Plaines",
    "address": "480 Potter Road, Des Plaines, IL 60016",
    "latitude": "42.0454973",
    "longitude": "-87.860917",
    "city": "Des Plaines, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Qadir Mosque",
    "address": "10401 West Oklahoma Avenue, Greenfield, WI 53227",
    "latitude": "42.9876763",
    "longitude": "-88.0419156",
    "city": "Greenfield, WI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Milwaukee",
    "address": "4707 South 13th Street, Milwaukee, WI 53221",
    "latitude": "42.9589232",
    "longitude": "-87.9299241",
    "city": "Milwaukee",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar-ul-Hikmah",
    "address": "11615 West Layton Avenue, Greenfield, WI 53228",
    "latitude": "42.9587589",
    "longitude": "-88.0584031",
    "city": "Greenfield, WI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana",
    "address": "6704 Alma Drive, Plano, TX 75023",
    "latitude": "33.0662639",
    "longitude": "-96.7086591",
    "city": "Plano, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Vermont",
    "address": "400 Swift Street, South Burlington, VT 05403",
    "latitude": "44.4435041",
    "longitude": "-73.1794694",
    "city": "South Burlington, VT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Frederick",
    "address": "1250 Key Parkway, Frederick, MD 21702",
    "latitude": "39.4212924",
    "longitude": "-77.45234",
    "city": "Frederick, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Sahaabah Watauga Center",
    "address": "6005 Chapman Road, Watauga, TX 76148",
    "latitude": "32.8682536",
    "longitude": "-97.2517276",
    "city": "Watauga, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Vacaville",
    "address": "131 Bush Street, Vacaville, CA 95688",
    "latitude": "38.3579466",
    "longitude": "-121.9821471",
    "city": "Vacaville, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albanian American Muslim Society",
    "address": "157 West Girard Avenue, Philadelphia, PA 19123",
    "latitude": "39.9695082",
    "longitude": "-75.1382553",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Aqsa Islamic Society",
    "address": "1501 Germantown Avenue, Philadelphia, PA 19122",
    "latitude": "39.9739113",
    "longitude": "-75.1413619",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Makkah Masjid",
    "address": "1319 West Susquehanna Avenue, Philadelphia, PA 19122",
    "latitude": "39.9863468",
    "longitude": "-75.1547178",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nigerian Muslim Association of Philadelphia",
    "address": "2209 North Front Street, Philadelphia, PA 19133",
    "latitude": "39.9835574",
    "longitude": "-75.1321298",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bait-ul-Aafiyat Mosque",
    "address": "1215 West Glenwood Avenue, Philadelphia, PA 19133",
    "latitude": "39.9980563",
    "longitude": "-75.1514575",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ridge Avenue Islamic Center",
    "address": "3116 Ridge Avenue, Philadelphia, PA 19121",
    "latitude": "39.9894949",
    "longitude": "-75.184198",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Muqbil Bin Hadee",
    "address": "2735 West Allegheny Avenue, Philadelphia, PA 19132",
    "latitude": "40.004683",
    "longitude": "-75.1748717",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "United Muslim Movement",
    "address": "810 South 15th Street, Philadelphia, PA 19146",
    "latitude": "39.9407514",
    "longitude": "-75.1680764",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Al Salaam",
    "address": "15250 Dumfries Road, Manassas, VA 20112",
    "latitude": "38.6222435",
    "longitude": "-77.4024385",
    "city": "Manassas",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Harford County Education Society (Masjid Al Falaah)",
    "address": "3014 Philadelphia Road",
    "latitude": "39.4541766",
    "longitude": "-76.2872586",
    "city": "Harford",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mubarak Mosque",
    "address": "4555 Ahmadiyya Drive, Chantilly, VA 20151",
    "latitude": "38.8803876",
    "longitude": "-77.4363732",
    "city": "Chantilly, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madina Masjid",
    "address": "1773 West North Temple, Salt Lake City, UT 84116",
    "latitude": "40.7712147",
    "longitude": "-111.9411333",
    "city": "Salt Lake City, UT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nur-Allah Islamic Center",
    "address": "2040 East 46th Street, Indianapolis, IN 46205",
    "latitude": "39.8403941",
    "longitude": "-86.1260973",
    "city": "Indianapolis, IN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Minnesota Islamic Center - Masjid Imaam Al-Shaafi'i",
    "address": "390 4th Avenue South, St. Cloud, MN 56301",
    "latitude": "45.5561759",
    "longitude": "-94.1528663",
    "city": "St. Cloud, MN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Huda Islamic Center",
    "address": "Al-Huda Islamic Center",
    "latitude": "47.9385391",
    "longitude": "-97.0209447",
    "city": "Al-Huda",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ibrahim",
    "address": "Masjid Ibrahim",
    "latitude": "39.6758881",
    "longitude": "-75.6961698",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Greater Chattanooga",
    "address": "Islamic Society of Greater Chattanooga",
    "latitude": "35.048643",
    "longitude": "-85.1465431",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dawoodi Bohra Masjid",
    "address": "1121 Old Canyon Road, Fremont, CA 94536",
    "latitude": "37.582303",
    "longitude": "-121.9634699",
    "city": "Fremont, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mahmood Mosque",
    "address": "1730 West Auburn Road, Rochester Hills, MI 48309",
    "latitude": "42.6364453",
    "longitude": "-83.1660125",
    "city": "Rochester Hills, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Greater Valley Forge",
    "address": "Islamic Society of Greater Valley Forge",
    "latitude": "40.0665886",
    "longitude": "-75.434542",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Saad Foundation",
    "address": "Masjid Saad Foundation",
    "latitude": "41.7170162",
    "longitude": "-83.6686298",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Fredericksburg",
    "address": "7040 Harrison Road, Fredericksburg, VA 22407",
    "latitude": "38.2891834",
    "longitude": "-77.5682378",
    "city": "Fredericksburg, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Cedar Rapids",
    "address": "2999 1st Avenue West, Cedar Rapids, IA 52405",
    "latitude": "41.9682976",
    "longitude": "-91.7103187",
    "city": "Cedar Rapids, IA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Greater Richmond",
    "address": "6324 Rigsby Road, 23226",
    "latitude": "37.5961833",
    "longitude": "-77.5157181",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Richmond(Masjid Yusuf)",
    "address": "8461 Hungary Road, Henrico, VA 23060",
    "latitude": "37.6464036",
    "longitude": "-77.5266295",
    "city": "Henrico, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic center of Wylie, Masjid",
    "address": "3390 Lakeway Drive, St Paul, TX 75098",
    "latitude": "33.048489",
    "longitude": "-96.567142",
    "city": "St Paul, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community of Bosniaks in Washington",
    "address": "20001 24th Avenue Northeast, Shoreline, WA 98155",
    "latitude": "47.7739943",
    "longitude": "-122.3037482",
    "city": "Shoreline, WA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Batavia Islamic Center",
    "address": "222 South Batavia Avenue, Batavia, IL 60510",
    "latitude": "41.846575",
    "longitude": "-88.311281",
    "city": "Batavia, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Rahman Mosque - Islamic Society of Greater Dayton",
    "address": "26 Josie Street, Dayton, OH 45403",
    "latitude": "39.7555655",
    "longitude": "-84.1758655",
    "city": "Dayton, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Warrensburg",
    "address": "Islamic Center of Warrensburg",
    "latitude": "38.7640723",
    "longitude": "-93.7382368",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Lubbock",
    "address": "3419 La Salle Avenue, Lubbock, TX 79407",
    "latitude": "33.561898",
    "longitude": "-101.9537991",
    "city": "Lubbock, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Middle Georgia",
    "address": "2501 Elberta Road, Centerville, GA 31028",
    "latitude": "32.6328427",
    "longitude": "-83.6679528",
    "city": "Centerville",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Maryland",
    "address": "19411 Woodfield Road, Gaithersburg, MD 20879",
    "latitude": "39.1745646",
    "longitude": "-77.150878",
    "city": "Gaithersburg, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Central Jersey",
    "address": "4145 US-1, Monmouth Junction, NJ 08852",
    "latitude": "40.3878313",
    "longitude": "-74.5711398",
    "city": "Monmouth Junction, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Council of America",
    "address": "6941 Schaefer Road, Dearborn, MI",
    "latitude": "42.3418466",
    "longitude": "-83.1771059",
    "city": "Dearborn, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Furqan",
    "address": "Masjid Al-Furqan",
    "latitude": "42.3289798",
    "longitude": "-83.1493448",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Lincoln Islamic Foundation",
    "address": "129 West Belmont Avenue, Lincoln, NE 68521",
    "latitude": "40.838978",
    "longitude": "-96.7213385",
    "city": "Lincoln, NE",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Yunus Emre Muslim Community Center",
    "address": "Yunus Emre Muslim Community Center",
    "latitude": "41.0670526",
    "longitude": "-80.6635096",
    "city": "Yunus",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Center of Tucson",
    "address": "5100 N Kevy Pl, Tucson, AZ 85704",
    "latitude": "32.2997568",
    "longitude": "-110.9978715",
    "city": "Tucson, AZ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Namarah Pakistani Community Center",
    "address": "Masjid Namarah Pakistani Community Center",
    "latitude": "39.9146868",
    "longitude": "-82.8762373",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Lexington Park",
    "address": "46118 Thompson Court, Lexington Park, MD",
    "latitude": "38.2864718",
    "longitude": "-76.4803909",
    "city": "Lexington Park, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Hidaya Center",
    "address": "322 Troy Schenectady Road, Latham, NY 12110",
    "latitude": "42.7423479",
    "longitude": "-73.7484613",
    "city": "Latham, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community of New Jersey (MCNJ)",
    "address": "15 South 2nd Street, Fords, NJ 08863",
    "latitude": "40.5298556",
    "longitude": "-74.3152231",
    "city": "Fords, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammad Mosque",
    "address": "Muhammad Mosque",
    "latitude": "41.1097041",
    "longitude": "-80.6557039",
    "city": "Muhammad",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "American Muslim Mission Center",
    "address": "American Muslim Mission Center",
    "latitude": "41.0934562",
    "longitude": "-80.6576161",
    "city": "American",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Wisconsin",
    "address": "Islamic Center of Wisconsin",
    "latitude": "44.278121",
    "longitude": "-88.4166213",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Madinatul Ilm",
    "address": "37775 Palmer Road, Westland, MI 48186",
    "latitude": "42.2940183",
    "longitude": "-83.4121588",
    "city": "Westland, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Tawheed",
    "address": "18640 West Warren Avenue, Detroit, MI 48228",
    "latitude": "42.3435913",
    "longitude": "-83.2228296",
    "city": "Detroit, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Center of Phoenix",
    "address": "7516 North Black Canyon Highway, Phoenix, AZ 85051",
    "latitude": "33.5465447",
    "longitude": "-112.112878",
    "city": "Phoenix",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Islam",
    "address": "560 East North Frontage Road, Bolingbrook, IL 60440",
    "latitude": "41.6983591",
    "longitude": "-88.04407",
    "city": "Bolingbrook, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Haqq",
    "address": "Masjid Al-Haqq",
    "latitude": "28.5422905",
    "longitude": "-81.3868302",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shelter Rock Islamic Center",
    "address": "2 Shelter Rock Road, Roslyn, NY 11576",
    "latitude": "40.766746",
    "longitude": "-73.670245",
    "city": "Roslyn, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Greater Youngstown",
    "address": "Islamic Society of Greater Youngstown",
    "latitude": "41.0769179",
    "longitude": "-80.6268194",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Brandon",
    "address": "1006 Victoria Street, Brandon, FL",
    "latitude": "27.9455054",
    "longitude": "-82.298403",
    "city": "Brandon, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Stroudsburg",
    "address": "Islamic Center of Stroudsburg",
    "latitude": "40.9943959",
    "longitude": "-75.1908453",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sacred Learning Center",
    "address": "3900 West Devon Avenue, Lincolnwood, IL 60712",
    "latitude": "41.998003",
    "longitude": "-87.7261127",
    "city": "Lincolnwood, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Northern New York",
    "address": "25918 State Route 342, Calcium, NY 13616",
    "latitude": "44.0376835",
    "longitude": "-75.8542017",
    "city": "Calcium, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Association of Huntington",
    "address": "Muslim Association of Huntington",
    "latitude": "38.416404",
    "longitude": "-82.4203969",
    "city": "Muslim",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana Center",
    "address": "100 Shermer Road, Glenview, IL 60025",
    "latitude": "42.0579155",
    "longitude": "-87.8146015",
    "city": "Glenview, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Stamford Islamic Center",
    "address": "379 West Avenue, Stamford, CT 06902",
    "latitude": "41.0408571",
    "longitude": "-73.5594217",
    "city": "Stamford, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Alnoor Islamic Center",
    "address": "6317 Sunset Lake Road, Fuquay-Varina, NC 27526",
    "latitude": "35.63227",
    "longitude": "-78.7815995",
    "city": "Fuquay-Varina, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammad Mosque 82",
    "address": "Muhammad Mosque 82",
    "latitude": "26.1296354",
    "longitude": "-80.1558943",
    "city": "Muhammad",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana",
    "address": "Ismaili Jamatkhana",
    "latitude": "30.4766407",
    "longitude": "-97.8182405",
    "city": "Ismaili",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mahdi Mosque",
    "address": "9610 Colvin Boulevard, Niagara Falls, NY 14304",
    "latitude": "43.0852725",
    "longitude": "-78.9510975",
    "city": "Niagara Falls, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Husainiya Center of Tucson",
    "address": "Husainiya Center of Tucson",
    "latitude": "32.2300026",
    "longitude": "-110.8927767",
    "city": "Husainiya",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Union County",
    "address": "Islamic Center of Union County",
    "latitude": "40.7006559",
    "longitude": "-74.2866972",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Education Center",
    "address": "4301 Shamrock Drive, Charlotte, NC 28215",
    "latitude": "35.2299931",
    "longitude": "-80.7504163",
    "city": "Charlotte, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Zahra Islamic Center of Charlotte",
    "address": "5227 Monroe Road, Charlotte, NC 28205",
    "latitude": "35.1905077",
    "longitude": "-80.7740168",
    "city": "Charlotte, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Midland",
    "address": "1801 North Stark Road, Midland, MI 48642",
    "latitude": "43.6654062",
    "longitude": "-84.3107058",
    "city": "Midland, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhammad Islamic Center of Greater Hartford",
    "address": "155,157 Hungerford Street, Hartford, CT 06106",
    "latitude": "41.759067",
    "longitude": "-72.6860368",
    "city": "Hartford, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abu Khadra Mosque",
    "address": "Abu Khadra Mosque",
    "latitude": "45.0426222",
    "longitude": "-93.257982",
    "city": "Abu",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Hedaya Islamic Center",
    "address": "115 Mount Pleasant Road, Newtown, CT 06470",
    "latitude": "41.4179398",
    "longitude": "-73.3550099",
    "city": "Newtown, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Taqwa",
    "address": "5403 Virginia Avenue, Shreveport, 71108",
    "latitude": "32.459902",
    "longitude": "-93.7772245",
    "city": "Shreveport",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Muncie",
    "address": "Islamic Center of Muncie",
    "latitude": "40.2178985",
    "longitude": "-85.4459622",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gallup Islamic Center",
    "address": "Gallup Islamic Center",
    "latitude": "35.5290165",
    "longitude": "-108.6868027",
    "city": "Gallup",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Fique Mosque",
    "address": "817 23rd Street, Watervliet, NY 12189",
    "latitude": "42.7334855",
    "longitude": "-73.7082645",
    "city": "Watervliet, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Evergreen Islamic Center",
    "address": "2486 Ruby Avenue, San Jose, CA 95148",
    "latitude": "37.3403783",
    "longitude": "-121.7852242",
    "city": "San Jose, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid",
    "address": "2394 West Lucas Drive, Beaumont, TX",
    "latitude": "30.103981",
    "longitude": "-94.1471115",
    "city": "Beaumont, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of McLean County",
    "address": "421 Olympia Drive, Bloomington, IL 61704",
    "latitude": "40.469044",
    "longitude": "-88.9088816",
    "city": "Bloomington, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Willimantic",
    "address": "4 Industrial Park Road, Windham, CT 06226",
    "latitude": "41.7427466",
    "longitude": "-72.1773705",
    "city": "Windham, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Spokane Islamic Center",
    "address": "Spokane Islamic Center",
    "latitude": "47.6556193",
    "longitude": "-117.3180182",
    "city": "Spokane",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Center of Anchorage",
    "address": "8005 Spring Street, Anchorage, AK 99518",
    "latitude": "61.1481362",
    "longitude": "-149.8610988",
    "city": "Anchorage, AK",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Brushy Creek",
    "address": "1950 Brushy Creek Road, Cedar Park, TX 78613",
    "latitude": "30.5079753",
    "longitude": "-97.7920075",
    "city": "Cedar Park, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid As Salaam",
    "address": "21628 Fenkell Street, Detroit, MI 48223",
    "latitude": "42.4006369",
    "longitude": "-83.2545897",
    "city": "Detroit, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Princess Anne",
    "address": "11732 Somerset Avenue, Princess Anne, MD 21853",
    "latitude": "38.203333",
    "longitude": "-75.6934227",
    "city": "Princess Anne, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Mustafa",
    "address": "24038 South Val Vista Drive, Chandler, AZ 85249",
    "latitude": "33.2287826",
    "longitude": "-111.7560166",
    "city": "Chandler, AZ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "East Plano Islamic Center",
    "address": "East Plano Islamic Center",
    "latitude": "33.0098878",
    "longitude": "-96.6467899",
    "city": "East",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal",
    "address": "1545 Russell Cave Road, Lexington, KY 40505",
    "latitude": "38.0736797",
    "longitude": "-84.475228",
    "city": "Lexington, KY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mahmood Mosque",
    "address": "101 Maple Street, Smyrna, TN 37167",
    "latitude": "35.9836808",
    "longitude": "-86.5169042",
    "city": "Smyrna, TN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Cleveland",
    "address": "6055 W 130th Street, Parma, OH 44130",
    "latitude": "41.3988821",
    "longitude": "-81.7804326",
    "city": "Parma, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Malik",
    "address": "2042 Rouse Road, Orlando, FL 32817",
    "latitude": "28.5736651",
    "longitude": "-81.2246121",
    "city": "Orlando, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Abu Bakr",
    "address": "Masjid Abu Bakr",
    "latitude": "39.940513",
    "longitude": "-83.1193535",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Noor",
    "address": "55 North Matlock Street, Mesa, AZ 85203",
    "latitude": "33.416734",
    "longitude": "-111.807998",
    "city": "Mesa, AZ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Augusta",
    "address": "Islamic Society of Augusta",
    "latitude": "33.526125",
    "longitude": "-82.1117595",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "IEFAZ",
    "address": "2434 East Southern Avenue, Mesa, AZ 85204",
    "latitude": "33.3941495",
    "longitude": "-111.7784501",
    "city": "Mesa, AZ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Universal Education Foundation",
    "address": "2223 Goshen Road, Fort Wayne, IN 46808",
    "latitude": "41.1086061",
    "longitude": "-85.1715997",
    "city": "Fort Wayne",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Hamden",
    "address": "698 Newhall Street, Hamden, CT 06517",
    "latitude": "41.342655",
    "longitude": "-72.9266126",
    "city": "Hamden, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Alsabeel Masjid Noor Al Islam",
    "address": "Alsabeel Masjid Noor Al Islam",
    "latitude": "37.7824382",
    "longitude": "-122.4120676",
    "city": "Alsabeel",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albanian American Muslim Community",
    "address": "38 Raymond Street, Waterbury, CT 06706",
    "latitude": "41.5291129",
    "longitude": "-73.0362524",
    "city": "Waterbury, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Minhaj-ul-Quran Al-Noor Islamic Center",
    "address": "Minhaj-ul-Quran Al-Noor Islamic Center",
    "latitude": "41.8706029",
    "longitude": "-72.465074",
    "city": "Minhaj-ul-Quran",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Daar-ul-Ehsaan USA Headquarters",
    "address": "739 Terryville Avenue, Bristol, CT 06010",
    "latitude": "41.6812588",
    "longitude": "-72.9757297",
    "city": "Bristol, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Danbury Masjid Islamic Society of Western Connecticut",
    "address": "388 Main Street, Danbury, CT 06810",
    "latitude": "41.4017165",
    "longitude": "-73.4593728",
    "city": "Danbury, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Association of Greater Hartford Berlin Mosque",
    "address": "1781 Berlin Turnpike, Berlin, CT 06037",
    "latitude": "41.6031705",
    "longitude": "-72.75146",
    "city": "Berlin, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Taqwa",
    "address": "100 Arch Street, New Britain, CT 06051",
    "latitude": "41.6642943",
    "longitude": "-72.78193",
    "city": "New Britain, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madina Masjid",
    "address": "140 White Rock Drive, Windsor, CT 06095",
    "latitude": "41.8116976",
    "longitude": "-72.6714022",
    "city": "Windsor, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of New London",
    "address": "16 Fort Street, Groton, CT 06340",
    "latitude": "41.3548642",
    "longitude": "-72.082837",
    "city": "Groton, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Monroe Masjid",
    "address": "57 Pepper Street, Monroe, CT 06468",
    "latitude": "41.3226515",
    "longitude": "-73.2601682",
    "city": "Monroe, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Islam",
    "address": "624 George Street, New Haven, CT 06511",
    "latitude": "41.309125",
    "longitude": "-72.9429742",
    "city": "New Haven, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al-Mustafa",
    "address": "20 Church Street, East Hartford, CT 06108",
    "latitude": "41.7785353",
    "longitude": "-72.6087701",
    "city": "East Hartford, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "United Muslim Masjid",
    "address": "132 Prospect Street, Waterbury, CT 06710",
    "latitude": "41.5602214",
    "longitude": "-73.0400423",
    "city": "Waterbury, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "West Haven Masjid",
    "address": "2 Pruden Street, West Haven, CT 06516",
    "latitude": "41.2926276",
    "longitude": "-72.9626621",
    "city": "West Haven, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Farmington Valley American Muslim Center",
    "address": "35 Harris Road, Avon, CT 06001",
    "latitude": "41.7664614",
    "longitude": "-72.8595984",
    "city": "Avon, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of South Windsor",
    "address": "100 Long Hill Road, South Windsor, CT 06074",
    "latitude": "41.8029753",
    "longitude": "-72.5932686",
    "city": "South Windsor, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center Of Asheville",
    "address": "941 Old Fairview Road, Asheville, NC 28803",
    "latitude": "35.5645826",
    "longitude": "-82.5038689",
    "city": "Asheville, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Husseini Islamic Center",
    "address": "5211 Hester Avenue, Sanford, FL 32773",
    "latitude": "28.7351965",
    "longitude": "-81.288199",
    "city": "Sanford, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Hayy",
    "address": "786 Myrtle Street, Sanford, FL 32773",
    "latitude": "28.7361765",
    "longitude": "-81.276166",
    "city": "Sanford, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albanian American Cultural and Islamic Center",
    "address": "106 Columbia Boulevard, Waterbury, CT 06710",
    "latitude": "41.5683073",
    "longitude": "-73.042164",
    "city": "Waterbury, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Asheboro",
    "address": "203 Brittain Street, Asheboro, NC 27203",
    "latitude": "35.7347856",
    "longitude": "-79.8065742",
    "city": "Asheboro, NC",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Center of Minnesota",
    "address": "1429 Northeast 2nd Street, Minneapolis, 55413",
    "latitude": "45.0028506",
    "longitude": "-93.2658239",
    "city": "Minneapolis",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Jihad",
    "address": "117 East 34th Lane, Savannah, GA 31401",
    "latitude": "32.0589348",
    "longitude": "-81.0974402",
    "city": "Savannah, GA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Daytona Beach",
    "address": "347 South Keech Street, Daytona Beach, FL 32114",
    "latitude": "29.2005582",
    "longitude": "-81.0344094",
    "city": "Daytona Beach, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Bloomington",
    "address": "Islamic Center of Bloomington",
    "latitude": "39.163336",
    "longitude": "-86.510008",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Savannah",
    "address": "1030 Dutchtown Road, Savannah, GA 31419",
    "latitude": "31.9893425",
    "longitude": "-81.1617359",
    "city": "Savannah",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Rawdah",
    "address": "189 East Main Street, Meriden, CT 06450",
    "latitude": "41.5351109",
    "longitude": "-72.7971536",
    "city": "Meriden, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Wallingford",
    "address": "164 South Whittlesey Avenue, Wallingford, CT 06492",
    "latitude": "41.4504218",
    "longitude": "-72.8229187",
    "city": "Wallingford, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Arizona",
    "address": "9026 North 9th Street, Phoenix, AZ 85020",
    "latitude": "33.5689167",
    "longitude": "-112.0618094",
    "city": "Phoenix, AZ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Mosque",
    "address": "1818 North 32nd Street, Phoenix, AZ 85008",
    "latitude": "33.4681553",
    "longitude": "-112.0132792",
    "city": "Phoenix, AZ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Sarasota and Bradenton",
    "address": "4350 North Lockwood Ridge Road, Sarasota, FL 34234",
    "latitude": "27.3723838",
    "longitude": "-82.5047329",
    "city": "Sarasota, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Center of Phoenix Secondary",
    "address": "7362 North Black Canyon Highway, Phoenix, AZ 85051",
    "latitude": "33.5454852",
    "longitude": "-112.1129186",
    "city": "Phoenix",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Falah Islamic Center",
    "address": "Al Falah Islamic Center",
    "latitude": "40.6164102",
    "longitude": "-74.6270726",
    "city": "Al",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Mahmoud Foundation",
    "address": "5995 Timber Trail Southeast, Prior Lake, MN",
    "latitude": "44.7265482",
    "longitude": "-93.3999044",
    "city": "Prior Lake, MN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Hidayah",
    "address": "223 East Luzerne Street, Philadelphia, PA",
    "latitude": "40.0113294",
    "longitude": "-75.1238286",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al Furqaan",
    "address": "1525 Glenwood Avenue, Minneapolis, MN 55405",
    "latitude": "44.9806545",
    "longitude": "-93.3002897",
    "city": "Minneapolis, MN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gilbert Mussalla",
    "address": "5635 East Baseline Road, Mesa, AZ 85206",
    "latitude": "33.3787361",
    "longitude": "-111.710765",
    "city": "Mesa, AZ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Islam Mosque",
    "address": "7826 Klein Street, Detroit, MI 48211",
    "latitude": "42.3870334",
    "longitude": "-83.0394819",
    "city": "Detroit, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "IC-NUR",
    "address": "1073 Lawrenceville Highway, Lawrenceville, GA 30046",
    "latitude": "33.9411445",
    "longitude": "-84.0157495",
    "city": "Lawrenceville, GA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Greater Kansas City",
    "address": "Islamic Society of Greater Kansas City",
    "latitude": "38.9438339",
    "longitude": "-94.4911683",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shafia Islamic and Cultural Center",
    "address": "1425 University Avenue",
    "latitude": "41.6006644",
    "longitude": "-93.6364922",
    "city": "Shafia",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Triplex – Beaumont Mosque",
    "address": "1270 West Cardinal Drive, Beaumont, TX 77705-5804",
    "latitude": "30.0336478",
    "longitude": "-94.0934969",
    "city": "Beaumont",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid At-Taqwa",
    "address": "40 Parker Avenue, Buffalo, NY 14214",
    "latitude": "42.9404464",
    "longitude": "-78.8394183",
    "city": "Buffalo, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Sadar & Community Center",
    "address": "216 Ernston Road, Parlin, NJ 08859",
    "latitude": "40.4576385",
    "longitude": "-74.3038115",
    "city": "Parlin, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Association",
    "address": "2301 Plymouth Road, Ann Arbor, 48105",
    "latitude": "42.3011908",
    "longitude": "-83.7146225",
    "city": "Ann Arbor",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Noor",
    "address": "5355 Lafayette Road, Indianapolis, IN 46254",
    "latitude": "39.8488163",
    "longitude": "-86.2587576",
    "city": "Indianapolis, IN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Rahman",
    "address": "2577 Keystone Road, Tarpon Springs, FL 34688",
    "latitude": "28.152389",
    "longitude": "-82.712965",
    "city": "Tarpon Springs, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Wali Muhammad",
    "address": "11529 Linwood Avenue, MI 48206",
    "latitude": "42.3816869",
    "longitude": "-83.1145947",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Ansar",
    "address": "4014 Winona Avenue, San Diego, CA 92105",
    "latitude": "32.7498311",
    "longitude": "-117.0883013",
    "city": "San Diego",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North Penn Mosque",
    "address": "North Penn Mosque",
    "latitude": "40.2476612",
    "longitude": "-75.2835695",
    "city": "North",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Lansdale Mosque",
    "address": "Lansdale Mosque",
    "latitude": "40.2478057",
    "longitude": "-75.2845515",
    "city": "Lansdale",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Denton",
    "address": "1105 Greenlee Street, Denton, TX 76201",
    "latitude": "33.2015757",
    "longitude": "-97.1446735",
    "city": "Denton, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albanian Islamic Center",
    "address": "Albanian Islamic Center",
    "latitude": "42.4343765",
    "longitude": "-82.9230605",
    "city": "Albanian",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "East Cobb Islamic Center",
    "address": "1111 Braswell Road, 30062",
    "latitude": "33.9787338",
    "longitude": "-84.4870208",
    "city": "East",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Greenville",
    "address": "96 Meridian Avenue, Taylors, 29687",
    "latitude": "34.8983594",
    "longitude": "-82.3410305",
    "city": "Taylors",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Salam",
    "address": "Masjid Al-Salam",
    "latitude": "40.0527323",
    "longitude": "-75.0665825",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Clermont",
    "address": "15020 Johns Lake Road, Clermont, FL 34711",
    "latitude": "28.5235625",
    "longitude": "-81.7064455",
    "city": "Clermont, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Alhuda Islamic Center of Indiana (AICI)",
    "address": "12213 Lantern Road, Fishers, in 46038",
    "latitude": "39.9655505",
    "longitude": "-86.0129377",
    "city": "Fishers, in",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "South Suburban Islamic Center Of Harvey",
    "address": "15200 Broadway Avenue, Harvey, IL 60426",
    "latitude": "41.613416",
    "longitude": "-87.6449288",
    "city": "Harvey, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Ansar",
    "address": "1717 Brookhurst Street, Anaheim, CA 92804",
    "latitude": "33.805618",
    "longitude": "-117.9595158",
    "city": "Anaheim, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of North Louisiana",
    "address": "1000 West California Avenue, Ruston, LA 71270",
    "latitude": "32.5224621",
    "longitude": "-92.6510383",
    "city": "Ruston, LA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mecca Center",
    "address": "Mecca Center",
    "latitude": "41.7239426",
    "longitude": "-87.9479798",
    "city": "Mecca",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of New Tampa",
    "address": "15830 Morris Bridge Road, Thonotosassa, FL 33592",
    "latitude": "28.1483195",
    "longitude": "-82.2806495",
    "city": "Thonotosassa, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Fazl-i-Umar Mosque",
    "address": "637 Randolph Street, Dayton, OH 45417",
    "latitude": "39.745446",
    "longitude": "-84.2294675",
    "city": "Dayton, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Dar Al-Taqwa",
    "address": "6556 Hemlock Avenue, Fontana, CA 92336",
    "latitude": "34.1349899",
    "longitude": "-117.4757273",
    "city": "Fontana, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Houston's Blue Mosque",
    "address": "9301 West Bellfort Street, TX 77031",
    "latitude": "29.6548694",
    "longitude": "-95.5457303",
    "city": "Unknown, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Fath-e-Azeem Mosque",
    "address": "2700 Lewis Avenue, Zion, IL 60099",
    "latitude": "42.4458639",
    "longitude": "-87.8552208",
    "city": "Zion, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Center",
    "address": "4380 North Elston Avenue, Chicago, IL 60641",
    "latitude": "41.9601203",
    "longitude": "-87.7289276",
    "city": "Chicago, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "San Marcos Masjid",
    "address": "434 North Comanche Street, San Marcos, TX 78666",
    "latitude": "29.8862237",
    "longitude": "-97.9441235",
    "city": "San Marcos, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bait-ur-Rahman Mosque",
    "address": "15000 Good Hope Road, Silver Spring, MD 20905",
    "latitude": "39.1029487",
    "longitude": "-76.9823643",
    "city": "Silver Spring, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Elizabethtown",
    "address": "2710 Ring Road, Elizabethtown, KY 42701",
    "latitude": "37.7247133",
    "longitude": "-85.8381592",
    "city": "Elizabethtown, KY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "West End Islamic Center",
    "address": "5020 Shady Grove Road, Glen Allen, VA 23059",
    "latitude": "37.6738531",
    "longitude": "-77.6055465",
    "city": "Glen Allen, VA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "IALFM Mosque",
    "address": "Peters Colony Road, Flower Mound, TX 75022",
    "latitude": "33.0354077",
    "longitude": "-97.0830104",
    "city": "Flower Mound, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center in Greenville",
    "address": "1303 South Evans Street, Greenville, NC 27834",
    "latitude": "35.6024066",
    "longitude": "-77.374901",
    "city": "Greenville",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bosnian Islamic Cultural Center",
    "address": "3828 Mobile Ave, Fort Wayne, 46805",
    "latitude": "41.1126947",
    "longitude": "-85.1435154",
    "city": "Fort Wayne",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Burmese Muslim Education & Community Center",
    "address": "2121 Seddlemeyer Avenue, Fort Wayne, 46816",
    "latitude": "41.0209898",
    "longitude": "-85.1059516",
    "city": "Fort Wayne",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Verona",
    "address": "56 Grove Avenue, Verona, NJ 07044",
    "latitude": "40.8357543",
    "longitude": "-74.2470397",
    "city": "Verona, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Mu'ath Bin Jabal",
    "address": "Masjid Mu'ath Bin Jabal",
    "latitude": "42.391159",
    "longitude": "-83.0406388",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Foundation of Lincoln",
    "address": "3636 North 1st Street, Lincoln, NE 68521",
    "latitude": "40.8479286",
    "longitude": "-96.7199791",
    "city": "Lincoln, NE",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ulu Cami",
    "address": "480 Knickerbocker Avenue, Paterson, NJ 07503",
    "latitude": "40.8926311",
    "longitude": "-74.1420138",
    "city": "Paterson",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Huda",
    "address": "3880 Smith Street, Union City, CA 94587",
    "latitude": "37.5961425",
    "longitude": "-122.0786855",
    "city": "Union City, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Livermore",
    "address": "Islamic Center of Livermore",
    "latitude": "37.680156",
    "longitude": "-121.7548274",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Federation of NJ",
    "address": "530 Montgomery Street, Jersey City, NJ 07302",
    "latitude": "40.7227603",
    "longitude": "-74.0600819",
    "city": "Jersey City, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bell Islamic Center",
    "address": "5250 Gage Avenue, Bell, CA 90201",
    "latitude": "33.9759458",
    "longitude": "-118.1712145",
    "city": "Bell, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Islam",
    "address": "525 Roosevelt Avenue, Carteret, NJ 07008",
    "latitude": "40.5825278",
    "longitude": "-74.2150813",
    "city": "Carteret, NJ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Hameed Mosque",
    "address": "11941 Ramona Avenue, Chino, CA 91710",
    "latitude": "34.0367423",
    "longitude": "-117.7059005",
    "city": "Chino, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Jaamay Mosque",
    "address": "2S510 IL 53, Glen Ellyn, IL 60137",
    "latitude": "41.8355088",
    "longitude": "-88.0549039",
    "city": "Glen Ellyn, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Omar Almokhtar",
    "address": "Masjid Omar Almokhtar",
    "latitude": "27.9470156",
    "longitude": "-82.4731679",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Naseer Mosque",
    "address": "1609 East Main Street, Rochester, NY 14609",
    "latitude": "43.1596814",
    "longitude": "-77.5676727",
    "city": "Rochester, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "M Khan Islamic Society of Upstate NY",
    "address": "M Khan Islamic Society of Upstate NY",
    "latitude": "43.3162323",
    "longitude": "-73.656716",
    "city": "M",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Al-Hijrah Mosque",
    "address": "504 Cedar Avenue South, Minneapolis, MN 55454",
    "latitude": "44.9685264",
    "longitude": "-93.2475904",
    "city": "Minneapolis, MN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North Raleigh Masjid",
    "address": "North Raleigh Masjid",
    "latitude": "35.8519952",
    "longitude": "-78.5570529",
    "city": "North",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "South Boston Masjid and Islamic Center",
    "address": "South Boston Masjid and Islamic Center",
    "latitude": "36.6988695",
    "longitude": "-78.9007274",
    "city": "South",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana and Center - Harvest Green",
    "address": "9550 Harlem Road, Richmond, TX 77407",
    "latitude": "29.6513724",
    "longitude": "-95.7138677",
    "city": "Richmond, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Orlando - Jama Masjid",
    "address": "11543 Ruby Lake Road, Orlando, FL 32826",
    "latitude": "28.3985644",
    "longitude": "-81.5025207",
    "city": "Orlando, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Wausau Masjid",
    "address": "629 South 36th Avenue, Wausau, WI 54401",
    "latitude": "44.9563685",
    "longitude": "-89.6807048",
    "city": "Wausau, WI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Marshfield Masjid",
    "address": "200560 Meadow Avenue, Marshfield, WI 54449",
    "latitude": "44.6891836",
    "longitude": "-90.1856654",
    "city": "Marshfield, WI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid As-Sunnah",
    "address": "5114 Main Street, Skokie, IL 60077",
    "latitude": "42.0338616",
    "longitude": "-87.7573039",
    "city": "Skokie, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Tulsa: Masjid Al-Salam",
    "address": "Islamic Society of Tulsa: Masjid Al-Salam",
    "latitude": "36.0959336",
    "longitude": "-95.9118923",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Rahma",
    "address": "13515 Plymouth Road, Detroit, MI 48227",
    "latitude": "42.3728162",
    "longitude": "-83.1771466",
    "city": "Detroit, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Evansville",
    "address": "4200 Grimm Road, Newburgh, IN 47630",
    "latitude": "37.9741133",
    "longitude": "-87.4314845",
    "city": "Newburgh, IN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Central Louisiana",
    "address": "398 Windermere Boulevard, Alexandria, LA 71303",
    "latitude": "31.2881803",
    "longitude": "-92.4913801",
    "city": "Alexandria, LA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Jonesboro",
    "address": "118 North Rogers Street, Jonesboro, AR 72401",
    "latitude": "35.8449274",
    "longitude": "-90.6883303",
    "city": "Jonesboro, AR",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Mukarram Masjid",
    "address": "18 South 43rd Street, Philadelphia, PA",
    "latitude": "39.9571064",
    "longitude": "-75.2085565",
    "city": "Philadelphia, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society Of South Texas",
    "address": "2008 North Ware Road, McAllen, TX 78051",
    "latitude": "26.2256896",
    "longitude": "-98.2570844",
    "city": "McAllen, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madani Muslim Community Service",
    "address": "Madani Muslim Community Service",
    "latitude": "42.5050008",
    "longitude": "-83.0800045",
    "city": "Madani",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Muhammad",
    "address": "2414 Oak Street, Monroe, LA",
    "latitude": "32.5120341",
    "longitude": "-92.0933531",
    "city": "Monroe, LA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Maqasid",
    "address": "7386 Alburtis Road, Macungie, PA 18062",
    "latitude": "40.5157857",
    "longitude": "-75.5832926",
    "city": "Macungie, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ibrahim",
    "address": "2075 Airway Avenue, Kingman, AZ 86409",
    "latitude": "35.2252213",
    "longitude": "-114.0295594",
    "city": "Kingman, AZ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "American Muslim Center",
    "address": "American Muslim Center",
    "latitude": "42.2910594",
    "longitude": "-83.2483366",
    "city": "American",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Akron Masjid",
    "address": "1147 Old Main Street, Akron, OH 44301",
    "latitude": "41.0556992",
    "longitude": "-81.5286819",
    "city": "Akron, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "American Islamic Community Center",
    "address": "5005 15 Mile Road, Sterling Heights, MI 48310",
    "latitude": "42.550947",
    "longitude": "-83.0575322",
    "city": "Sterling Heights, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Mumtaz Institute",
    "address": "5056 Sunrise Boulevard, Fair Oaks, CA 95628",
    "latitude": "38.6586027",
    "longitude": "-121.271873",
    "city": "Fair Oaks, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "DeSoto House of Peace",
    "address": "DeSoto House of Peace",
    "latitude": "32.5905805",
    "longitude": "-96.8686256",
    "city": "DeSoto",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Community Mosque of High Point",
    "address": "Community Mosque of High Point",
    "latitude": "35.97016",
    "longitude": "-80.0526473",
    "city": "Community",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Istiqamah",
    "address": "7950 South Central Avenue, Burbank, IL 60459",
    "latitude": "41.7472597",
    "longitude": "-87.7611991",
    "city": "Burbank, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Kitsap County",
    "address": "1140 Marine Drive, Bremerton, WA 98312",
    "latitude": "47.5734109",
    "longitude": "-122.6662584",
    "city": "Bremerton, WA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "C12",
    "address": "C12",
    "latitude": "33.3429644",
    "longitude": "-117.3524355",
    "city": "C12",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sabah Foundation - Masjid",
    "address": "1145 Furnas Avenue, Lincoln, NE 68521",
    "latitude": "40.8408464",
    "longitude": "-96.7044994",
    "city": "Lincoln, NE",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Grand Blanc Islamic Center",
    "address": "1479 East Baldwin Road, Grand Blanc, MI 48439",
    "latitude": "42.8870359",
    "longitude": "-83.6724234",
    "city": "Grand Blanc, MI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Johnson City",
    "address": "3010 Antioch Road, Johnson City, TN 37604",
    "latitude": "36.2854465",
    "longitude": "-82.4050609",
    "city": "Johnson City, TN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mobile Masjid of al-Islam",
    "address": "Mobile Masjid of al-Islam",
    "latitude": "30.6612827",
    "longitude": "-88.0743655",
    "city": "Mobile",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Eastside",
    "address": "14700 Main Street, Bellevue, 98007",
    "latitude": "47.6101893",
    "longitude": "-122.1440816",
    "city": "Bellevue",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Association of the Finger Lakes",
    "address": "499 Hickory Grove Road, Horseheads, NY 14845",
    "latitude": "42.1690771",
    "longitude": "-76.8646412",
    "city": "Horseheads, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ghousia Islamic Center",
    "address": "188 East 147th Street, Harvey, IL 60426",
    "latitude": "41.6223673",
    "longitude": "-87.6452594",
    "city": "Harvey, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Cypress Islamic Center",
    "address": "16103 Cypress Rosehill Road, Cypress, TX 77429",
    "latitude": "30.0009107",
    "longitude": "-95.6988937",
    "city": "Cypress, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar ul Iman Mosque",
    "address": "Dar ul Iman Mosque",
    "latitude": "38.732872",
    "longitude": "-90.6421061",
    "city": "Dar",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Monticello",
    "address": "33 Cottage Street, Monticello, NY 12701",
    "latitude": "41.6582995",
    "longitude": "-74.6880141",
    "city": "Monticello, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Westchester Muslim Center",
    "address": "Westchester Muslim Center",
    "latitude": "40.9273187",
    "longitude": "-73.817768",
    "city": "Westchester",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Farooq Islamic Center",
    "address": "67 Thompson Lane, Nashville, TN 37211",
    "latitude": "36.1083333",
    "longitude": "-86.7303724",
    "city": "Nashville, TN",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Maryam Islamic Center",
    "address": "504 Sartartia Road, Sugar Land, TX 77479",
    "latitude": "29.5935051",
    "longitude": "-95.68427",
    "city": "Sugar Land, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Haqq",
    "address": "Masjid Haqq",
    "latitude": "41.851893",
    "longitude": "-88.0124397",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Uthman",
    "address": "Masjid Uthman",
    "latitude": "41.8587671",
    "longitude": "-88.0373767",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Conejo Valley",
    "address": "Islamic Center of Conejo Valley",
    "latitude": "34.1785103",
    "longitude": "-118.9334178",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "SABAH Islmaic Cultural Center",
    "address": "9920 West Grand Avenue, Franklin Park, IL 60131",
    "latitude": "41.930225",
    "longitude": "-87.8731562",
    "city": "Franklin Park, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Light of Islam Masjid",
    "address": "46 East 147th Street, Harvey, IL 60426",
    "latitude": "41.6224248",
    "longitude": "-87.6533939",
    "city": "Harvey, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jafaria Community Center",
    "address": "12217 North Market Street, Mead, WA 99021",
    "latitude": "47.7680083",
    "longitude": "-117.3554137",
    "city": "Mead, WA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Xhamia Shqiptare DFW",
    "address": "Xhamia Shqiptare DFW",
    "latitude": "32.8563923",
    "longitude": "-97.1602916",
    "city": "Xhamia",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albanian American Islamic Center",
    "address": "Albanian American Islamic Center",
    "latitude": "40.8695713",
    "longitude": "-74.1100552",
    "city": "Albanian",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Chagrin Valley Islamic Center",
    "address": "6909 Liberty Road, Solon, OH 44139",
    "latitude": "41.3704577",
    "longitude": "-81.4189876",
    "city": "Solon, OH",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Palos Islamic Center",
    "address": "12300 South 80th Avenue, Palos Park, IL 60464",
    "latitude": "41.6668818",
    "longitude": "-87.8166097",
    "city": "Palos Park, IL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Anjuman-E-Ezzi",
    "address": "18728 New Hampshire Avenue, Ashton, MD 20861",
    "latitude": "39.1636149",
    "longitude": "-77.0157731",
    "city": "Ashton, MD",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Istiqlal Houston",
    "address": "Masjid Istiqlal Houston",
    "latitude": "29.6527273",
    "longitude": "-95.6542335",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Darul-Uloom Texas",
    "address": "Masjid Darul-Uloom Texas",
    "latitude": "29.6440377",
    "longitude": "-95.6527157",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sammamish Mosque",
    "address": "22011 Southeast 20th Street, Sammamish, WA 98075",
    "latitude": "47.5911596",
    "longitude": "-122.0457888",
    "city": "Sammamish, WA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Prichard Masjid of Al-Islam",
    "address": "Prichard Masjid of Al-Islam",
    "latitude": "30.7265957",
    "longitude": "-88.0828832",
    "city": "Prichard",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Hidaya Mosque",
    "address": "2339 15th Street, Troy, NY 12180",
    "latitude": "42.7382597",
    "longitude": "-73.6754022",
    "city": "Troy, NY",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Omaha",
    "address": "Islamic Center of Omaha",
    "latitude": "41.2912413",
    "longitude": "-96.025819",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Modesto",
    "address": "Islamic Center of Modesto",
    "latitude": "37.6566234",
    "longitude": "-121.0330427",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Quddus",
    "address": "Masjid Al-Quddus",
    "latitude": "28.5387287",
    "longitude": "-81.3891993",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Whitewater Islamic Center",
    "address": "W4890 Tri-County Road, Whitewater, WI 53190",
    "latitude": "42.8430477",
    "longitude": "-88.7761976",
    "city": "Whitewater, WI",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Ata Mosque",
    "address": "2860 South Pike Avenue, Allentown, PA 18103",
    "latitude": "40.5666813",
    "longitude": "-75.450184",
    "city": "Allentown, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "MOMIN of Texas",
    "address": "2945 Frankford Road, Dallas, TX 75287",
    "latitude": "32.9986738",
    "longitude": "-96.8619783",
    "city": "Dallas, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Kalkan Masjid Houston",
    "address": "2600 Lazy Hollow Drive, Houston, TX 77063",
    "latitude": "29.7377657",
    "longitude": "-95.5174069",
    "city": "Houston, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitus Samee Mosque",
    "address": "1333 Spears Road, Houston, TX 77067",
    "latitude": "29.9646368",
    "longitude": "-95.4408293",
    "city": "Houston, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid",
    "address": "Masjid",
    "latitude": "29.6775566",
    "longitude": "-95.3973955",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Ghadeer",
    "address": "9260 South Course Drive, Houston, TX 77099",
    "latitude": "29.6794424",
    "longitude": "-95.5630604",
    "city": "Houston, TX",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "es Salaam Mosque",
    "address": "1071 North Alma School Road, Chandler, AZ 85225",
    "latitude": "33.3216782",
    "longitude": "-111.8586716",
    "city": "Chandler, AZ",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-ul-Islam",
    "address": "Masjid-ul-Islam",
    "latitude": "42.0188574",
    "longitude": "-88.2404327",
    "city": "Masjid-ul-Islam",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Mosque and Cultural Center",
    "address": "2551 Massachusetts Avenue Northwest",
    "latitude": "38.9170993",
    "longitude": "-77.0567964",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Coachella Valley",
    "address": "Islamic Society of Coachella Valley",
    "latitude": "33.6933467",
    "longitude": "-116.1875924",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bridgeport Islamic Community Center",
    "address": "877 Park Avenue, Bridgeport, CT 06604",
    "latitude": "41.1734622",
    "longitude": "-73.1979664",
    "city": "Bridgeport, CT",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ithna-asheri Muslim Association of the Northwest (IMAN)",
    "address": "515 State Street South, Kirkland, 98033",
    "latitude": "47.671577",
    "longitude": "-122.2026471",
    "city": "Kirkland",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Children Education & Civic Center",
    "address": "5821 Casa Bella Street, San Antonio, 78249",
    "latitude": "29.5711952",
    "longitude": "-98.5893669",
    "city": "San Antonio",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Southern California",
    "address": "434 South Vermont Avenue, Los Angeles, CA 90020",
    "latitude": "34.0664084",
    "longitude": "-118.291235",
    "city": "Los Angeles, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bosanski Mesdžid",
    "address": "10999 60th Street, Pinellas County, FL 33782",
    "latitude": "27.8714831",
    "longitude": "-82.7162254",
    "city": "Pinellas County, FL",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Mustafa",
    "address": "Masjid Al-Mustafa",
    "latitude": "29.8627779",
    "longitude": "-95.6714781",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Golden",
    "address": "Islamic Center of Golden",
    "latitude": "39.7501497",
    "longitude": "-105.213759",
    "city": "Islamic",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Huda Islamic Center",
    "address": "2022 South Milledge Avenue, Athens, 30605",
    "latitude": "33.9245727",
    "longitude": "-83.3790322",
    "city": "Athens",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "East Cobb Islamic Center",
    "address": "1111 Braswell Road, Marietta, GA 30062",
    "latitude": "33.978622",
    "longitude": "-84.4870208",
    "city": "Marietta, GA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Mohammed",
    "address": "Masjid Mohammed",
    "latitude": "39.3543051",
    "longitude": "-74.4578507",
    "city": "Masjid",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Center of Redlands",
    "address": "26830 Beaumont Avenue, Redlands, CA 92373",
    "latitude": "34.0385329",
    "longitude": "-117.2177651",
    "city": "Redlands, CA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Rawdah Islamic Center",
    "address": "415 Howertown Road, Catasauqua, PA 18032",
    "latitude": "40.6554314",
    "longitude": "-75.4695513",
    "city": "Catasauqua, PA",
    "country": "USA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Toronto",
    "address": "168 Dundas Street West",
    "latitude": "43.6553756",
    "longitude": "-79.3858908",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madina Masjid",
    "address": "Madina Masjid",
    "latitude": "43.6804092",
    "longitude": "-79.3360717",
    "city": "Madina",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Fatima-Zohra",
    "address": "2012 Rue Saint-Dominique, Montréal",
    "latitude": "45.5119276",
    "longitude": "-73.5669843",
    "city": "Montréal",
    "country": "CA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Winston Churchill Mosque",
    "address": "Winston Churchill Mosque",
    "latitude": "43.5809559",
    "longitude": "-79.7618968",
    "city": "Winston",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Toronto Islamic Centre (TIC) & Community Services",
    "address": "817 Yonge Street",
    "latitude": "43.6725134",
    "longitude": "-79.3874634",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Association of New Brunswick",
    "address": "Muslim Association of New Brunswick",
    "latitude": "45.3318661",
    "longitude": "-66.0284093",
    "city": "Muslim",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Welfare Center (Masjid and Food Bank)",
    "address": "Muslim Welfare Center (Masjid and Food Bank)",
    "latitude": "43.5751086",
    "longitude": "-79.6466592",
    "city": "Muslim",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Mosque",
    "address": "Masjid Mosque",
    "latitude": "43.6809743",
    "longitude": "-79.3312319",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid an-Noor",
    "address": "Masjid an-Noor",
    "latitude": "43.1663258",
    "longitude": "-79.2406468",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Slave Lake Muslim Society Mosque",
    "address": "Slave Lake Muslim Society Mosque",
    "latitude": "55.2756402",
    "longitude": "-114.7681398",
    "city": "Slave",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosquée Al Falah",
    "address": "6550 Avenue de Darlington, Montréal, H3S 2J3",
    "latitude": "45.5088126",
    "longitude": "-73.6294767",
    "city": "Montréal",
    "country": "CA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Don Mills Jamatkhana",
    "address": "80 Overlea Boulevard, East York, M4H 1C5",
    "latitude": "43.7087855",
    "longitude": "-79.3400581",
    "city": "East York",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Saskatchewan (Saskatoon)",
    "address": "222 Copland Crescent, Saskatoon, S7H 2Z5",
    "latitude": "52.1185493",
    "longitude": "-106.6305923",
    "city": "Saskatoon",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Taiba Mosque",
    "address": "3560 Avenue Van Horne, Montréal, H3S 1R5",
    "latitude": "45.5011634",
    "longitude": "-73.6316704",
    "city": "Montréal",
    "country": "CA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim World League",
    "address": "2630 Royal Windsor Drive, Mississauga",
    "latitude": "43.4979836",
    "longitude": "-79.6431177",
    "city": "Mississauga",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Association of Milton",
    "address": "4269 Regional Road 25, Oakville",
    "latitude": "43.4570431",
    "longitude": "-79.8024296",
    "city": "Oakville",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Forum of Canada",
    "address": "Islamic Forum of Canada",
    "latitude": "43.6920921",
    "longitude": "-79.6962402",
    "city": "Islamic",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Aman Masjid",
    "address": "3114 Danforth Avenue, Toronto, M1L 1B1",
    "latitude": "43.6916305",
    "longitude": "-79.2875074",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Omar Bin Khatab",
    "address": "Masjid Omar Bin Khatab",
    "latitude": "43.6573287",
    "longitude": "-79.3653195",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jaame Masjid Scarborough",
    "address": "3665-3667 Lawrence Avenue East, Toronto, M1G 1P7",
    "latitude": "43.7602184",
    "longitude": "-79.2205356",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Dar Us Salaam",
    "address": "4 Thorncliffe Park Drive, Toronto, M4H 1H1",
    "latitude": "43.7060576",
    "longitude": "-79.3510456",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Toronto",
    "address": "Islamic Society of Toronto",
    "latitude": "43.7061046",
    "longitude": "-79.3508403",
    "city": "Islamic",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Zakariya",
    "address": "333 Second Street East",
    "latitude": "45.0211592",
    "longitude": "-74.7195012",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Islamique de Rimouski",
    "address": "Centre Islamique de Rimouski",
    "latitude": "48.4509069",
    "longitude": "-68.5193497",
    "city": "Centre",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Hikmah Centre Inc",
    "address": "36 Colville Road, North York",
    "latitude": "43.7068238",
    "longitude": "-79.4759196",
    "city": "North York",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islam Care Centre",
    "address": "375 Somerset Street West",
    "latitude": "45.4152723",
    "longitude": "-75.6968804",
    "city": "Islam",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Information & Dawah Centre International",
    "address": "1168 Bloor Street West, Toronto",
    "latitude": "43.6596989",
    "longitude": "-79.4370268",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albanian Mosque - Albanian Muslim Society of Toronto",
    "address": "564 Annette Street, Toronto, M6S 2C2",
    "latitude": "43.6600317",
    "longitude": "-79.4808509",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjidur Rahmah",
    "address": "Masjidur Rahmah",
    "latitude": "43.6598694",
    "longitude": "-79.3663424",
    "city": "Masjidur",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Niagara Peninsula",
    "address": "6768 Lyons Creek Road",
    "latitude": "43.0326295",
    "longitude": "-79.1060829",
    "city": "Islamic",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Adam Islamic Center",
    "address": "1759 Bloor Street",
    "latitude": "43.6250456",
    "longitude": "-79.5871898",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Rahma Mosque",
    "address": "Rahma Mosque",
    "latitude": "53.4966976",
    "longitude": "-113.62232",
    "city": "Rahma",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Falah Masjid",
    "address": "Al-Falah Masjid",
    "latitude": "53.4673598",
    "longitude": "-113.409494",
    "city": "Al-Falah",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Al Sunnah",
    "address": "Dar Al Sunnah",
    "latitude": "53.6070948",
    "longitude": "-113.4838939",
    "city": "Dar",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darul-Uloom",
    "address": "2803 St. Joseph Boulevard",
    "latitude": "45.4735064",
    "longitude": "-75.5205888",
    "city": "Darul-Uloom",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jannatul Ferdous Mosque",
    "address": "1701 Martin Grove Road, Etobicoke, M9V 4N4",
    "latitude": "43.7331459",
    "longitude": "-79.5882398",
    "city": "Etobicoke",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "East Ottawa Masjid",
    "address": "967 St-Laurent Boulevard",
    "latitude": "45.4298022",
    "longitude": "-75.6401819",
    "city": "East",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Reign of Islamic Da'Wah",
    "address": "The Reign of Islamic Da'Wah",
    "latitude": "43.6833105",
    "longitude": "-79.4809583",
    "city": "The",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Annoor",
    "address": "Masjid Annoor",
    "latitude": "53.4621498",
    "longitude": "-113.5037747",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Annoor Islamic Centre",
    "address": "Annoor Islamic Centre",
    "latitude": "53.4610115",
    "longitude": "-113.5314742",
    "city": "Annoor",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosquée Al-Rawdah",
    "address": "12253 Boulevard Laurentien, Montréal, H4K 1N5",
    "latitude": "45.5293795",
    "longitude": "-73.7222594",
    "city": "Montréal",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hamza Mosque",
    "address": "1287 Queen Street West, M6K 1M2",
    "latitude": "43.6414066",
    "longitude": "-79.432098",
    "city": "Hamza",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Qalam",
    "address": "Masjid Al Qalam",
    "latitude": "43.6979569",
    "longitude": "-79.4514591",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal",
    "address": "Masjid Bilal",
    "latitude": "43.7443451",
    "longitude": "-79.2199378",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Jannah",
    "address": "2201 Ellesmere Road",
    "latitude": "43.7764183",
    "longitude": "-79.2302198",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "al-Hussain Foundation Centre",
    "address": "10992 Kennedy Road, Markham, Ontario L6C 1P1",
    "latitude": "43.9206951",
    "longitude": "-79.3260271",
    "city": "Markham, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Afghan-Canadian Islamic Community",
    "address": "22 Hobson Avenue, North York, M4A 1Y2",
    "latitude": "43.7203003",
    "longitude": "-79.3081666",
    "city": "North York",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abu Huraria Centre",
    "address": "Abu Huraria Centre",
    "latitude": "43.7729913",
    "longitude": "-79.3345756",
    "city": "Abu",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Charlottetown Mosque",
    "address": "125 Queen Street",
    "latitude": "46.2339816",
    "longitude": "-63.1276967",
    "city": "Charlottetown",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre culturel islamique de Roussillon",
    "address": "Centre culturel islamique de Roussillon",
    "latitude": "45.3855508",
    "longitude": "-73.5902712",
    "city": "Centre",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre musulman Al-Manara",
    "address": "Centre musulman Al-Manara",
    "latitude": "45.3815799",
    "longitude": "-73.5593511",
    "city": "Centre",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre culturel musulman Châteauguay",
    "address": "Centre culturel musulman Châteauguay",
    "latitude": "45.354953",
    "longitude": "-73.7185779",
    "city": "Centre",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Ismaili Centre Burnaby",
    "address": "4010 Canada Way",
    "latitude": "49.2541224",
    "longitude": "-123.0138211",
    "city": "The",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhanas",
    "address": "2227 Wilgress Road, Nanaimo, BC V9S 4N3",
    "latitude": "49.1935835",
    "longitude": "-123.9770707",
    "city": "Nanaimo, BC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Jannah Islamic Center",
    "address": "Baitul Jannah Islamic Center",
    "latitude": "43.7188156",
    "longitude": "-79.2402546",
    "city": "Baitul",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Mustafa Academy",
    "address": "5441 125A Street",
    "latitude": "49.1015267",
    "longitude": "-122.8748044",
    "city": "Al-Mustafa",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosquée Dhoun-Nourain",
    "address": "5180 Chemin Queen Mary, Montréal, Québec H3W 3E7",
    "latitude": "45.4845527",
    "longitude": "-73.6279318",
    "city": "Montréal, Québec",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "White Rock Muslim Association - Musallah",
    "address": "15531 24 Avenue, Surrey",
    "latitude": "49.0471591",
    "longitude": "-122.7919309",
    "city": "Surrey",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Culturel Khadimou Rassoul - Keur Serigne Touba - Nourou Darayni - Sope Serig Fallou - FONCAB",
    "address": "10775 Avenue Millen, Montréal, QC",
    "latitude": "45.5571787",
    "longitude": "-73.6686341",
    "city": "Montréal, QC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abu Huraira Masjid",
    "address": "Abu Huraira Masjid",
    "latitude": "45.2864853",
    "longitude": "-66.0772685",
    "city": "Abu",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Rexdale Jame Masjid",
    "address": "127 Westmore Drive, Etobicoke, ON M9V 3Y6",
    "latitude": "43.7358347",
    "longitude": "-79.6008166",
    "city": "Etobicoke, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Aman",
    "address": "Al Aman",
    "latitude": "45.6115863",
    "longitude": "-73.7932816",
    "city": "Al",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Vaughan",
    "address": "9100 Jane Street, Vaughan, Ontario L4K 0A4",
    "latitude": "43.8296836",
    "longitude": "-79.5328807",
    "city": "Vaughan, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque Nour Al Medina",
    "address": "Mosque Nour Al Medina",
    "latitude": "45.5269927",
    "longitude": "-73.6240341",
    "city": "Mosque",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Naqshbandi Sufi Toronto",
    "address": "129 East Drive",
    "latitude": "43.7117703",
    "longitude": "-79.6890563",
    "city": "Naqshbandi",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Neighbour Nexus",
    "address": "Muslim Neighbour Nexus",
    "latitude": "43.535318",
    "longitude": "-79.723061",
    "city": "Muslim",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre islamique Bilal et culturel du Québec",
    "address": "4139 Rue Jean-Talon Ouest, Montréal, QC",
    "latitude": "45.5012308",
    "longitude": "-73.6461428",
    "city": "Montréal, QC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim community of Lasalle",
    "address": "9023 Rue Airlie, H8R 2A4 ‎",
    "latitude": "45.420997",
    "longitude": "-73.6312674",
    "city": "Muslim",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre islamique Île-des-Soeurs Al Jazira",
    "address": "280 Rue Elgar, Verdun, QC",
    "latitude": "45.4565917",
    "longitude": "-73.5469136",
    "city": "Verdun, QC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Communautaire Islamique",
    "address": "Centre Communautaire Islamique",
    "latitude": "45.5657576",
    "longitude": "-73.5868686",
    "city": "Centre",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Salaam Islamic Centre",
    "address": "300 Mill Street, Kitchener, Ontario N2M 5G8",
    "latitude": "43.4365784",
    "longitude": "-80.4841013",
    "city": "Kitchener, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "MAC Qurtuba Islamic Centre",
    "address": "MAC Qurtuba Islamic Centre",
    "latitude": "45.3260789",
    "longitude": "-75.7199946",
    "city": "MAC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Aljisr",
    "address": "Centre Aljisr",
    "latitude": "45.5430878",
    "longitude": "-73.7260569",
    "city": "Centre",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imam Bukhari Centre",
    "address": "50 Steeles Avenue East, Milton, ON",
    "latitude": "43.5177898",
    "longitude": "-79.8972278",
    "city": "Milton, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Communautaire Islamique",
    "address": "5905 Grande Allée, Brossard, QC",
    "latitude": "45.4697419",
    "longitude": "-73.4365828",
    "city": "Brossard, QC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Erin Islamic Cultural Center",
    "address": "103 Main Street",
    "latitude": "43.7703015",
    "longitude": "-80.0635517",
    "city": "Erin",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Ma'moor Mosque",
    "address": "2833 Rue Ontario Est",
    "latitude": "45.536337",
    "longitude": "-73.5505032",
    "city": "Baitul",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosquée Tawuba",
    "address": "2361 Rue Ontario Est",
    "latitude": "45.5311193",
    "longitude": "-73.5545863",
    "city": "Mosquée",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Akram Jomaa Islamic Centre",
    "address": "Akram Jomaa Islamic Centre",
    "latitude": "51.0880448",
    "longitude": "-114.0003833",
    "city": "Akram",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Hedaya Islamic Centre",
    "address": "108 Savanna Avenue NE, Calgary, Alberta T3J 2E3",
    "latitude": "51.1340068",
    "longitude": "-113.9645688",
    "city": "Calgary, Alberta",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hazrat Bilal Islamic Centre",
    "address": "20 Saddlestone Drive NE, Calgary, AB T3J 0W8",
    "latitude": "51.1295071",
    "longitude": "-113.9289467",
    "city": "Calgary, AB",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Association of Tillsonburg",
    "address": "169 Broadway Street, Tillsonburg, ON N4G 3P9",
    "latitude": "42.8613247",
    "longitude": "-80.7288747",
    "city": "Tillsonburg, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Regent Park Islamic Resource Center",
    "address": "Regent Park Islamic Resource Center",
    "latitude": "43.6602569",
    "longitude": "-79.3636854",
    "city": "Regent",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ummah Nabawiah Masjid",
    "address": "2074 Kipling Avenue",
    "latitude": "43.7149002",
    "longitude": "-79.5692053",
    "city": "Ummah",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Isna Canada",
    "address": "2200 South Sheridan Way, Mississauga, Ontario",
    "latitude": "43.5202656",
    "longitude": "-79.6503299",
    "city": "Mississauga, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Foundation of Toronto",
    "address": "441 Nugget Avenue, Toronto",
    "latitude": "43.7980215",
    "longitude": "-79.24167",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Anjuman-e-Fakhri Dawoodi Bohra Jamaat",
    "address": "1605 Argentia Road",
    "latitude": "43.6071805",
    "longitude": "-79.7310574",
    "city": "Anjuman-e-Fakhri",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Meadowvale Ismaili Centre",
    "address": "7037 Financial Drive, Mississauga, L5N 7H5",
    "latitude": "43.6129821",
    "longitude": "-79.7490987",
    "city": "Mississauga",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sayeda Khadija Centre",
    "address": "7150 Edwards Boulevard, Mississauga, ON L5S 1Z1",
    "latitude": "43.6504787",
    "longitude": "-79.7085726",
    "city": "Mississauga, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Huda Institute Canada",
    "address": "5671 McAdam Road, Mississauga, L4Z 1N9",
    "latitude": "43.6249079",
    "longitude": "-79.665951",
    "city": "Mississauga",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jame Masjid Mississauga",
    "address": "5761 Coopers Avenue",
    "latitude": "43.6322462",
    "longitude": "-79.6578825",
    "city": "Jame",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Hamd Mosque",
    "address": "1194 Matheson Boulevard East, Mississauga, Ontario L4W 1Y2",
    "latitude": "43.6373731",
    "longitude": "-79.6369498",
    "city": "Mississauga, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Anatolia Islamic Centre",
    "address": "5280 Maingate Drive, Mississauga, L4W 1G5",
    "latitude": "43.633229",
    "longitude": "-79.6324547",
    "city": "Mississauga",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Malton Islamic Centre",
    "address": "6836 Professional Court, Mississauga, L4V 1X6",
    "latitude": "43.7075165",
    "longitude": "-79.6310944",
    "city": "Mississauga",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jami Mosque",
    "address": "56 Boustead Avenue, Toronto, M6R 1Y9",
    "latitude": "43.6533205",
    "longitude": "-79.45448",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Research Center of Canada Inc.",
    "address": "1 Stamford Square North, Toronto, Ontario M1L 1X4",
    "latitude": "43.7111375",
    "longitude": "-79.2951115",
    "city": "Toronto, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hamilton Downtown Mosque",
    "address": "221 York Boulevard",
    "latitude": "43.2610287",
    "longitude": "-79.8755949",
    "city": "Hamilton",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Islamique Badr",
    "address": "8625 Boulevard Langelier, H1P 2C6",
    "latitude": "45.598881",
    "longitude": "-73.59095",
    "city": "Centre",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Islamique Libanais",
    "address": "Centre Islamique Libanais",
    "latitude": "45.5473573",
    "longitude": "-73.6560616",
    "city": "Centre",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Jamieh",
    "address": "Al Jamieh",
    "latitude": "45.4926196",
    "longitude": "-73.8379936",
    "city": "Al",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Salaheddin Islamic Centre",
    "address": "741 Kennedy Road",
    "latitude": "43.7308697",
    "longitude": "-79.2659976",
    "city": "Salaheddin",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bosnian Islamic Association Gazi Husrev-Beg",
    "address": "122 North Queen Street, Etobicoke",
    "latitude": "43.6207841",
    "longitude": "-79.55001",
    "city": "Etobicoke",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jaffari Community Centre",
    "address": "9000 Bathurst Street, Thornhill, Ontario",
    "latitude": "43.841701",
    "longitude": "-79.460731",
    "city": "Thornhill, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Al-Hijrah Islamic Center",
    "address": "2050 Kipling Avenue, Etobicoke",
    "latitude": "43.7133519",
    "longitude": "-79.5685136",
    "city": "Etobicoke",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana Scarborough",
    "address": "Toronto",
    "latitude": "43.8169155",
    "longitude": "-79.2597495",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Mukarram Islamic Society",
    "address": "3340 Danforth Avenue, Scarborough, Ontario M1L 1C6",
    "latitude": "43.693917",
    "longitude": "-79.277756",
    "city": "Scarborough, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Toronto and Region Islamic Congregation",
    "address": "99 Beverly Hills Drive, Toronto, M3L 1A2",
    "latitude": "43.7179654",
    "longitude": "-79.5159802",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imam Mahdi Islamic Centre",
    "address": "7340 Bayview Avenue, Thornhill",
    "latitude": "43.8111725",
    "longitude": "-79.4001251",
    "city": "Thornhill",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imdadul Islamic Jamat",
    "address": "26 Le Page Court, Toronto, M3J 1Z9",
    "latitude": "43.7590279",
    "longitude": "-79.4869955",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Huzaifah",
    "address": "18 Progress Avenue, Scarborough",
    "latitude": "43.770228",
    "longitude": "-79.280662",
    "city": "Scarborough",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of York Region",
    "address": "Islamic Society of York Region",
    "latitude": "43.9366856",
    "longitude": "-79.4069923",
    "city": "Islamic",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Darul Iman",
    "address": "1330 Castlemore Avenue, Markham, ON L6E 1A4",
    "latitude": "43.9052155",
    "longitude": "-79.2639906",
    "city": "Markham, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Islamique de L'Outaouais",
    "address": "4 Rue Lois, Gatineau, J8X 0A1",
    "latitude": "45.4290273",
    "longitude": "-75.7321088",
    "city": "Gatineau",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ottawa Islamic Centre & Assalam Mosque",
    "address": "2335 St-Laurent Boulevard",
    "latitude": "45.383107",
    "longitude": "-75.620526",
    "city": "Ottawa",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana",
    "address": "Ismaili Jamatkhana",
    "latitude": "43.92653",
    "longitude": "-78.8795867",
    "city": "Ismaili",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jame Makki Masjid Brampton",
    "address": "8450 Torbram Road, Brampton, L6T 4M9",
    "latitude": "43.7216539",
    "longitude": "-79.6905252",
    "city": "Brampton",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ottawa Muslim Association",
    "address": "251 Northwestern Avenue, K1Y 0M1",
    "latitude": "45.401462",
    "longitude": "-75.741327",
    "city": "Ottawa",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Usman Gousi Mosque",
    "address": "75 Kirkdene Drive, Toronto",
    "latitude": "43.7945587",
    "longitude": "-79.138474",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shalimar",
    "address": "79 Cedarglen Gate, Mississauga, On L5C 4S3",
    "latitude": "43.5584348",
    "longitude": "-79.6426708",
    "city": "Mississauga, On",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Aylmer Mosque",
    "address": "21 Rue Park, Gatineau, J9H 4J6",
    "latitude": "45.3955834",
    "longitude": "-75.8448092",
    "city": "Gatineau",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Manitoba Islamic Association Community Center",
    "address": "2445 Waverley Street, R3Y 1S3",
    "latitude": "49.7913976",
    "longitude": "-97.1749602",
    "city": "Manitoba",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bab ul Ilm - Bani Hashim Society",
    "address": "Bab ul Ilm - Bani Hashim Society",
    "latitude": "43.6250781",
    "longitude": "-79.6319577",
    "city": "Bab",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hamilton Mountain Masjid",
    "address": "1545 Stone Church Road East",
    "latitude": "43.1955722",
    "longitude": "-79.8205373",
    "city": "Hamilton",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana & Centre",
    "address": "Ismaili Jamatkhana & Centre",
    "latitude": "51.094044",
    "longitude": "-114.0376223",
    "city": "Ismaili",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "London Muslim Mosque",
    "address": "151 Oxford Street West, London",
    "latitude": "42.9909133",
    "longitude": "-81.2705905",
    "city": "London",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Rashid Mosque",
    "address": "Al Rashid Mosque",
    "latitude": "53.5016883",
    "longitude": "-113.5780526",
    "city": "Al",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Centre of Southwest Ontario",
    "address": "951 Pond Mills Road, London, ON N6N1C3",
    "latitude": "42.9317026",
    "longitude": "-81.1919677",
    "city": "London, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The BC Muslim Association",
    "address": "2218 Quadra Street",
    "latitude": "48.4336253",
    "longitude": "-123.3585823",
    "city": "The",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Ahad Mosque",
    "address": "546 Beaverbrook Avenue, London, Ontario N6H 2M6",
    "latitude": "42.9804165",
    "longitude": "-81.278067",
    "city": "London, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Waterloo Masjid",
    "address": "213 Erb Street West, Waterloo",
    "latitude": "43.4590603",
    "longitude": "-80.5354741",
    "city": "Waterloo",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Kitchener Masjid",
    "address": "1017 Victoria Street North, Kitchener",
    "latitude": "43.4647895",
    "longitude": "-80.4604245",
    "city": "Kitchener",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Community Centre of Milton",
    "address": "8069 Esquesing Line, Milton, ON L9T7L4",
    "latitude": "43.5427096",
    "longitude": "-79.8768764",
    "city": "Milton, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dawoodi Bohra Al Masjid Al Saifee Anjuman-e-Burhani",
    "address": "Dawoodi Bohra Al Masjid Al Saifee Anjuman-e-Burhani",
    "latitude": "43.8492852",
    "longitude": "-79.4074797",
    "city": "Dawoodi",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamiat-Ul-Ansar of Brampton",
    "address": "291 Great Lakes Drive, Brampton, L6R 2Z4",
    "latitude": "43.7374773",
    "longitude": "-79.7695094",
    "city": "Brampton",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Newmarket Islamic Centre",
    "address": "700 Mulock Drive, Newmarket, Ontario L3Y9C1",
    "latitude": "44.0426668",
    "longitude": "-79.443425",
    "city": "Newmarket, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Islam Mosque",
    "address": "10610 Jane Street, Vaughan, Ontario L6A 3A2",
    "latitude": "43.8648527",
    "longitude": "-79.5429879",
    "city": "Vaughan, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Zahra Shia Association of Waterloo Region",
    "address": "204 Madison Avenue South",
    "latitude": "43.441332",
    "longitude": "-80.4873513",
    "city": "Al",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Association",
    "address": "130 Lincoln Road, Fredericton",
    "latitude": "45.9369131",
    "longitude": "-66.6279094",
    "city": "Fredericton",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Rahmatul-lil-Alameen",
    "address": "205 North Service Road, Mississauga, L5A 1A4",
    "latitude": "43.5735625",
    "longitude": "-79.5952994",
    "city": "Mississauga",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Grande Mosquée de Québec",
    "address": "2877 Chemin Sainte-Foy, Québec",
    "latitude": "46.7779531",
    "longitude": "-71.3053718",
    "city": "Québec",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal, Islamic Society of Cumberland",
    "address": "4509 Innes Road",
    "latitude": "45.4621642",
    "longitude": "-75.4846875",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Centre Toronto",
    "address": "49 Wynford Drive, North York, M3C 1K1",
    "latitude": "43.7238587",
    "longitude": "-79.333445",
    "city": "North York",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Itissam",
    "address": "Masjid Al Itissam",
    "latitude": "45.5719272",
    "longitude": "-73.6942351",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Pickering Islamic Centre",
    "address": "Pickering Islamic Centre",
    "latitude": "43.8534967",
    "longitude": "-79.0764039",
    "city": "Pickering",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Albatool Fatima Association",
    "address": "2575 Bond Street",
    "latitude": "45.3638405",
    "longitude": "-75.7878475",
    "city": "Albatool",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Brossard Ismaili Jamat Khana",
    "address": "Brossard Ismaili Jamat Khana",
    "latitude": "45.4275812",
    "longitude": "-73.4594078",
    "city": "Brossard",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masumeen Islamic Centre",
    "address": "7580 Kennedy Road South, Brampton",
    "latitude": "43.6674141",
    "longitude": "-79.7116013",
    "city": "Brampton",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Manitoba Dawah Centre",
    "address": "368 Edmonton Street",
    "latitude": "49.8948913",
    "longitude": "-97.1489524",
    "city": "Manitoba",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Rhoda Masjid and Institute",
    "address": "2871 St. Joseph Boulevard",
    "latitude": "45.4745532",
    "longitude": "-75.5191812",
    "city": "Rhoda",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ottawa South Mosque",
    "address": "7 Fairbairn Street",
    "latitude": "45.3948791",
    "longitude": "-75.6812937",
    "city": "Ottawa",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jam'e Masjid Markham",
    "address": "2900 Denison Street, Markham",
    "latitude": "43.841864",
    "longitude": "-79.2645245",
    "city": "Markham",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Wilmot Muslim Centre",
    "address": "1000 Knechtel Court, Saint Petersburg",
    "latitude": "43.3993619",
    "longitude": "-80.5382781",
    "city": "Saint Petersburg",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Fort McMurray Islamic Centre",
    "address": "Fort McMurray Islamic Centre",
    "latitude": "56.729412",
    "longitude": "-111.3758869",
    "city": "Fort",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamat Khana",
    "address": "3225 Conroy Road",
    "latitude": "45.3744894",
    "longitude": "-75.6241075",
    "city": "Ismaili",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-an-Noor",
    "address": "Masjid-an-Noor",
    "latitude": "47.6071101",
    "longitude": "-52.6893568",
    "city": "Masjid-an-Noor",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "MAC Hespeler Masjid",
    "address": "64 Winston Boulevard, Cambridge, Ontario N3C 1L6",
    "latitude": "43.4254334",
    "longitude": "-80.3177917",
    "city": "Cambridge, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bosnian Islamic Centre",
    "address": "75 Birmingham Street",
    "latitude": "43.603482",
    "longitude": "-79.5042513",
    "city": "Bosnian",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Rayan Islamic Centre",
    "address": "1660 Regional Highway 2, Courtice, ON",
    "latitude": "43.911339",
    "longitude": "-78.7865665",
    "city": "Courtice, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jami Omar",
    "address": "3990 Old Richmond Road, K2H 6P6",
    "latitude": "45.3116695",
    "longitude": "-75.828436",
    "city": "Jami",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Prairie Muslim Association",
    "address": "3350 Fairlight Drive, Saskatoon, S7M 5H9",
    "latitude": "52.1272912",
    "longitude": "-106.7263894",
    "city": "Saskatoon",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Belleville",
    "address": "Islamic Society of Belleville",
    "latitude": "44.1682058",
    "longitude": "-77.3880989",
    "city": "Islamic",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Omar Al-Farooq",
    "address": "1659 East 10th Avenue, Vancouver, V5N 1X6",
    "latitude": "49.2616216",
    "longitude": "-123.0705718",
    "city": "Vancouver",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sudbury Mosque",
    "address": "755 Churchill Avenue, Sudbury, ON",
    "latitude": "46.5131805",
    "longitude": "-80.9345732",
    "city": "Sudbury, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Shia Ithna Asheri Asociation of Ottawa",
    "address": "3856 Old Richmond Road",
    "latitude": "45.3214673",
    "longitude": "-75.8257328",
    "city": "Islamic",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abu Thar al-Gofary Mosque, Ottawa",
    "address": "273 Donald Street",
    "latitude": "45.4282963",
    "longitude": "-75.6568356",
    "city": "Abu",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ahmadiyya Muslim Center",
    "address": "525 Kylemore Avenue, Winnipeg, ON R3L 1B5",
    "latitude": "49.8626565",
    "longitude": "-97.1362007",
    "city": "Winnipeg, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Masjid al-Jamia Vancouver",
    "address": "655 West 8th Avenue",
    "latitude": "49.26442",
    "longitude": "-123.1189909",
    "city": "Al-Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Malton Masjid",
    "address": "7097 Airport Road, Mississauga, ON L4T2G7",
    "latitude": "43.7063905",
    "longitude": "-79.6444861",
    "city": "Mississauga, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madani Mosque",
    "address": "12080 Boulevard Laurentien",
    "latitude": "45.5268612",
    "longitude": "-73.7180557",
    "city": "Madani",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Peace Mosque",
    "address": "6735 Caledonia Street, Niagara Falls, L2G 5A6",
    "latitude": "43.0737417",
    "longitude": "-79.1069196",
    "city": "Niagara Falls",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Scarborough Muslim Association - Jame Abu Bakr Siddique Masjid",
    "address": "2665 Lawrence Avenue East, Toronto",
    "latitude": "43.7514785",
    "longitude": "-79.262164",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Alfalah Center (Masjid)",
    "address": "2401 47 Street NW, Edmonton, AB T6L 4P6",
    "latitude": "53.4557266",
    "longitude": "-113.4146823",
    "city": "Edmonton, AB",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Shia Ithna-Asheri Centre",
    "address": "Islamic Shia Ithna-Asheri Centre",
    "latitude": "53.4621394",
    "longitude": "-113.405806",
    "city": "Islamic",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markaz-Ul-Islam",
    "address": "7907 36 Avenue NW, Edmonton, AB T6K 3S6",
    "latitude": "53.4682597",
    "longitude": "-113.4547647",
    "city": "Edmonton, AB",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Mosque",
    "address": "10721 86 Avenue NW, Edmonton",
    "latitude": "53.5216771",
    "longitude": "-113.507308",
    "city": "Edmonton",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bait-ul-Hadi",
    "address": "7005 98 Avenue North-west, Edmonton, Alberta T6A 0A6",
    "latitude": "53.5370962",
    "longitude": "-113.4364849",
    "city": "Edmonton, Alberta",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sahaba Mosque",
    "address": "Sahaba Mosque",
    "latitude": "53.5505174",
    "longitude": "-113.4774663",
    "city": "Sahaba",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Quba: Jama Masjid - Edmonton",
    "address": "Masjid Quba: Jama Masjid - Edmonton",
    "latitude": "53.5706606",
    "longitude": "-113.496062",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Rashid Mosque",
    "address": "Al Rashid Mosque",
    "latitude": "53.5912515",
    "longitude": "-113.5157414",
    "city": "Al",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Ameen Islamic Centre Mosque",
    "address": "Al Ameen Islamic Centre Mosque",
    "latitude": "53.576961",
    "longitude": "-113.4257571",
    "city": "Al",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Community Center and Jamatkhana - Edmonton Belle Rive",
    "address": "Ismaili Community Center and Jamatkhana - Edmonton Belle Rive",
    "latitude": "53.614713",
    "longitude": "-113.4887389",
    "city": "Ismaili",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Farooq",
    "address": "935 Eglinton Avenue West, Mississauga",
    "latitude": "43.5870808",
    "longitude": "-79.6759189",
    "city": "Mississauga",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mount Pleasant Islamic Center",
    "address": "160 Salvation Road, Brampton, L7A 0G2",
    "latitude": "43.6766727",
    "longitude": "-79.8195695",
    "city": "Brampton",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Halifax Jamia Masjid and Nova Scotia Islamic Community Centre",
    "address": "2141 Larry Uteck Boulevard, Bedford, Nova Scotia B4B 1E2",
    "latitude": "44.720795",
    "longitude": "-63.7261213",
    "city": "Bedford, Nova Scotia",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Association Culturelle Islamique de l'Estrie",
    "address": "1200 Rue Massé",
    "latitude": "45.3860992",
    "longitude": "-71.9059635",
    "city": "Association",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Qods",
    "address": "2465 Rue Bélanger",
    "latitude": "45.5517823",
    "longitude": "-73.5991661",
    "city": "Al",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Salam Centre",
    "address": "6415 Ranchview Drive NW, T3G 1B5",
    "latitude": "51.1148326",
    "longitude": "-114.1799531",
    "city": "Al-Salam",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Islamique du Quebec",
    "address": "2520 Chemin Laval, Saint-Laurent, H4L 3A1",
    "latitude": "45.5212952",
    "longitude": "-73.7046974",
    "city": "Saint-Laurent",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Kanata Muslim Association",
    "address": "351 Sandhill Road",
    "latitude": "45.3560684",
    "longitude": "-75.9283763",
    "city": "Kanata",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Culturel Islamique de Laval",
    "address": "1330 Rue Antonio, Laval, quebec H7V 3N4",
    "latitude": "45.5475641",
    "longitude": "-73.7542818",
    "city": "Laval, quebec",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Thunder Bay Masjid",
    "address": "591 John Street, Thunder Bay, Ontartio P7B 1Y8",
    "latitude": "48.431952",
    "longitude": "-89.2478948",
    "city": "Thunder Bay, Ontartio",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "As-Salaam Alaykum Masjid Aisha",
    "address": "Stanley Avenue, Niagara Falls, ON L2G 3X2",
    "latitude": "43.0940132",
    "longitude": "-79.08484",
    "city": "Niagara Falls, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosquée Baitul Mukarram",
    "address": "4225 Avenue de Courtrai, Montréal, QC H3S 1B8",
    "latitude": "45.5006171",
    "longitude": "-73.6430099",
    "city": "Montréal, QC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ahlilbait Mosque",
    "address": "4075 Avenue de Courtrai, Montréal, QC H3S 1B8",
    "latitude": "45.5013647",
    "longitude": "-73.6425765",
    "city": "Montréal, QC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abbotsford Islamic Center",
    "address": "1980 Salton Road, V2S 3W7",
    "latitude": "49.0383327",
    "longitude": "-122.2874137",
    "city": "Abbotsford",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sayyidah Zainab",
    "address": "Sayyidah Zainab",
    "latitude": "43.8515393",
    "longitude": "-79.0232252",
    "city": "Sayyidah",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Centre of Cambridge",
    "address": "1550 Dunbar Road",
    "latitude": "43.3904363",
    "longitude": "-80.3176005",
    "city": "Islamic",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Center of Waterloo",
    "address": "510 Erbsville Road, Waterloo, N2J 3Z4",
    "latitude": "43.4685221",
    "longitude": "-80.5891625",
    "city": "Waterloo",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ibraham Jam-E Mosque",
    "address": "Ibraham Jam-E Mosque",
    "latitude": "43.2512039",
    "longitude": "-79.8441998",
    "city": "Ibraham",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "House of the Commandments",
    "address": "House of the Commandments",
    "latitude": "44.1011149",
    "longitude": "-77.5806063",
    "city": "House",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al-Huda",
    "address": "14136 Grosvernor Road, Surrey",
    "latitude": "49.2069635",
    "longitude": "-122.8300311",
    "city": "Surrey",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Association of Nova Scotia",
    "address": "42 Leaman Drive, Dartmouth, Nova Scotia B3A 2K9",
    "latitude": "44.6885448",
    "longitude": "-63.5801759",
    "city": "Dartmouth, Nova Scotia",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jaame Masjid Scarborough",
    "address": "Toronto",
    "latitude": "43.7602052",
    "longitude": "-79.2205168",
    "city": "Toronto",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Umar Mosque",
    "address": "734 Rennie Street",
    "latitude": "43.2465045",
    "longitude": "-79.7741582",
    "city": "Umar",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Az-Zahraa Islamic Centre",
    "address": "8580 Number 5 Road",
    "latitude": "49.1508668",
    "longitude": "-123.0904948",
    "city": "Az-Zahraa",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Surrey Jami'a Mosque",
    "address": "12407 72 Avenue",
    "latitude": "49.1342216",
    "longitude": "-122.8786528",
    "city": "Surrey",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Richmond Jamea Masjid",
    "address": "12300 Blundell Road, Richmond, V6W 1B3",
    "latitude": "49.1540842",
    "longitude": "-123.0875706",
    "city": "Richmond",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Riyad Ul Jannah",
    "address": "6680 Campobello Road, Mississauga, L5N 2L8",
    "latitude": "43.6086461",
    "longitude": "-79.7336717",
    "city": "Mississauga",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitun Naseer Mosque",
    "address": "2620 Market Street, Cumberland, Ontario K4C 1A3",
    "latitude": "45.5165977",
    "longitude": "-75.4034007",
    "city": "Cumberland, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "SNMC Center & Masjid",
    "address": "3020 Woodroffe Avenue, K2J 4G3",
    "latitude": "45.2890632",
    "longitude": "-75.7266492",
    "city": "SNMC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Noor-ul-Haram",
    "address": "2478 9th Line, Oavkville",
    "latitude": "43.5062767",
    "longitude": "-79.6958778",
    "city": "Oavkville",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ar-Rahman",
    "address": "1216 Hunt Club Road",
    "latitude": "45.351783",
    "longitude": "-75.647315",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Iman Ali (As) Masjid",
    "address": "1606 Walkley Road",
    "latitude": "45.3771035",
    "longitude": "-75.6459075",
    "city": "Iman",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid in The Park",
    "address": "125 Broadview Drive, Sherwood Park, Alberta T8H 0W9",
    "latitude": "53.5451265",
    "longitude": "-113.312072",
    "city": "Sherwood Park, Alberta",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitun Nur Mosque",
    "address": "4354 54 Avenue NE, Calgary, Alberta T3J 4L3",
    "latitude": "51.101882",
    "longitude": "-113.9712837",
    "city": "Calgary, Alberta",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Salaam",
    "address": "5060 Canada Way, Burnaby",
    "latitude": "49.2399955",
    "longitude": "-122.9641091",
    "city": "Burnaby",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Windsor Mosque",
    "address": "Windsor Mosque",
    "latitude": "42.2774224",
    "longitude": "-83.0320239",
    "city": "Windsor",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mahmood Mosque",
    "address": "3810 Eastgate Drive, Regina, SK S4Z 1A5",
    "latitude": "50.4508691",
    "longitude": "-104.5281956",
    "city": "Regina, SK",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Oshawa Mosque",
    "address": "Oshawa Mosque",
    "latitude": "43.8924569",
    "longitude": "-78.8623798",
    "city": "Oshawa",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hawkesbury Mosque",
    "address": "651 Main Street East, Hawkesbury, K6A 1B3",
    "latitude": "45.6105951",
    "longitude": "-74.6004479",
    "city": "Hawkesbury",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Westwinds Ismaili Jamatkhana",
    "address": "4669 Westwinds Drive NE",
    "latitude": "51.0994214",
    "longitude": "-113.9674488",
    "city": "Westwinds",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Stratford Mosque",
    "address": "97 Woods Street, Stratford",
    "latitude": "43.3652482",
    "longitude": "-80.9954819",
    "city": "Stratford",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Fraser Valley Jamatkhanna",
    "address": "15177 68 Avenue",
    "latitude": "49.1269795",
    "longitude": "-122.8015885",
    "city": "Fraser",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darur Rahmat",
    "address": "101 Boychuk Drive, Saskatoon, SK S7H 4C6",
    "latitude": "52.1238355",
    "longitude": "-106.5858339",
    "city": "Saskatoon, SK",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitur Rahman Mosque",
    "address": "9570 River Road, Delta, BC V4G1B5",
    "latitude": "49.152624",
    "longitude": "-122.9578042",
    "city": "Delta, BC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana",
    "address": "6556 Sprott Street",
    "latitude": "49.2486747",
    "longitude": "-122.9672459",
    "city": "Ismaili",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana",
    "address": "6556 Sprott Street",
    "latitude": "49.2492855",
    "longitude": "-122.9673001",
    "city": "Ismaili",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Alhakeem Bowmanville",
    "address": "Masjid Alhakeem Bowmanville",
    "latitude": "43.9105436",
    "longitude": "-78.6831859",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Fatima",
    "address": "9275 25 Avenue NW, Edmonton, AB T6N 0A5",
    "latitude": "53.4535669",
    "longitude": "-113.472686",
    "city": "Edmonton, AB",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ummah Masjid",
    "address": "2510 St Matthias Street, Halifax, B3L 0A9",
    "latitude": "44.6505843",
    "longitude": "-63.5977843",
    "city": "Halifax",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Aqsa Mosque",
    "address": "Al-Aqsa Mosque",
    "latitude": "45.0233257",
    "longitude": "-74.7311889",
    "city": "Al-Aqsa",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sarnia Muslim Association",
    "address": "1609 London Line, Sarnia, N7W 1A9",
    "latitude": "42.9831922",
    "longitude": "-82.3354944",
    "city": "Sarnia",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Truro Masjid",
    "address": "Truro Masjid",
    "latitude": "45.3921609",
    "longitude": "-63.2157995",
    "city": "Truro",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Lloydminster Islamic Centre",
    "address": "4610 49 Avenue, Lloydminster",
    "latitude": "53.2802983",
    "longitude": "-110.003886",
    "city": "Lloydminster",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Hafeez Mosque",
    "address": "1098 Grand Lake Road, Sydney, NS B1M 1A2",
    "latitude": "46.1623935",
    "longitude": "-60.1079843",
    "city": "Sydney, NS",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Amaan Mosque",
    "address": "4530 50 Street, Lloydminster, S9V 1B8",
    "latitude": "53.2836129",
    "longitude": "-109.9943205",
    "city": "Lloydminster",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Musalla As-Sahaba",
    "address": "2835 Dumaurier Avenue",
    "latitude": "45.3506479",
    "longitude": "-75.7937122",
    "city": "Musalla",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Noor-ul-Islam",
    "address": "Lincoln Road, Windsor, Ontario",
    "latitude": "42.3210224",
    "longitude": "-83.0159066",
    "city": "Windsor, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Ehsaan Mosque",
    "address": "1957 Head Avenue, Windsor, ON N8W 1V7",
    "latitude": "42.2910878",
    "longitude": "-82.9919101",
    "city": "Windsor, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Centre of Kingston",
    "address": "Kingston",
    "latitude": "44.284521",
    "longitude": "-76.5420575",
    "city": "Kingston",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Institute of Toronto",
    "address": "1630 Neilson Road, Toronto, Ontario M1X 1S3",
    "latitude": "43.818755",
    "longitude": "-79.229839",
    "city": "Toronto, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Spiritual Society Canada",
    "address": "Spiritual Society Canada",
    "latitude": "43.7743525",
    "longitude": "-79.1842505",
    "city": "Spiritual",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al-Faisal (Islamic Society of Willowdale)",
    "address": "3551 Victoria Park Avenue, M1W 2H2",
    "latitude": "43.801315",
    "longitude": "-79.334554",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid El Noor",
    "address": "277 Scott Road, Toronto, ON",
    "latitude": "43.6896555",
    "longitude": "-79.4719435",
    "city": "Toronto, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Vaughan",
    "address": "9954 Keele Street, Maple, Ontario",
    "latitude": "43.853548",
    "longitude": "-79.5126835",
    "city": "Maple, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Brampton Islamic Center",
    "address": "6 Lowry Drive, Brampton, L7A 1C4",
    "latitude": "43.701851",
    "longitude": "-79.8046835",
    "city": "Brampton",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitun Nasir Mosque",
    "address": "341 Balmoral Avenue, Cornwall, Ontario K6H 3G6",
    "latitude": "45.0407431",
    "longitude": "-74.7368045",
    "city": "Cornwall, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Pictou County Mosque",
    "address": "25 Forge Street, Trenton",
    "latitude": "45.6099063",
    "longitude": "-62.6367647",
    "city": "Trenton",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Makkah-Al-Mukarramah",
    "address": "Masjid Makkah-Al-Mukarramah",
    "latitude": "45.5069867",
    "longitude": "-73.8250112",
    "city": "Masjid",
    "country": "CA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Fondation du Message de l’Islam",
    "address": "10555 Boulevard Saint-Laurent, Montréal, Qc H3L 2P5",
    "latitude": "45.5499792",
    "longitude": "-73.6686754",
    "city": "Montréal, Qc",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Midnight Sun Mosque",
    "address": "Midnight Sun Mosque",
    "latitude": "68.3683313",
    "longitude": "-133.7377672",
    "city": "Midnight",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-e-Maryam Calgary",
    "address": "183 Beddington Drive NE",
    "latitude": "51.1286546",
    "longitude": "-114.0681804",
    "city": "Masjid-e-Maryam",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jami' Masjid Chatham",
    "address": "Jami' Masjid Chatham",
    "latitude": "42.3900824",
    "longitude": "-82.1797045",
    "city": "Jami'",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Red Deer Islamic Center",
    "address": "159 Douglas Avenue",
    "latitude": "52.2589919",
    "longitude": "-113.7613684",
    "city": "Red",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Aisha",
    "address": "44 Marlborough Road, Guelph",
    "latitude": "43.5605888",
    "longitude": "-80.2640327",
    "city": "Guelph",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Iqaluit Masjid",
    "address": "4121 Road to Nowhere, Iqaluit, NU X0A 0H0",
    "latitude": "63.747888",
    "longitude": "-68.4879886",
    "city": "Iqaluit, NU",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitun Nur Mosque",
    "address": "2301 King Street East, Hamilton, Ontario L8K 1X6",
    "latitude": "43.2296292",
    "longitude": "-79.7957217",
    "city": "Hamilton, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-ur-Raman",
    "address": "13585 62 Avenue",
    "latitude": "49.1156169",
    "longitude": "-122.8457744",
    "city": "Masjid-ur-Raman",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamatkhana Richmond",
    "address": "Ismaili Jamatkhana Richmond",
    "latitude": "49.1827211",
    "longitude": "-123.1174857",
    "city": "Ismaili",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Riyadhul Jannah",
    "address": "27079 River Road, Maple Ridge, BC",
    "latitude": "49.1747378",
    "longitude": "-122.472053",
    "city": "Maple Ridge",
    "country": "CA",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al-Hidayah - Islamic Society of BC",
    "address": "2626 Kingsway Avenue",
    "latitude": "49.2652087",
    "longitude": "-122.7879187",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Salaam",
    "address": "Masjid Al-Salaam",
    "latitude": "44.3092946",
    "longitude": "-78.3487231",
    "city": "Masjid",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Zubaidah Tallab Masjid",
    "address": "Zubaidah Tallab Masjid",
    "latitude": "55.7472926",
    "longitude": "-97.8704334",
    "city": "Zubaidah",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Islamique de Verdun",
    "address": "4583 Rue de Verdun, H4G 1M3",
    "latitude": "45.4589831",
    "longitude": "-73.5714045",
    "city": "Centre",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Winnipeg Central Mosque",
    "address": "715 Ellice Avenue",
    "latitude": "49.8933299",
    "longitude": "-97.1645088",
    "city": "Winnipeg",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Yaseen Centre of Manitoba",
    "address": "746 Ellice Avenue",
    "latitude": "49.8929602",
    "longitude": "-97.1657206",
    "city": "Yaseen",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Green Dome Masjid",
    "address": "Green Dome Masjid",
    "latitude": "51.1261813",
    "longitude": "-113.9677231",
    "city": "Green",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Yukon Muslims Society",
    "address": "2176 Second Avenue, Whitehorse, YT",
    "latitude": "60.7246361",
    "longitude": "-135.0568512",
    "city": "Whitehorse, YT",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Cambridge Muslim Society",
    "address": "252 Elgin Street North, Cambridge, N1R 7H9",
    "latitude": "43.3740144",
    "longitude": "-80.303962",
    "city": "Cambridge",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Centre Culture Islamique Cheikh Zayed",
    "address": "495 Avenue Lafleur, Lasalle, QC",
    "latitude": "45.4338359",
    "longitude": "-73.645482",
    "city": "Lasalle, QC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mubarak Mosque",
    "address": "10545 Hurontario Street, Brampton, ON L6Z 2V9",
    "latitude": "43.7169056",
    "longitude": "-79.8009379",
    "city": "Brampton, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Andalous Islamic Center",
    "address": "816 Avenue Sainte-Croix, Saint-Laurent, H4L 3Y4",
    "latitude": "45.513657",
    "longitude": "-73.6762119",
    "city": "Saint-Laurent",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Arqam Islamic Centre",
    "address": "Al-Arqam Islamic Centre",
    "latitude": "43.9492235",
    "longitude": "-78.853355",
    "city": "Al-Arqam",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hadiqa Ahmad",
    "address": "3999 10th Sideroad, Bradford, Ontario L3Z 2A5",
    "latitude": "44.1620864",
    "longitude": "-79.615089",
    "city": "Bradford, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Karim Mosque",
    "address": "5 Elliott Street, Cambridge, Ontario N1R 2J3",
    "latitude": "43.3526807",
    "longitude": "-80.3124794",
    "city": "Cambridge, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Mahdi Mosque",
    "address": "3505 Salem Road, Locust Hill, Ontario L0H 1J0",
    "latitude": "43.9262591",
    "longitude": "-79.0420318",
    "city": "Locust Hill, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mary Mosque (Maryam Mosque)",
    "address": "110 Oro-Medonte Line 7, Barrie, ON L0L 2X0",
    "latitude": "44.4747797",
    "longitude": "-79.5318463",
    "city": "Barrie, ON",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitur Rehmat Mosque",
    "address": "304565 Township Road 362, Saskatoon, SK S0K 0Y0",
    "latitude": "52.0850252",
    "longitude": "-106.5704116",
    "city": "Saskatoon, SK",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Khabir",
    "address": "Elizabeth Street, Bradford, Ontario L3Z1W9",
    "latitude": "44.1127925",
    "longitude": "-79.5648925",
    "city": "Bradford, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Owen Sound Muslim Association",
    "address": "895 7th Street East, Owen Sound, On N4K 1K2",
    "latitude": "44.5633946",
    "longitude": "-80.92729",
    "city": "Owen Sound, On",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Sayyidna Bilal",
    "address": "26 Spruce Street, Paris, Ontario N2L3V2",
    "latitude": "43.2023624",
    "longitude": "-80.3958423",
    "city": "Paris, Ontario",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Prince George Islamic Centre",
    "address": "4668 5th Avenue",
    "latitude": "53.9210797",
    "longitude": "-122.818567",
    "city": "Prince",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Townline Muslim Centre",
    "address": "1170 Townline Road, Cambridge, N1T 2G3",
    "latitude": "43.4022068",
    "longitude": "-80.2767592",
    "city": "Cambridge",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Mukaromah",
    "address": "13578 Holland Commons, Surrey, BC",
    "latitude": "49.182755",
    "longitude": "-122.846777",
    "city": "Surrey, BC",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bab ul Ilm - Bani Hashim Society",
    "address": "Bab ul Ilm - Bani Hashim Society",
    "latitude": "43.6250053",
    "longitude": "-79.6319295",
    "city": "Bab",
    "country": "Canada",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamie Mosque and Bangladesh Islamic Centre",
    "address": "Jamie Mosque and Bangladesh Islamic Centre",
    "latitude": "51.7522699",
    "longitude": "-0.3212208",
    "city": "Jamie",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Khanqah Naqshbandia",
    "address": "181a Mauldeth Road, M19 1BA",
    "latitude": "53.4329627",
    "longitude": "-2.2088242",
    "city": "Khanqah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Wimbledon Mosque",
    "address": "262-270 Durnsford Road, London, SW19 8DS",
    "latitude": "51.4364908",
    "longitude": "-0.1972458",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Aylesbury Mosque",
    "address": "Aylesbury Mosque",
    "latitude": "51.821377",
    "longitude": "-0.8103297",
    "city": "Aylesbury",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ghausia Mosque Trust",
    "address": "Ghausia Mosque Trust",
    "latitude": "52.5162826",
    "longitude": "-1.8562277",
    "city": "Ghausia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Portsmouth Jami Mosque",
    "address": "Victoria Road North, PO5 1PS",
    "latitude": "50.7939468",
    "longitude": "-1.0799079",
    "city": "Portsmouth",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Ansar",
    "address": "39 Edgehill Road, LE4 9EE",
    "latitude": "52.6535652",
    "longitude": "-1.0967755",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darul Ihsaan",
    "address": "1 Gervas Road, Leicester, LE5 2EP",
    "latitude": "52.6402022",
    "longitude": "-1.0683882",
    "city": "Leicester",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Umar",
    "address": "Masjid Umar",
    "latitude": "53.4044437",
    "longitude": "-1.4565333",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jami Madina Ashiful Loom Masjid",
    "address": "Jami Madina Ashiful Loom Masjid",
    "latitude": "52.4883971",
    "longitude": "-1.8493971",
    "city": "Jami",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Balham Mosque",
    "address": "Balham Mosque",
    "latitude": "51.4465338",
    "longitude": "-0.1491658",
    "city": "Balham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Camberwell Islamic Centre",
    "address": "Camberwell Islamic Centre",
    "latitude": "51.4787255",
    "longitude": "-0.0944046",
    "city": "Camberwell",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shahjalal Jame Masjid Euston Mosque",
    "address": "Shahjalal Jame Masjid Euston Mosque",
    "latitude": "51.527302",
    "longitude": "-0.1374519",
    "city": "Shahjalal",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Qadria Jilania Islamic (S+E) Centre",
    "address": "Qadria Jilania Islamic (S+E) Centre",
    "latitude": "53.4569713",
    "longitude": "-2.2029736",
    "city": "Qadria",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Madina Jamia Mosque",
    "address": "Al Madina Jamia Mosque",
    "latitude": "53.8113009",
    "longitude": "-1.5679579",
    "city": "Al",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Amin Jame Masjid & Madrasha",
    "address": "Al Amin Square, Bradford, BD3 8AG",
    "latitude": "53.7974726",
    "longitude": "-1.7240215",
    "city": "Bradford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque Tabbligh-Ul-Islam",
    "address": "Jamia Mosque Tabbligh-Ul-Islam",
    "latitude": "53.7762355",
    "longitude": "-1.7587549",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Tawakkulia Jamia Masjid & Islamia Madrasa",
    "address": "Tawakkulia Jamia Masjid & Islamia Madrasa",
    "latitude": "53.8026662",
    "longitude": "-1.758044",
    "city": "Tawakkulia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Tabligh-ul-Islam Mosque",
    "address": "Tabligh-ul-Islam Mosque",
    "latitude": "53.7880267",
    "longitude": "-1.7896146",
    "city": "Tabligh-ul-Islam",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hussainia Islamic Mission",
    "address": "Hussainia Islamic Mission",
    "latitude": "53.7853939",
    "longitude": "-1.7719186",
    "city": "Hussainia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque Tabligh-ul-Islam",
    "address": "Jamia Mosque Tabligh-ul-Islam",
    "latitude": "53.7909358",
    "longitude": "-1.7712511",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Kotku Mosque",
    "address": "35 Grainger Park Road, Newcastle upon Tyne, NE4 8SA",
    "latitude": "54.9705697",
    "longitude": "-1.6486262",
    "city": "Newcastle upon Tyne",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Noor Al Hadi Mosque",
    "address": "Noor Al Hadi Mosque",
    "latitude": "53.3896753",
    "longitude": "-1.4274416",
    "city": "Noor",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Idara Taleem ul Quran",
    "address": "Idara Taleem ul Quran",
    "latitude": "55.9384166",
    "longitude": "-3.218234",
    "city": "Idara",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Sulthainia Mosque",
    "address": "Jamia Sulthainia Mosque",
    "latitude": "53.5155873",
    "longitude": "-1.1152511",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Ghausia",
    "address": "Jamia Masjid Ghausia",
    "latitude": "51.5098941",
    "longitude": "-0.5786375",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Karam Trust Mosque",
    "address": "19 North Street, Milton Keynes, MK13 0EE",
    "latitude": "52.0652423",
    "longitude": "-0.7892129",
    "city": "Milton Keynes",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shah Jahan Mosque",
    "address": "2-4 Gregory Boulevard, Nottingham, NG7 6BG",
    "latitude": "52.9656038",
    "longitude": "-1.1680699",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nasrul-Lahi-i-Fathi Society of Nigeria",
    "address": "Nasrul-Lahi-i-Fathi Society of Nigeria",
    "latitude": "51.4945109",
    "longitude": "-0.0802016",
    "city": "Nasrul-Lahi-i-Fathi",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "King's Cross Mosque and Islamic Centre",
    "address": "Cromer Street, London, WC1H 8DU",
    "latitude": "51.528205",
    "longitude": "-0.1212167",
    "city": "London",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-e-Noor",
    "address": "Masjid-e-Noor",
    "latitude": "51.8575754",
    "longitude": "-2.2367648",
    "city": "Masjid-e-Noor",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Khoja Shi'a Muslim Community",
    "address": "Khoja Shi'a Muslim Community",
    "latitude": "51.8323771",
    "longitude": "-2.2754319",
    "city": "Khoja",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "MIcklefield Mosque",
    "address": "MIcklefield Mosque",
    "latitude": "51.6305549",
    "longitude": "-0.7119255",
    "city": "MIcklefield",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gravesend Shahjalal Masjid",
    "address": "St Hilda's Way, Gravesend, DA12 4AZ",
    "latitude": "51.4265328",
    "longitude": "0.3894214",
    "city": "Gravesend",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid St Ives Mosque",
    "address": "Jamia Masjid St Ives Mosque",
    "latitude": "52.3251021",
    "longitude": "-0.0686199",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Lenton Muslim Centre",
    "address": "56 Rothesay Avenue, Nottingham, NG7 1PW",
    "latitude": "52.9544575",
    "longitude": "-1.1718025",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Blackpool Central Mosque",
    "address": "2 Revoe Street, Blackpool, FY1 5HN",
    "latitude": "53.8083489",
    "longitude": "-3.0449865",
    "city": "Blackpool",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Faisal al-Madinah",
    "address": "Milton Road, Westcliff-on-Sea, SS0 7JP",
    "latitude": "51.539379",
    "longitude": "0.7006434",
    "city": "Westcliff-on-Sea",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jaffria Islamic Centre",
    "address": "Jaffria Islamic Centre",
    "latitude": "53.4578087",
    "longitude": "-2.23369",
    "city": "Jaffria",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Kingswood Masjid",
    "address": "Moravian Road, Bristol, BS15 8LR",
    "latitude": "51.4618237",
    "longitude": "-2.5074679",
    "city": "Bristol",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madressa Islamia Mosque",
    "address": "Madressa Islamia Mosque",
    "latitude": "53.7839034",
    "longitude": "-2.4066493",
    "city": "Madressa",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ghousia Masjid mosque",
    "address": "Ghousia Masjid mosque",
    "latitude": "53.7856942",
    "longitude": "-2.3986293",
    "city": "Ghousia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Fountain of Knowledge Islamic Centre",
    "address": "394 Ladypool Road, Birmingham, B12 8JZ",
    "latitude": "52.4526751",
    "longitude": "-1.8781306",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Thornaby Mosque",
    "address": "Thornaby Mosque",
    "latitude": "54.5529201",
    "longitude": "-1.2987553",
    "city": "Thornaby",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bath Islamic Centre and Mosque",
    "address": "8 Pierrepont Street, BA1 1LA",
    "latitude": "51.3800009",
    "longitude": "-2.3573317",
    "city": "Bath",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sarajia Islamic Center",
    "address": "5 Whitburn Road, Bathgate",
    "latitude": "55.9006658",
    "longitude": "-3.6421959",
    "city": "Bathgate",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Manarat Foundation",
    "address": "155 New Coventry Road, Birmingham, B26 3DX",
    "latitude": "52.4539633",
    "longitude": "-1.7922472",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamie Mosque & Islamic Society of Darlington",
    "address": "25-26 North Lodge Terrace, Darlington, DL3 6LY",
    "latitude": "54.5297414",
    "longitude": "-1.5565794",
    "city": "Darlington",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Mosque",
    "address": "WS1 2JN",
    "latitude": "52.5832348",
    "longitude": "-1.9704539",
    "city": "Central",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dawatal Islam Mosque",
    "address": "Dawatal Islam Mosque",
    "latitude": "53.7135371",
    "longitude": "-1.6222729",
    "city": "Dawatal",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Aman Mosque",
    "address": "101 Braintree Street, London, E2 0FT",
    "latitude": "51.5250755",
    "longitude": "-0.0527433",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Faizan -e-Mustafa Educational Centre",
    "address": "Faizan -e-Mustafa Educational Centre",
    "latitude": "52.4562063",
    "longitude": "-1.8581574",
    "city": "Faizan",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Eccles and Salford Islamic Society",
    "address": "5 Liverpool Road, Eccles",
    "latitude": "53.4830267",
    "longitude": "-2.3452464",
    "city": "Eccles",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Youth Foundation (MYF)",
    "address": "27 Turner Street, Manchester, M4 1DY",
    "latitude": "53.4839831",
    "longitude": "-2.2374421",
    "city": "Manchester",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Somers Town Islamic Cultural and Education Centre",
    "address": "68 Churchway, London, NW1 1LT",
    "latitude": "51.5296019",
    "longitude": "-0.1306907",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Gulshani Baghdad",
    "address": "1-7 Westbourne Road, Bedford, MK40 4LB",
    "latitude": "52.1322479",
    "longitude": "-0.4850555",
    "city": "Bedford",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shahjahal Mosque and Islamic Centre Southampton",
    "address": "Oxford Avenue, Southampton, SO14 0GF",
    "latitude": "50.9104108",
    "longitude": "-1.3992335",
    "city": "Southampton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Chatham Mosque",
    "address": "Chatham Mosque",
    "latitude": "51.3783884",
    "longitude": "0.5357223",
    "city": "Chatham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imam Ali Centre",
    "address": "Imam Ali Centre",
    "latitude": "51.3789084",
    "longitude": "0.5063272",
    "city": "Imam",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Battersea Mosque",
    "address": "75 Falcon Road",
    "latitude": "51.4676248",
    "longitude": "-0.1703216",
    "city": "Battersea",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gulzare Medina Masjid Islamic Welfare Trust",
    "address": "1 Collingdale Road, Northampton, NN3 2TS",
    "latitude": "52.2582958",
    "longitude": "-0.8493383",
    "city": "Northampton",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ezzeitouna",
    "address": "Ezzeitouna",
    "latitude": "51.514035",
    "longitude": "-0.2498237",
    "city": "Ezzeitouna",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Prayer Hall",
    "address": "Islamic Prayer Hall",
    "latitude": "52.3806369",
    "longitude": "-1.561382",
    "city": "Islamic",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque of the Embassy of Qatar",
    "address": "30 Collingham Gardens",
    "latitude": "51.4924531",
    "longitude": "-0.1876873",
    "city": "Mosque",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Faizan E Islam Centre",
    "address": "Faizan E Islam Centre",
    "latitude": "53.4559193",
    "longitude": "-2.2835393",
    "city": "Faizan",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Tooting Islamic Centre",
    "address": "Tooting Islamic Centre",
    "latitude": "51.4317002",
    "longitude": "-0.1626528",
    "city": "Tooting",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Muslim Cultural Centre",
    "address": "11 Albion Terrace, Gravesend, DA12 2SX",
    "latitude": "51.4412642",
    "longitude": "0.3810061",
    "city": "Gravesend",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Abu-Bakr & Islamic Centre",
    "address": "Church Street",
    "latitude": "53.6430078",
    "longitude": "-1.8071282",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Leeds Islamic Centre",
    "address": "46-48 Spencer Place, Leeds, LS7 4BR",
    "latitude": "53.8132335",
    "longitude": "-1.5254897",
    "city": "Leeds",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Jamia Mosque",
    "address": "Central Jamia Mosque",
    "latitude": "53.8040094",
    "longitude": "-1.7669474",
    "city": "Central",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jam-E-Masjid-Bilal",
    "address": "Jam-E-Masjid-Bilal",
    "latitude": "53.6358478",
    "longitude": "-1.8025952",
    "city": "Jam-E-Masjid-Bilal",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Green Room",
    "address": "The Green Room",
    "latitude": "53.8040001",
    "longitude": "-1.55311",
    "city": "The",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Khizra mosque",
    "address": "Khizra mosque",
    "latitude": "53.5054187",
    "longitude": "-2.2372419",
    "city": "Khizra",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque",
    "address": "Jamia Mosque",
    "latitude": "53.5105547",
    "longitude": "-2.2431964",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Wycombe Mosque",
    "address": "Wycombe Mosque",
    "latitude": "51.6334042",
    "longitude": "-0.7669462",
    "city": "Wycombe",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Prayer Room",
    "address": "Muslim Prayer Room",
    "latitude": "50.9350389",
    "longitude": "-1.3979643",
    "city": "Muslim",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Prayer Room",
    "address": "Prayer Room",
    "latitude": "53.4025917",
    "longitude": "-2.9638314",
    "city": "Prayer",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Limehouse Mosque",
    "address": "304-306 Stocks Place, London, E14 8AE",
    "latitude": "51.5101456",
    "longitude": "-0.0282755",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shah Jalal Masjiid",
    "address": "A'court Street, Nottingham, NG7 5AH",
    "latitude": "52.963045",
    "longitude": "-1.1700746",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bilal Masjid Trust (Greenford)",
    "address": "82-84 Horsenden Lane North",
    "latitude": "51.5504229",
    "longitude": "-0.3310905",
    "city": "Bilal",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madina Tul Quran",
    "address": "Madina Tul Quran",
    "latitude": "52.9995428",
    "longitude": "-2.1886081",
    "city": "Madina",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bangladesh Islamic Education Centre",
    "address": "57 Cowley Road, OX4 1HR",
    "latitude": "51.7491161",
    "longitude": "-1.2411798",
    "city": "Bangladesh",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Prayer Room",
    "address": "17 Middlegate, CA11 7PG",
    "latitude": "54.6652322",
    "longitude": "-2.754161",
    "city": "Islamic",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Brixton Hill Islamic Centre",
    "address": "Brixton Hill Islamic Centre",
    "latitude": "51.4487467",
    "longitude": "-0.1240323",
    "city": "Brixton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Wycombe Islamic Society",
    "address": "Wycombe Islamic Society",
    "latitude": "51.6303575",
    "longitude": "-0.7362595",
    "city": "Wycombe",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darus-salam",
    "address": "Darus-salam",
    "latitude": "53.4519437",
    "longitude": "-2.1965445",
    "city": "Darus-salam",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Boston Mosque & Islamic Centre",
    "address": "Boston Mosque & Islamic Centre",
    "latitude": "52.9846688",
    "longitude": "-0.0187808",
    "city": "Boston",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamiat-ul-Muslimin",
    "address": "28 Tennyson Road, Birmingham",
    "latitude": "52.464953",
    "longitude": "-1.8507167",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Lincoln Green Mosque",
    "address": "Cherry Row, Leeds, LS9 7LY",
    "latitude": "53.8044817",
    "longitude": "-1.5282348",
    "city": "Leeds",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Chelmsford Mosque",
    "address": "13a Moulsham Street, Chelmsford, CM2 0HU",
    "latitude": "51.7306481",
    "longitude": "0.4740415",
    "city": "Chelmsford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Manchester Islamic Centre",
    "address": "Manchester Islamic Centre",
    "latitude": "53.499323",
    "longitude": "-2.1731363",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Peckham High Street Islamic Centre",
    "address": "Peckham High Street Islamic Centre",
    "latitude": "51.4737541",
    "longitude": "-0.0677412",
    "city": "Peckham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Furqan Mosque",
    "address": "19 Carrington Street, Glasgow, G4 9AJ",
    "latitude": "55.8714691",
    "longitude": "-4.2718878",
    "city": "Glasgow",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North Brixton Islamic Cultural Centre",
    "address": "North Brixton Islamic Cultural Centre",
    "latitude": "51.4739674",
    "longitude": "-0.1130421",
    "city": "North",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The UK Islamic Mission Southend Mosque",
    "address": "The UK Islamic Mission Southend Mosque",
    "latitude": "51.5466569",
    "longitude": "0.6998299",
    "city": "The",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Coventry Cross Mosque",
    "address": "6 Empson Street, London, E3 3LJ",
    "latitude": "51.5228703",
    "longitude": "-0.0146564",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Nehar Mosque & Education Centre",
    "address": "70 Caledonian Road, London, N1 9DN",
    "latitude": "51.5326528",
    "longitude": "-0.1195678",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid",
    "address": "68 Derby Road, Nottingham, NG10 4QP",
    "latitude": "52.9010573",
    "longitude": "-1.2772349",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gulzar e Madina",
    "address": "Melbourne Road, Leicester, LE2 0GU",
    "latitude": "52.6341318",
    "longitude": "-1.1133074",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Centre Upton Park",
    "address": "72-74 Selwyn Road, London, E13 0PY",
    "latitude": "51.5338647",
    "longitude": "0.0245228",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Karimia Masjid & Institute",
    "address": "141-143 Berridge Road, Nottingham, NG7 6HR",
    "latitude": "52.97002",
    "longitude": "-1.1662228",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Spiritual Centre Maddrassa Naqshbandiyya Nawabiyya Aslamiyya Birmingham",
    "address": "Spiritual Centre Maddrassa Naqshbandiyya Nawabiyya Aslamiyya Birmingham",
    "latitude": "52.4767037",
    "longitude": "-1.8572922",
    "city": "Spiritual",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Maktaba Tul Madina Dawat-E-Islami",
    "address": "Maktaba Tul Madina Dawat-E-Islami",
    "latitude": "52.47892",
    "longitude": "-1.8563214",
    "city": "Maktaba",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madani",
    "address": "77 Evington Valley Road, Leicester, LE5 5LL",
    "latitude": "52.6278525",
    "longitude": "-1.0987708",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Fatima Zahra",
    "address": "72-74 Osmaston Road, Leicester, LE5 5JL",
    "latitude": "52.6266319",
    "longitude": "-1.1070179",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Sultania",
    "address": "56-58 Thurgarton Street, Nottingham, NG2 4AG",
    "latitude": "52.9511813",
    "longitude": "-1.1255024",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markazi Jamia Masjid Riza Islamic Centre",
    "address": "Markazi Jamia Masjid Riza Islamic Centre",
    "latitude": "53.6591761",
    "longitude": "-1.7862765",
    "city": "Markazi",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al Furqan",
    "address": "Masjid al Furqan",
    "latitude": "53.0597278",
    "longitude": "-2.2115441",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Taqwah Mosque",
    "address": "Princes Court, Southampton",
    "latitude": "50.9112572",
    "longitude": "-1.3872852",
    "city": "Southampton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Prayer Room",
    "address": "Nottingham, NG5 1PB",
    "latitude": "52.9898272",
    "longitude": "-1.1559491",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Prayer Room",
    "address": "Nottingham, NG5 1PB",
    "latitude": "52.9898143",
    "longitude": "-1.1560296",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Raza Mosque",
    "address": "71 Blades Street, Lancaster, LA1 1TS",
    "latitude": "54.0454798",
    "longitude": "-2.8053063",
    "city": "Lancaster",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Newcastle Tawheed Islamic Centre",
    "address": "77 Bentinck Road, Newcastle upon Tyne, NE4 6UX",
    "latitude": "54.970153",
    "longitude": "-1.6453997",
    "city": "Newcastle upon Tyne",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madrassa-tul-Madina Aston",
    "address": "284 Witton Road, Birmingham, B6 6NU",
    "latitude": "52.5090738",
    "longitude": "-1.890951",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hazrath Shahjahal Jamie Masjid",
    "address": "95 Manor Road, Milton Keynes, MK2 2GT",
    "latitude": "51.9893484",
    "longitude": "-0.7216604",
    "city": "Milton Keynes",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Makkah Masjid Mitcham",
    "address": "Makkah Masjid Mitcham",
    "latitude": "51.4074854",
    "longitude": "-0.1641168",
    "city": "Makkah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Madina Mitcham Islamic Centre",
    "address": "Al-Madina Mitcham Islamic Centre",
    "latitude": "51.416716",
    "longitude": "-0.151788",
    "city": "Al-Madina",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Muzzamil Mosque",
    "address": "Al Muzzamil Mosque",
    "latitude": "51.4302527",
    "longitude": "-0.1676225",
    "city": "Al",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Hidayah",
    "address": "22-36 Whalley Street, Blackburn, BB1 7NB",
    "latitude": "53.7550858",
    "longitude": "-2.4806485",
    "city": "Blackburn",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-al-Momineen",
    "address": "Masjid-al-Momineen",
    "latitude": "53.7573243",
    "longitude": "-2.4690479",
    "city": "Masjid-al-Momineen",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Minhaj-ul-Qur'an Central Mosque",
    "address": "Minhaj-ul-Qur'an Central Mosque",
    "latitude": "53.4523886",
    "longitude": "-2.2580139",
    "city": "Minhaj-ul-Qur'an",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Kettering Muslim Association",
    "address": "123 Headlands, Kettering, NN15 6AD",
    "latitude": "52.3885249",
    "longitude": "-0.7274642",
    "city": "Kettering",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Laud Worship Rooms",
    "address": "Laud Worship Rooms",
    "latitude": "51.2792236",
    "longitude": "1.0900097",
    "city": "Laud",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mevlana Rumi",
    "address": "337 Fore Street, London, N9 0NU",
    "latitude": "51.6206823",
    "longitude": "-0.0623249",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Chesterfield Muslim Association",
    "address": "Chesterfield Muslim Association",
    "latitude": "53.2397338",
    "longitude": "-1.4283669",
    "city": "Chesterfield",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Oxford University Islamic Society Prayer Room",
    "address": "Oxford University Islamic Society Prayer Room",
    "latitude": "51.7589725",
    "longitude": "-1.2560206",
    "city": "Oxford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gatwick Muslim Centre",
    "address": "Gatwick Muslim Centre",
    "latitude": "51.1732336",
    "longitude": "-0.1611853",
    "city": "Gatwick",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Northampton Central Mosque",
    "address": "112-116 Abington Avenue, Northampton, NN1 4PD",
    "latitude": "52.2475787",
    "longitude": "-0.8770168",
    "city": "Northampton",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Cranfield University Mosque",
    "address": "Wharley End, Cranfield",
    "latitude": "52.0743805",
    "longitude": "-0.6270766",
    "city": "Cranfield",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al Quba",
    "address": "19 Brunswick Street, Leicester, LE1 2LP",
    "latitude": "52.6386906",
    "longitude": "-1.1216685",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Salahuddin",
    "address": "9 Upper George Street, Leicester, LE1 3LQ",
    "latitude": "52.6410439",
    "longitude": "-1.1270419",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Beaumont Leys Muslims",
    "address": "LE4 0SA",
    "latitude": "52.6615781",
    "longitude": "-1.1523813",
    "city": "Beaumont",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "World Muslim League (London office)",
    "address": "46 Goodge Street, London, W1T 4LU",
    "latitude": "51.5194617",
    "longitude": "-0.1359108",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid e Sajedeen",
    "address": "Plane Tree Road, Blackburn, BB1 6LS",
    "latitude": "53.7584123",
    "longitude": "-2.4677028",
    "city": "Blackburn",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hackney Central Masjid",
    "address": "237 Well Street, London, E9 6RG",
    "latitude": "51.5443148",
    "longitude": "-0.0469229",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hoxton Islah",
    "address": "71 Pitfield Street, London, N1 6BT",
    "latitude": "51.5294969",
    "longitude": "-0.0836774",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Education Centre",
    "address": "Muslim Education Centre",
    "latitude": "51.6378911",
    "longitude": "-0.7288836",
    "city": "Muslim",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Cultural Centre Neasden",
    "address": "259 Neasden Lane, London",
    "latitude": "51.5595705",
    "longitude": "-0.2504888",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "UKIM Iqra Centre Leeds",
    "address": "UKIM Iqra Centre Leeds",
    "latitude": "53.8357937",
    "longitude": "-1.549838",
    "city": "UKIM",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Noor",
    "address": "74-76 Glentworth Road, Nottingham, NG7 5QA",
    "latitude": "52.9625403",
    "longitude": "-1.1798459",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "South Bedford Islamic Centre",
    "address": "5 Elstow Road, Bedford, MK42 9NU",
    "latitude": "52.1238424",
    "longitude": "-0.4656208",
    "city": "Bedford",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Prayer Room",
    "address": "Islamic Prayer Room",
    "latitude": "51.2430107",
    "longitude": "-0.5887526",
    "city": "Islamic",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Usman-e-Ghani",
    "address": "16 Northcote Street, Stockton-on-Tees, TS18 3JQ",
    "latitude": "54.5579994",
    "longitude": "-1.319505",
    "city": "Stockton-on-Tees",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madrassa At Tawhad",
    "address": "Madrassa At Tawhad",
    "latitude": "52.470936",
    "longitude": "-1.8456441",
    "city": "Madrassa",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Jamme Mosque (Reading)",
    "address": "18a Waylen Street, Reading, RG1 7UP",
    "latitude": "51.4542594",
    "longitude": "-0.9815589",
    "city": "Reading",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sultan Bahu Centre",
    "address": "Sultan Bahu Centre",
    "latitude": "52.4920688",
    "longitude": "-1.8227045",
    "city": "Sultan",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madani",
    "address": "Arnold Street",
    "latitude": "52.6399959",
    "longitude": "-1.1203802",
    "city": "Madani",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darul Arqam",
    "address": "Thurmaston Lane, LE5 0TE",
    "latitude": "52.6483645",
    "longitude": "-1.0813836",
    "city": "Darul",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "DMU Prayer room",
    "address": "DMU Prayer room",
    "latitude": "52.6305131",
    "longitude": "-1.1405991",
    "city": "DMU",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Knighton Education Centre",
    "address": "355 Welford Road",
    "latitude": "52.6127089",
    "longitude": "-1.1244842",
    "city": "Knighton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muhaddith e Azam Community Centre",
    "address": "Prestwold Road, LE5 0EZ",
    "latitude": "52.6446067",
    "longitude": "-1.1076951",
    "city": "Muhaddith",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Jalal Masjid",
    "address": "Al-Jalal Masjid",
    "latitude": "51.8957249",
    "longitude": "-0.4322675",
    "city": "Al-Jalal",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Abraar Jami Masjir",
    "address": "Baitul Abraar Jami Masjir",
    "latitude": "51.8949031",
    "longitude": "-0.4384325",
    "city": "Baitul",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North Tyneside Bangladeshi Community Association & Mosque",
    "address": "6",
    "latitude": "55.0426434",
    "longitude": "-1.4408736",
    "city": "North",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Hudaa Islamic Prayer Group",
    "address": "150 Homerton High Street",
    "latitude": "51.5479731",
    "longitude": "-0.0442198",
    "city": "Al-Hudaa",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "University of Sussex Mosque",
    "address": "University of Sussex Mosque",
    "latitude": "50.8647235",
    "longitude": "-0.0884751",
    "city": "University",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bow Central Mosque",
    "address": "246 Bow Road, London, E3 3AP",
    "latitude": "51.529195",
    "longitude": "-0.0145175",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "White City Musalla",
    "address": "95 Bloemfontein Road",
    "latitude": "51.5121249",
    "longitude": "-0.234702",
    "city": "White",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Almukhbiteen",
    "address": "356-358 Uxbridge Road",
    "latitude": "51.5065991",
    "longitude": "-0.2339036",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Taj Daar e Madina",
    "address": "Taj Daar e Madina",
    "latitude": "51.4260572",
    "longitude": "-0.1653906",
    "city": "Taj",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "IQRA Community Centre",
    "address": "276 Corporation Road, Newport, NP19 0DZ",
    "latitude": "51.5846466",
    "longitude": "-2.9781088",
    "city": "Newport",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "As Sabr",
    "address": "As Sabr",
    "latitude": "51.5175268",
    "longitude": "-0.0392735",
    "city": "As",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ilyas",
    "address": "Masjid Ilyas",
    "latitude": "51.5290704",
    "longitude": "0.0029368",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Madani Masjid",
    "address": "1 Whittle Parkway, Slough, SL1 6FE",
    "latitude": "51.5218398",
    "longitude": "-0.6503894",
    "city": "Slough",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shahjal Mosque",
    "address": "Shahjal Mosque",
    "latitude": "54.9712449",
    "longitude": "-1.6384053",
    "city": "Shahjal",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Alevi Cultural Centre",
    "address": "48 Clarence Place, Newport, NP19 0AG",
    "latitude": "51.5910757",
    "longitude": "-2.9901221",
    "city": "Newport",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Newport Central Jam'e Masjid",
    "address": "63 Stow Hill, Newport, NP20 4DX",
    "latitude": "51.5848926",
    "longitude": "-2.9969069",
    "city": "Newport",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Stockport Islamic Centre",
    "address": "2a Longshut Lane West, Stockport, SK2 6RX",
    "latitude": "53.4012093",
    "longitude": "-2.1573795",
    "city": "Stockport",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Salafi Masjid",
    "address": "394-396 Wright Street, B10 9SP",
    "latitude": "52.4703405",
    "longitude": "-1.8583834",
    "city": "Salafi",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid",
    "address": "183-186 Commercial Road, Newport, NP20 2PP",
    "latitude": "51.5824435",
    "longitude": "-2.9919157",
    "city": "Newport",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Said Nursi Camii",
    "address": "Said Nursi Camii",
    "latitude": "51.6051113",
    "longitude": "-0.0542316",
    "city": "Said",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Murtaza Trust",
    "address": "12 Honey Street, Manchester, M8 8RG",
    "latitude": "53.4929654",
    "longitude": "-2.2359728",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bedford Al Falaah Islamic Centre",
    "address": "43 Brereton Road, Bedford",
    "latitude": "52.1363181",
    "longitude": "-0.4734689",
    "city": "Bedford",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bangladesh Islamic Mission & Jamee Mosjid",
    "address": "65 Commercial Road, Bedford, MK40 1QS",
    "latitude": "52.1341993",
    "longitude": "-0.4736781",
    "city": "Bedford",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markaz Dar-ul-ehsan Manchester",
    "address": "21-23 Broughton Street, Manchester, M8 8LZ",
    "latitude": "53.4959493",
    "longitude": "-2.241423",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Manchester Islamic Centre",
    "address": "5 Sidney Street, Manchester, M1 7HB",
    "latitude": "53.4711527",
    "longitude": "-2.2371229",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Albirr",
    "address": "Masjid Albirr",
    "latitude": "52.2858415",
    "longitude": "-1.5292415",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal",
    "address": "Masjid Bilal",
    "latitude": "51.9032098",
    "longitude": "-0.4537413",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madinah Masjid",
    "address": "128/130 Oak Road, Luton",
    "latitude": "51.8844559",
    "longitude": "-0.4333538",
    "city": "Luton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Luton Turkish Community Centre",
    "address": "58 Dumfries Street, Luton",
    "latitude": "51.8766383",
    "longitude": "-0.4208976",
    "city": "Luton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Prayer Room",
    "address": "Muslim Prayer Room",
    "latitude": "51.4262508",
    "longitude": "-0.5690612",
    "city": "Muslim",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid & Imambargah Shuhdae Karbala",
    "address": "383 Barking Road, London, E13 8AL",
    "latitude": "51.52279",
    "longitude": "0.0234644",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darul Arqam Muslim Community Centre",
    "address": "17 Jutland Road, London",
    "latitude": "51.5211326",
    "longitude": "0.022508",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Bilal & Islamic Centre",
    "address": "295-297 Barking Road, London, E6 1LB",
    "latitude": "51.5326908",
    "longitude": "0.0513182",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid",
    "address": "Barking Road, London",
    "latitude": "51.5310865",
    "longitude": "0.0438006",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Newark Islamic Centre",
    "address": "83-85 Appleton Gate, Newark, NG24 1LP",
    "latitude": "53.0817915",
    "longitude": "-0.80083",
    "city": "Newark",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Inverness Masjid",
    "address": "Portland Place, Inverness",
    "latitude": "57.483357",
    "longitude": "-4.2306811",
    "city": "Inverness",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "European Islamic Centre & Mosque",
    "address": "79 Manchester Road, Oldham, OL8 4LN",
    "latitude": "53.5282637",
    "longitude": "-2.1348267",
    "city": "Oldham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gosforth Prayer Hall",
    "address": "Christon Road, Newcastle upon Tyne, NE3 1XD",
    "latitude": "55.0097822",
    "longitude": "-1.6146126",
    "city": "Newcastle upon Tyne",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ely Islamic Centre",
    "address": "34 Broad Street, Ely, CB7 4AH",
    "latitude": "52.3968067",
    "longitude": "0.26741",
    "city": "Ely",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitun Noor Mosque",
    "address": "327 Martindale Road, Hounslow, TW4 7HG",
    "latitude": "51.4644185",
    "longitude": "-0.3850911",
    "city": "Hounslow",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Globe Town Mosque",
    "address": "Globe Town Mosque",
    "latitude": "51.5286295",
    "longitude": "-0.0482806",
    "city": "Globe",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Arrahman ManchesterIslamic Cultural Association",
    "address": "Arrahman ManchesterIslamic Cultural Association",
    "latitude": "53.4543677",
    "longitude": "-2.2485079",
    "city": "Arrahman",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Old Kent Road Mosque & Islamic Cultural Centre",
    "address": "365 Old Kent Road, London, SE1 5JH",
    "latitude": "51.4860719",
    "longitude": "-0.072297",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Prayer Room",
    "address": "Muslim Prayer Room",
    "latitude": "55.9107186",
    "longitude": "-3.3223449",
    "city": "Muslim",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Farley Hill Jame Masjid",
    "address": "31 The Crossway, Luton, LU1 5LY",
    "latitude": "51.8712128",
    "longitude": "-0.4289488",
    "city": "Luton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Lambeth Masjid Progressive Community Centre",
    "address": "194 Coldharbour Lane, London",
    "latitude": "51.4665109",
    "longitude": "-0.101125",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hendon Mosque & Islamic Centre",
    "address": "Brent view road",
    "latitude": "51.5776887",
    "longitude": "-0.2390867",
    "city": "Hendon",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Chadwell Heath Muslim Centre",
    "address": "Chadwell Heath Muslim Centre",
    "latitude": "51.569595",
    "longitude": "0.1245009",
    "city": "Chadwell",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "East Newport Islamic Cultural Centre",
    "address": "12 Cedar Road, Newport, NP19 0BA",
    "latitude": "51.5900485",
    "longitude": "-2.9874602",
    "city": "Newport",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "SIEA Highlands Mosque",
    "address": "Cranmore Avenue, Solihull, B90 4LE",
    "latitude": "52.3990327",
    "longitude": "-1.8064214",
    "city": "Solihull",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Prayer Room",
    "address": "Prayer Room",
    "latitude": "52.951771",
    "longitude": "-1.1854388",
    "city": "Prayer",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Prayer Room",
    "address": "Prayer Room",
    "latitude": "52.9516525",
    "longitude": "-1.1854357",
    "city": "Prayer",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Cavendish Prayer Rooms",
    "address": "Cavendish Street, Manchester, M15 6BG",
    "latitude": "53.4695658",
    "longitude": "-2.2394377",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Limehouse Bangladeshi Cultural Centre",
    "address": "304 Stocks Place, London, E14 8AE",
    "latitude": "51.510194",
    "longitude": "-0.0284004",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hough End Hall Academy",
    "address": "Hough End Hall Academy",
    "latitude": "53.4357525",
    "longitude": "-2.2651151",
    "city": "Hough",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Razvia Masjid",
    "address": "Razvia Masjid",
    "latitude": "50.9094043",
    "longitude": "-1.3991837",
    "city": "Razvia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abu Bakar Mosque",
    "address": "71 Ardwick Green North, Manchester, M12 6FX",
    "latitude": "53.4715148",
    "longitude": "-2.2226191",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Al-Islam Foundation",
    "address": "2A Higher Ardwick, Manchester, M12 6BZ",
    "latitude": "53.4708601",
    "longitude": "-2.2216908",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shah Jalal Mosque",
    "address": "Ralph Road",
    "latitude": "52.4899538",
    "longitude": "-1.8556099",
    "city": "Shah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Westwood Mosque",
    "address": "Neville Street, Oldham, OL9 6LD",
    "latitude": "53.5439801",
    "longitude": "-2.1330945",
    "city": "Oldham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Zia Ul Quran Centre",
    "address": "257 Kenmure Street, Glasgow",
    "latitude": "55.8393653",
    "longitude": "-4.2736727",
    "city": "Glasgow",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markaz Al-Takwa",
    "address": "Markaz Al-Takwa",
    "latitude": "53.4613195",
    "longitude": "-2.2135976",
    "city": "Markaz",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Quba Masjid",
    "address": "Nimes Street, Preston",
    "latitude": "53.7620824",
    "longitude": "-2.6759518",
    "city": "Preston",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shahjalal Mosque",
    "address": "8a Annandale Street Lane",
    "latitude": "55.9603093",
    "longitude": "-3.183322",
    "city": "Shahjalal",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Iqraa Ethiopian Muslim Centre",
    "address": "60 Craven Park Road, London, NW10 4AE",
    "latitude": "51.539183",
    "longitude": "-0.2508046",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Newport Diyanet Education Community Centre",
    "address": "48 Alexandra Road, Newport, NP20 2JE",
    "latitude": "51.5728166",
    "longitude": "-2.9904623",
    "city": "Newport",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dartford Masjid",
    "address": "Dartford Masjid",
    "latitude": "51.4465507",
    "longitude": "0.2157251",
    "city": "Dartford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Raza Jamia Masjid",
    "address": "39-41 Lower Antley Street, Accrington, BB5 0BA",
    "latitude": "53.7518416",
    "longitude": "-2.3795861",
    "city": "Accrington",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Tauheedul Islam",
    "address": "31 Bicknell Street, Blackburn, BB1 7EY",
    "latitude": "53.7532657",
    "longitude": "-2.4854556",
    "city": "Blackburn",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Makki Masjid",
    "address": "89 Wimberley Street, Blackburn, BB1 7LE",
    "latitude": "53.7550736",
    "longitude": "-2.4839777",
    "city": "Blackburn",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dawat-e-Islami Faizan-e-Madina",
    "address": "51-52 Hereford Street, Newport, NP19 8DT",
    "latitude": "51.5908257",
    "longitude": "-2.9833863",
    "city": "Newport",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Niddrie Masjid",
    "address": "63 Niddrie Mains Terrace, Edinburgh, EH16 4NX",
    "latitude": "55.9359209",
    "longitude": "-3.1299256",
    "city": "Edinburgh",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Portobello Mosque",
    "address": "3 Fishwives Causeway, Edinburgh, EH15 1DH",
    "latitude": "55.9552088",
    "longitude": "-3.1192155",
    "city": "Edinburgh",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Perth Mosque",
    "address": "37 St Catherine's Road, Perth, PH1 5YA",
    "latitude": "56.399751",
    "longitude": "-3.4411186",
    "city": "Perth",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baytul Ihsaan",
    "address": "202 Sandhills Avenue, Leicester, LE5 1PL",
    "latitude": "52.6601305",
    "longitude": "-1.0671741",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hamilton hub",
    "address": "Hamilton hub",
    "latitude": "52.6535435",
    "longitude": "-1.0678742",
    "city": "Hamilton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jaima Ala Abba Community Center",
    "address": "Probert Place, Newport, NP19 8EZ",
    "latitude": "51.5896762",
    "longitude": "-2.9798072",
    "city": "Newport",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Borders Islamic Society",
    "address": "6A Roxburgh Street, Galashiels, TD1 1PB",
    "latitude": "55.6186982",
    "longitude": "-2.8128772",
    "city": "Galashiels",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Skegness Mosque",
    "address": "44 Roman Bank, Skegness, PE25 2SP",
    "latitude": "53.1470619",
    "longitude": "0.338624",
    "city": "Skegness",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Indonesian Islamic Centre",
    "address": "Indonesian Islamic Centre",
    "latitude": "51.5578327",
    "longitude": "-0.2469312",
    "city": "Indonesian",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Epsom & Ewell Islamic Society",
    "address": "113 Hook Road, Epsom",
    "latitude": "51.3388336",
    "longitude": "-0.266812",
    "city": "Epsom",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Prayer Rooms",
    "address": "Muslim Prayer Rooms",
    "latitude": "56.4569199",
    "longitude": "-2.9808531",
    "city": "Muslim",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "London Central Mosque",
    "address": "London, NW8 7RG",
    "latitude": "51.5289777",
    "longitude": "-0.165071",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hounslow Jamia Masjid & Islamic Centre",
    "address": "367 Wellington Road South, London Borough of Hounslow, TW4 5HU",
    "latitude": "51.45919",
    "longitude": "-0.374936",
    "city": "London Borough of Hounslow",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Feltham Masjid",
    "address": "Feltham Masjid",
    "latitude": "51.4430645",
    "longitude": "-0.4141668",
    "city": "Feltham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Anjuman-e-Zinatul Islam",
    "address": "Anjuman-e-Zinatul Islam",
    "latitude": "53.7094054",
    "longitude": "-1.6321036",
    "city": "Anjuman-e-Zinatul",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitur Raheem Mosque",
    "address": "Sanatorium Road, Cardiff, CF11 8DG",
    "latitude": "51.4794421",
    "longitude": "-3.2137235",
    "city": "Cardiff",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Leytonstone Mosque",
    "address": "9 Dacre Road, London, E11 3AG",
    "latitude": "51.568253",
    "longitude": "0.0128357",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Edinburgh Central Mosque",
    "address": "50 Potterrow, Edinburgh, EH8 9BT",
    "latitude": "55.9450099",
    "longitude": "-3.1858397",
    "city": "Edinburgh",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Futuh Mosque",
    "address": "181 London Road, Morden, SM4 5PT",
    "latitude": "51.3967071",
    "longitude": "-0.1992764",
    "city": "Morden",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Centre of England",
    "address": "Islamic Centre of England",
    "latitude": "51.5354273",
    "longitude": "-0.1889909",
    "city": "Islamic",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nottingham Islamic Centre",
    "address": "3 Curzon Street, Nottingham, NG3 1DG",
    "latitude": "52.9576091",
    "longitude": "-1.1427438",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Peckham Islamic Centre",
    "address": "12 London",
    "latitude": "51.4673952",
    "longitude": "-0.0696106",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Zainabiya Islamic Centre",
    "address": "Peverel Drive, Milton Keynes, MK1 1NW",
    "latitude": "52.0114567",
    "longitude": "-0.7430387",
    "city": "Milton Keynes",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Husseini mosque",
    "address": "Husseini mosque",
    "latitude": "51.5426645",
    "longitude": "-0.3639706",
    "city": "Husseini",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Maidenhead Central Mosque",
    "address": "Maidenhead Central Mosque",
    "latitude": "51.5255167",
    "longitude": "-0.7168128",
    "city": "Maidenhead",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sittingbourne Islamic Cultural Centre",
    "address": "Sittingbourne Islamic Cultural Centre",
    "latitude": "51.3419066",
    "longitude": "0.7288394",
    "city": "Sittingbourne",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jame Masjid",
    "address": "2 Trinity Road, Birmingham, B6 6AG",
    "latitude": "52.5083532",
    "longitude": "-1.9029239",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Holborn Muslim Community & Welfare Association",
    "address": "33 Brookes Court, London",
    "latitude": "51.5193173",
    "longitude": "-0.1114336",
    "city": "London",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque Derby",
    "address": "6 Rose Hill Street, Derby, DE23 8GA",
    "latitude": "52.9101043",
    "longitude": "-1.4764435",
    "city": "Derby",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Farooq",
    "address": "Mill Hill Lane, Derby, DE23 6SB",
    "latitude": "52.9137415",
    "longitude": "-1.4805647",
    "city": "Derby",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Centre Derby",
    "address": "Wilmot Street, Derby, DE1 2JR",
    "latitude": "52.9172401",
    "longitude": "-1.4763066",
    "city": "Derby",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Anware Madina Mosque",
    "address": "Craingshill Road, Livingston, EH54 5DT",
    "latitude": "55.9018082",
    "longitude": "-3.4986369",
    "city": "Livingston",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Finsbury Park Mosque",
    "address": "7-11 Saint Thomas's Road, London, N4 2QH",
    "latitude": "51.5635752",
    "longitude": "-0.1056431",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Salaam",
    "address": "Corden Street, Derby, DE23 8GN",
    "latitude": "52.9078945",
    "longitude": "-1.4782966",
    "city": "Derby",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Zia-E-Medina",
    "address": "153 Walsall Road, Sandwell, WS10 9SW",
    "latitude": "52.5694878",
    "longitude": "-2.025306",
    "city": "Sandwell",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ghamkol Sharif",
    "address": "Ghamkol Sharif",
    "latitude": "52.4649278",
    "longitude": "-1.858464",
    "city": "Ghamkol",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madina Masjid",
    "address": "2a Lea Bridge Road, London, E5 9QD",
    "latitude": "51.5582227",
    "longitude": "-0.0547024",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Derby Jamia Mosque",
    "address": "Village Street, Derby, DE23 8DE",
    "latitude": "52.899026",
    "longitude": "-1.4859374",
    "city": "Derby",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dorking Mosque",
    "address": "Dorking Mosque",
    "latitude": "51.233993",
    "longitude": "-0.3298314",
    "city": "Dorking",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Birmingham Central Mosque",
    "address": "180 Belgrave Middleway, Birmingham, B12 0XS",
    "latitude": "52.4645947",
    "longitude": "-1.8905789",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Telford Central Mosque",
    "address": "Telford Central Mosque",
    "latitude": "52.6987252",
    "longitude": "-2.5171607",
    "city": "Telford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque and Islamic Centre of Brent",
    "address": "Mosque and Islamic Centre of Brent",
    "latitude": "51.5556712",
    "longitude": "-0.2164802",
    "city": "Mosque",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sheppey Islamic Cultural Centre",
    "address": "14-16 Minster Road, Minster-on-Sea, ME12 3JF",
    "latitude": "51.4224014",
    "longitude": "0.7780839",
    "city": "Minster-on-Sea",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Ghausia & Community Centre",
    "address": "15 Birchills Street, Walsall, WS2 8NF",
    "latitude": "52.5873972",
    "longitude": "-1.991111",
    "city": "Walsall",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Meadows Muslim Centre",
    "address": "Collygate Road, Nottingham",
    "latitude": "52.9374039",
    "longitude": "-1.143991",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "UK Albanian Muslim Community & Cultural Centre",
    "address": "88-90 Carlton Vale, London, NW6 5DA",
    "latitude": "51.5327938",
    "longitude": "-0.2012252",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gousul Azzam Mosque",
    "address": "23 North Cross Road",
    "latitude": "51.4573916",
    "longitude": "-0.0726475",
    "city": "Gousul",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Lebanese Welfare Community",
    "address": "14 Brondesbury Road, London, NW6 6AS",
    "latitude": "51.5373675",
    "longitude": "-0.1959203",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamatia Islamic Centre",
    "address": "179-181 Woodlands Road, Birmingham, B11 4ER",
    "latitude": "52.4431247",
    "longitude": "-1.860461",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Hub",
    "address": "5-9 Hermitage Road, Solihull, B91 2LL",
    "latitude": "52.42235",
    "longitude": "-1.7754657",
    "city": "Solihull",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Hamza",
    "address": "90 Church Road, Birmingham, B13 9AE",
    "latitude": "52.449381",
    "longitude": "-1.8828575",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Medina Mosque",
    "address": "Medina Mosque",
    "latitude": "53.3641524",
    "longitude": "-1.4733688",
    "city": "Medina",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Minhaj-ul-Quran",
    "address": "49 Woodwards Road, Walsall, WS2 9RN",
    "latitude": "52.5775021",
    "longitude": "-2.0066002",
    "city": "Walsall",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hazrat Mujaddid Alf-e Sanni",
    "address": "Birmingham, B12 8BG",
    "latitude": "52.4520897",
    "longitude": "-1.8739336",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dover Masjid",
    "address": "6 Park Place, Dover, Kent CT16 1DQ",
    "latitude": "51.1290659",
    "longitude": "1.3093521",
    "city": "Dover",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "IQRA Academy",
    "address": "IQRA Academy",
    "latitude": "55.9301377",
    "longitude": "-3.1678363",
    "city": "IQRA",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Oxford Mosque",
    "address": "Central Oxford Mosque",
    "latitude": "51.7476553",
    "longitude": "-1.230763",
    "city": "Central",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque Amir-e-Millat",
    "address": "Jamia Mosque Amir-e-Millat",
    "latitude": "52.4553925",
    "longitude": "-1.865956",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Foresterhill Mosque",
    "address": "Foresterhill Mosque",
    "latitude": "57.1543202",
    "longitude": "-2.1313961",
    "city": "Foresterhill",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Amanah Masjid",
    "address": "Henley Street, Birmingham, B11 1JB",
    "latitude": "52.4672973",
    "longitude": "-1.8766158",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "New Peckham Mosque",
    "address": "New Peckham Mosque",
    "latitude": "51.4844573",
    "longitude": "-0.0761532",
    "city": "New",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ukim Jamia Masjid",
    "address": "Ukim Jamia Masjid",
    "latitude": "52.4626944",
    "longitude": "-1.8630279",
    "city": "Ukim",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Umar",
    "address": "98 Walford Road, Birmingham, B11 1QA",
    "latitude": "52.4595227",
    "longitude": "-1.8667638",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imam Khoei Islamic Centre",
    "address": "Imam Khoei Islamic Centre",
    "latitude": "51.5394147",
    "longitude": "-0.2098614",
    "city": "Imam",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Mosque of Brent",
    "address": "Central Mosque of Brent",
    "latitude": "51.5498805",
    "longitude": "-0.2238311",
    "city": "Central",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Raza Mosque",
    "address": "Raza Mosque",
    "latitude": "52.5081103",
    "longitude": "-1.880682",
    "city": "Raza",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Students House Masjid",
    "address": "Muslim Students House Masjid",
    "latitude": "52.4572845",
    "longitude": "-1.8862014",
    "city": "Muslim",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Zia ul Quran Jamia Mosque",
    "address": "Zia ul Quran Jamia Mosque",
    "latitude": "52.4849563",
    "longitude": "-1.8545255",
    "city": "Zia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Harrow Road Jamme Mosque",
    "address": "10-12 Lancefield Street, London, W10 4NZ",
    "latitude": "51.5285045",
    "longitude": "-0.2053079",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darul Barkaat Mosque",
    "address": "85 Tilton Road, Birmingham, B9 4PP",
    "latitude": "52.4768291",
    "longitude": "-1.8651293",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamiat Ahl-e-Hadith & Al-Furquan Education Centre",
    "address": "153 Porter Road, Derby, DE23 6RE",
    "latitude": "52.9069272",
    "longitude": "-1.4890913",
    "city": "Derby",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Khalm-e-Nubudwat Educational Centre",
    "address": "St Andrews Street, Birmingham, B9 4JT",
    "latitude": "52.4773369",
    "longitude": "-1.8708427",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bordesley Green Islamic Centre",
    "address": "Bordesley Green Islamic Centre",
    "latitude": "52.4768835",
    "longitude": "-1.8569335",
    "city": "Bordesley",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jami-a-Masjid Idara Minhaj-ul-Quran",
    "address": "14 Naseby Road, Birmingham, B8 3HE",
    "latitude": "52.4887839",
    "longitude": "-1.8455227",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jakia Masjid Naqsbandia Aslamia & Community Centre",
    "address": "Washwood Heath Road, Birmingham, B8 2HF",
    "latitude": "52.4947713",
    "longitude": "-1.8353846",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Derby Jamia Mosque",
    "address": "52-54 Dairy House Road, Derby, DE23 8HL",
    "latitude": "52.9071001",
    "longitude": "-1.4712407",
    "city": "Derby",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Glasgow Central Mosque",
    "address": "Glasgow Central Mosque",
    "latitude": "55.8523055",
    "longitude": "-4.251611",
    "city": "Glasgow",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Leeds Grand Mosque",
    "address": "9 Woodsley Road, Leeds, LS6 1SN",
    "latitude": "53.8064665",
    "longitude": "-1.5681443",
    "city": "Leeds",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Green Lane Masjid",
    "address": "20 Green Lane, Birmingham, B9 5DB",
    "latitude": "52.4731013",
    "longitude": "-1.8641447",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Manchester Central Mosque & Islamic Cultural Centre",
    "address": "Manchester Central Mosque & Islamic Cultural Centre",
    "latitude": "53.4557094",
    "longitude": "-2.2189768",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jami Masjid & Islamic Centre",
    "address": "Jami Masjid & Islamic Centre",
    "latitude": "52.4687756",
    "longitude": "-1.8567479",
    "city": "Jami",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jami Masjid & Islamic Centre",
    "address": "505-527 Coventry Road, Birmingham, B10 0LL",
    "latitude": "52.4683532",
    "longitude": "-1.8560179",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jami Masjid & Islamic Centre Darul Uloom Al-Islamah",
    "address": "505-527 Coventry Road, Birmingham, B10 0LL",
    "latitude": "52.4689226",
    "longitude": "-1.8572074",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Ul Irfan",
    "address": "Dar Ul Irfan",
    "latitude": "52.4763471",
    "longitude": "-1.8575071",
    "city": "Dar",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Mosque Wembley",
    "address": "Central Mosque Wembley",
    "latitude": "51.5503635",
    "longitude": "-0.2978891",
    "city": "Central",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid e Subshamallah",
    "address": "299 Somerville Road, Birmingham, B10 9DT",
    "latitude": "52.4702969",
    "longitude": "-1.8426885",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Tawheed Mosque",
    "address": "179 Braidfauld Street, Glasgow, G32 8PJ",
    "latitude": "55.8417756",
    "longitude": "-4.1777266",
    "city": "Glasgow",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hazrat Shah-e-Walayat Education Centre",
    "address": "101-105 Oldknow Road, Birmingham, B10 0JA",
    "latitude": "52.4638521",
    "longitude": "-1.8486475",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ul Imam Il Bukhari",
    "address": "159 Loughborough Road, Leicester, LE4 5LR",
    "latitude": "52.6578471",
    "longitude": "-1.1217889",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Tendring Deen Education Centre",
    "address": "94 Clacton-on-Sea, CO15 1NJ",
    "latitude": "51.7916257",
    "longitude": "1.1497724",
    "city": "Clacton-on-Sea",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Taqw",
    "address": "147 Kyrwicks Lane, Birmingham, B11 1SS",
    "latitude": "52.4624369",
    "longitude": "-1.8815156",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ayesha",
    "address": "Masjid Ayesha",
    "latitude": "51.5877588",
    "longitude": "-0.0784815",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque Bilal",
    "address": "1 Willows Crescent, Birmingham, B12 9NS",
    "latitude": "52.4556015",
    "longitude": "-1.8960253",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nimab Trust Mosque",
    "address": "Duddeston Mill Road, Birmingham, B7 4QN",
    "latitude": "52.4888869",
    "longitude": "-1.873357",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Aisha Masjid & Islamic Centre",
    "address": "London Road, Reading, RG6 1BW",
    "latitude": "51.4549365",
    "longitude": "-0.9364635",
    "city": "Reading",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-e-Noor",
    "address": "Noor Street, Preston, PR1 1QS",
    "latitude": "53.7654773",
    "longitude": "-2.6946018",
    "city": "Preston",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Raza Masjid",
    "address": "St Paul's Road, Preston, PR1 1UH",
    "latitude": "53.7658631",
    "longitude": "-2.6959783",
    "city": "Preston",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid e Salaam",
    "address": "49 Watling Street Road, Preston, PR2 8EA",
    "latitude": "53.7779299",
    "longitude": "-2.7018724",
    "city": "Preston",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "London Islamic Cultural Society",
    "address": "389 Wightman Road, London, N8 0NA",
    "latitude": "51.5873027",
    "longitude": "-0.10925",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque Noor-ul-Uloom",
    "address": "81-85 St Oswalds Road, Birmingham, B10 9RB",
    "latitude": "52.4699075",
    "longitude": "-1.8507632",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Witton Islamic Centre",
    "address": "Witton Islamic Centre",
    "latitude": "52.5105704",
    "longitude": "-1.8878611",
    "city": "Witton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Wakefield Central Mosque",
    "address": "Wakefield Central Mosque",
    "latitude": "53.6799836",
    "longitude": "-1.4875755",
    "city": "Wakefield",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Sawafia Mosque",
    "address": "Park Hill Lane, Wakefield, WF1 4NJ",
    "latitude": "53.6815045",
    "longitude": "-1.4859963",
    "city": "Wakefield",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Aston Mosque & Community Centre",
    "address": "Aston Mosque & Community Centre",
    "latitude": "52.5029207",
    "longitude": "-1.8878955",
    "city": "Aston",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid E Noor",
    "address": "Masjid E Noor",
    "latitude": "52.501642",
    "longitude": "-1.8856727",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Hijrah Mosque",
    "address": "Al-Hijrah Mosque",
    "latitude": "52.4742071",
    "longitude": "-1.8392704",
    "city": "Al-Hijrah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Qamarul Islam Mosque",
    "address": "Qamarul Islam Mosque",
    "latitude": "52.4717544",
    "longitude": "-1.832314",
    "city": "Qamarul",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shacklewell Lane Mosque",
    "address": "Shacklewell Lane, London",
    "latitude": "51.5510022",
    "longitude": "-0.0740297",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque",
    "address": "Wakefield, WF1 3PD",
    "latitude": "53.6876289",
    "longitude": "-1.4924296",
    "city": "Wakefield",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamme Masjid Reading",
    "address": "46 Alexandra Road, Reading, RG1 5PF",
    "latitude": "51.4482295",
    "longitude": "-0.9522605",
    "city": "Reading",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Elgin Mosque",
    "address": "78 South Street, Elgin, IV30 1JG",
    "latitude": "57.6468723",
    "longitude": "-3.3179197",
    "city": "Elgin",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Hanfia Ghousia",
    "address": "Jamia Masjid Hanfia Ghousia",
    "latitude": "52.1326128",
    "longitude": "-0.483291",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Solihull Central Masjid and Community Centre",
    "address": "1021 Warwick Road, Solihull, B91 3HG",
    "latitude": "52.4089938",
    "longitude": "-1.7613905",
    "city": "Solihull",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Olton Project",
    "address": "Kineton Green Road, Solihull, B92 7DY",
    "latitude": "52.4369878",
    "longitude": "-1.8091518",
    "city": "Solihull",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Imam Ali Centre",
    "address": "85 Mount Stuart Square",
    "latitude": "51.4655056",
    "longitude": "-3.1670777",
    "city": "Imam",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Essex Jamme Masjid Trust",
    "address": "Essex Jamme Masjid Trust",
    "latitude": "51.5459012",
    "longitude": "0.7033029",
    "city": "Essex",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mohiuddin Jamia Masjid & Education Centre",
    "address": "123 Great Junction Street, Edinburgh, EH6 5JB",
    "latitude": "55.9721944",
    "longitude": "-3.1752063",
    "city": "Edinburgh",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Qurani Murkuz",
    "address": "Qurani Murkuz",
    "latitude": "51.592929",
    "longitude": "0.0286139",
    "city": "Qurani",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Anwar-E-Madina Mosque and Community Centre",
    "address": "Anwar-E-Madina Mosque and Community Centre",
    "latitude": "55.9605648",
    "longitude": "-3.1852708",
    "city": "Anwar-E-Madina",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-e-Umer",
    "address": "79 Queen's Road",
    "latitude": "51.5784508",
    "longitude": "-0.0232799",
    "city": "Masjid-e-Umer",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Makki Jamia Mosque",
    "address": "Makki Jamia Mosque",
    "latitude": "53.3586671",
    "longitude": "-1.4731201",
    "city": "Makki",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Easton Jamia Masjid",
    "address": "Bristol",
    "latitude": "51.4672082",
    "longitude": "-2.5645486",
    "city": "Bristol",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Ghousia Reading Islamic Centre",
    "address": "50,52 South Street, Reading, RG1 4QU",
    "latitude": "51.4523897",
    "longitude": "-0.9640844",
    "city": "Reading",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bilal Mosque",
    "address": "Bilal Mosque",
    "latitude": "51.4837003",
    "longitude": "-3.2002875",
    "city": "Bilal",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Medina Mosque",
    "address": "Medina Mosque",
    "latitude": "50.9093886",
    "longitude": "-1.3996202",
    "city": "Medina",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bait-ul-Aziz Islamic Cultural Centre",
    "address": "Bait-ul-Aziz Islamic Cultural Centre",
    "latitude": "51.4975225",
    "longitude": "-0.0943793",
    "city": "Bait-ul-Aziz",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markazi Mosque",
    "address": "9-11 Christian Street, London, E1 1SE",
    "latitude": "51.511696",
    "longitude": "-0.0643535",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Al-Arqam",
    "address": "Dar Al-Arqam",
    "latitude": "55.9444914",
    "longitude": "-3.2001538",
    "city": "Dar",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Norwich and Norfolk Community Centre",
    "address": "286 Dereham Road, Norwich, NR2 3UU",
    "latitude": "52.6354144",
    "longitude": "1.2668274",
    "city": "Norwich",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque",
    "address": "Jamia Mosque",
    "latitude": "53.3942371",
    "longitude": "-1.4307366",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque",
    "address": "Jamia Mosque",
    "latitude": "51.3843027",
    "longitude": "0.5447703",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Noor El Islam Mosque",
    "address": "Noor El Islam Mosque",
    "latitude": "51.4728076",
    "longitude": "-3.173287",
    "city": "Noor",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Taha",
    "address": "6-7 Park Lane, London",
    "latitude": "51.5370355",
    "longitude": "-0.0042438",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Elahi Jame Mosque",
    "address": "Elahi Jame Mosque",
    "latitude": "53.3893492",
    "longitude": "-1.4238977",
    "city": "Elahi",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markazi Jamia",
    "address": "13 Industry Road, Sheffield, S9 5FP",
    "latitude": "53.3900259",
    "longitude": "-1.4159681",
    "city": "Sheffield",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar al-Islam Foundation",
    "address": "Dar al-Islam Foundation",
    "latitude": "51.553547",
    "longitude": "-0.2170266",
    "city": "Dar",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Abu Bakr",
    "address": "Bawtry Road, Sheffield, S9 1WZ",
    "latitude": "53.4109674",
    "longitude": "-1.3961115",
    "city": "Sheffield",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Zain Abiya",
    "address": "Reading",
    "latitude": "51.4609564",
    "longitude": "-1.0376918",
    "city": "Reading",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bournemouth Islamic Centre & Central Mosque",
    "address": "Bournemouth Islamic Centre & Central Mosque",
    "latitude": "50.7218195",
    "longitude": "-1.8800898",
    "city": "Bournemouth",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Grimesthorpe Academy",
    "address": "191 Grimesthorpe Road, Sheffield, S4 7EU",
    "latitude": "53.3979191",
    "longitude": "-1.4545551",
    "city": "Sheffield",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar Ul Aloom Saddiqia",
    "address": "Dar Ul Aloom Saddiqia",
    "latitude": "53.3938198",
    "longitude": "-1.4595601",
    "city": "Dar",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Noor-Us-Sunnah",
    "address": "42 Yardley Green Road, Birmingham, B9 5QF",
    "latitude": "52.4763178",
    "longitude": "-1.8401362",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madina Foundation Dagenham East Islamic Centre",
    "address": "539 Rainham Road South, Dagenham, RM10 7XJ",
    "latitude": "51.5457643",
    "longitude": "0.165126",
    "city": "Dagenham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abu Bakr Masjid",
    "address": "Abu Bakr Masjid",
    "latitude": "51.456964",
    "longitude": "-0.9959209",
    "city": "Abu",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bristol Jamia Mosque",
    "address": "Green Street, Bristol",
    "latitude": "51.4421603",
    "longitude": "-2.5815615",
    "city": "Bristol",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Haroonia",
    "address": "766 Alum Rock Road, Birmingham, B8 3PX",
    "latitude": "52.4890707",
    "longitude": "-1.8311133",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Brick Lane Jamme Masjid",
    "address": "59 Brick Lane, London, E1 6QL",
    "latitude": "51.5194535",
    "longitude": "-0.0720518",
    "city": "London",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madrassa Tul Madinah",
    "address": "Madrassa Tul Madinah",
    "latitude": "53.4128675",
    "longitude": "-1.4442422",
    "city": "Madrassa",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Trowbridge Mosque",
    "address": "Trowbridge Mosque",
    "latitude": "51.3160004",
    "longitude": "-2.2026841",
    "city": "Trowbridge",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "York Mosque",
    "address": "Bull Lane, York, YO10 3EN",
    "latitude": "53.9562307",
    "longitude": "-1.0635869",
    "city": "York",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "York Mosque",
    "address": "Bull Lane, York, YO10 3EN",
    "latitude": "53.9563212",
    "longitude": "-1.0639123",
    "city": "York",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bridgwater Islamic Centre",
    "address": "10 Friarn Street, Bridgwater, Somerset TA6 3LH",
    "latitude": "51.1269689",
    "longitude": "-3.0036163",
    "city": "Bridgwater",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ibrahim Masjid",
    "address": "425 Paisley Road West, G51 1PZ",
    "latitude": "55.8507348",
    "longitude": "-4.2993841",
    "city": "Ibrahim",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bangladeshi Islamic Centre & Jami Mosque",
    "address": "Bangladeshi Islamic Centre & Jami Mosque",
    "latitude": "52.5016007",
    "longitude": "-1.9101584",
    "city": "Bangladeshi",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque and Islamic Welfare Association Lozells",
    "address": "Jamia Mosque and Islamic Welfare Association Lozells",
    "latitude": "52.501258",
    "longitude": "-1.9118207",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jalalabad Sunni Jame Masjid & Islamic Community Centre",
    "address": "Jalalabad Sunni Jame Masjid & Islamic Community Centre",
    "latitude": "52.5034237",
    "longitude": "-1.896298",
    "city": "Jalalabad",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Aston Masjid",
    "address": "125 Mansfield Road, Birmingham, B6 6DA",
    "latitude": "52.504486",
    "longitude": "-1.8996378",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shahjalal (R:) Sunnia Mosque & Islamic Community Centre",
    "address": "Shahjalal (R:) Sunnia Mosque & Islamic Community Centre",
    "latitude": "52.5047721",
    "longitude": "-1.8932411",
    "city": "Shahjalal",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Faizal Islam",
    "address": "Masjid Faizal Islam",
    "latitude": "52.5100223",
    "longitude": "-1.8899462",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-Al-Falaah, Kokni Muslim Association",
    "address": "32-34a Trinity Road, Birmingham, B6 6AL",
    "latitude": "52.5083245",
    "longitude": "-1.9008325",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Ikhlas & Cambridge Islamic Centre",
    "address": "4 Devonshire Road, Cambridge, CB1 2BH",
    "latitude": "52.198776",
    "longitude": "0.1388875",
    "city": "Cambridge",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abubakr Siddiq Islamic Centre",
    "address": "1A Mawson Road, Cambridge, CB1 2DZ",
    "latitude": "52.2001377",
    "longitude": "0.1362138",
    "city": "Cambridge",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Huda",
    "address": "8 Britannia Street, Leicester, LE1 3LE",
    "latitude": "52.6427619",
    "longitude": "-1.1271058",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Medina Mosque",
    "address": "24 Bedford Place, Brighton, BN1 2PT",
    "latitude": "50.8241036",
    "longitude": "-0.1538826",
    "city": "Brighton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "AL-Jamat-Ul-Muslimin of Bangladesh",
    "address": "8 Saint George's Street, Northampton, NN1 2TR",
    "latitude": "52.2433843",
    "longitude": "-0.8989018",
    "city": "Northampton",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Keele University Islamic Centre",
    "address": "Keele University Islamic Centre",
    "latitude": "53.0053007",
    "longitude": "-2.2722497",
    "city": "Keele",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Makkah Masjid Mosque",
    "address": "Makkah Masjid Mosque",
    "latitude": "53.8110022",
    "longitude": "-1.5730042",
    "city": "Makkah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Falkirk Islamic Centre",
    "address": "6-8 Burnhead Lane, Falkirk, FK1 1UG",
    "latitude": "55.9981444",
    "longitude": "-3.7809659",
    "city": "Falkirk",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Khizra Mosque",
    "address": "Khizra Mosque",
    "latitude": "53.5055565",
    "longitude": "-2.2376221",
    "city": "Khizra",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Quwwat ul Islam Masjid",
    "address": "62-66 Upton Lane, London, E7 9LN",
    "latitude": "51.5444158",
    "longitude": "0.0256991",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Yousuf",
    "address": "Masjid Yousuf",
    "latitude": "51.5464882",
    "longitude": "0.0286684",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Forest Gate Mosque",
    "address": "Forest Gate Mosque",
    "latitude": "51.5477542",
    "longitude": "0.0348003",
    "city": "Forest",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Abdullah Bin Masoud",
    "address": "Evelyn Road, Birmingham, B11 3JJ",
    "latitude": "52.4514046",
    "longitude": "-1.8597154",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid and Islamic Centre",
    "address": "83 Slough",
    "latitude": "51.5186289",
    "longitude": "-0.5989887",
    "city": "Slough",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Scotland Islamic Centre",
    "address": "Burghmuir Road, Stirling, FK7 7NZ",
    "latitude": "56.1134618",
    "longitude": "-3.9329979",
    "city": "Stirling",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markazi Jamia Mosque",
    "address": "Markazi Jamia Mosque",
    "latitude": "53.870489",
    "longitude": "-1.9022903",
    "city": "Markazi",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bradford Central Mosque",
    "address": "Bradford Central Mosque",
    "latitude": "53.7979069",
    "longitude": "-1.7601352",
    "city": "Bradford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Hanfia Mosque",
    "address": "Jamia Masjid Hanfia Mosque",
    "latitude": "53.8057189",
    "longitude": "-1.7696631",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bedford Central Jamee Masjid",
    "address": "34 Brereton Road, Bedford, MK40 1HU",
    "latitude": "52.1369895",
    "longitude": "-0.4745038",
    "city": "Bedford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North Jamia Watford Mosque",
    "address": "167 N Western Ave, Watford, Watford, WD25 0AQ",
    "latitude": "51.6825527",
    "longitude": "-0.4017903",
    "city": "Watford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al‐Mahdi Mosque",
    "address": "6 Rees Way, Bradford, BD3 0DZ",
    "latitude": "53.8010402",
    "longitude": "-1.7445677",
    "city": "Bradford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Fath",
    "address": "304 Burdett Road, London, E14 7DQ",
    "latitude": "51.5149566",
    "longitude": "-0.0290893",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Canterbury Islamic Centre",
    "address": "Canterbury Islamic Centre",
    "latitude": "51.2963498",
    "longitude": "1.0648859",
    "city": "Canterbury",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shah jalal Mosque & Centre",
    "address": "80A Rendell Street, LE11 1LL",
    "latitude": "52.7780966",
    "longitude": "-1.2056767",
    "city": "Shah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Khazra Central Mosque",
    "address": "Khazra Central Mosque",
    "latitude": "55.8404944",
    "longitude": "-4.2605152",
    "city": "Khazra",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Centre",
    "address": "10 Berwick Street, London",
    "latitude": "51.5133127",
    "longitude": "-0.1344639",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bristol Central Mosque",
    "address": "Bristol",
    "latitude": "51.4619791",
    "longitude": "-2.5627135",
    "city": "Bristol",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sutton Central Masjid",
    "address": "25 Carshalton Road, Sutton, SM1 4LF",
    "latitude": "51.3624354",
    "longitude": "-0.1883174",
    "city": "Sutton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Crawley Mosque",
    "address": "Crawley Mosque",
    "latitude": "51.0975348",
    "longitude": "-0.2138951",
    "city": "Crawley",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "St Albans Islamic Centre",
    "address": "St Albans Islamic Centre",
    "latitude": "51.7528133",
    "longitude": "-0.3166734",
    "city": "St",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hasrat Shahjal Al Mosque",
    "address": "SN1 2AF",
    "latitude": "51.5649655",
    "longitude": "-1.7802756",
    "city": "Hasrat",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Madina",
    "address": "25 Sherborne Place, Cheltenham, GL52 2RS",
    "latitude": "51.9001849",
    "longitude": "-2.070014",
    "city": "Cheltenham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shipley Masjid",
    "address": "5 Windsor Road, Shipley, BD18 3EU",
    "latitude": "53.8333034",
    "longitude": "-1.7793748",
    "city": "Shipley",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bashir Ahmed Masjid",
    "address": "Bashir Ahmed Masjid",
    "latitude": "50.9230772",
    "longitude": "-1.3948892",
    "city": "Bashir",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ad Duha Institute",
    "address": "1164 Stratford Road, Birmingham, B28 8AF",
    "latitude": "52.4378488",
    "longitude": "-1.8470407",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Cultural & Education Centre",
    "address": "98 Greswolde Road, Birmingham, B11 4DL",
    "latitude": "52.4450741",
    "longitude": "-1.8632392",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Mu'eed",
    "address": "60 Mowbray Road, Cambridge, CB1 7SY",
    "latitude": "52.1822081",
    "longitude": "0.1499747",
    "city": "Cambridge",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Exeter Mosque",
    "address": "Exeter Mosque",
    "latitude": "50.7292049",
    "longitude": "-3.5250632",
    "city": "Exeter",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Bhokari Education Centre",
    "address": "2 Knowle Road, Birmingham, B11 3AW",
    "latitude": "52.4476858",
    "longitude": "-1.857945",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North London Mosque",
    "address": "North London Mosque",
    "latitude": "51.5649049",
    "longitude": "-0.0687451",
    "city": "North",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markazi Jamia Masjid Bilal",
    "address": "Markazi Jamia Masjid Bilal",
    "latitude": "53.8128071",
    "longitude": "-1.5137514",
    "city": "Markazi",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shia Community Centre Edinburgh",
    "address": "1 King Street, Edinburgh, EH6 6TN",
    "latitude": "55.9737788",
    "longitude": "-3.1761214",
    "city": "Edinburgh",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ar Rahman SCT",
    "address": "4-6 Abbots Avenue, St Albans, AL1 2HX",
    "latitude": "51.7390235",
    "longitude": "-0.3333032",
    "city": "St Albans",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Society of Airdrie & Coatbridge",
    "address": "10 Quarry Street, Coatbridge, ML5 3PU",
    "latitude": "55.861287",
    "longitude": "-4.0050649",
    "city": "Coatbridge",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Risalah",
    "address": "Masjid Risalah",
    "latitude": "53.3893216",
    "longitude": "-1.4816226",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Makii Marjid & Madrassa",
    "address": "Makii Marjid & Madrassa",
    "latitude": "52.5051488",
    "longitude": "-1.9313756",
    "city": "Makii",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Madni",
    "address": "Gibbet Street, Halifax",
    "latitude": "53.7231845",
    "longitude": "-1.8722584",
    "city": "Halifax",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jameah Fatimiah Mosque",
    "address": "118A Berridge Road, Nottingham, NG7 6HT",
    "latitude": "52.9706631",
    "longitude": "-1.1642632",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baytul 'Ilm",
    "address": "Spinney Hill Road, Leicester, LE5 3GH",
    "latitude": "52.640024",
    "longitude": "-1.1083278",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shah Jalal Jame Masjid",
    "address": "Shah Jalal Jame Masjid",
    "latitude": "51.4707216",
    "longitude": "-2.56402",
    "city": "Shah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Harrow Central Mosque",
    "address": "36-38 Station Road, Harrow, HA1 2SQ",
    "latitude": "51.5890841",
    "longitude": "-0.3321979",
    "city": "Harrow",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Abu Bakr Jamia Masjid",
    "address": "The Abu Bakr Jamia Masjid",
    "latitude": "50.9099171",
    "longitude": "-1.3974368",
    "city": "The",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Loughborough Mosque and Islamic Cultural Association",
    "address": "83-85 King Street, Loughborough, Leicestershire LE11 1SB",
    "latitude": "52.7695431",
    "longitude": "-1.1981466",
    "city": "Loughborough",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Basingstoke Mosque",
    "address": "35-37 Sarum Hill, Basingstoke, RG21 8SS",
    "latitude": "51.263496",
    "longitude": "-1.0923061",
    "city": "Basingstoke",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Redcoat Community Centre and Mosque",
    "address": "256 Stepney Way, London, E1 3DW",
    "latitude": "51.5165909",
    "longitude": "-0.0484559",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Ihsan Mosque and Islamic Centre",
    "address": "17 Chapelfield East, Norwich, NR2 1SF",
    "latitude": "52.6271996",
    "longitude": "1.2890366",
    "city": "Norwich",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "ShahJahil Jami Masjid",
    "address": "111 Medlicott Road, Birmingham, B11 1UG",
    "latitude": "52.4579276",
    "longitude": "-1.8667081",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Ahl-e-hadith",
    "address": "Hopwood Lane",
    "latitude": "53.7197575",
    "longitude": "-1.8857899",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markaz Quba",
    "address": "21 Tichborne Street, Leicester, LE2 0NQ",
    "latitude": "52.6285756",
    "longitude": "-1.1188467",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ali",
    "address": "42-54 Smith Dorrien Road, Leicester, LE5 4BG",
    "latitude": "52.6395135",
    "longitude": "-1.0942112",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar al Aloom Qadmia Jilamia",
    "address": "Dar al Aloom Qadmia Jilamia",
    "latitude": "51.5837676",
    "longitude": "-0.0145515",
    "city": "Dar",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darul Amaan Mosque",
    "address": "15 Greenheys Lane, Manchester, M15 6NQ",
    "latitude": "53.4621579",
    "longitude": "-2.2394218",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Abu Bakr",
    "address": "26a Mansfield Road",
    "latitude": "51.584883",
    "longitude": "-0.0274884",
    "city": "Masjid",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Jamia Mosque & Madrisa (Highfield Branch)",
    "address": "Central Jamia Mosque & Madrisa (Highfield Branch)",
    "latitude": "53.8686784",
    "longitude": "-1.9104665",
    "city": "Central",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shahjalal Jami Masjid & Jamia Quraniah",
    "address": "Keighley, BD21 2AH",
    "latitude": "53.8666887",
    "longitude": "-1.9104771",
    "city": "Keighley",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sakina Trust Centre",
    "address": "7-8 Vestry Road",
    "latitude": "51.5829834",
    "longitude": "-0.0131196",
    "city": "Sakina",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Corby Central Masjid",
    "address": "33 Stuart Road, Corby, NN17 1RL",
    "latitude": "52.4877932",
    "longitude": "-0.6976383",
    "city": "Corby",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Centre of Edgware",
    "address": "9a-d Deansbrook Road, London Borough of Barnet, HA8 9BE",
    "latitude": "51.6080025",
    "longitude": "-0.2737492",
    "city": "London Borough of Barnet",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Firdaws Mosque",
    "address": "Firdaws Mosque",
    "latitude": "53.7885835",
    "longitude": "-1.7481566",
    "city": "Firdaws",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "North Finchley Mosque",
    "address": "North Finchley Mosque",
    "latitude": "51.6114439",
    "longitude": "-0.1761317",
    "city": "North",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Ahad",
    "address": "67 Erskine Road, London, E17 6SA",
    "latitude": "51.5873716",
    "longitude": "-0.0269418",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Furqan",
    "address": "1 Kamloops Crescent, Leicester, LE1 2HX",
    "latitude": "52.6407911",
    "longitude": "-1.1257486",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Sultania And Education Centre",
    "address": "54 Sneinton Dale, Nottingham, NG2 4HE",
    "latitude": "52.9519869",
    "longitude": "-1.1259401",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shahporan Masjid",
    "address": "Shahporan Masjid",
    "latitude": "53.4508796",
    "longitude": "-2.2018544",
    "city": "Shahporan",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Banbury Makkah Masjid (Spiritual Centre)",
    "address": "Boxhedge Road, Banbury, OX16 0BP",
    "latitude": "52.0633073",
    "longitude": "-1.3461983",
    "city": "Banbury",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Aberystwyth Masjid",
    "address": "Aberystwyth Masjid",
    "latitude": "52.412773",
    "longitude": "-4.0747863",
    "city": "Aberystwyth",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ipswich & Suffolk Bangladeshi Muslim Community Centre and Mosque",
    "address": "32-36 Bond Street, Ipswich, IP4 1JE",
    "latitude": "52.0559202",
    "longitude": "1.1600896",
    "city": "Ipswich",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Beeston Muslim Centre",
    "address": "Evelyn Street, Nottingham, NG9 2EU",
    "latitude": "52.9277725",
    "longitude": "-1.2048107",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Omar Faruque Mosque and Cultural Centre",
    "address": "Kirkwood Road, Cambridge, CB4 2PF",
    "latitude": "52.2320251",
    "longitude": "0.1357544",
    "city": "Cambridge",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markazi Mosque",
    "address": "Markazi Mosque",
    "latitude": "53.6810094",
    "longitude": "-1.6281319",
    "city": "Markazi",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid e Zakaria",
    "address": "Masjid e Zakaria",
    "latitude": "53.6839928",
    "longitude": "-1.6312226",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque",
    "address": "George Street, Coventry",
    "latitude": "52.4177165",
    "longitude": "-1.502865",
    "city": "Coventry",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Faizan-e-Islam Centre",
    "address": "8 Corbett Road, London, E17 3JZ",
    "latitude": "51.5900857",
    "longitude": "-0.003659",
    "city": "London",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-at-Tauwheed Mosque",
    "address": "Masjid-at-Tauwheed Mosque",
    "latitude": "52.6133455",
    "longitude": "1.7265192",
    "city": "Masjid-at-Tauwheed",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Grantham Islamic Centre",
    "address": "7 Elmer Street North, Grantham, NG31 6RE",
    "latitude": "52.9127955",
    "longitude": "-0.641504",
    "city": "Grantham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Basford Culture Centre",
    "address": "379 Nottingham Road, Nottingham, NG7 7EU",
    "latitude": "52.97942",
    "longitude": "-1.1724348",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Umar",
    "address": "398 Alfreton Road, Nottingham, NG7 5NG",
    "latitude": "52.9643126",
    "longitude": "-1.178144",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shoreditch Masjid Trust",
    "address": "53-55 Redchurch Street, London, E2 7DJ",
    "latitude": "51.5245585",
    "longitude": "-0.0747866",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shahjalal masjid",
    "address": "170 Handcroft Road, Croydon, CR0 3LE",
    "latitude": "51.3836264",
    "longitude": "-0.1086315",
    "city": "Croydon",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jemia Mosque",
    "address": "Jemia Mosque",
    "latitude": "53.4310666",
    "longitude": "-1.3643398",
    "city": "Jemia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madrassa Islamia Razvia (reg)",
    "address": "221 Alexander Road, Birmingham, B27 6ET",
    "latitude": "52.4525407",
    "longitude": "-1.8278346",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ahlul Bayt Centre",
    "address": "1 Oxford Road, Oxford, OX4 2EN",
    "latitude": "51.7382063",
    "longitude": "-1.219508",
    "city": "Oxford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitus Subhan Mosque",
    "address": "59 St James Road, Croydon, CR0 2US",
    "latitude": "51.3839835",
    "longitude": "-0.1037258",
    "city": "Croydon",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jami Masjid",
    "address": "24 Gladstone Street, Nottingham, NG7 6GA",
    "latitude": "52.9709277",
    "longitude": "-1.1738295",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Imam Ali",
    "address": "Masjid Imam Ali",
    "latitude": "51.5571072",
    "longitude": "-0.3195106",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Airdrie & Coatbridge Islamic Centre",
    "address": "41 Bell Street, Airdrie, ML6 0BS",
    "latitude": "55.8666552",
    "longitude": "-3.9849344",
    "city": "Airdrie",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Risaalah Mosque & Islington Islamic Centre",
    "address": "91-93 Parkhurst Road",
    "latitude": "51.5575487",
    "longitude": "-0.1202505",
    "city": "Al-Risaalah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Kings Heath Mosque",
    "address": "113-115 Station Road, Birmingham, B14 7TA",
    "latitude": "52.4359555",
    "longitude": "-1.896777",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darus Salaam Mosque",
    "address": "11 Boyd Avenue, Southall, UB1 3BT",
    "latitude": "51.510049",
    "longitude": "-0.3730984",
    "city": "Southall",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Faiza-e-Madinah Wembley",
    "address": "8-10 Forty Avenue, HA9 8JW",
    "latitude": "51.5622153",
    "longitude": "-0.2899787",
    "city": "Faiza-e-Madinah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Umar",
    "address": "Masjid Umar",
    "latitude": "55.8822216",
    "longitude": "-4.363733",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madina Madrassa & Spiritual Centre",
    "address": "116 Midland Road, Peterborough, PE3 6DD",
    "latitude": "52.5769497",
    "longitude": "-0.2543777",
    "city": "Peterborough",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jalalia Jamme Masjeed",
    "address": "High Street, Ponders End, EN3 4EZ",
    "latitude": "51.6459495",
    "longitude": "-0.0471284",
    "city": "Jalalia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mohammedi Islamic Centre",
    "address": "171 Walford Road, Birmingham, B11 1QJ",
    "latitude": "52.4595403",
    "longitude": "-1.8633833",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "East London Mosque",
    "address": "82-92 Whitechapel Road, London, E1 1JQ",
    "latitude": "51.517377",
    "longitude": "-0.065376",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Zahra Foundation",
    "address": "15 Osmaston Street, Nottingham, NG7 1SD",
    "latitude": "52.9472361",
    "longitude": "-1.1735217",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Salahuddin",
    "address": "1 Norfolk Place",
    "latitude": "51.516306",
    "longitude": "-0.1715291",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Broomhouse Mosque",
    "address": "Broomhouse Crescent, Edinburgh, EH11 3RH",
    "latitude": "55.9284073",
    "longitude": "-3.27709",
    "city": "Edinburgh",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Croydon Mosque & Islamic Centre",
    "address": "Croydon Mosque & Islamic Centre",
    "latitude": "51.3894662",
    "longitude": "-0.1126267",
    "city": "Croydon",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bournemouth Jamei Mosque",
    "address": "Bournemouth Jamei Mosque",
    "latitude": "50.7424819",
    "longitude": "-1.8770498",
    "city": "Bournemouth",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abu Huraira",
    "address": "Haynes Road",
    "latitude": "52.6414669",
    "longitude": "-1.0940344",
    "city": "Abu",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Northfields Education Centre",
    "address": "8 Essex Road, Leicester, LE4 9EE",
    "latitude": "52.6525675",
    "longitude": "-1.0954757",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Wirral Deen Centre",
    "address": "371-375 Borough Road, Birkenhead",
    "latitude": "53.385356",
    "longitude": "-3.0323839",
    "city": "Birkenhead",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-E-Hidayah",
    "address": "19 Humphrey Road, Manchester, M16 9DD",
    "latitude": "53.4611704",
    "longitude": "-2.275117",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Stoke-on-Trent Muslim Welfare and Community Centre",
    "address": "Stoke-on-Trent Muslim Welfare and Community Centre",
    "latitude": "53.0175969",
    "longitude": "-2.1866171",
    "city": "Stoke-on-Trent",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Community Centre",
    "address": "115 Thorold Road, Chatham, ME5 7DR",
    "latitude": "51.3758693",
    "longitude": "0.5393628",
    "city": "Chatham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Ghousia",
    "address": "Worcester, WR5 1JU",
    "latitude": "52.1935142",
    "longitude": "-2.2107134",
    "city": "Worcester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Juma Jamat Mosque",
    "address": "Juma Jamat Mosque",
    "latitude": "52.48624",
    "longitude": "-1.9594509",
    "city": "Juma",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madinah Masjid & Community Centre",
    "address": "12 Lothian Street, Bonnyrigg, EH19 3AD",
    "latitude": "55.8753148",
    "longitude": "-3.1050124",
    "city": "Bonnyrigg",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bangladeshi Islamic Association Centre",
    "address": "Bangladeshi Islamic Association Centre",
    "latitude": "52.5005566",
    "longitude": "-1.965927",
    "city": "Bangladeshi",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-e-Baitul Amaan",
    "address": "Masjid-e-Baitul Amaan",
    "latitude": "52.5020124",
    "longitude": "-1.9678284",
    "city": "Masjid-e-Baitul",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Qadria Trust Islamic Education",
    "address": "26 Alfred Street, Birmingham, B12 8JL",
    "latitude": "52.4572577",
    "longitude": "-1.8736573",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Karam Mosque",
    "address": "411-413 Katherine Road, London, E7 8LT",
    "latitude": "51.5425027",
    "longitude": "0.0367251",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madressa Islamiyah (old madressah)",
    "address": "Madressa Islamiyah (old madressah)",
    "latitude": "53.7097239",
    "longitude": "-1.6374042",
    "city": "Madressa",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Madina Jami Masjid",
    "address": "Worcester, WR4 9PS",
    "latitude": "52.1964375",
    "longitude": "-2.2107648",
    "city": "Worcester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia al Karim",
    "address": "Jamia al Karim",
    "latitude": "51.8608005",
    "longitude": "-2.2378823",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Stratford",
    "address": "3 Brydges Road, London, E15 1NA",
    "latitude": "51.5491776",
    "longitude": "0.0015906",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Holloway Mosque",
    "address": "152 Holloway Road, London, N7 8DD",
    "latitude": "51.5509743",
    "longitude": "-0.1098397",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "London Islamic Turkish Association",
    "address": "16 Green Lanes, London, N16 9ND",
    "latitude": "51.5527209",
    "longitude": "-0.0866061",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Rahma Mosque",
    "address": "Al-Rahma Mosque",
    "latitude": "53.3943047",
    "longitude": "-2.9606484",
    "city": "Al-Rahma",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Green Dome Mosque",
    "address": "6 Canmore Street, Dunfermline, KY12 7PX",
    "latitude": "56.0706697",
    "longitude": "-3.4606494",
    "city": "Dunfermline",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Surma Islamic Education Centre Madrassa & Masjid",
    "address": "30;32 Waverley Road, Birmingham, B10 0EP",
    "latitude": "52.4617508",
    "longitude": "-1.8524865",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Green Oak Academy (Kings Heath)",
    "address": "240 Alcester Road South, Birmingham, B14 6DR",
    "latitude": "52.4224378",
    "longitude": "-1.89269",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Faizan-e-Madina Mosque",
    "address": "175 Gladstone Street, Peterborough, PE1 2BN",
    "latitude": "52.5803299",
    "longitude": "-0.2489767",
    "city": "Peterborough",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid AlBirr",
    "address": "Redditch, B98 7AZ",
    "latitude": "52.3043744",
    "longitude": "-1.9379387",
    "city": "Redditch",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Redditch New Mosque",
    "address": "Redditch, B98 7AZ",
    "latitude": "52.3006432",
    "longitude": "-1.9365465",
    "city": "Redditch",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Rizvia",
    "address": "Albion Street, Brierley Hill, DY5 3EE",
    "latitude": "52.4831481",
    "longitude": "-2.1233205",
    "city": "Brierley Hill",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "City Jamia Masjid",
    "address": "347-349 Stockport Road, M13 0LF",
    "latitude": "53.4619184",
    "longitude": "-2.2077526",
    "city": "City",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Wolverhampton Central Mosque",
    "address": "Wolverhampton Central Mosque",
    "latitude": "52.5960705",
    "longitude": "-2.1299633",
    "city": "Wolverhampton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shah Jalal Masjid",
    "address": "110-114 St Helens Street, Ipswich, IP4 2LB",
    "latitude": "52.0564722",
    "longitude": "1.1654832",
    "city": "Ipswich",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Leamington Road Mosque",
    "address": "Leamington Road",
    "latitude": "53.7506683",
    "longitude": "-2.501614",
    "city": "Leamington",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nasir Mosque",
    "address": "113 Richmond Road, Gillingham, ME7 1NY",
    "latitude": "51.3947823",
    "longitude": "0.5511606",
    "city": "Gillingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Atta Mosque",
    "address": "146 Willenhall Road, Wolverhampton, WV1 2HT",
    "latitude": "52.5831288",
    "longitude": "-2.1015467",
    "city": "Wolverhampton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Hafeez Mosque",
    "address": "308 Sneinton Dale, Nottingham, NG3 7DN",
    "latitude": "52.9559521",
    "longitude": "-1.1171158",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Stepney Shahjalal Mosque & Cultural Centre",
    "address": "81-83 Duckett Street, London, E1 4TD",
    "latitude": "51.5202088",
    "longitude": "-0.0408034",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nottingham Alevi Cultural Centre & Cemevi",
    "address": "28 Handel Street, Nottingham, NG3 1JE",
    "latitude": "52.9552083",
    "longitude": "-1.1357401",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markazul Uloom",
    "address": "1 Sandringham Road, London",
    "latitude": "51.5499152",
    "longitude": "-0.0740416",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madina Mosque",
    "address": "2 Park Terrace East, Horsham, RH13 5DN",
    "latitude": "51.0609241",
    "longitude": "-0.3230504",
    "city": "Horsham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Mosque & Islamic Centre",
    "address": "Mosque & Islamic Centre",
    "latitude": "52.4733407",
    "longitude": "-2.0754748",
    "city": "Mosque",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shah Jalal Mosque",
    "address": "CH1 5LT",
    "latitude": "53.1990065",
    "longitude": "-2.9244912",
    "city": "Shah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Nasir Mosque",
    "address": "42 Brougham Terrace, Hartlepool, TS24 8EY",
    "latitude": "54.6930594",
    "longitude": "-1.2162475",
    "city": "Hartlepool",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "City Central Mosque",
    "address": "City Central Mosque",
    "latitude": "53.0183531",
    "longitude": "-2.1769677",
    "city": "City",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Suleymaniye Mosque",
    "address": "Suleymaniye Mosque",
    "latitude": "51.5353015",
    "longitude": "-0.0764441",
    "city": "Suleymaniye",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shah Jahan Mosque",
    "address": "Shah Jahan Mosque",
    "latitude": "51.3226743",
    "longitude": "-0.5445501",
    "city": "Shah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bangladeshi Isalmic Social Organisation & Modina Mosque",
    "address": "Moseley Road, Birmingham, B12 9AE",
    "latitude": "52.4562771",
    "longitude": "-1.8856076",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "West London Islamic Centre & Greenford Mosque",
    "address": "West London Islamic Centre & Greenford Mosque",
    "latitude": "51.5268963",
    "longitude": "-0.3519161",
    "city": "West",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid UKIM",
    "address": "Jamia Masjid UKIM",
    "latitude": "51.5104278",
    "longitude": "-0.326266",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Aisha Mosque & Islamic Centre",
    "address": "4 Rutter Street, Walsall, WS1 4HJ",
    "latitude": "52.5766956",
    "longitude": "-1.9850192",
    "city": "Walsall",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Abu Bakr",
    "address": "Masjid Abu Bakr",
    "latitude": "52.576351",
    "longitude": "-1.9908742",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid e Yusuf",
    "address": "440 Hornsey Road",
    "latitude": "51.5659057",
    "longitude": "-0.120722",
    "city": "Masjid",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hussaini Islamic Mission & Ali (AS) Mosque, Shia Muslim Community & Welfare Centre",
    "address": "283 Newhampton Road West, Wolverhampton, WV6 0RS",
    "latitude": "52.5953874",
    "longitude": "-2.1522746",
    "city": "Wolverhampton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ibraheem",
    "address": "Masjid Ibraheem",
    "latitude": "53.773146",
    "longitude": "-1.5487639",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "NMC Centre & Masjid",
    "address": "6 Church Road, Northwich, CW9 5NT",
    "latitude": "53.2622498",
    "longitude": "-2.5061801",
    "city": "Northwich",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Cultural Centre",
    "address": "Islamic Cultural Centre",
    "latitude": "53.3200739",
    "longitude": "-3.4931998",
    "city": "Islamic",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Galler Turkish Mosque",
    "address": "Galler Turkish Mosque",
    "latitude": "53.3156099",
    "longitude": "-3.4781392",
    "city": "Galler",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Ghafoor Mosque",
    "address": "224 Long Lane, Halesowen, B62 9JT",
    "latitude": "52.4640773",
    "longitude": "-2.0293757",
    "city": "Halesowen",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Mosque Blackheath",
    "address": "Jamia Mosque Blackheath",
    "latitude": "52.47077",
    "longitude": "-2.0351902",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Central Jamia Mosque",
    "address": "Central Jamia Mosque",
    "latitude": "51.4992687",
    "longitude": "-0.3847758",
    "city": "Central",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ellesmere Port Masjid & Islamic Centre",
    "address": "82-84 Station Road, CH65 4BH",
    "latitude": "53.2843249",
    "longitude": "-2.8952859",
    "city": "Ellesmere",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Redhill Islamic Centre",
    "address": "30 Earlswood Road, Redhill, RH1 6HW",
    "latitude": "51.2281938",
    "longitude": "-0.1720894",
    "city": "Redhill",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Chesham Mosque",
    "address": "212 Bellingdon Road, Chesham, HP5 2NN",
    "latitude": "51.7119026",
    "longitude": "-0.6143601",
    "city": "Chesham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gillani Noor Mosque",
    "address": "Gillani Noor Mosque",
    "latitude": "52.9810001",
    "longitude": "-2.1214011",
    "city": "Gillani",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Londra Diyanet Camii",
    "address": "31 High Street, London, N8 7FB",
    "latitude": "51.5880084",
    "longitude": "-0.1175137",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madni Masjid",
    "address": "Alberta Terrace, Nottingham, NG7 6JA",
    "latitude": "52.9714865",
    "longitude": "-1.1613821",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Da'watul Islam Mosque",
    "address": "Charnock Street, Chorley, PR6 0NZ",
    "latitude": "53.6495706",
    "longitude": "-2.6225499",
    "city": "Chorley",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid e Bilaal",
    "address": "Cedar Street, Blackburn",
    "latitude": "53.7628528",
    "longitude": "-2.4739791",
    "city": "Blackburn",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jalalabad Islamic Centre",
    "address": "145-149 Fishponds Road, Bristol, BS5 6PR",
    "latitude": "51.4729131",
    "longitude": "-2.5583833",
    "city": "Bristol",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Kharza",
    "address": "Queensberry Street, Nottingham, NG6 0DG",
    "latitude": "52.9864102",
    "longitude": "-1.1801876",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Surrey Muslim Centre",
    "address": "Surrey Muslim Centre",
    "latitude": "51.3744251",
    "longitude": "-0.4795683",
    "city": "Surrey",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Muslim Cultural Centre Wollaton",
    "address": "43 Radford Bridge Road, Nottingham, NG8 1NB",
    "latitude": "52.9565446",
    "longitude": "-1.1939007",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ghausia Qasmia & Community Hub",
    "address": "34-38 Mount Street, Walsall, WS1 3PJ",
    "latitude": "52.5784632",
    "longitude": "-1.9827354",
    "city": "Walsall",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Farooq",
    "address": "Masjid Al-Farooq",
    "latitude": "52.575683",
    "longitude": "-1.9894955",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Syeda Fatima Zahra Centre",
    "address": "15 Birchills Street, Walsall, WS2 8NF",
    "latitude": "52.5877344",
    "longitude": "-1.9914702",
    "city": "Walsall",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jalalia Sunni Jami Masjid & Islamic Education Centre",
    "address": "150 Bath Street, Walsall, WS1 3BX",
    "latitude": "52.5776271",
    "longitude": "-1.9801244",
    "city": "Walsall",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shah Jalal Jami Masjid & Madrasah",
    "address": "48 Hart Street, Walsall, WS1 3PE",
    "latitude": "52.578412",
    "longitude": "-1.9831296",
    "city": "Walsall",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-E-Usman",
    "address": "Brace Street, Walsall, WS1 3PS",
    "latitude": "52.5779055",
    "longitude": "-1.9839026",
    "city": "Walsall",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Medina Mosque & Islamic Centre",
    "address": "Medina Mosque & Islamic Centre",
    "latitude": "53.5291866",
    "longitude": "-2.1170523",
    "city": "Medina",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-e-Noor",
    "address": "115 Stamford Street, Trafford, M16 9LT",
    "latitude": "53.4607508",
    "longitude": "-2.2631296",
    "city": "Trafford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Imdadia",
    "address": "26 Blackburn Street, Trafford, M16 9LJ",
    "latitude": "53.4609665",
    "longitude": "-2.2664899",
    "city": "Trafford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Zakaria Mosque",
    "address": "22-24 Clarendon Road, M16 8LD",
    "latitude": "53.4480956",
    "longitude": "-2.2589191",
    "city": "Zakaria",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Tees Valley Muslim Community Centre",
    "address": "Sopwith Close, Stockton-on-Tees, TS18 3TT",
    "latitude": "54.547116",
    "longitude": "-1.3248718",
    "city": "Stockton-on-Tees",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madrassa Majadidia Taleem-ul-quran",
    "address": "369 Somerville Road, Birmingham, B10 9DU",
    "latitude": "52.4695872",
    "longitude": "-1.8415012",
    "city": "Birmingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shahjalal Jame Mosque",
    "address": "35 Winstanley Road, Wellingborough, NN8 1JF",
    "latitude": "52.3028327",
    "longitude": "-0.6873422",
    "city": "Wellingborough",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Hethersett Masjid",
    "address": "Henstead Road, Norwich, NR9 3JH",
    "latitude": "52.6022796",
    "longitude": "1.1779913",
    "city": "Norwich",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-E-Umar",
    "address": "Bills Street, Walsall, WS10 8BB",
    "latitude": "52.5703287",
    "longitude": "-2.0268166",
    "city": "Walsall",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid",
    "address": "112-114 College Road, Rotherham, S60 1JF",
    "latitude": "53.4313444",
    "longitude": "-1.3684584",
    "city": "Rotherham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Moorlands Islamic Centre",
    "address": "Dumbarton Road, Lancaster, LA1 3BX",
    "latitude": "54.0462893",
    "longitude": "-2.7922893",
    "city": "Lancaster",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid",
    "address": "Jamia Masjid",
    "latitude": "53.4255672",
    "longitude": "-1.3507575",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Abu Bakr Mosque",
    "address": "Jamia Masjid Abu Bakr Mosque",
    "latitude": "53.4376125",
    "longitude": "-1.3496061",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Dar-ul Islam Central Mosque",
    "address": "30 Southfield Road, Middlesbrough, TS1 3EX",
    "latitude": "54.5704923",
    "longitude": "-1.2311806",
    "city": "Middlesbrough",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bexhill Masjid & Islamic Centre",
    "address": "1 Clifford Road, Bexhill-on-Sea, TN40 1QA",
    "latitude": "50.841369",
    "longitude": "0.4741471",
    "city": "Bexhill-on-Sea",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Muntada Al-Islami Trust",
    "address": "7 Bridges Place, London, SW6 4HW",
    "latitude": "51.4763922",
    "longitude": "-0.2016742",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Greenbank Masjid",
    "address": "Bristol",
    "latitude": "51.4678463",
    "longitude": "-2.5577706",
    "city": "Bristol",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Awliya Allah",
    "address": "1 Ely Street, Gateshead, NE8 1NR",
    "latitude": "54.9561958",
    "longitude": "-1.60335",
    "city": "Gateshead",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islah-Ul-Muslimeen",
    "address": "37 Winstanley Road, Wellingborough, NN8 1JD",
    "latitude": "52.3028771",
    "longitude": "-0.6868359",
    "city": "Wellingborough",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid us Sunnah",
    "address": "176 Welford Road, Leicester, LE2 6BD",
    "latitude": "52.6168852",
    "longitude": "-1.1260974",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Umar",
    "address": "1-3 Evington Drive, Leicester, LE5 5PF",
    "latitude": "52.6242263",
    "longitude": "-1.1018273",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Tawfiq Masjid & Centre",
    "address": "Tawfiq Masjid & Centre",
    "latitude": "51.4534319",
    "longitude": "-2.5628763",
    "city": "Tawfiq",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Blackhall Mosque",
    "address": "1 House O' Hill Road, Edinburgh, EH4 2AJ",
    "latitude": "55.9612397",
    "longitude": "-3.2575997",
    "city": "Edinburgh",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Jamia Suffa-Tul-Islam Grand Mosque",
    "address": "Al-Jamia Suffa-Tul-Islam Grand Mosque",
    "latitude": "53.7843366",
    "longitude": "-1.769082",
    "city": "Al-Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Kirkcaldy Central Mosque",
    "address": "Kirkcaldy Central Mosque",
    "latitude": "56.1308876",
    "longitude": "-3.1750972",
    "city": "Kirkcaldy",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid Noor",
    "address": "Crosland Road, Huddersfield, HD1 3JS",
    "latitude": "53.6391186",
    "longitude": "-1.7976717",
    "city": "Huddersfield",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Rugby Mosque",
    "address": "Rugby Mosque",
    "latitude": "52.3745447",
    "longitude": "-1.2514456",
    "city": "Rugby",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Madina Mosque Barking",
    "address": "2 Victoria Road, Barking, IG11 8PY",
    "latitude": "51.544186",
    "longitude": "0.077535",
    "city": "Barking",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Alnoor",
    "address": "170 Gascoigne Road, Barking, IG11 7LH",
    "latitude": "51.5307564",
    "longitude": "0.0813532",
    "city": "Barking",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bilal Jamia Masjid",
    "address": "Malvern Street, Newcastle upon Tyne, NE4 6SU",
    "latitude": "54.9691721",
    "longitude": "-1.6400589",
    "city": "Newcastle upon Tyne",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Langley Green Islamic Centre & Mosque",
    "address": "Langley Green Islamic Centre & Mosque",
    "latitude": "51.1310199",
    "longitude": "-0.1864385",
    "city": "Langley",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Noor Mosque",
    "address": "Langley Drive, Crawley, RH11 7TF",
    "latitude": "51.1264477",
    "longitude": "-0.1926709",
    "city": "Crawley",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Banbury Madni Masjid",
    "address": "Merton Street, Banbury, OX16 4RP",
    "latitude": "52.061785",
    "longitude": "-1.3250553",
    "city": "Banbury",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Islamia Education Centre",
    "address": "22 Hubert Street, Nottingham, NG7 5AJ",
    "latitude": "52.9633241",
    "longitude": "-1.1697434",
    "city": "Nottingham",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Portsmouth Hafiziah Madrasah",
    "address": "73,75 Marmion Road",
    "latitude": "50.7856786",
    "longitude": "-1.084249",
    "city": "Portsmouth",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Gilwell Mosque",
    "address": "Gilwell Mosque",
    "latitude": "51.6498721",
    "longitude": "0.0015732",
    "city": "Gilwell",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The London Mosque",
    "address": "16 Gressenhall Road, London, SW18 5QL",
    "latitude": "51.4511567",
    "longitude": "-0.2073569",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sunderland Jami-Masjid",
    "address": "Sunderland Jami-Masjid",
    "latitude": "54.902607",
    "longitude": "-1.3975112",
    "city": "Sunderland",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Zakariya",
    "address": "Wakefield, WF1 5BN",
    "latitude": "53.6673102",
    "longitude": "-1.4781174",
    "city": "Wakefield",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madina Masjid",
    "address": "82-84 St. Catherine Street, Wakefield, WF1 5BP",
    "latitude": "53.6687333",
    "longitude": "-1.4794246",
    "city": "Wakefield",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Poplar Shahjalal Mosque",
    "address": "25 Hale Street, London, E14 0BF",
    "latitude": "51.5094826",
    "longitude": "-0.0173918",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al Azhar Mosque",
    "address": "South Shields",
    "latitude": "54.9902343",
    "longitude": "-1.4400354",
    "city": "South Shields",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Ma'mur Jame-E- Masjid and Islamic Center",
    "address": "Baitul Ma'mur Jame-E- Masjid and Islamic Center",
    "latitude": "55.0013101",
    "longitude": "-1.4290163",
    "city": "Baitul",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid e Anwaar e Madinah",
    "address": "St Mark's Road North, Sunderland, SR4 7EG",
    "latitude": "54.9058474",
    "longitude": "-1.4012136",
    "city": "Sunderland",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jame Masjid & Madrassa Salafia",
    "address": "23-25 Midland Street, Skipton, BD23 1SE",
    "latitude": "53.9592102",
    "longitude": "-2.0317255",
    "city": "Skipton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Poplar Mosque & Community Centre",
    "address": "6 Webber Path, London, E14 0FZ",
    "latitude": "51.5109868",
    "longitude": "-0.0097531",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Whitley Bay Islamic Cultural Centre and Masjid",
    "address": "Hillheads Road, Whitley Bay, NE25 8HR",
    "latitude": "55.0358186",
    "longitude": "-1.4541559",
    "city": "Whitley Bay",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jame",
    "address": "51 Asfordby Street, Leicester, LE5 3QJ",
    "latitude": "52.6369341",
    "longitude": "-1.105215",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Abu Bakr",
    "address": "55 Barclay Street, Leicester, LE3 0JD",
    "latitude": "52.6279428",
    "longitude": "-1.1526767",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Furqan",
    "address": "298 East Park Road, Leicester, LE5 5AY",
    "latitude": "52.6314629",
    "longitude": "-1.1061479",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid e Aisha",
    "address": "22-28 Cork Street, Leicester, LE5 5AN",
    "latitude": "52.6309511",
    "longitude": "-1.1096934",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Tabuk & Evington Muslim Centre",
    "address": "59 Stoughton Drive North, Leicester, LE5 5UD",
    "latitude": "52.6228698",
    "longitude": "-1.1029059",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid an Noor",
    "address": "146-152 Berners Street, Leicester, LE2 0FS",
    "latitude": "52.6342387",
    "longitude": "-1.1101539",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Education Trust Cumbernauld",
    "address": "5 Craighalbert Way, Cumbernauld, G68 0LS",
    "latitude": "55.9587575",
    "longitude": "-4.0120383",
    "city": "Cumbernauld",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Shair-e-Rabbani Mosque",
    "address": "11A Bedford Avenue, M16 8JS",
    "latitude": "53.4473649",
    "longitude": "-2.262905",
    "city": "Shair-e-Rabbani",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al Falah & Islamic Educational Trust",
    "address": "3-13 Keythorpe Street, Leicester, LE2 0AL",
    "latitude": "52.6351991",
    "longitude": "-1.1150051",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Tajdaar e Madina",
    "address": "1A Garendon Street, Leicester, LE2 0AH",
    "latitude": "52.63599",
    "longitude": "-1.1169123",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid e Usman",
    "address": "162 Nedham Street, Leicester, LE2 0HB",
    "latitude": "52.6368859",
    "longitude": "-1.1133119",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Leicester Central Mosque",
    "address": "Conduit Street, Leicester, LE2 0JN",
    "latitude": "52.6322866",
    "longitude": "-1.1215754",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madina Masjid & Community Centre",
    "address": "2 Barlow Road, Manchester, M19 3DJ",
    "latitude": "53.4459997",
    "longitude": "-2.1903096",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Faizan-e-Islam Centre",
    "address": "757 Lea Bridge Road, London",
    "latitude": "51.5796535",
    "longitude": "-0.0049326",
    "city": "London",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Abdullah Quilliam Mosque",
    "address": "8-10 Brougham Terrace, Liverpool",
    "latitude": "53.4142884",
    "longitude": "-2.9605132",
    "city": "Liverpool",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madina Masjid",
    "address": "Wingrove Gardens, Newcastle upon Tyne, NE4 9HS",
    "latitude": "54.9800811",
    "longitude": "-1.6488164",
    "city": "Newcastle upon Tyne",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Falkirk Central Mosque",
    "address": "10 Burnhead Lane, Falkirk, FK1 1UG",
    "latitude": "55.9979575",
    "longitude": "-3.7807457",
    "city": "Falkirk",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Ar-Rahman",
    "address": "71 Guthlaxton Street, Leicester, LE2 0UX",
    "latitude": "52.6321983",
    "longitude": "-1.1165066",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Ata",
    "address": "36 North Road, Wallsend, NE28 8LF",
    "latitude": "54.9925779",
    "longitude": "-1.5397579",
    "city": "Wallsend",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Heaton Mosque & Islamic Centre",
    "address": "Heaton Mosque & Islamic Centre",
    "latitude": "54.9858067",
    "longitude": "-1.5816489",
    "city": "Heaton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Aziziye Mosque and Community Centre",
    "address": "Aziziye Mosque and Community Centre",
    "latitude": "51.5553657",
    "longitude": "-0.0750781",
    "city": "Aziziye",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid An Noor",
    "address": "170a Belgrave Gate, Leicester, LE1 3XL",
    "latitude": "52.6411898",
    "longitude": "-1.1303347",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Darul Ummah Mosque",
    "address": "56 Bigland Street, London, E1 2ND",
    "latitude": "51.5124129",
    "longitude": "-0.0581906",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Livingston Masjid & Islamic Centre",
    "address": "Livingston Masjid & Islamic Centre",
    "latitude": "55.9012767",
    "longitude": "-3.5675834",
    "city": "Livingston",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Newcasyle Central Mosque",
    "address": "Newcasyle Central Mosque",
    "latitude": "54.9735727",
    "longitude": "-1.6473047",
    "city": "Newcasyle",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madni Jamia Masjid",
    "address": "101 Thornbury Road, Bradford, BD3 8SA",
    "latitude": "53.7960007",
    "longitude": "-1.7185127",
    "city": "Bradford",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Zeenat Masjid",
    "address": "Stoney Stanton Road, Coventry",
    "latitude": "52.4191644",
    "longitude": "-1.4981813",
    "city": "Coventry",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "The Islamic Brotherhood Pakistan And Kashmir Family Centre",
    "address": "Eagle Street East, Coventry",
    "latitude": "52.4169173",
    "longitude": "-1.5018479",
    "city": "Coventry",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Manchester Islamic Centre & Didsbury Mosque",
    "address": "271 Burton Road, Manchester, M20 2WA",
    "latitude": "53.4228001",
    "longitude": "-2.2466722",
    "city": "Manchester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Islamic Prayer Rooms",
    "address": "Islamic Prayer Rooms",
    "latitude": "54.7658026",
    "longitude": "-1.5758409",
    "city": "Islamic",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "City Mosque Preston",
    "address": "City Mosque Preston",
    "latitude": "53.7631638",
    "longitude": "-2.6984111",
    "city": "City",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Zakariya Masjid",
    "address": "Zakariya Masjid",
    "latitude": "51.9008463",
    "longitude": "-0.4936375",
    "city": "Zakariya",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-E-Ali",
    "address": "2-32 Beechwood Road, Luton",
    "latitude": "51.8929878",
    "longitude": "-0.4492025",
    "city": "Luton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Al-Alkbaria",
    "address": "Jamia Al-Alkbaria",
    "latitude": "51.8958621",
    "longitude": "-0.4454061",
    "city": "Jamia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Luton Central Mosque",
    "address": "Luton Central Mosque",
    "latitude": "51.8873604",
    "longitude": "-0.4319557",
    "city": "Luton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jalalabad Jame Masjid",
    "address": "Jalalabad Jame Masjid",
    "latitude": "51.887367",
    "longitude": "-0.4299413",
    "city": "Jalalabad",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Zakariyya Jaam'e Masjid",
    "address": "Zakariyya Jaam'e Masjid",
    "latitude": "53.5685514",
    "longitude": "-2.4416975",
    "city": "Zakariyya",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitul Lateef Mosque",
    "address": "309 Breck Road, Liverpool, L5 6PU",
    "latitude": "53.4246172",
    "longitude": "-2.9554255",
    "city": "Liverpool",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Rahman Mosque",
    "address": "2-14 Randal Street, Bolton, BL3 4AG",
    "latitude": "53.5658085",
    "longitude": "-2.4472761",
    "city": "Bolton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Camberley Mosque",
    "address": "Camberley Mosque",
    "latitude": "51.3373992",
    "longitude": "-0.7568599",
    "city": "Camberley",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ghousia Mosque",
    "address": "Ghousia Mosque",
    "latitude": "53.8743786",
    "longitude": "-1.9090054",
    "city": "Ghousia",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Baitus Sadiq",
    "address": "19a Warren Road, Rhyl, LL18 1DP",
    "latitude": "53.3149106",
    "longitude": "-3.4981311",
    "city": "Rhyl",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Burdett Estate Mosque",
    "address": "6 Masjid Lane, London, E14 7UD",
    "latitude": "51.5170865",
    "longitude": "-0.0265323",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Noorul Islam",
    "address": "Masjid Noorul Islam",
    "latitude": "53.7101747",
    "longitude": "-1.6406745",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Noor",
    "address": "Masjid Noor",
    "latitude": "53.7101386",
    "longitude": "-1.6421097",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Hilal",
    "address": "Masjid Hilal",
    "latitude": "53.701477",
    "longitude": "-1.635044",
    "city": "Masjid",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Cemetery Lodge Prayer Room",
    "address": "Cemetery Lodge Prayer Room",
    "latitude": "53.8093245",
    "longitude": "-1.5563658",
    "city": "Cemetery",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Poole Mosque",
    "address": "Poole Mosque",
    "latitude": "50.7279031",
    "longitude": "-1.9266412",
    "city": "Poole",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Cardigan Islamic Centre",
    "address": "Quay Street, Cardigan / Aberteifi, SA43 1HR",
    "latitude": "52.0817975",
    "longitude": "-4.6631121",
    "city": "Cardigan / Aberteifi",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Yaqeen",
    "address": "28 Warwick Road, Redhill, RH1 1BU",
    "latitude": "51.2419342",
    "longitude": "-0.1704939",
    "city": "Redhill",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Clarkston Community Centre",
    "address": "Clarkston Community Centre",
    "latitude": "55.795005",
    "longitude": "-4.2727246",
    "city": "Clarkston",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Belfast Islamic Centre",
    "address": "38 Wellington Park, Belfast, BT9 6DN",
    "latitude": "54.582409",
    "longitude": "-5.9420906",
    "city": "Belfast",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Cheadle Masjid",
    "address": "Cheadle Masjid",
    "latitude": "53.359326",
    "longitude": "-2.2195115",
    "city": "Cheadle",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-e-Noorul Islam",
    "address": "Masjid-e-Noorul Islam",
    "latitude": "53.5897545",
    "longitude": "-2.4314281",
    "city": "Masjid-e-Noorul",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Makki Masjid",
    "address": "Makki Masjid",
    "latitude": "53.5911793",
    "longitude": "-2.4433627",
    "city": "Makki",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Sughra Mosque",
    "address": "Granville Street, Bolton, BL4 7LD",
    "latitude": "53.5548714",
    "longitude": "-2.4011484",
    "city": "Bolton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "ShahJalaal Islamic Centre",
    "address": "2 Stanley Street, Reading",
    "latitude": "51.4573485",
    "longitude": "-0.9843521",
    "city": "Reading",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Bilal Masjid",
    "address": "1 Bulwer Street, Rochdale, OL16 2EU",
    "latitude": "53.6209193",
    "longitude": "-2.1453653",
    "city": "Rochdale",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Madina Masjid",
    "address": "3 Gower Street, Bolton, BL1 4BG",
    "latitude": "53.5830512",
    "longitude": "-2.4451754",
    "city": "Bolton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al-Jamia Darul Quran",
    "address": "454-460 Bridgeman Street, Bolton, BL3 6TH",
    "latitude": "53.5658291",
    "longitude": "-2.4406258",
    "city": "Bolton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Makkah Masjid",
    "address": "100-110 Grecian Crescent, Bolton, BL3 6QU",
    "latitude": "53.5661207",
    "longitude": "-2.4286511",
    "city": "Bolton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Markaz e Ahlebait",
    "address": "Fletcher Street, Bolton, BL3 6NG",
    "latitude": "53.5681764",
    "longitude": "-2.4292055",
    "city": "Bolton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Falah",
    "address": "23 Salisbury Street, Bolton, BL3 5DR",
    "latitude": "53.5740455",
    "longitude": "-2.4417264",
    "city": "Bolton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ilford Central Mosque",
    "address": "50-58 Albert Road, Ilford, IG1 1HW",
    "latitude": "51.5563499",
    "longitude": "0.0748956",
    "city": "Ilford",
    "country": "GB",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-e-Usman",
    "address": "82 Astley Street, Bolton, BL1 8EY",
    "latitude": "53.5939323",
    "longitude": "-2.4360954",
    "city": "Bolton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Portsmouth Muslim Academy",
    "address": "389a Old Commercial Road, Portsmouth",
    "latitude": "50.8068076",
    "longitude": "-1.0873212",
    "city": "Portsmouth",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Huda",
    "address": "Al-Huda",
    "latitude": "53.7556816",
    "longitude": "-2.6975999",
    "city": "Al-Huda",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Alavia Bolton",
    "address": "29 Bromwich Street, Bolton, BL2 1JF",
    "latitude": "53.5750996",
    "longitude": "-2.4160608",
    "city": "Bolton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Taiyabah Masjid",
    "address": "Taiyabah Masjid",
    "latitude": "53.5920804",
    "longitude": "-2.4314087",
    "city": "Taiyabah",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Madinatul-Uloom Al-Islamiyah",
    "address": "Wyre Forest, DY10 4BH",
    "latitude": "52.3626005",
    "longitude": "-2.2127864",
    "city": "Wyre Forest",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Tawhid",
    "address": "80 High Road Leyton, London, E15 2BP",
    "latitude": "51.5531282",
    "longitude": "-0.004632",
    "city": "London",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Al-Baseera Bristol Centre",
    "address": "20 Wade Street, Bristol, BS2 9DR",
    "latitude": "51.4591566",
    "longitude": "-2.5798583",
    "city": "Bristol",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid Al Aqsa",
    "address": "Gilnow Road, Bolton, BL1 4LL",
    "latitude": "53.5757954",
    "longitude": "-2.451295",
    "city": "Bolton",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Leicester Mosque",
    "address": "2a Sutherland Street, Leicester, LE2 1DS",
    "latitude": "52.6293244",
    "longitude": "-1.1126164",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid e Usmani",
    "address": "308 Saint Saviour's Road, Leicester, LE5 4HJ",
    "latitude": "52.633918",
    "longitude": "-1.0992347",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid-Al-Husayn Mosque",
    "address": "Masjid-Al-Husayn Mosque",
    "latitude": "52.6409177",
    "longitude": "-1.0997212",
    "city": "Masjid-Al-Husayn",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Jamia Masjid-e-Bilal",
    "address": "80 Evington Valley Road, Leicester, LE5 5LJ",
    "latitude": "52.6267841",
    "longitude": "-1.1017697",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Ismaili Jamaat Khana",
    "address": "31 Waterside Road, Leicester, LE5 1TL",
    "latitude": "52.6591212",
    "longitude": "-1.0780242",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid al Ameen",
    "address": "Sandhurst Street, Oadby, LE2 5AR",
    "latitude": "52.5996616",
    "longitude": "-1.0845787",
    "city": "Oadby",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  },
  {
    "name": "Masjid at-Taqwa Islamic Education Centre",
    "address": "1 Harewood Street, Leicester, LE5 3LX",
    "latitude": "52.6418743",
    "longitude": "-1.1053957",
    "city": "Leicester",
    "country": "UK",
    "type": "mosque",
    "bidetStatus": "unknown"
  }
]

// In your MemStorage constructor:
locations.forEach(loc => {
  const id = crypto.randomUUID();
  this.masajid.set(id, {
    ...loc,
    id,
    operatingHours: loc.operatingHours ?? null,
    phoneNumber: null,
    website: null,
    amenities: null,
    bidetType: null,
    isApproved: true,
    isFromGoogleMaps: false,
    googlePlaceId: null,
    masjidPhotoUrl: null,
    bidetPhotoUrl: null,
    createdAt: new Date(),
  });
});
```

---

## Notes

- No auth required — open community app
- No real DB — MemStorage resets on restart, that's fine for now
- OpenStreetMap tiles are free, no API key needed
- The app name "BidetBeacon" should appear in the header, page title, and browser tab
- Bidet status badge color guide: verified=green, no_bidet=red, warmed=amber, unknown=gray
- The "restaurant" type category label in the UI should read "Other Establishments" (not "restaurants")
