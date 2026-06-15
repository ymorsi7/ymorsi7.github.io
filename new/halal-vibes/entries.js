/**
 * Halal Vibes Blog - Entry Data
 *
 * To add a new entry: copy an entire object below, paste at the end of the array,
 * and edit the fields. No HTML editing needed.
 *
 * Region: US | Egypt | UK | Saudi Arabia | Turkey
 * Location: city/area (airport lounges: include IATA code, e.g. "Las Vegas (LAS)")
 * Categories: coffee | food | vibes | lounges
 * Scores: 1-10, or null if N/A
 * Stars: 1-5 for airport lounges (optional)
 * nonMeatOptions: true — show "Not halal · good non-meat options" badge on card
 * halalBadge: true — show "Halal" badge (also auto on Halal Restaurants tab entries)
 * halalOptions: true — show "Has halal options" badge (e.g. partial halal menu)
 */
const HALAL_VIBES_ENTRIES = [
  {
    slug: "cafe-venetia-palo-alto",
    title: "Cafe Venetia",
    region: "US",
    location: "Palo Alto",
    categories: ["coffee", "food", "vibes"],
    foodScore: 9,
    vibesScore: 9,
    excerpt: "My favorite cafe in Palo Alto. Amazing desserts and very yummy coffee. Great walking vibes, and the patio gives European vibes.",
    image: "halal-vibes/imgs/IMG_4886.jpg",
    content: `
      <p>Espresso bar · $10–20 · Downtown North</p>
      <p>My favorite cafe in Palo Alto. Amazing desserts, and very very yummy coffee. Great walking vibes, and I love taking visitors here. The patio outside give me European vibes.</p>
      <p><strong>Meal type:</strong> Brunch</p>
    `,
    date: "2025-03-01",
    tags: ["halal", "coffee", "brunch", "patio"]
  },
  {
    slug: "cafe-creme-austin",
    title: "Café Crème - Downtown",
    region: "US",
    location: "Austin",
    categories: ["coffee", "vibes"],
    foodScore: 8,
    vibesScore: 9,
    excerpt: "Excellent vibes. Vietnamese Coffee was not disappointing. Love all the greenery and colors inside the shop, and the great view outside the window.",
    image: "halal-vibes/imgs/cafecreme.jpg",
    images: ["halal-vibes/imgs/cafecreme.jpg", "halal-vibes/imgs/unnamed (1).jpg", "halal-vibes/imgs/unnamed (2).jpg", "halal-vibes/imgs/unnamed.jpg"],
    content: `
      <p>710 W Cesar Chavez St, Austin, TX 78701</p>
      <p>Excellent vibes. Came here and had the Vietnamese Coffee, and was not disappointed. I love all the greenery and colors inside the shop, and how great the view outside the window is. In a nutshell, excellent vibes, and good service.</p>
      <p>100% will be back next time I'm in DT Austin.</p>
    `,
    date: "2025-02-28",
    tags: ["halal", "coffee", "vietnamese"]
  },
  {
    slug: "nomad-donuts-san-diego",
    title: "Nomad Donuts",
    region: "US",
    location: "San Diego",
    categories: ["coffee", "food", "vibes"],
    foodScore: 9,
    vibesScore: 8,
    excerpt: "Amazing bagels and great donuts. Everything bagel with salmon, avocado and egg,  impressed. Maple donut thoroughly enjoyed. Parking surprisingly good for North Park.",
    image: "halal-vibes/imgs/nomads2.jpg",
    images: ["halal-vibes/imgs/nomads2.jpg", "halal-vibes/imgs/nomad.jpg"],
    content: `
      <p>Donuts · $10–20 · North Park</p>
      <p>Amazing bagels and great donuts. I got an everything bagel with salmon, avocado and egg and was impressed. Employee was very kind and even brought our order to us.</p>
      <p>I was also a fan of the maple donut, which I tried out and thoroughly enjoyed.</p>
      <p>One more note is that parking was surprisingly good for North Park. Definitely recommend.</p>
    `,
    date: "2025-02-15",
    tags: ["halal", "donuts", "bagels", "north park"]
  },
  {
    slug: "il-giardino-di-lilli-san-diego",
    title: "Il Giardino di Lilli",
    region: "US",
    location: "San Diego",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/il.jpg",
    content: `
      <p>San Diego, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "san diego"]
  },
  {
    slug: "ijava-cafe-almaden-san-jose",
    title: "iJava Cafe (Almaden)",
    region: "US",
    location: "San Jose",
    categories: ["coffee", "food", "vibes"],
    halalBadge: true,
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/IMG_5847.jpg",
    content: `
      <p>4858 Almaden Expy, San Jose, CA 95118</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "almaden", "san jose"]
  },
  {
    slug: "golden-bagel-san-diego",
    title: "Golden Bagel",
    region: "US",
    location: "San Diego",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/goldenbagel.png",
    content: `
      <p>San Diego, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "bagels", "san diego"]
  },
  {
    slug: "copa-vida-torrey-ridge-san-diego",
    title: "Copa Vida Torrey Ridge",
    region: "US",
    location: "San Diego",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/copa.jpg",
    content: `
      <p>10578 Science Center Dr, San Diego, CA 92121</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "torrey ridge", "san diego"]
  },
  {
    slug: "parakeet-cafe-la-jolla",
    title: "Parakeet Cafe",
    region: "US",
    location: "San Diego",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "La Jolla. Only good to go in the morning.",
    image: "images/3.jpg",
    content: `
      <p>La Jolla, San Diego, CA</p>
      <p>Only good to go in the morning.</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "la jolla", "san diego"]
  },
  {
    slug: "urban-skillet-san-diego",
    title: "Urban Skillet San Diego",
    region: "US",
    location: "San Diego",
    categories: ["food", "vibes"],
    foodScore: 9,
    vibesScore: 6,
    excerpt: "Mac and Cheese burrito is very tasty and filling. Great service and amazing location with good parking. All halal/zabiha. Food better than vibes, vibes moderate to average.",
    image: "halal-vibes/imgs/urban.png",
    content: `
      <p>9254 Scranton Rd, San Diego, CA 92121</p>
      <p>Went during the grand opening; was a big fan of their location in Santa Monica. Mac and Cheese burrito is very tasty and filling, though feels very unhealthy 😂. Great service and amazing location with good parking. Great that it's all halal/zabiha. Will definitely be back.</p>
      <p><em>Food better than vibes tbh vibes are moderate to average</em></p>
    `,
    date: "2025-02-15",
    tags: ["halal", "zabiha", "burrito"]
  },
  {
    slug: "fidels-little-mexico-solana-beach",
    title: "Fidel's Little Mexico",
    region: "US",
    location: "San Diego",
    categories: ["food", "vibes"],
    nonMeatOptions: true,
    foodScore: null,
    vibesScore: null,
    excerpt: "Solana Beach. Only the seafood is halal,  not the full menu.",
    image: null,
    content: `
      <p>Solana Beach, San Diego, CA</p>
      <p><strong>Note:</strong> Only the seafood is halal.</p>
    `,
    date: "2025-05-31",
    tags: ["seafood", "mexican", "solana beach"]
  },
  {
    slug: "pacific-coast-grill-san-diego",
    title: "Pacific Coast Grill",
    region: "US",
    location: "San Diego",
    categories: ["food", "vibes"],
    nonMeatOptions: true,
    foodScore: null,
    vibesScore: null,
    excerpt: "Only the seafood is halal, not the full menu.",
    image: null,
    content: `
      <p>San Diego, CA</p>
      <p><strong>Note:</strong> Only the seafood is halal.</p>
    `,
    date: "2025-05-31",
    tags: ["seafood", "san diego"]
  },
  {
    slug: "mal-al-sham-san-diego",
    title: "Mal al Sham",
    region: "US",
    location: "San Diego",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: null,
    content: `
      <p>San Diego, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "middle eastern", "san diego"]
  },
  {
    slug: "kunduz-kabob-san-diego",
    title: "Kunduz Kabob",
    region: "US",
    location: "San Diego",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: null,
    content: `
      <p>San Diego, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "kabob", "san diego"]
  },
  {
    slug: "urban-skillet-santa-monica",
    title: "Urban Skillet",
    region: "US",
    location: "Los Angeles",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 8,
    excerpt: "My #1 lunch/dinner pick in LA. Brisket wrap + mac and cheese is bussin—never disappoints. Parking is the only pain (sometimes worth the ticket).",
    image: null,
    content: `
      <p>2307 Main St, Santa Monica, CA 90405</p>
      <p>My #1 lunch/dinner recommendation to anyone visiting LA. Amazing. The brisket wrap with mac and cheese is absolutely bussin, and they never disappoint. Only bad thing about this place is the parking—but sometimes it's worth the ticket.</p>
      <p>If I wasn't only restricted to eating halal food, I would still go out of my way to eat here.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "zabiha", "burrito", "brisket", "santa monica", "los angeles"]
  },
  {
    title: "Courage Bagels",
    region: "US",
    location: "Los Angeles",
    categories: ["food", "vibes"],
    foodScore: 8,
    vibesScore: 7,
    excerpt: "Salmon bagel on everything bread,  quite delicious. Seating not plentiful, line to stand in, no parking, quite pricey. Vibes slightly above average. Good for showing tourists around LA.",
    image: "halal-vibes/imgs/fefef.jpg",
    images: ["halal-vibes/imgs/fefef.jpg", "halal-vibes/imgs/faaedf.jpg", "halal-vibes/imgs/fefe.jpg", "halal-vibes/imgs/kaefn.jpg", "halal-vibes/imgs/ljnlj.jpg", "halal-vibes/imgs/vadfda.jpg"],
    content: `
      <p>777 Virgil Ave, Los Angeles, CA 90029</p>
      <p>As a bagel enthusiast, I was excited to try this trendy spot. I had the salmon bagel on everything bread and it was quite delicious. Things to note however: the seating is not that plentiful, there is a line you have to stand in (even after 9 AM on a weekday), there is no parking (I had to park 1-2 blocks away in a neighborhood), and there didn't seem to be a bathroom (it seems that only employees go inside). Quite pricey, but would recommend if you want to show a tourist around LA and get him an LA breakfast.</p>
      <p>One note: personally I like being able to customize my bagels by adding egg/avocado but Courage Bagels doesn't carry either. I also found their bread selection to be limited.</p>
      <p><em>Vibes were good, slightly above average.</em></p>
    `,
    date: "2025-02-15",
    tags: ["halal", "bagels", "breakfast"]
  },
  {
    slug: "milyar-coffee-santa-clara",
    title: "Milyar Coffee House",
    region: "US",
    location: "Santa Clara",
    categories: ["coffee", "vibes"],
    halalBadge: true,
    foodScore: 6,
    vibesScore: 9,
    excerpt: "Amazing atmosphere and probably the best bathroom I've ever seen in a public place. Just Peachy drink is good. Coffee isn't the greatest but atmosphere is great.",
    image: "halal-vibes/imgs/milyar.jpg",
    content: `
      <p>1098 Monroe St, Santa Clara, CA 95050</p>
      <p>Amazing atmosphere, and I must say that they probably have the best bathroom I've ever seen in a public place. Bidet, air fresheners, personal sink, you name it.</p>
      <p>I like the Just Peachy drink, and although generally their coffee isn't the greatest, in terms of atmosphere this place is great. Very good and central location as well.</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "coffee", "study spot"]
  },
  {
    slug: "ibs-santa-clara",
    title: "IB's",
    region: "US",
    location: "Santa Clara",
    categories: ["food", "vibes"],
    foodScore: 9,
    vibesScore: 5,
    excerpt: "Best halal philly cheese steak I've ever had. Amazing sandwiches and good service. Can be oily and messy, no restroom, parking a bit tough. Atmosphere 2/5.",
    image: "halal-vibes/imgs/IB.png",
    content: `
      <p>2261 The Alameda, Santa Clara, CA 95050</p>
      <p>Amazing sandwiches and good service. Best halal philly cheese steak I've ever had. Unfortunately they can be oily and messy, and there is no restroom to wash hands. Parking is also a bit tough. Otherwise, great spot</p>
      <p><strong>Price per person:</strong> $10–20 | Food: 5 | Service: 5 | Atmosphere: 2</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "philly", "sandwiches"]
  },
  /*
  {
    slug: "halalstreet-xinjiang-mountain-view",
    title: "HalalStreet Xinjiang Cuisine",
    region: "US",
    location: "Mountain View",
    categories: ["food"],
    foodScore: 5,
    vibesScore: 5,
    excerpt: "Wait for table despite empty tables, popular stuff sold out, lamb took ages, overpriced. 3 stars; would never go back.",
    image: "halal-vibes/imgs/xin.png",
    content: `
      <p>174 Castro St, Mountain View, CA 94041</p>
      <p>My friends and I went there and had to wait a while to get a table (although there were empty tables). All the popular stuff was sold out (e.g. kung pao), and they didn't have any of the more famous Chinese-American cuisine like sweet and spicy chicken. I ordered a lamb dish and it took absolute ages to arrive. To top it all off, the items were quite overpriced. Waitress was very good but when dealing with the guy that saw us waiting to be seated, we felt the service was unprofessional.</p>
      <p>3 stars; would never go back</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "xinjiang", "chinese"]
  },
  */
  {
    slug: "mr-toots-coffeehouse-capitola",
    title: "Mr Toots Coffeehouse",
    region: "US",
    location: "Santa Cruz/Capitola",
    categories: ["coffee", "vibes"],
    foodScore: 8,
    vibesScore: 10,
    excerpt: "Amazing view and great wifi. Good place to work remotely. Highly recommend for a remote day away from San Jose. Great aesthetics.",
    image: "halal-vibes/imgs/toots.png",
    content: `
      <p>231 Esplanade #100, Capitola, CA 95010</p>
      <p>Amazing view and great wifi. Good place to work remotely from with fast wifi, and very nice service.</p>
      <p>Highly recommend, especially if you have a remote day for work and want to go somewhere away from San Jose. Great aesthetics. Food: 5 | Service: 5 | Atmosphere: 5</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "coffee", "remote work"]
  },
  {
    slug: "portos-bakery-buena-park",
    title: "Porto's Bakery and Cafe",
    region: "US",
    location: "Buena Park",
    categories: ["coffee", "food", "vibes"],
    foodScore: 9,
    vibesScore: 10,
    excerpt: "Amazing atmosphere, great food, amazing vibes, and good location. AMAZING VIBES!!! Just go early or it'll be overly crowded.",
    image: "halal-vibes/imgs/ortos.jpg",
    images: ["halal-vibes/imgs/ortos.jpg", "halal-vibes/imgs/portos.jpg"],
    content: `
      <p>7640 Beach Blvd, Buena Park, CA 90620</p>
      <p>Amazing atmosphere, great food, amazing vibes, and good location. Meal type: Breakfast. Price per person: $10–20. Food: 5 | Service: 5</p>
      <p><strong>AMAZING VIBES!!!</strong> Very good, just go early or it'll be overly crowded</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "bakery", "breakfast"]
  },
  {
    slug: "susiecakes-del-mar",
    title: "SusieCakes - Del Mar",
    region: "US",
    location: "San Diego",
    categories: ["desserts", "vibes"],
    foodScore: 9,
    vibesScore: 8,
    excerpt: "Brilliant cakes. Recommend cranberry loaf, carrot cake, and probably anything else. Very good service and quality desserts. My go-to bakery in Del Mar. 8/10 vibe score.",
    image: null,
    content: `
      <p>3705 Caminito Ct #0500, San Diego, CA 92130</p>
      <p>Brilliant cakes. I recommend their cranberry loaf, carrot cake, and honestly probably anything else they have. Very good service and quality desserts. My go-to bakery in Del Mar. Food: 5 | Service: 5. 8/10 vibe score</p>
    `,
    date: "2024-11-01",
    tags: ["halal", "bakery", "desserts"]
  },
  {
    slug: "batch-and-box-la-jolla",
    title: "Batch & Box,  La Jolla",
    region: "US",
    location: "San Diego",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: null,
    content: `
      <p>La Jolla, San Diego, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "desserts", "la jolla"]
  },
  {
    slug: "aerotel-lounge-jeddah",
    title: "Aerotel Lounge",
    region: "Saudi Arabia",
    location: "Jeddah (JED)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 5,
    excerpt: "Very nice—amazing food, excellent service, brilliant overall. Not on Priority Pass; you have to pay extra for entry.",
    image: null,
    content: `
      <p>King Abdulaziz International Airport (JED), Jeddah, Saudi Arabia</p>
      <p>Very nice, amazing food, excellent service, and brilliant overall.</p>
      <p><strong>Note:</strong> It isn't Priority Pass—you have to pay extra for it.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "jeddah", "jed", "aerotel"]
  },
  {
    slug: "jed-welcome-lounge",
    title: "JED Welcome Lounge",
    region: "Saudi Arabia",
    location: "Jeddah (JED)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "Very good, but not out of this world. A bit small compared to other Jeddah lounges.",
    image: null,
    content: `
      <p>King Abdulaziz International Airport (JED), Jeddah, Saudi Arabia</p>
      <p>Very good, but not out of this world. A bit small compared to other Jeddah lounges.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "jeddah", "jed", "welcome lounge"]
  },
  {
    slug: "alfursan-lounge-jeddah",
    title: "Alfursan Lounge - Jeddah Airport",
    region: "Saudi Arabia",
    location: "Jeddah (JED)",
    categories: ["food", "vibes", "lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 5,
    excerpt: "Favorite lounge at JED and around the world. Chef custom-makes pizza and pasta, barista, great buffet. Nice musallah. Best lounge I've ever been to.",
    image: "halal-vibes/imgs/fursan.jpg",
    content: `
      <p>King Abdulaziz International Airport, Jeddah 23635, Saudi Arabia</p>
      <p>I've been to several lounges not only at JED, but around the world, and I have to say that this is my favorite one. They have a counter where a chef custom-makes you a pizza, another one for pasta, and a barista. The buffet options are great too. There are also a couple dessert options in the buffet, but most of the great desserts are behind a counter. Desserts however were great, and the sleep accomodations were amazing too. Nice musallah there for prayers, and honestly a very luxurious lounge. This is probably the best lounge I have ever been to.</p>
      <p>They also allow you to go in more than 3 hours before your flight if you have a business class ticket. Certainly worth it. <strong>EXCELLENT VIBES, full vibe score</strong></p>
    `,
    date: "2024-12-01",
    tags: ["lounge", "airport", "jeddah"]
  },
  {
    slug: "av-tap-vip-lounge-miami",
    title: "AV/TAP VIP Lounge",
    region: "US",
    location: "Miami (MIA)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "Great lounge, great food—very impressed for a lounge in America.",
    image: null,
    content: `
      <p>Miami International Airport (MIA), Miami, FL</p>
      <p>Great lounge, great food. Was very impressed for a lounge in America.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "miami", "mia", "tap", "avianca"]
  },
  {
    slug: "plaza-premium-lounge-dfw",
    title: "Plaza Premium Lounge",
    region: "US",
    location: "Dallas (DFW)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "Great lounge, great sweets, and good location—not too far from the gates.",
    image: null,
    content: `
      <p>Dallas/Fort Worth International Airport (DFW), Dallas, TX</p>
      <p>Great lounge, great sweets, and good location—not too far.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "dallas", "dfw", "plaza premium"]
  },
  {
    slug: "admirals-club-ord",
    title: "American Airlines Admirals Club",
    region: "US",
    location: "Chicago (ORD)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "Good lounge, very good food. Convenient for work calls after landing—I paid for entry before I had Priority Pass.",
    image: null,
    content: `
      <p>O'Hare International Airport (ORD), Chicago, IL</p>
      <p>I paid for entry—I went there before I had Priority Pass. Good lounge, very good. Was convenient because I had work meetings upon landing and was easily able to take them from there. Good food.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "chicago", "ord", "american airlines", "admirals club"]
  },
  {
    slug: "amex-lounge-lax",
    title: "American Express Lounge",
    region: "US",
    location: "Los Angeles (LAX)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "",
    image: "images/AMEX.jpg",
    content: `
      <p>Los Angeles International Airport (LAX), Los Angeles, CA</p>
    `,
    date: "2025-05-31",
    tags: ["lounge", "airport", "lax"]
  },
  {
    slug: "cac-lounge-cairo-terminal-3",
    title: "CAC Lounge (E Lounge),  Terminal 3",
    region: "Egypt",
    location: "Cairo (CAI)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "",
    image: null,
    content: `
      <p>Cairo International Airport, Terminal 3, Cairo Governorate, Egypt</p>
    `,
    date: "2025-05-31",
    tags: ["lounge", "airport", "cairo"]
  },
  {
    slug: "pearl-lounge-alexandria-hbe",
    title: "Pearl Lounge",
    region: "Egypt",
    location: "Alexandria (HBE)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 1,
    excerpt: "Very few food options and poor quality—nothing filling. Tiny, cramped space. Often have to wait; Priority Pass frequently doesn't sync with their system.",
    image: null,
    content: `
      <p>Borg El Arab Airport (HBE), Alexandria Governorate, Egypt</p>
      <p>Very little food options, and the quality of them aren't good—and nothing filling. Also very small space and very crammed. Often times I go there and have to wait because they have issues getting Priority Pass to work with the system.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "alexandria", "hbe", "priority pass"]
  },
  {
    slug: "etihad-lounge-washington",
    title: "Etihad Airways Washington Lounge",
    region: "US",
    location: "Washington, D.C. (IAD)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "Has a prayer room with a rug. Washington Dulles (IAD).",
    image: "images/IMG_2590.jpg",
    content: `
      <p>Washington Dulles International Airport (IAD), Washington, D.C.</p>
      <p>Has a prayer room and a rug for prayer.</p>
    `,
    date: "2025-05-31",
    tags: ["lounge", "airport", "etihad", "iad", "prayer room"]
  },
  {
    slug: "prima-vista-lounge-fco",
    title: "Prima Vista Lounge – Portus",
    region: "Italy",
    location: "Rome (FCO)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "Pretty much no wait, easy to get in. Amazing desserts, and very nice and big.",
    image: "images/IMG_4550.jpg",
    content: `
      <p>Leonardo da Vinci–Fiumicino Airport (FCO), Rome, Italy</p>
      <p>Pretty much no wait, easy to get in. Amazing desserts, and very nice and big.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "fco", "rome", "portus", "prima vista"]
  },
  {
    slug: "essence-escape-lounge-stansted",
    title: "Essence by Escape Lounge",
    region: "UK",
    location: "London Stansted (STN)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 2.75,
    excerpt: "Very hard to get in—always a waitlist. Showed up before opening and still waited after they opened while on a list. Food is not good.",
    image: "images/IMG_7756.jpg",
    content: `
      <p>London Stansted Airport (STN), Essex, United Kingdom</p>
      <p>Very hard to get in, always wait list. I showed up early before opening and still took me a while to get in after they opened because they still put me on a list. Takes very long to get in consistently, and the food is not good.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "stansted", "stn", "escape lounge"]
  },
  {
    slug: "plaza-premium-lounge-heathrow",
    title: "Plaza Premium Lounge",
    region: "UK",
    location: "London Heathrow (LHR)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 3.5,
    excerpt: "Decent food, but the lounge is tiny—feels wedged into whatever leftover space they could find at Heathrow.",
    image: null,
    content: `
      <p>London Heathrow Airport (LHR), London, United Kingdom</p>
      <p>Decent food options, but so tiny. Feels like they just crammed a lounge into some small space they found—not much room to breathe for an airport this size.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "london", "lhr", "heathrow", "plaza premium"]
  },
  {
    slug: "club-aspire-lounge-heathrow",
    title: "Club Aspire Lounge",
    region: "UK",
    location: "London Heathrow (LHR)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 3.5,
    excerpt: "Food is passable, but the footprint is minuscule—basically the same cramped vibe as the other small Heathrow lounges.",
    image: null,
    content: `
      <p>London Heathrow Airport (LHR), London, United Kingdom</p>
      <p>Food options are decent, but the lounge is so small it seems shoehorned into a tight corner. Functionally the same story as Plaza Premium at LHR: fine for a bite, not a place to settle in.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "london", "lhr", "heathrow", "aspire"]
  },
  {
    slug: "lot-business-lounge-mazurek-warsaw",
    title: "LOT Business Lounge Mazurek",
    region: "Poland",
    location: "Warsaw (WAW)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 3.75,
    excerpt: "Wasn't outstanding, but they allow paid entry. Decent selections—nothing crazy.",
    image: null,
    content: `
      <p>Warsaw Chopin Airport (WAW), Warsaw, Poland</p>
      <p>Wasn't outstanding. They allow you to pay for entry. Decent selections but nothing crazy.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "warsaw", "waw", "lot"]
  },
  {
    slug: "skyserv-aristotle-onassis-lounge-athens",
    title: "Skyserv Aristotle Onassis Lounge",
    region: "Greece",
    location: "Athens (ATH)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "Great lounge—decent food, not too crowded, and nice bathrooms.",
    image: null,
    content: `
      <p>Athens International Airport (ATH), Athens, Greece</p>
      <p>It is a great lounge. Decent food, not too crowded, and nice bathrooms.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "athens", "ath", "skyserv"]
  },
  {
    slug: "aspire-lounge-san-diego",
    title: "Aspire Lounge",
    region: "US",
    location: "San Diego (SAN)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 2,
    excerpt: "Very small. Food options are awful, at least for breakfast.",
    image: null,
    content: `
      <p>San Diego International Airport (SAN), San Diego, CA</p>
      <p>Very small. Food options are awful, at least for breakfast.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "san diego", "san", "aspire"]
  },
  {
    slug: "chase-sapphire-lounge-san-diego",
    title: "Chase Sapphire Lounge",
    region: "US",
    location: "San Diego (SAN)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "",
    image: "images/SANsaph.jpg",
    content: `
      <p>San Diego International Airport (SAN), San Diego, CA</p>
    `,
    date: "2025-05-31",
    tags: ["lounge", "airport", "san diego"]
  },
  {
    slug: "chase-sapphire-lounge-las-vegas",
    title: "Chase Sapphire Lounge, Las Vegas",
    region: "US",
    location: "Las Vegas (LAS)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "Food options are great, but the wait is annoying and it's crowded. I was stuck at the bar with nowhere else to sit—even though I don't drink. Also a bit of a walk from where I was.",
    image: "images/vegas.jpg",
    content: `
      <p>Harry Reid International Airport (LAS), Las Vegas, NV</p>
      <p>Food options are great. The wait is very annoying, and it's crowded—I was stuck sitting at a bar despite not drinking, because according to the waiter there was nowhere else to sit. Also a bit of a walk from where I was.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "las vegas", "chase sapphire"]
  },
  {
    slug: "san-jose-airport-lounge",
    title: "The Club",
    region: "US",
    location: "San Jose (SJC)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 2,
    excerpt: "Breakfast is good, but evening halal/veg options are slim (often just chicken). Terminal A only—far from Terminal B gates. Dry cookies, but a really nice coworking space.",
    image: null,
    content: `
      <p>The Club — Mineta San Jose International Airport (SJC), Terminal A — San Jose, CA</p>
      <p>This was the first lounge I've ever been to, so it pains me to make this review.</p>
      <p>I have to say, in my experience, their breakfast is good. However, I've been there around 6PM many many times, only to say that their lunch/dinner options are pretty much nil if you can't eat meat. As someone who only eats halal certified meat, I am not able to eat their lunch/dinner because it's usually just one option that is chicken.</p>
      <p>After living in San Jose, I can confidently say that I am not alone in not being able to eat their meals with meat, as a lot of the community is vegetarian.</p>
      <p>Another note is that their cookies are consistently dry which I find surprising for a lounge that presumably has a kitchen.</p>
      <p>Another problem is that people usually come to SJC to fly out of terminal B, but this, which is the nearest lounge, is in terminal A, forcing people to have to walk far from their gate in order to use their lounge benefits.</p>
      <p>I would rate lower if it wasn't for the fact that they have a really nice coworking space.</p>
      <p><strong>Update:</strong> Food options have gotten slightly better—they started including quesadillas that don't have to contain meat.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "san jose", "sjc", "the club", "halal", "vegetarian", "terminal a"]
  },
  {
    slug: "plaza-premium-marmara-saw",
    title: "Plaza Premium Lounge – Marmara",
    region: "Turkey",
    location: "Istanbul (SAW)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "Very nice—good food with halal options, Priority Pass works. A bit small; not out of this world, but a good lounge I enjoyed.",
    image: null,
    content: `
      <p>Istanbul Sabiha Gökçen Airport (SAW), Istanbul, Turkey</p>
      <p>Very nice. A bit small but good food and halal food, and Priority Pass. I enjoyed it and had a nice lounge experience—not out of this world, but a good lounge.</p>
    `,
    date: "2026-06-03",
    tags: ["lounge", "airport", "istanbul", "saw", "plaza premium", "halal", "priority pass"]
  },
  {
    slug: "iga-lounge-istanbul",
    title: "iGA Lounge",
    region: "Turkey",
    location: "Istanbul (IST)",
    categories: ["lounges"],
    foodScore: null,
    vibesScore: null,
    stars: 5,
    excerpt: "",
    image: "images/iga.jpg",
    content: `
      <p>Istanbul Airport (IST), Istanbul, Turkey</p>
    `,
    date: "2025-05-31",
    tags: ["lounge", "airport", "istanbul"]
  },
  {
    slug: "gad-alexandria",
    title: "Gad",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["food"],
    foodScore: 9,
    vibesScore: 7,
    excerpt: "One of the greatest falafel spots in Alex. Recommend the egg/pastrami sandwich and pastrami-stuffed falafel sandwiches. Very tasty and filling.",
    image: null,
    content: `
      <p>272 El-Gaish Road, Stanley Bridge, El Raml 2, Alexandria Governorate, Egypt</p>
      <p>One of the greatest falafel spots in Alex. I recommend the egg/pastrami sandwich, and the pastrami-stuffed falafel sandwiches. Very tasty, and filling. Price per person: E£1–200. Meal type: Breakfast</p>
    `,
    date: "2024-12-01",
    tags: ["halal", "falafel", "egyptian"]
  },
  {
    slug: "nos-regheef-alexandria",
    title: "Nos Regheef - Gleem Bay",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["food", "vibes"],
    foodScore: 9,
    vibesScore: 9,
    excerpt: "Great atmosphere, great breakfast, great service. Small delays with check/soda. Otherwise great. EXCELLENT VIBES, 90% vibe score.",
    image: "halal-vibes/imgs/nosragheef.png",
    images: ["halal-vibes/imgs/nosragheef.png", "halal-vibes/imgs/noss.png"],
    content: `
      <p>Gleem Bay, Alexandria, San Stefano, El Raml 1, Alexandria Governorate, Egypt</p>
      <p>Great atmosphere, great breakfast, and great service, except for the small delays where they may forget to give you your check or take some time to bring your soda. Otherwise great. Food: 5 | Service: 4 | Atmosphere: 5. Price: E£200–400</p>
      <p><strong>EXCELLENT VIBES, 90% vibe score</strong></p>
    `,
    date: "2024-12-01",
    tags: ["halal", "breakfast", "egyptian"]
  },
  {
    slug: "bazooka-chicken-alexandria",
    title: "Bazooka Chicken",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 9,
    excerpt: "Deserves an award. Cheeseburger wraps and fried chicken wraps are out of this world—always a good eat, and perfect when you want wraps over a greasy bucket.",
    image: null,
    content: `
      <p>Alexandria Governorate, Egypt · branches across Alexandria (Raml, Asafra, Smouha, Louran, and more)</p>
      <p>This place deserves an award or something. Their cheeseburger wraps and fried chicken wraps are out of this world. Very delectable and always a good eat. The wraps are good when not in the mood to eat something oily like a bucket of fried chicken haha.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "chicken", "wrap", "fried chicken", "alexandria"]
  },
  {
    slug: "caribou-coffee-alexandria",
    title: "Caribou Coffee",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["coffee", "vibes"],
    foodScore: 8,
    vibesScore: 8,
    excerpt: "Great Spanish Latte for a chain. Quite bussin. Excellent location, service and atmosphere. 8/10 vibe score.",
    image: "halal-vibes/imgs/caribou.png",
    images: ["halal-vibes/imgs/caribou.png", "halal-vibes/imgs/caribou2.png"],
    content: `
      <p>6WMX+CMX Stanley, El-Gaish Rd, Fleming, El Raml 1, Alexandria Governorate, Egypt</p>
      <p>Great Spanish Latte for a branch of a chain.. quite bussin I must say. Excellent location, service and atmosphere too. 8/10 vibe score</p>
    `,
    date: "2024-12-01",
    tags: ["halal", "coffee", "spanish latte"]
  },
  {
    slug: "mikel-coffee-company-alexandria",
    title: "Mikel Coffee Company",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/images.jpg",
    content: `
      <p>88 El-Horeya Rd, Bab Sharqi WA Wabour Al Meyah, Bab Shar', Alexandria Governorate 5423002, Egypt</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "bab shar"]
  },
  {
    slug: "fikscue-thrive-city-sf",
    title: "Fikscue Thrive City",
    region: "US",
    location: "San Francisco",
    categories: ["food", "vibes"],
    foodScore: 9,
    vibesScore: 8,
    excerpt: "Brisket sandwich was amazing and decently priced. Great view and location. Parking may not be optimal. Good BBQ sauce. 8.5/10 vibe score.",
    image: "halal-vibes/imgs/fiks.png",
    images: ["halal-vibes/imgs/fiks.png", "halal-vibes/imgs/fix2.png"],
    content: `
      <p>7 Warriors Wy Suite 208, San Francisco, CA 94158</p>
      <p>The brisket sandwich was amazing and decently priced. Great view and location, although parking may not be optimal. Good BBQ sauce, would def try again. 8.5/10 vibe score</p>
    `,
    date: "2024-12-01",
    tags: ["halal", "bbq", "brisket"]
  },
  {
    title: "Qahwa",
    region: "Egypt",
    location: "Cairo, Egypt",
    categories: ["coffee", "vibes"],
    foodScore: 5,
    vibesScore: 9,
    excerpt: "Vibes of the place 9/10 but service was terrible,  took forever, not that busy. Parking horrendous. Many heaters broken.",
    image: null,
    content: `
      <p>New Cairo 1, Cairo Governorate, Egypt</p>
      <p>Not that many heaters outside and many of them were broken. I asked for my order to be taken multiple times and they never came after 20 minutes. I eventually went up to them to order and waited probably another twenty minutes. Service was terrible and took forever, although they were kind. Note that all this and it wasn't even that busy. Parking situation was also quite horrendous.</p>
      <p><em>Vibes of the place was like 9/10 just bad service</em></p>
    `,
    date: "2024-12-01",
    tags: ["halal", "coffee", "new cairo"]
  },
  {
    slug: "1980-coffee-cairo",
    title: "1980 Coffee",
    region: "Egypt",
    location: "Cairo, Egypt",
    categories: ["coffee", "food", "vibes"],
    foodScore: 9,
    vibesScore: 10,
    excerpt: "Great service, lox eggs benedict, blended iced Spanish Latte. Full vibe score. Only one toilet, too much cream cheese on eggs benedict.",
    image: "halal-vibes/imgs/19080.png",
    images: ["halal-vibes/imgs/19080.png", "halal-vibes/imgs/19800.png"],
    content: `
      <p>2G4M+9QP, New Cairo 1, Cairo Governorate, Egypt</p>
      <p>Great service, lox eggs benedict, and blended iced Spanish Latte. Only criticism is that there's only one toilet, and that they put too much cream cheese on the eggs benedict. Food: 5 | Service: 5 | Atmosphere: 5. Full vibe score</p>
    `,
    date: "2024-12-01",
    tags: ["halal", "coffee", "breakfast"]
  },
  {
    slug: "coasterra-san-diego",
    title: "Coasterra",
    region: "US",
    location: "San Diego",
    categories: ["food", "vibes"],
    nonMeatOptions: true,
    foodScore: 9,
    vibesScore: 9,
    excerpt: "Amazing enchiladas. Sublime view. Very good service. Valet parking ($10),  worth it, especially with Chase Sapphire dining credit. 9/10 vibe score.",
    image: "halal-vibes/imgs/coasterra.png",
    content: `
      <p>880 B Harbor Island Dr, San Diego, CA 92101</p>
      <p>Amazing enchiladas. Sublime view. Very good service. Only issue was that you basically have to get valet parking (10 dollars) because was 0 parking in the lot, but I have to say it was worth it - especially if you have the Chase Sapphire dining credit. Price: $30–50. Food: 5. 9/10 vibe score</p>
    `,
    date: "2024-12-01",
    tags: ["mexican", "waterfront", "vegetarian options"]
  },
  {
    slug: "jazwah-coffee-chicago",
    title: "JAZWAH COFFEE",
    region: "US",
    location: "Chicago",
    categories: ["coffee", "food", "vibes"],
    halalBadge: true,
    foodScore: 9,
    vibesScore: 8,
    excerpt: "Beautiful on the inside. Spanish Latte good. Peach and Mango espresso AMAZING. Chocolate chip cookies and chocolate cake amazing. 8.5/10 vibe score.",
    image: "halal-vibes/imgs/jazwaH.png",
    content: `
      <p>9150 S Harlem Ave, Bridgeview, IL 60455</p>
      <p>Great and beautiful on the inside. Spanish Latte is good. Peach and Mango espresso is AMAZING. Chocolate chip cookies is also AMAZING. Chocolate cake is also pretty good. Great location. Price: $1–10. 8.5/10 vibe score</p>
    `,
    date: "2024-11-01",
    tags: ["halal", "coffee", "bridgeview"]
  },
  {
    slug: "mdakhan-chicago",
    title: "M'dakhan (Mdakhan)",
    region: "US",
    location: "Chicago",
    categories: ["food"],
    foodScore: 10,
    vibesScore: 6,
    excerpt: "Best Middle Eastern restaurant I've ever had in the US. Amazing mixed grill platter and delectable brisket sandwich. Vibe score not that high but more of an amazing restaurant.",
    image: "halal-vibes/imgs/mdakhan.png",
    content: `
      <p>9115 S Harlem Ave, Bridgeview, IL 60455</p>
      <p>Best Middle Eastern restaurant I've ever had in the US. Amazing mixed grill platter and delectable brisket sandwich. Absolutely amazing. There was a short wait but it was absolutely worth it 100%. The banana milk was also pretty good. Food: 5 | Service: 5 | Atmosphere: 5. Wait time: 10-30 min</p>
      <p><em>Vibe score not that high but more of an amazing restaurant.</em></p>
    `,
    date: "2024-11-01",
    tags: ["halal", "middle eastern", "bridgeview"]
  },
  /*
  {
    slug: "et-voila-san-diego",
    title: "Et Voilà! French Bistro",
    region: "US",
    location: "San Diego",
    categories: ["food"],
    foodScore: 6,
    vibesScore: 6,
    excerpt: "Out of 6 menu pages one was food. 40 min wait for smallest portions. Parking abysmal. Do not recommend. Food was good but not worth price, wait, or parking.",
    image: null,
    content: `
      <p>3015 Adams Ave, San Diego, CA 92116</p>
      <p>Out of 6 menu pages (iirc) one was food. We waited about 40 minutes give or take for one of the smallest portion sizes I have ever seen in my life. Parking is abysmal. Do not recommend. Food was good but certainly not worth the price, wait, or even parking situation. Food: 3 | Service: 5 | Atmosphere: 4</p>
    `,
    date: "2024-11-01",
    tags: ["french", "bistro"]
  },
  */
  {
    slug: "cafe-luna-san-diego",
    title: "Cafe Luna",
    region: "US",
    location: "San Diego",
    categories: ["food", "vibes"],
    nonMeatOptions: true,
    foodScore: 9,
    vibesScore: 9,
    excerpt: "Great food with great service. Manicotti #1 recommendation. Bread with sauce appetizer pretty good. Olive Garden has no business being in the same complex. 9/10 vibe score.",
    image: null,
    content: `
      <p>11040 Rancho Carmel Dr #2, San Diego, CA 92128</p>
      <p>Great food with great service. I loved the Manicotti, definitely #1 recommendation. Bread with sauce appetizer was also pretty good. I'm not usually big on Italian restaurants but honestly the Olive Garden has no business being in the same complex as this 😂. Food: 5 | Service: 5. 9/10 vibe score</p>
    `,
    date: "2024-11-01",
    tags: ["italian", "vegetarian options"]
  },
  {
    slug: "dukes-malibu",
    title: "Duke's Malibu",
    region: "US",
    location: "Malibu",
    categories: ["food", "vibes"],
    nonMeatOptions: true,
    foodScore: 9,
    vibesScore: 8,
    excerpt: "Best calamari in California. Amazing view of the coast. Social distancing done right, no flies. 8.5/10 vibe score.",
    image: null,
    content: `
      <p>21150 Pacific Coast Hwy, Malibu, CA 90265</p>
      <p>Best calamari in California, in my opinion. Highly recommend it as an appetizer. Unlike the outdoor seating at other restaurants, this one implemented social distancing (in 2020), had no flies or anything, and an amazing view of the coast of Malibu. Food: 5 | Atmosphere: 5. 8.5/10 vibe score</p>
    `,
    date: "2024-11-01",
    tags: ["seafood", "waterfront", "vegetarian options"]
  },
  {
    slug: "alexandria-sporting-club",
    title: "Alexandria Sporting Club",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["vibes"],
    foodScore: 7,
    vibesScore: 9,
    excerpt: "Really love this place. Beautiful. Wi-Fi isn't fast and reliable, clubhouse doesn't have AC only fans. Service and staff excellent. 9/10 vibe score.",
    image: "halal-vibes/imgs/alexspoirting.png",
    images: ["halal-vibes/imgs/alexspoirting.png", "halal-vibes/imgs/alexsporting.png"],
    content: `
      <p>Abou Quer الرياضة, Sidi Gabir, Alexandria Governorate, Egypt</p>
      <p>Honestly, I really love this place. It's beautiful, but the only downside is that the Wi-Fi isn't fast and reliable, and the clubhouse doesn't have air conditioning, only fans. But honestly, the place is very nice, and the service and staff are excellent. 9/10 vibe score</p>
    `,
    date: "2024-10-01",
    tags: ["halal", "sporting club"]
  },
  {
    slug: "antoniades-gardens-alexandria",
    title: "Antoniades Gardens",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["vibes"],
    foodScore: null,
    vibesScore: 9,
    excerpt: "Beautiful place to take a morning walk, read a nice book, and enjoy life. The nature there is absolutely stunning. 9/10 vibe score.",
    image: "halal-vibes/imgs/antoniades.jpg",
    content: `
      <p>ش البرت الأول, Smoha Sq., Sidi Gabir, Egypt</p>
      <p>A beautiful place to take a morning walk, read a nice book, and enjoy life. The nature there is absolutely stunning. 9/10 vibe score</p>
    `,
    date: "2024-10-01",
    tags: ["gardens", "nature", "alexandria"]
  },
  {
    slug: "chicken-gs-mountain-view",
    title: "Chicken G's",
    region: "US",
    location: "Mountain View",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 4,
    excerpt: "Best zinger you'll ever taste—worth it once despite the shack vibes. Prayer room. No indoor restroom; sublime pineapple juice.",
    image: null,
    content: `
      <p>1414 W El Camino Real, Mountain View, CA 94040</p>
      <p>If you want the best zinger you've ever gifted your tongue with the opportunity of tasting, come to this place. Amazing zinger—although oily and a diet-destroyer, I would say it's worth trying at least once.</p>
      <p>I love that they have a prayer room. The only downside is that they don't have a restroom inside the restaurant—you have to go outside. Also the place is a really unattractive shack, and judging from how it looks on the outside, I would never eat there. Nevertheless I go occasionally because of how darn good the zinger is.</p>
      <p>I also really recommend the pineapple juice (sublime).</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "chicken", "zinger", "prayer room", "mountain view"]
  },
  {
    slug: "zankou-chicken-valencia",
    title: "Zankou Chicken Valencia",
    region: "US",
    location: "Santa Clarita",
    categories: ["food"],
    halalOptions: true,
    foodScore: 9,
    vibesScore: 7,
    excerpt: "Great halal food. Chicken tarna wrap quite delectable. Location convenient, wait not awful. Service 4 stars. Everything else great.",
    image: null,
    content: `
      <p>24463 Magic Mountain Pkwy, Santa Clarita, CA 91355</p>
      <p>Great halal food. Got the chicken tarna wrap, and it was quite delectable. Location was quite convenient, and the wait wasn't so awful. I give 4 stars for service bc they did finish it after when they said they would but other than that everything was great. Food: 5 | Service: 4 | Atmosphere: 4. Price: $10–20</p>
    `,
    date: "2024-10-01",
    tags: ["halal", "chicken", "wrap"]
  },
  {
    slug: "tesla-diner-la",
    title: "Tesla Diner",
    region: "US",
    location: "Los Angeles",
    categories: ["food", "vibes"],
    nonMeatOptions: true,
    foodScore: 8,
    vibesScore: 8,
    excerpt: "V2G Egg sandwich brilliant. Really got the 50s Hollywood feel. Great view of Hollywood sign on second floor. Bread a bit tasteless. 8/10 vibe score.",
    image: "halal-vibes/imgs/tesla.jpg",
    content: `
      <p>7001 Santa Monica Blvd, Los Angeles, CA 90038</p>
      <p>Great experience- especially for tourists. Really got the 50s Hollywood feel. Got the V2G Egg sandwich and it was brilliant. Only thing was that the bread was a bit tasteless. Great view of Hollywood sign on the second floor. You will probably have to street park if you don't come with an electric car, but I was able to easily find parking on a Sunday ~10:30 AM. 8/10 vibe score</p>
    `,
    date: "2024-10-01",
    tags: ["breakfast", "hollywood", "vegetarian options"]
  },
  {
    slug: "hh-brazilian-steakhouse-beverlywood",
    title: "H&H Brazilian Steakhouse",
    region: "US",
    location: "Los Angeles",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: null,
    content: `
      <p>Beverlywood, Los Angeles, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "steakhouse", "brazilian", "beverlywood"]
  },
  {
    slug: "sincerly-syria-hollywood",
    title: "Sincerly Syria",
    region: "US",
    location: "Los Angeles",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: null,
    content: `
      <p>Hollywood, Los Angeles, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "syrian", "hollywood"]
  },
  {
    slug: "golden-gate-park-sf",
    title: "Golden Gate Park",
    region: "US",
    location: "San Francisco",
    categories: ["vibes"],
    foodScore: null,
    vibesScore: 9,
    excerpt: "Perfect weekend morning,  bike around from 7AM. Not too hard to find free street parking, amazing views and vibes. GG Park larger than Central Park. 9.5/10 vibe score.",
    image: "halal-vibes/imgs/goldengate.jpg",
    content: `
      <p>San Francisco, CA</p>
      <p>Perfect weekend morning- bike around this park from around 7AM… not too hard to find street parking for free, and amazing views and vibes. I used to bike around the entire park every weekend, and honestly some of my best times. Fun fact: GG Park is actually larger than Central Park. 9.5/10 vibe score</p>
    `,
    date: "2024-10-01",
    tags: ["park", "biking", "outdoors"]
  },
  {
    slug: "equator-coffees-sf",
    title: "Equator Coffee",
    region: "US",
    location: "San Francisco",
    categories: ["coffee", "vibes"],
    foodScore: 8,
    vibesScore: 9,
    excerpt: "Really enjoyed their matcha. Quite a line every time but worth it. Recommend going with friends, then walking across Golden Gate Bridge and back. Parking pretty bad. 9/10 vibe score.",
    image: "images/20210623_Equator_Coffees_at_Roundhouse_Images_and_Press_Release_Credit_Equator_Coffees_002.webp",
    content: `
      <p>Golden Gate Bridge Plaza, San Francisco, CA 94129</p>
      <p>I really enjoyed their matcha. Quite a line every time I go but worth it. I recommend going with friends/family, maybe getting something to eat/drink, then walking across the Golden Gate Bridge and back. Definitely a time to remember. Parking situation is pretty bad though. 9/10 vibe score (just crowded)</p>
    `,
    date: "2024-10-01",
    tags: ["halal", "coffee", "golden gate"]
  },
  {
    slug: "four-seasons-alexandria",
    title: "Four Seasons Hotel Alexandria at San Stefano",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["food", "vibes"],
    foodScore: 9,
    vibesScore: 8,
    excerpt: "Never slept here but ordered from lobby restaurant. Very clean, desserts excellent. Good place for meetings. 8/10 vibe score.",
    image: "images/20241009_203443_Original.JPG",
    content: `
      <p>399 El El-Gaish Rd, San Stefano, El Raml 1, Alexandria Governorate, Egypt</p>
      <p>I've never slept here before, but I sat down and ordered from the restaurant in the lobby. The place is very clean and the desserts are excellent. It's a good place for meetings and things like that. 8/10 vibe score</p>
    `,
    date: "2024-10-01",
    tags: ["halal", "hotel", "desserts"]
  },
  {
    slug: "genoise-alexandria",
    title: "Genoise",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: null,
    content: `
      <p>Alexandria Governorate, Egypt</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "desserts", "bakery", "alexandria"]
  },
  {
    slug: "mr-baker-alexandria",
    title: "Mr Baker",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: null,
    content: `
      <p>Alexandria Governorate, Egypt</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "desserts", "bakery", "alexandria"]
  },
  {
    slug: "area-31-miami",
    title: "Area 31",
    region: "US",
    location: "Miami",
    categories: ["food", "vibes"],
    nonMeatOptions: true,
    foodScore: 9,
    vibesScore: 10,
    excerpt: "Great first-time Miami spot. Eggs benedict expensive but delectable. Main reason was the view,  was not disappointed. Parking not easy. 10/10 vibe score.",
    image: null,
    content: `
      <p>270 Biscayne Blvd Way, Miami, FL 33131</p>
      <p>This place was great. I came here my first time in Miami to experience a place that captured the Miami vibe without any of the Miami sin haha. I ordered eggs benedict and they were quite expensive, but delectable nevertheless. The main reason I came here anyways, food aside, was for the view, which I was not disappointed by. Only criticism is that the parking wasn't so easy, but definitely would do again. Meal type: Breakfast. Price: $50–100. <strong>10/10 vibe score</strong></p>
    `,
    date: "2024-10-01",
    tags: ["breakfast", "waterfront", "vegetarian options"]
  },
  {
    slug: "cafe-53-chicago",
    title: "Cafe 53",
    region: "US",
    location: "Chicago",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 9,
    vibesScore: 8,
    excerpt: "Favorite halal breakfast spot in Chicago. Amazing bagels where you can add meat and it's halal. Great location, lovely park nearby. A bit of a line but worth it. 8.5/10 vibe score.",
    image: "halal-vibes/imgs/54.jpg",
    content: `
      <p>1369 E 53rd St, Chicago, IL 60615</p>
      <p>This place is my favorite halal breakfast spot in Chicago. Amazing bagels where you can add meat and it's halal 😋. Great location and lovely park nearby to eat the bagels. A bit of a line but definitely worth it. 8.5/10 vibe score</p>
    `,
    date: "2024-10-01",
    tags: ["halal", "bagels", "breakfast"]
  },
  {
    slug: "big-mug-coffee-santa-clara",
    title: "Big Mug Coffee Roaster",
    region: "US",
    location: "Santa Clara",
    categories: ["coffee", "food", "vibes"],
    foodScore: 10,
    vibesScore: 8,
    excerpt: "My favorite coffee shop in Santa Clara—food is pretty good and location is great. WiFi changes often, crowded, sometimes overpriced… I still keep going.",
    image: null,
    content: `
      <p>3014 El Camino Real, Santa Clara, CA 95051</p>
      <p>My favorite coffee shop in Santa Clara. Food is actually pretty good in my opinion, and location is great. Only criticism I have is that:</p>
      <ol>
        <li>They change the wifi password frequently</li>
        <li>Can get quite crowded</li>
        <li>Can be a bit overpriced for some items</li>
      </ol>
      <p>Despite all that, I keep going lol</p>
      <p><strong>Order type:</strong> Dine in · <strong>Meal type:</strong> Breakfast · <strong>Price per person:</strong> $10–20 · Food: 5</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "coffee", "breakfast", "santa clara", "south bay"]
  },
  {
    slug: "central-perk-alexandria",
    title: "Central Perk Cafe, Alexandria",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["coffee", "vibes"],
    foodScore: 6,
    vibesScore: 9,
    excerpt: "Truly amazing for Friends fans. Loved the atmosphere. As a place to meet up and hang out, fantastic spot. 9/10 vibe score.",
    image: "halal-vibes/imgs/central.png",
    content: `
      <p>Mohammed Shafek Ghrbal, Al Azaritah WA Ash Shatebi, Bab Shar', Alexandria Governorate, Egypt</p>
      <p>This place is truly amazing. As someone who watched this show a lot when I was little, I really loved the atmosphere of the cafe, and I'm so glad I found it in Alexandria. I'm not one to focus too much on the taste of coffee, so I won't comment on that, but as a place to meet up and hang out, it's honestly a fantastic spot. Service: 4 | Atmosphere: 5. 9/10 vibe score</p>
    `,
    date: "2024-10-01",
    tags: ["halal", "coffee", "friends themed"]
  },
  {
    slug: "propery-coffee-alexandria",
    title: "Propery Coffee",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["coffee", "vibes"],
    foodScore: 7,
    vibesScore: 7,
    excerpt: "Coffee good, location excellent. Prices a bit expensive (expected from a chic place like this). 7/10 vibe score.",
    image: null,
    content: `
      <p>173 Branched from Ahmed Shawki, Fleming, El Raml 2, Alexandria Governorate, Egypt</p>
      <p>The coffee is good, and the location is excellent, but the prices are a bit expensive (which is honestly expected from a chic place like this). Price: E£1–200. Food: 4 | Service: 5 | Atmosphere: 5. 7/10 vibe score</p>
    `,
    date: "2024-10-01",
    tags: ["halal", "coffee"]
  },
  {
    slug: "croissante-santa-clara",
    title: "Croissante",
    region: "US",
    location: "Santa Clara",
    categories: ["coffee", "food", "vibes"],
    foodScore: 9,
    vibesScore: 8,
    excerpt: "My favorite bakery in south bay. Great croissants but quite expensive. Seating is good too, the place is always active, and once again, amazing pastries.",
    image: "halal-vibes/imgs/croissante..jpg",
    content: `
      <p>2908 El Camino Real #100, Santa Clara, CA 95051</p>
      <p>Bakery · $10–20</p>
      <p>My favorite bakery in south bay. Great croissants but quite expensive. Seating is good too, the place is always active, and once again, amazing pastries.</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "bakery", "croissants", "pastries"]
  },
  {
    slug: "social-specialty-coffee-cairo",
    title: "Social Specialty Coffee",
    region: "Egypt",
    location: "Cairo",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "halal-vibes/imgs/social.jpg",
    images: ["halal-vibes/imgs/social.jpg", "halal-vibes/imgs/social1.jpg", "halal-vibes/imgs/social2.jpg"],
    content: `
      <p>Boulevard, Compound, New Cairo 1, Cairo Governorate 11835, Egypt</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "coffee", "specialty"]
  },
  {
    slug: "zed-and-co-alexandria",
    title: "Zed & Co",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["coffee", "food", "vibes"],
    foodScore: null,
    vibesScore: 9,
    excerpt: "9/10 vibes.",
    image: "images/IMG_8961.jpg",
    images: ["images/IMG_8961.jpg"],
    content: `
      <p>Sant Giyn, Abu an Nawatir, Sidi Gaber, Alexandria Governorate 5433113, Egypt</p>
      <p>9/10 vibes.</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "coffee", "brunch"]
  },
  {
    slug: "coffee-lab-bakery-cairo",
    title: "Coffee Lab & Bakery",
    region: "Egypt",
    location: "Cairo",
    categories: ["coffee", "food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "halal-vibes/imgs/cofeelabbb.png",
    images: ["halal-vibes/imgs/cofeelabbb.png", "halal-vibes/imgs/coffeelabb.png", "halal-vibes/imgs/cofffeeelabbak.png"],
    content: `
      <p>3GF3+QJW, Youssef El Sebai, Second New Cairo, Cairo Governorate 4752232, Egypt</p>
      <p>Coffee shop · E£200–400</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "coffee", "bakery"]
  },
  {
    slug: "arwa-yemeni-coffee-sunnyvale",
    title: "Arwa Yemeni Coffee",
    region: "US",
    location: "Sunnyvale",
    categories: ["coffee", "vibes"],
    halalBadge: true,
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "halal-vibes/imgs/arwa.jpg",
    content: `
      <p>605 Tasman Dr, Sunnyvale, CA 94089</p>
      <p>Coffee shop · $10–20</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "coffee", "yemeni"]
  },
  {
    slug: "the-tiffin-truck-cambridge",
    title: "The Tiffin Truck",
    region: "UK",
    location: "Cambridge",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "halal-vibes/imgs/tiffint.png",
    content: `
      <p>22 Regent St, Cambridge CB2 1DB, United Kingdom</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "indian", "street food"]
  },
  {
    slug: "sky-garden-london",
    title: "Sky Garden",
    region: "UK",
    location: "London",
    categories: ["food", "vibes"],
    foodScore: 9,
    vibesScore: 10,
    excerpt: "Great view. Honestly have never been to a place like this before. Very impressive views inside and outside the building, and delicious Eggs Benedict. Make sure to reserve in advance.",
    image: "halal-vibes/imgs/skygarden.jpg",
    content: `
      <p>1 Sky Garden Walk, London EC3M 8AF, United Kingdom</p>
      <p>Great view. Honestly have never been to a place like this before and stumbled upon it trying to find a breakfast spot that's open early.</p>
      <p>Honestly very impressive views (I spent way more time than I'd like to admit taking photos), both inside and outside the building, and delicious Eggs Benedict.</p>
      <p>Great place to walk around afterwards, and definitely a must for tourists. Make sure to reserve in advance. Wait time: Up to 10 min. Reservation recommended: Yes.</p>
    `,
    date: "2025-02-01",
    tags: ["halal", "breakfast", "views", "tourist"]
  },
  {
    slug: "the-drive-new-cairo",
    title: "The Drive",
    region: "Egypt",
    location: "Cairo, Egypt",
    categories: ["food", "vibes"],
    foodScore: 8,
    vibesScore: 9,
    excerpt: "Great place, good location, and amazing idea. Especially liked the boba spot and TakoSan (Japanese/Hispanic fusion). A tad expensive, but really enjoyed it—clever concept.",
    image: "images/IMG_3729.jpg",
    content: `
      <p>New Cairo, Cairo Governorate, Egypt</p>
      <p>Great place, good location, and amazing idea. The food options here are good; I especially liked the boba spot and TakoSan (Japanese/Hispanic fusion). A tad expensive, but I really enjoyed it, and must reiterate how clever an idea it is.</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "food hall", "new cairo"]
  },
  {
    slug: "sea-side-cafe-alexandria",
    title: "Sea Side Cafe",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["coffee", "vibes"],
    foodScore: 7,
    vibesScore: 9,
    excerpt: "Amazing atmosphere—great morning or evening hangout. Decent food and drinks; cash only (no cards).",
    image: "images/IMG_3920.jpg",
    content: `
      <p>San Stefano, El Raml 1, Alexandria Governorate, Egypt</p>
      <p>Amazing atmosphere. Decent food and drinks—have hung out here both in the morning and in the evening. Only inconvenient in that you must have cash to pay; they don't accept credit cards.</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "san stefano"]
  },
  {
    slug: "la-vienna-wedding-venue-alexandria",
    title: "La Vienna Wedding Venue",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: null,
    content: `
      <p>Khalf Mahmoud Shaker Abd al Monem, Ezbet Saad, Alexandria Governorate, Egypt</p>
    `,
    date: "2025-05-31",
    tags: ["venue", "wedding", "alexandria"]
  },
  {
    slug: "brown-nose-coffee-new-cairo",
    title: "Brown Nose Coffee",
    region: "Egypt",
    location: "Cairo, Egypt",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: null,
    content: `
      <p>5A by the Waterway, New Cairo 3, Cairo Governorate, Egypt</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "new cairo"]
  },
  {
    slug: "kato-coffee-alexandria",
    title: "Kato Coffee",
    region: "Egypt",
    location: "Alexandria, Egypt",
    categories: ["coffee", "vibes"],
    foodScore: 6,
    vibesScore: 8,
    excerpt: "Fire Spanish Matcha—but service dropped the ball: ~30 min for fridge items with no line. Lowered from 5★ to 3★ overall; still love the vibes.",
    image: "images/unnamed.jpg",
    content: `
      <p>Syria St., Sidi Gaber, Alexandria Governorate, Egypt</p>
      <p>Great vibes—fire Spanish Matcha, which I didn't even know was a thing but tasted great.</p>
      <p><strong>Update:</strong> Returned and lowered my review from 5 to 3. I ordered a Spanish latte and a mango tart (both prepped in the fridge). No line or crowd, yet it took around thirty minutes—and they didn't have to make anything, just pull from the fridge. Multiple workers on their phones the whole time.</p>
      <p>Not happy to lower this, especially because vibes- and distance-wise this is one of my favorite spots, but the poor service really changed how I view it. P.S. the mango tart was still tasty.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "coffee", "matcha", "sidi gaber"]
  },
  {
    slug: "layla-bagels-santa-monica",
    title: "Layla Bagels",
    region: "US",
    location: "Los Angeles",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/layhla.jpg",
    content: `
      <p>Santa Monica, Los Angeles, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "bagels", "santa monica"]
  },
  {
    slug: "jyan-isaac-bread-santa-monica",
    title: "Jyan Isaac Bread",
    region: "US",
    location: "Los Angeles",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/Cereal-Milk-French-toast-1.webp",
    content: `
      <p>Santa Monica, Los Angeles, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "bagels", "bread", "santa monica"]
  },
  {
    slug: "groundwork-coffee-venice",
    title: "Groundwork Coffee Co.",
    region: "US",
    location: "Venice",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/unnamed-1.jpg",
    content: `
      <p>Venice, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "venice"]
  },
  {
    slug: "ceremony-coffee-roasters-baltimore",
    title: "Ceremony Coffee Roasters,  Harbor Point",
    region: "US",
    location: "Baltimore",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/ceeremony.webp",
    content: `
      <p>Harbor Point, Baltimore, MD</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "baltimore"]
  },
  {
    slug: "temple-coffee-s-st-sacramento",
    title: "Temple Coffee (S St)",
    region: "US",
    location: "Sacramento",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/sac.jpg",
    content: `
      <p>2203 S St, Sacramento, CA 95816</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "sacramento"]
  },
  {
    slug: "scorpio-coffee-16th-sacramento",
    title: "Scorpio Coffee (16th St)",
    region: "US",
    location: "Sacramento",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/sac0.jpg",
    content: `
      <p>1215 16th St, Sacramento, CA 95814</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "sacramento"]
  },
  {
    slug: "la-vaca-birria-san-francisco",
    title: "La Vaca Birria",
    region: "US",
    location: "San Francisco",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 8,
    excerpt: "Chicken and brisket quesadillas slapped. Best fries I've ever had. Maybe the best halal Mexican in the Bay. Friday lunch—parking wasn't bad.",
    image: "images/vaca.jpg",
    content: `
      <p>2962 24th St, San Francisco, CA 94110</p>
      <p>I liked the chicken and brisket quesadillas. The cheese fries were the best fries I've ever had in my life. One of the best halal Mexican spots I've been to in the Bay—maybe even the best. I went on a Friday afternoon and the parking situation wasn't so bad.</p>
      <p><strong>Meal type:</strong> Lunch · Dine in · <strong>Price per person:</strong> $10–20 · Food: 5 | Service: 5 | Atmosphere: 4</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "birria", "san francisco", "mission"]
  },
  {
    slug: "crust-sourdough-deli-santa-clara",
    title: "CRUST Sourdough Deli",
    region: "US",
    location: "Santa Clara",
    categories: ["food", "vibes"],
    nonMeatOptions: true,
    foodScore: null,
    vibesScore: null,
    excerpt: "Tuna sandwich on sourdough is amazing.",
    image: "images/crust.jpg",
    content: `
      <p>Santa Clara, CA</p>
      <p>Tuna sandwich on sourdough is amazing.</p>
    `,
    date: "2025-05-31",
    tags: ["sandwiches", "sourdough", "santa clara", "vegetarian options"]
  },
  /*
  {
    slug: "coffee-lab-rehab-new-cairo",
    title: "Coffee Lab",
    region: "Egypt",
    location: "Cairo, Egypt",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/IMG_4384.jpg",
    content: `
      <p>El Rehab, New Cairo, Cairo Governorate, Egypt</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "rehab", "new cairo"]
  }
  */,
  {
    slug: "story-coffee-seattle",
    title: "Story Coffee",
    region: "US",
    location: "Seattle",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/IMG_2651.jpg",
    content: `
      <p>NE 8th St, Seattle, WA</p>
    `,
    date: "2025-06-01",
    tags: ["halal", "coffee", "seattle"]
  },
  {
    slug: "toasted-bagels-bellevue",
    title: "TOASTED Bagels & Coffee",
    region: "US",
    location: "Bellevue",
    categories: ["coffee", "food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/TOASTED.jpg",
    content: `
      <p>Bellevue, WA</p>
    `,
    date: "2025-06-01",
    tags: ["halal", "bagels", "coffee", "bellevue"]
  },
  {
    slug: "mr-shawarma-pacific-beach",
    title: "Mr Shawarma",
    region: "US",
    location: "San Diego",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    stars: 4.5,
    excerpt: "Pretty good shawarma (4–4.5 stars). Open late and good food—parking isn't great, and it can feel heavy fast.",
    image: null,
    content: `
      <p>Pacific Beach, San Diego, CA</p>
      <p>Pretty good shawarma—I'd say 4–4.5 stars. I personally get sick of it quickly because of how unhealthy it feels to me, and parking is not great, but they're open late, and it's good food.</p>
    `,
    date: "2026-06-03",
    tags: ["shawarma", "san diego", "pacific beach", "late night"]
  },
  {
    slug: "busboys-and-poets-dc",
    title: "Busboys and Poets",
    region: "US",
    location: "Washington, D.C.",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "Pretty good vibes for coffee and hanging out. Food wasn't that great, but good for the vibes.",
    image: null,
    content: `
      <p>Washington, D.C.</p>
      <p>Pretty good vibes for coffee and hanging out. Food wasn't that great, but good for the vibes.</p>
    `,
    date: "2026-06-03",
    tags: ["coffee", "washington dc", "northern virginia", "hangout"]
  },
  {
    slug: "nazs-halal-food-sterling",
    title: "Naz's Halal Food",
    region: "US",
    location: "Sterling",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "Pretty good food—I enjoyed it. 4 stars.",
    image: null,
    content: `
      <p>Sterling, Northern Virginia</p>
      <p>Pretty good food, I enjoyed it. I give it like 4 stars.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "sterling", "northern virginia"]
  },
  {
    slug: "talkin-tacos-washington-dc",
    title: "Talkin' Tacos",
    region: "US",
    location: "Washington, D.C.",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    stars: 5,
    excerpt: "Great Mexican food and it's halal. Also decent service.",
    image: null,
    content: `
      <p>Washington, D.C.</p>
      <p>Great Mexican food and it's halal. Also decent service.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "mexican", "washington dc", "northern virginia"]
  },
  {
    slug: "bitez-arlington",
    title: "Bitez",
    region: "US",
    location: "Northern Virginia",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/arl.jpg",
    content: `
      <p>Northern Virginia</p>
    `,
    date: "2025-06-01",
    tags: ["halal", "northern virginia", "virginia"]
  },
  {
    slug: "bussin-buns-austin",
    title: "Bussin Buns",
    region: "US",
    location: "Austin",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/bussin.jpg",
    content: `
      <p>Austin, TX</p>
    `,
    date: "2025-06-01",
    tags: ["halal", "austin", "chicken"]
  },
  {
    slug: "tiffs-treats-austin",
    title: "Tiff's Treats",
    region: "US",
    location: "Austin",
    categories: ["desserts", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/IMG_1257.jpg",
    content: `
      <p>Austin, TX</p>
    `,
    date: "2025-06-01",
    tags: ["halal", "desserts", "cookies", "austin"]
  },
  {
    slug: "living-room-coffeehouse-la-jolla",
    title: "Living Room Coffeehouse",
    region: "US",
    location: "La Jolla",
    categories: ["coffee", "food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "Great spot indoors with decent food. Parking is hard to find. Halal status unclear—they have other options.",
    image: null,
    content: `
      <p>La Jolla, San Diego, CA</p>
      <p>Great spot. Indoors, however—decent food. Only problem is it is hard to find parking.</p>
      <p><strong>Note:</strong> Not sure on halal status, but they've got other options.</p>
    `,
    date: "2026-06-03",
    tags: ["coffee", "la jolla", "san diego", "vegetarian options"]
  },
  {
    slug: "egglet-la-jolla",
    title: "Egglet",
    region: "US",
    location: "La Jolla",
    categories: ["food", "vibes"],
    nonMeatOptions: true,
    foodScore: null,
    vibesScore: null,
    excerpt: "Good breakfast spot—very yummy.",
    image: null,
    content: `
      <p>La Jolla, San Diego, CA</p>
      <p>Good breakfast spot. Very yummy.</p>
    `,
    date: "2026-06-03",
    tags: ["breakfast", "la jolla", "san diego", "vegetarian options"]
  },
  {
    slug: "craft-by-smoke-and-fire-anaheim",
    title: "Craft By Smoke & Fire",
    region: "US",
    location: "Anaheim",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "I like their meat selections—pretty good and halal. Don't love that they also serve alcohol.",
    image: null,
    content: `
      <p>Anaheim, CA (Orange County)</p>
      <p>I like their meat selections, pretty good—it's halal. I don't like that they also serve alcohol though.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "bbq", "anaheim", "oc", "orange county"]
  },
  {
    slug: "tasa2go-fullerton",
    title: "Tasa2Go",
    region: "US",
    location: "Fullerton",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    stars: 4,
    excerpt: "Great Egyptian food. A bit pricey.",
    image: null,
    content: `
      <p>Fullerton, CA (Orange County)</p>
      <p>Great Egyptian food. Four stars because it's a bit pricey.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "egyptian", "fullerton", "oc", "orange county"]
  },
  {
    slug: "dr-ink-san-jose",
    title: "Dr.ink",
    region: "US",
    location: "San Jose",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "Good coffee spot in San Jose—pretty good for vibes.",
    image: null,
    content: `
      <p>San Jose, CA</p>
      <p>Good coffee spot in San Jose. Pretty good for vibes.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "coffee", "san jose", "south bay"]
  },
  // {
  //   slug: "bagel-broker-los-angeles",
  //   title: "Bagel Broker",
  //   region: "US",
  //   location: "Los Angeles",
  //   categories: ["food", "vibes"],
  //   foodScore: null,
  //   vibesScore: null,
  //   stars: 4,
  //   excerpt: "Decent bagel (4 stars), but not great vibes—more on-the-go than a hangout spot. Meat isn't halal; lots of non-meat options.",
  //   image: null,
  //   content: `
  //     <p>Los Angeles, CA</p>
  //     <p>Not great vibes location, but decent bagel—I give it like 4 stars, but it's not on the top of my list of bagel spots for vibes. More for on the go.</p>
  //     <p><strong>Note:</strong> Meat is not halal, but there are lots of non-meat options.</p>
  //   `,
  //   date: "2026-06-03",
  //   tags: ["bagels", "los angeles", "vegetarian options", "on the go"]
  // },
  {
    slug: "big-shoulders-coffee-chicago",
    title: "Big Shoulders Coffee",
    region: "US",
    location: "Chicago",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "Decent spot—good on the go, with a nice place to sit nearby. Great vibes.",
    image: null,
    content: `
      <p>141 W Jackson Blvd, Chicago, IL 60604</p>
      <p>Decent spot, good if you're on the go but also has a nice place to sit down nearby. Great vibes.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "coffee", "chicago"]
  },
  {
    slug: "perch-los-angeles",
    title: "Perch",
    region: "US",
    location: "Los Angeles",
    categories: ["desserts"],
    foodScore: null,
    vibesScore: null,
    excerpt: "Decent rooftop dessert spot—great view, fine for 1–4 people. Sit away from the alcohol; parking isn't too easy.",
    image: null,
    content: `
      <p>Los Angeles, CA</p>
      <p>Decent rooftop dessert place. Make sure to sit away from the alcohol. Decent spot for 1–4 people. Great view. Parking not too easy though.</p>
    `,
    date: "2026-06-03",
    tags: ["desserts", "rooftop", "los angeles", "views"]
  },
  {
    slug: "new-york-chicken-gyro-pasadena",
    title: "New York Chicken & Gyro",
    region: "US",
    location: "Pasadena",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "Pretty good platter, nice Pasadena area—the food wasn't bad. Halal; I enjoyed it.",
    image: null,
    content: `
      <p>Pasadena, Los Angeles, CA</p>
      <p>Pretty good platter, nice area, and the food wasn't bad. I enjoyed it. It's halal.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "gyro", "chicken", "pasadena", "los angeles"]
  },
  {
    slug: "stumptown-cafe-portland",
    title: "Stumptown Cafe",
    region: "US",
    location: "Portland",
    categories: ["coffee", "vibes"],
    foodScore: null,
    vibesScore: null,
    stars: 4.5,
    excerpt: "4.5 stars for vibes—great and amazing walkable area.",
    image: null,
    content: `
      <p>1140 SW Washington St Ste 103, Portland, OR 97205</p>
      <p>Great and amazing walkable area.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "coffee", "portland", "walkable"]
  },
  /*
  {
    slug: "davincis-marco-island",
    title: "DaVinci's",
    region: "US",
    location: "Marco Island",
    categories: ["food", "vibes"],
    nonMeatOptions: true,
    foodScore: null,
    vibesScore: null,
    excerpt: "Decent food but extremely pricey. Some no-meat options that aren't too bad.",
    image: null,
    content: `
      <p>Marco Island, FL</p>
      <p>Decent food but extremely pricey. They have some no-meat options there that aren't too bad.</p>
    `,
    date: "2026-06-03",
    tags: ["vegetarian", "marco island", "florida"]
  },
  */
  {
    slug: "ibn-alsham-cairo",
    title: "مطعم ابن الشام · Ibn Alsham Restaurant",
    region: "Egypt",
    location: "Cairo",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "Popular Syrian/Levantine chain—shawarma, grills, and Damascene dishes. Branches in El Rehab and Fifth Settlement.",
    image: null,
    content: `
      <p><strong>El Rehab:</strong> Commercial Market, Shop 161 (behind Ezaby Pharmacy)</p>
      <p><strong>Fifth Settlement:</strong> Banks Center St, H1 Mall, New Cairo 1</p>
      <p>Authentic Syrian and Levantine food—shawarma, charcoal grills, and family-style meals. Delivery hotline: 15155 · <a href="http://www.ibnalsham.com/" target="_blank" rel="noopener">ibnalsham.com</a></p>
    `,
    date: "2026-06-03",
    tags: ["halal", "syrian", "shawarma", "cairo", "el rehab", "new cairo"]
  },
  {
    slug: "zein-al-sham-el-rehab-cairo",
    title: "Zein al Sham · زين الشام",
    region: "Egypt",
    location: "Cairo",
    categories: ["food"],
    foodScore: null,
    vibesScore: null,
    excerpt: "El Rehab. Syrian grills, shawarma, manaeesh, and Levantine plates in the Old Commercial Market.",
    image: null,
    content: `
      <p>Old Commercial Market, Gate 6, Shop 127 (next to Koueider), El Rehab City, New Cairo</p>
      <p>Syrian restaurant—shawarma, grills, sandwiches, manaeesh, and mansaf-style dishes. Hotline: 16551</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "syrian", "shawarma", "grill", "el rehab", "cairo"]
  },
  {
    slug: "3am-bashandy-nasr-city-cairo",
    title: "3am Bashandy · عم بشندي",
    region: "Egypt",
    location: "Cairo",
    categories: ["food"],
    foodScore: null,
    vibesScore: null,
    excerpt: "Amazing breakfast in Madinat Nasr—foul, falafel, and classic Egyptian morning plates.",
    image: null,
    content: `
      <p><strong>Nasr City (Madinat Nasr):</strong> 16 El Sherka El Saudi Block · also E-Zone Mall (Omar Effendi), Makram Ebeid St</p>
      <p>Traditional Egyptian breakfast spot—foul, taameya (falafel), and oriental plates. Great morning run. Hotline: 16319 · 0224113711</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "breakfast", "foul", "falafel", "nasr city", "cairo", "egyptian"]
  },
  {
    slug: "mikes-red-tacos-mira-mesa",
    title: "Mike's Red Tacos (Mira Mesa)",
    region: "US",
    location: "San Diego",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 9,
    excerpt: "Best halal Mexican I've had in San Diego. Amazing birria and crunch wrap—store confirmed halal beef.",
    image: null,
    content: `
      <p>9089 Mira Mesa Blvd, San Diego, CA 92126</p>
      <p>Best halal Mexican I've had in San Diego (not that there are many options). Amazing birria and great crunch wrap. Confirmed with the store that their beef is halal.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "mexican", "birria", "mira mesa", "san diego"]
  },
  {
    slug: "stans-donut-shop-santa-clara",
    title: "Stan's Donut Shop",
    region: "US",
    location: "Santa Clara",
    categories: ["desserts", "coffee", "vibes"],
    foodScore: 10,
    vibesScore: 8,
    excerpt: "Best donuts I've ever had—by far. Bargain Peerless coffee too. Cash only (ATM inside), incredibly inconvenient but worth it.",
    image: null,
    content: `
      <p>2628 Homestead Rd, Santa Clara, CA 95051</p>
      <p>Donuts · $1–10 · South Bay / San Jose area</p>
      <p>These are absolutely the best donuts I have ever had in my entire life. By far. Brewed Peerless coffee for about $1.50—no fancy espresso, just classic cafe vibes. Family-run since 1959; cash and check only (ATM on site).</p>
      <p><strong>Only criticism:</strong> Cash-only is incredibly inconvenient.</p>
    `,
    date: "2026-06-03",
    tags: ["donuts", "cash only", "santa clara", "south bay", "coffee"]
  },
  {
    slug: "halalstreet-hot-pot-newark",
    title: "HalalStreet Hot Pot | Newark",
    region: "US",
    location: "Newark",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 10,
    excerpt: "Best buffet I've ever been to. Sublime taste, excellent service, amazing deal—outstanding decor and vibes.",
    image: null,
    content: `
      <p>5605 Mowry School Rd, Newark, CA 94560</p>
      <p>Brilliant place. Best buffet I have ever been to. Outstanding. Amazing food, excellent service, and it is truly an amazing deal. The taste is sublime, and the vibes/decor of the place are too.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "hot pot", "buffet", "newark", "east bay"]
  },
  {
    slug: "takosan-the-drive-new-cairo",
    title: "Takosan - The Drive",
    region: "Egypt",
    location: "Cairo, Egypt",
    categories: ["food", "vibes"],
    foodScore: 8,
    vibesScore: 6,
    excerpt: "Burger tacos were the best—Cali roll burrito and chicken poppers decent. ~20 min wait, so-so service, tough mall parking.",
    image: "images/download.png",
    content: `
      <p>2C52+RCV, New Cairo 1, Cairo Governorate 4720110, Egypt · inside <strong>The Drive</strong></p>
      <p>Had the Cali roll burrito, chicken poppers, and the burger tacos. By far the burger tacos were the best—the other items were decent.</p>
      <p>Not five stars because service wasn't the greatest and the wait was extremely long (more or less 20 minutes). Parking in this mall is pretty hard to come by, but otherwise a good spot.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "japanese", "mexican", "fusion", "the drive", "new cairo", "tacos"]
  },
  {
    slug: "nyc-halal-eats-lombard",
    title: "NYC Halal Eats",
    region: "US",
    location: "Chicago",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 9,
    excerpt: "Chicken platter was amazing—great chicken, sauce on point, and very nice seating.",
    image: null,
    content: `
      <p>52 W Roosevelt Rd, Lombard, IL 60148</p>
      <p>Excellent food. I had the chicken platter and it was amazing. Very nice seating, great chicken, and with the sauce it was quite yummy.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "chicken", "platter", "lombard", "chicago"]
  },
  {
    slug: "alforon-mediterranean-lebanese-san-diego",
    title: "Alforon Mediterranean / Lebanese Cuisine",
    region: "US",
    location: "San Diego",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 9,
    vibesScore: 10,
    excerpt: "Very good food and ambiance—kind owners stayed open late for us and sent out free dessert. Pricey but worth it.",
    image: null,
    content: `
      <p>5965 El Cajon Blvd, San Diego, CA 92115</p>
      <p>Good food, good vibes, and very kind owners. My friends and I came late and they stayed open past hours for us, and were very friendly. They even gave us a free dessert at the end (it was amazing).</p>
      <p>Food quality was very good—would definitely go again. Only downside is that it is quite pricey, but other than that, great food and ambiance.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "lebanese", "mediterranean", "san diego", "el cajon"]
  },
  {
    slug: "mazra-redwood-city",
    title: "MAZRA",
    region: "US",
    location: "Redwood City",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 9,
    excerpt: "Probably the best Arab food in the Bay—sublime beef kofta, solid falafel, great frozen date juice. Far, bad parking, long waits, pricey—but worth it.",
    image: null,
    content: `
      <p>2021 Broadway, Redwood City, CA 94063</p>
      <p>I've had quite a journey with my opinion of this place. I used to avoid it—not because of food quality, but because:</p>
      <ol>
        <li>Redwood City is far from everything</li>
        <li>The parking situation is abysmal</li>
        <li>There is never a table ready when you get there</li>
        <li>The food is expensive</li>
      </ol>
      <p>That being said, their meat is great, the vibes are great, and their service is great. Their beef kofta is sublime, and their falafel isn't too bad either. They also have a pretty good frozen date juice that I enjoyed.</p>
      <p>If you don't mind those four things (I'm personally caring less and less about them in lieu of the amazing food), definitely go. This is probably the best Arab food I've had in the Bay Area.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "arab", "kofta", "falafel", "redwood city", "bay area"]
  },
  {
    slug: "cracked-and-battered-san-francisco",
    title: "Cracked & Battered",
    region: "US",
    location: "San Francisco",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 10,
    excerpt: "A must-visit in SF. Chicken benedict is amazing, potatoes scrumptious—friendly owners, great walkable location. Indoor or outdoor, family or friends.",
    image: null,
    content: `
      <p>1434 18th St, San Francisco, CA 94107</p>
      <p>A must-visit in SF. Great restaurant with very friendly owners. Amazing location too, and great to walk around afterwards. I recommend the chicken benedict—it's amazing. Their potatoes are also quite scrumptious.</p>
      <p>Whether you sit indoors or outdoors, you will have a great time. I recommend going with family or with friends—you will definitely want to go again.</p>
      <p><strong>Meal type:</strong> Brunch · <strong>Reservations:</strong> Not required · <strong>Group size:</strong> 2 people, 3–4 people</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "brunch", "chicken benedict", "san francisco", "potrero"]
  },
  {
    slug: "house-of-mandi-anaheim",
    title: "House of Mandi - Yemeni Restaurant",
    region: "US",
    location: "Anaheim",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 9,
    excerpt: "Excellent food and meat, great seating for friends/family. Great Ramadan buffet too.",
    image: null,
    content: `
      <p>518 S Brookhurst St #1, Anaheim, CA 92804</p>
      <p>Excellent food and meat. Great seating as well; I recommend as a place to eat with friends/family. Great Ramadan buffet too.</p>
      <p><strong>Order type:</strong> Dine in · <strong>Meal type:</strong> Dinner · <strong>Seating:</strong> Indoor dining area</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "yemeni", "mandi", "anaheim", "oc", "buffet"]
  },
  {
    slug: "el-halal-amigos-san-jose",
    title: "El Halal Amigos",
    region: "US",
    location: "San Jose",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 7,
    vibesScore: 8,
    excerpt: "One of my first Bay halal spots—chicken quesadillas with chips & salsa in-person. Fell off a bit but still good occasionally. Nice for groups, good parking.",
    image: null,
    content: `
      <p>1100 Lincoln Ave, San Jose, CA 95125</p>
      <p>One of my first halal spot experiences in the Bay. I love their chicken quesadillas, which comes with chips and salsa <em>only</em> if you go in-person AFAIK. It kind of fell off and isn't as good as it used to be, but good every once in a while nevertheless.</p>
      <p>Good for groups and parking is nice as well.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "mexican", "quesadilla", "san jose", "south bay"]
  },
  {
    slug: "the-burger-shop-fremont",
    title: "The Burger Shop",
    region: "US",
    location: "Fremont",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 8,
    excerpt: "My favorite halal burger in the Bay—great quality, okay prices. Food truck spot with nice seating; great quick Fremont stop.",
    image: null,
    content: `
      <p>4050 Alder Ave, Fremont, CA 94536</p>
      <p>Gotta say that this is my favorite halal burger in the Bay. Prices are okay and not as good as say Dough Burger, but the quality is great. Food truck location is good too, and seating is nice. Great quick stop for when you are in Fremont.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "burger", "food truck", "fremont", "bay area"]
  },
  {
    slug: "habibiz-san-jose",
    title: "Habibiz",
    region: "US",
    location: "San Jose",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 10,
    excerpt: "Amazing food and huge portions—mosque next door, free ice cream, incredibly generous. May Allah bless the owners.",
    image: null,
    content: `
      <p>262 E Santa Clara St, San Jose, CA 95113</p>
      <p>This place is amazing. May Allah bless the owners and increase them in bounty. Amazing food, amazing portion sizes, and it's awesome that they have their own mosque next door. I love that they also give free ice cream, and to reiterate, they are very generous with portion sizes. I leave feeling like I gained weight haha.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "generous portions", "mosque", "san jose", "south bay"]
  },
  {
    slug: "dough-burger-san-jose",
    title: "Dough Burger",
    region: "US",
    location: "San Jose",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 9,
    vibesScore: 8,
    excerpt: "Great halal burgers—amazing base prices, oily but worth it. Double with tomato; good parking near SJC. Watch them cook through the window.",
    image: null,
    content: `
      <p>1751 N First St, San Jose, CA 95112</p>
      <p>Great burger place, despite having oily burgers. Amazing prices unless you're adding toppings, which make you pay quite a bit haha. I personally get the double with tomato on it. Parking situation is good, and it's very close to the airport. If you eat too much you will feel guilty because of how unhealthy it is haha, but it is a great halal option and my roommates and I go at least once a week.</p>
      <p>Also, it's really cool that you can see them making the burgers through a window as well.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "burger", "san jose", "south bay", "sjc"]
  },
  {
    slug: "pakwan-restaurant-san-francisco",
    title: "Pakwan Restaurant",
    region: "US",
    location: "San Francisco",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: 10,
    vibesScore: 9,
    excerpt: "Better desi food than I expected—TSM, naan, and biryani all great. This Ocean Ave location beats the Fremont branch by a mile.",
    image: null,
    content: `
      <p>1140 Ocean Ave, San Francisco, CA 94112</p>
      <p>Great location, amazing food—I didn't think I'd find better desi food than what they have at Zareen's. I had the TSM, naan, and some biryani and all of it was great.</p>
      <p><strong>Note:</strong> Only this location—I didn't like their Fremont one; the quality was not anywhere near this one.</p>
    `,
    date: "2026-06-03",
    tags: ["halal", "desi", "biryani", "pakistani", "san francisco", "ocean ave"]
  },
  {
    slug: "papi-tacos-churros-santa-ana",
    title: "Papi Tacos & Churros",
    region: "US",
    location: "Santa Ana",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: null,
    vibesScore: null,
    excerpt: "Fully halal Mexican street food—birria mulitas, tacos, and homemade churros. Santa Ana Main St location.",
    image: "images/IMG_6409.jpg",
    content: `
      <p>2603 S Main St, Santa Ana, CA 92707</p>
      <p>Halal-certified chicken and beef from a Muslim meat distributor. Known for slow-cooked birria, pollo asado, and churros made from scratch.</p>
      <p>Pictured: birria mulita with melted cheese, seasoned meat, and fresh avocado.</p>
    `,
    date: "2026-06-04",
    tags: ["halal", "mexican", "birria", "churros", "tacos", "santa ana", "oc"]
  },
  {
    slug: "motw-coffee-pastries-san-diego",
    title: "MOTW Coffee and Pastries",
    region: "US",
    location: "San Diego",
    categories: ["coffee", "vibes"],
    halalBadge: true,
    foodScore: null,
    vibesScore: 10,
    excerpt: "Amazing vibes—brilliant café and my favorite in San Diego. Great location in Kearny Mesa / Convoy.",
    image: null,
    content: `
      <p>7710 Balboa Ave Suite 129, San Diego, CA 92111</p>
      <p>Amazing vibes. Brilliant café—my favorite in San Diego—and a really good location.</p>
    `,
    date: "2026-06-04",
    tags: ["halal", "coffee", "pastries", "san diego", "kearny mesa", "convoy"]
  },
  {
    slug: "cairo-grill-santa-clara",
    title: "Cairo Grill",
    region: "US",
    location: "Santa Clara",
    categories: ["food", "vibes"],
    halalBadge: true,
    foodScore: null,
    vibesScore: null,
    excerpt: "Halal Egyptian and Middle Eastern on Scott Blvd—hawawshi, koshary, shawarma, and weekend breakfast. Next to Fatima Bazaar.",
    image: null,
    content: `
      <p>805 Scott Blvd, Santa Clara, CA 95050</p>
      <p>Halal Egyptian and Middle Eastern restaurant attached to Fatima Bazaar. Known for hawawshi, koshary, falafel, shawarma wraps, kabab skewers, and weekend breakfast plates.</p>
      <p>Open daily 10 AM – 9 PM · (408) 708-7075 · <a href="https://cairogrill.us/" target="_blank" rel="noopener noreferrer">cairogrill.us</a></p>
    `,
    date: "2026-06-12",
    tags: ["halal", "egyptian", "middle eastern", "santa clara", "south bay", "san jose", "shawarma", "koshary"]
  }
];
