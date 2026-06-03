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
    categories: ["food", "vibes"],
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
    categories: ["food", "vibes"],
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
    title: "Urban Skillet Santa Monica",
    region: "US",
    location: "Los Angeles",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: null,
    content: `
      <p>Santa Monica, Los Angeles, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "zabiha", "burrito", "santa monica"]
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
    foodScore: 6,
    vibesScore: 9,
    excerpt: "Amazing atmosphere and probably the best bathroom I've ever seen in a public place. Just Peachy drink is good. Coffee isn't the greatest but atmosphere is great.",
    image: null,
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
  {
    slug: "mr-toots-coffeehouse-capitola",
    title: "Mr Toots Coffeehouse",
    region: "US",
    location: "Capitola",
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
    categories: ["food", "vibes"],
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
    foodScore: null,
    vibesScore: null,
    stars: 5,
    excerpt: "5 stars from me. Their cheeseburger wrap and fried chicken wrap are out of this world.",
    image: null,
    content: `
      <p>Alexandria Governorate, Egypt</p>
      <p>5 stars from me. Their cheeseburger wrap and fried chicken wrap are out of this world.</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "chicken", "wrap", "alexandria"]
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
    foodScore: 9,
    vibesScore: 9,
    excerpt: "Amazing enchiladas. Sublime view. Very good service. Valet parking ($10),  worth it, especially with Chase Sapphire dining credit. 9/10 vibe score.",
    image: "halal-vibes/imgs/coasterra.png",
    content: `
      <p>880 B Harbor Island Dr, San Diego, CA 92101</p>
      <p>Amazing enchiladas. Sublime view. Very good service. Only issue was that you basically have to get valet parking (10 dollars) because was 0 parking in the lot, but I have to say it was worth it - especially if you have the Chase Sapphire dining credit. Price: $30–50. Food: 5. 9/10 vibe score</p>
    `,
    date: "2024-12-01",
    tags: ["halal", "mexican", "waterfront"]
  },
  {
    slug: "jazwah-coffee-chicago",
    title: "JAZWAH COFFEE",
    region: "US",
    location: "Chicago",
    categories: ["coffee", "food", "vibes"],
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
    foodScore: 9,
    vibesScore: 9,
    excerpt: "Great food with great service. Manicotti #1 recommendation. Bread with sauce appetizer pretty good. Olive Garden has no business being in the same complex. 9/10 vibe score.",
    image: null,
    content: `
      <p>11040 Rancho Carmel Dr #2, San Diego, CA 92128</p>
      <p>Great food with great service. I loved the Manicotti, definitely #1 recommendation. Bread with sauce appetizer was also pretty good. I'm not usually big on Italian restaurants but honestly the Olive Garden has no business being in the same complex as this 😂. Food: 5 | Service: 5. 9/10 vibe score</p>
    `,
    date: "2024-11-01",
    tags: ["halal", "italian"]
  },
  {
    slug: "dukes-malibu",
    title: "Duke's Malibu",
    region: "US",
    location: "Malibu",
    categories: ["food", "vibes"],
    foodScore: 9,
    vibesScore: 8,
    excerpt: "Best calamari in California. Amazing view of the coast. Social distancing done right, no flies. 8.5/10 vibe score.",
    image: null,
    content: `
      <p>21150 Pacific Coast Hwy, Malibu, CA 90265</p>
      <p>Best calamari in California, in my opinion. Highly recommend it as an appetizer. Unlike the outdoor seating at other restaurants, this one implemented social distancing (in 2020), had no flies or anything, and an amazing view of the coast of Malibu. Food: 5 | Atmosphere: 5. 8.5/10 vibe score</p>
    `,
    date: "2024-11-01",
    tags: ["halal", "seafood", "waterfront"]
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
    categories: ["food"],
    foodScore: 9,
    vibesScore: 3,
    excerpt: "Best zinger you've ever tasted. Amazing Zinger, although oily and diet-destroyer. Love the pineapple juice. Unattractive shack, no restroom inside, have to go outside. They have a prayer room.",
    image: null,
    content: `
      <p>1414 W El Camino Real, Mountain View, CA 94040</p>
      <p>If you want the best zinger you've ever gifted your tongue with the opportunity of tasting, come to this place. Amazing Zinger, although oily and a diet-destroyer, I would say it's worth trying at least once. I love that they have a prayer room. The only downside to this place is that they don't have a restroom inside the restaurant, you have to go outside to use it. Also the place is a really unattractive shack. Nevertheless I go occasionally because of how darn good the zinger is. I also really recommend the pineapple juice (sublime). Food: 5</p>
    `,
    date: "2024-10-01",
    tags: ["halal", "chicken", "zinger"]
  },
  {
    slug: "zankou-chicken-valencia",
    title: "Zankou Chicken Valencia",
    region: "US",
    location: "Santa Clarita",
    categories: ["food"],
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
    foodScore: 8,
    vibesScore: 8,
    excerpt: "V2G Egg sandwich brilliant. Really got the 50s Hollywood feel. Great view of Hollywood sign on second floor. Bread a bit tasteless. 8/10 vibe score.",
    image: "halal-vibes/imgs/tesla.jpg",
    content: `
      <p>7001 Santa Monica Blvd, Los Angeles, CA 90038</p>
      <p>Great experience- especially for tourists. Really got the 50s Hollywood feel. Got the V2G Egg sandwich and it was brilliant. Only thing was that the bread was a bit tasteless. Great view of Hollywood sign on the second floor. You will probably have to street park if you don't come with an electric car, but I was able to easily find parking on a Sunday ~10:30 AM. 8/10 vibe score</p>
    `,
    date: "2024-10-01",
    tags: ["halal", "breakfast", "hollywood"]
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
    foodScore: 9,
    vibesScore: 10,
    excerpt: "Great first-time Miami spot. Eggs benedict expensive but delectable. Main reason was the view,  was not disappointed. Parking not easy. 10/10 vibe score.",
    image: null,
    content: `
      <p>270 Biscayne Blvd Way, Miami, FL 33131</p>
      <p>This place was great. I came here my first time in Miami to experience a place that captured the Miami vibe without any of the Miami sin haha. I ordered eggs benedict and they were quite expensive, but delectable nevertheless. The main reason I came here anyways, food aside, was for the view, which I was not disappointed by. Only criticism is that the parking wasn't so easy, but definitely would do again. Meal type: Breakfast. Price: $50–100. <strong>10/10 vibe score</strong></p>
    `,
    date: "2024-10-01",
    tags: ["halal", "breakfast", "waterfront"]
  },
  {
    slug: "cafe-53-chicago",
    title: "Cafe 53",
    region: "US",
    location: "Chicago",
    categories: ["food", "vibes"],
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
    foodScore: 8,
    vibesScore: 8,
    excerpt: "Favorite coffee shop in South Bay. Food pretty good, location great. WiFi password changes frequently, can get crowded, some items overpriced. 8.5/10 vibe score.",
    image: null,
    content: `
      <p>3014 El Camino Real, Santa Clara, CA 95051</p>
      <p>My favorite coffee shop in South Bay. Food is actually pretty good in my opinion, and location is great. Only criticism: 1) They change the wifi password frequently 2) Can get quite crowded 3) Can be a bit overpriced for some items. Despite all that, I keep going lol. Meal type: Breakfast. Price: $10–20. Food: 5. 8.5/10 vibe score</p>
    `,
    date: "2024-10-01",
    tags: ["halal", "coffee", "south bay"]
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
    foodScore: null,
    vibesScore: null,
    excerpt: "Great place, good location, and amazing idea. Especially liked the boba spot and TakoSan (Japanese/Hispanic fusion). A tad expensive, but really enjoyed it,  clever concept.",
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
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/IMG_3920.jpg",
    content: `
      <p>San Stefano, El Raml 1, Alexandria Governorate, Egypt</p>
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
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/unnamed.jpg",
    content: `
      <p>Syria St., Sidi Gaber, Alexandria Governorate, Egypt</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "coffee", "sidi gaber"]
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
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/vaca.jpg",
    content: `
      <p>San Francisco, CA</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "birria", "san francisco"]
  },
  {
    slug: "crust-sourdough-deli-santa-clara",
    title: "CRUST Sourdough Deli",
    region: "US",
    location: "Santa Clara",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "Tuna sandwich on sourdough is amazing.",
    image: "images/crust.jpg",
    content: `
      <p>Santa Clara, CA</p>
      <p>Tuna sandwich on sourdough is amazing.</p>
    `,
    date: "2025-05-31",
    tags: ["halal", "sandwiches", "sourdough", "santa clara"]
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
    slug: "bitez-arlington",
    title: "Bitez",
    region: "US",
    location: "Arlington",
    categories: ["food", "vibes"],
    foodScore: null,
    vibesScore: null,
    excerpt: "",
    image: "images/arl.jpg",
    content: `
      <p>Arlington, VA</p>
    `,
    date: "2025-06-01",
    tags: ["halal", "arlington", "virginia"]
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
  }
];
