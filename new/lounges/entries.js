/**
 * Yusuf's Lounge Blog - Entry Data
 *
 * To add a lounge: copy an object below, paste it into the array, and edit it.
 * No HTML editing needed.
 *
 * region: US | UK | Italy | Greece | Poland | Egypt | Saudi Arabia | Turkey
 * airport: airport (or station) name with its code
 * city: used for search and for the card subtitle
 * stars: 1-5, halves and quarters are fine
 * access: short note on how you get in (optional)
 * tags: short labels, click to filter. Reuse existing ones where possible.
 * images: photo paths relative to /new, either "path.jpg" or { src, alt } (optional)
 * body: array of paragraphs (optional)
 */
const LOUNGE_ENTRIES = [
  {
    slug: "air-france-lounge-lax",
    title: "Air France Lounge",
    region: "US",
    city: "Los Angeles",
    airport: "Los Angeles (LAX)",
    stars: 5,
    access: "Paid entry, around $100. Priority Pass will not get you in.",
    tags: ["paid entry", "great food", "great desserts", "long walk"],
    images: [
      { src: "lounges/airfrance/IMG_2533.jpg", alt: "Dining area of the Air France lounge at LAX" },
      { src: "lounges/airfrance/IMG_2537.jpg", alt: "Plate of salmon, quiche, potato gratin, cheese and bread, with profiteroles, brownies, a macaron and mango pudding on the side" },
      { src: "lounges/airfrance/IMG_2534.jpg", alt: "Dessert counter with macarons, profiteroles, brownies, fruit salad and mango pudding" },
      { src: "lounges/airfrance/IMG_2535.jpg", alt: "Roasted salmon with capers and creamy leek sauce at the buffet" },
      { src: "lounges/airfrance/IMG_2538.jpg", alt: "Puff pastry topped with a tomato sauce" }
    ],
    body: [
      "I can't believe I didn't know about this lounge. The one downside is that it is really far from TBIT and requires a lot of walking, but I expect nothing less from one of America's worst international airports.",
      "The food options are excellent. I was very impressed to see roasted salmon with capers and creamy leek sauce, potato gratin, quiche, macarons, pretty good cheese and bread options, good profiteroles and brownies, tasty mango pudding, and some other stuff I can't pronounce.",
      "It was pricey to get in, and to be perfectly honest it was worth it, especially considering that you would wind up paying half of that on food in TBIT anyway. It is very relaxing, and I would definitely recommend it, especially in the middle of a tiring trip."
    ],
    date: "2026-09-13"
  },
  {
    slug: "amex-lounge-lax",
    title: "American Express Lounge",
    region: "US",
    city: "Los Angeles",
    airport: "Los Angeles (LAX)",
    stars: 4,
    tags: ["card lounge"],
    images: ["images/AMEX.jpg"],
    body: [],
    date: "2025-05-31"
  },
  {
    slug: "etihad-lounge-iad",
    title: "Etihad Airways Lounge",
    region: "US",
    city: "Washington, D.C.",
    airport: "Washington Dulles (IAD)",
    stars: 4,
    tags: ["prayer room"],
    images: ["images/IMG_2590.jpg"],
    body: [
      "Has a prayer room and a rug for prayer."
    ],
    date: "2025-05-31"
  },
  {
    slug: "chase-sapphire-lounge-san",
    title: "Chase Sapphire Lounge",
    region: "US",
    city: "San Diego",
    airport: "San Diego (SAN)",
    stars: 4,
    tags: ["card lounge"],
    images: ["images/SANsaph.jpg"],
    body: [],
    date: "2025-05-31"
  },
  {
    slug: "chase-sapphire-lounge-las",
    title: "Chase Sapphire Lounge",
    region: "US",
    city: "Las Vegas",
    airport: "Las Vegas (LAS)",
    stars: 4,
    tags: ["card lounge", "great food", "long wait", "cramped"],
    images: ["images/vegas.jpg"],
    body: [
      "Food options are great. The wait is very annoying, and it is crowded. I was stuck sitting at a bar despite not drinking, because according to the waiter there was nowhere else to sit. Also a bit of a walk from where I was."
    ],
    date: "2026-06-03"
  },
  {
    slug: "the-club-sfo",
    title: "The Club SFO",
    region: "US",
    city: "San Francisco",
    airport: "San Francisco (SFO), Terminal 1 near Gate B4",
    stars: 4,
    tags: ["great desserts", "long wait"],
    images: ["images/IMG_7646.jpeg"],
    body: [
      "Really nice desserts. The pudding custard is good and the chocolate chip cookies come out warm. I haven't tried the actual food yet, but the interior design is beautiful.",
      "The wait around 10 PM was ridiculous. It took 43 minutes to get off the waitlist."
    ],
    date: "2026-06-22"
  },
  {
    slug: "admirals-club-ord",
    title: "American Airlines Admirals Club",
    region: "US",
    city: "Chicago",
    airport: "Chicago (ORD)",
    stars: 4,
    access: "I paid for entry, since this was before I had Priority Pass.",
    tags: ["paid entry", "great food", "good for work"],
    images: [],
    body: [
      "Good lounge, very good food. It was convenient because I had work meetings upon landing and was easily able to take them from there."
    ],
    date: "2026-06-03"
  },
  {
    slug: "av-tap-vip-lounge-mia",
    title: "AV/TAP VIP Lounge",
    region: "US",
    city: "Miami",
    airport: "Miami (MIA)",
    stars: 4,
    tags: ["great food"],
    images: [],
    body: [
      "Great lounge, great food. I was very impressed for a lounge in America."
    ],
    date: "2026-06-03"
  },
  {
    slug: "plaza-premium-lounge-dfw",
    title: "Plaza Premium Lounge",
    region: "US",
    city: "Dallas",
    airport: "Dallas Fort Worth (DFW)",
    stars: 4,
    tags: ["great desserts", "close to gates"],
    images: [],
    body: [
      "Great lounge, great sweets, and a good location, not too far from the gates."
    ],
    date: "2026-06-03"
  },
  {
    slug: "aspire-lounge-san",
    title: "Aspire Lounge",
    region: "US",
    city: "San Diego",
    airport: "San Diego (SAN)",
    stars: 2,
    tags: ["weak food", "cramped"],
    images: [],
    body: [
      "Very small. Food options are awful, at least for breakfast."
    ],
    date: "2026-06-03"
  },
  {
    slug: "the-club-sjc",
    title: "The Club",
    region: "US",
    city: "San Jose",
    airport: "San Jose (SJC), Terminal A",
    stars: 2,
    tags: ["weak food", "coworking", "far from gates"],
    images: [],
    body: [
      "This was the first lounge I have ever been to, so it pains me to make this review.",
      "In my experience, their breakfast is good. However, I have been there around 6 PM many times, only to find that their lunch and dinner options are pretty much nil if you can't eat meat. As someone who only eats halal certified meat, I am usually not able to eat anything, because it is usually one option that is chicken. After living in San Jose, I can confidently say I am not alone in that, as a lot of the community is vegetarian.",
      "Their cookies are consistently dry, which I find surprising for a lounge that presumably has a kitchen.",
      "Another problem is that people usually fly out of Terminal B, but this, the nearest lounge, is in Terminal A, so you have to walk pretty far from your gate to use it. I would rate it lower if it wasn't for the fact that they have a really nice coworking space.",
      "Update: food options have gotten slightly better. They started including quesadillas that don't have to contain meat."
    ],
    date: "2026-06-03"
  },
  {
    slug: "clubrooms-lhr-t3",
    title: "Clubrooms",
    region: "UK",
    city: "London",
    airport: "London Heathrow (LHR), Terminal 3",
    stars: 4.5,
    access: "Priority Pass plus £18.",
    tags: ["priority pass", "extra fee", "great ambiance", "long wait"],
    images: [],
    body: [
      "Great lounge. It took a while to get through the queue, but once I did I was met with an amazing ambiance. One of the best lounges I have ever been to in that respect, especially compared to the other lounges at Heathrow. Dessert options are few, but the food is okay (prawn, pancakes, and so on).",
      "The first time I used this lounge was after a very rough trip, a week of back to back travel, and the comfort I was met with here was great. It sucks that you can't choose where you sit. I still give it 4.5 only because the food options aren't that impressive, especially compared to lounges at other airports.",
      "If you are able to get into the No1 Lounge, which also takes Priority Pass with no extra cost, I would recommend that instead. In my case there was a long waitlist, so I used Clubrooms."
    ],
    date: "2026-09-13"
  },
  {
    slug: "no1-lounge-lhr-t3",
    title: "No1 Lounge",
    region: "UK",
    city: "London",
    airport: "London Heathrow (LHR), Terminal 3",
    stars: 4,
    access: "Priority Pass, no extra cost.",
    tags: ["priority pass", "spacious", "long wait"],
    images: [],
    body: [
      "Great lounge with pretty good food options, not impressive but good. The only reason I don't give it a full 5 is the long wait. It is very spacious and nice. Not as classy as Clubrooms, but it is a great lounge.",
      "Dessert options are a bit mid, but other than that it has what a lounge needs."
    ],
    date: "2026-09-13"
  },
  {
    slug: "prima-vista-lounge-fco",
    title: "Prima Vista Lounge, Portus",
    region: "Italy",
    city: "Rome",
    airport: "Rome Fiumicino (FCO)",
    stars: 4,
    tags: ["no wait", "great desserts", "spacious"],
    images: ["images/IMG_4550.jpg"],
    body: [
      "Pretty much no wait, easy to get in. Amazing desserts, and very nice and big."
    ],
    date: "2026-06-03"
  },
  {
    slug: "skyserv-onassis-lounge-ath",
    title: "Skyserv Aristotle Onassis Lounge",
    region: "Greece",
    city: "Athens",
    airport: "Athens (ATH)",
    stars: 4,
    tags: ["not crowded"],
    images: [],
    body: [
      "It is a great lounge. Decent food, not too crowded, and nice bathrooms."
    ],
    date: "2026-06-03"
  },
  {
    slug: "lot-mazurek-lounge-waw",
    title: "LOT Business Lounge Mazurek",
    region: "Poland",
    city: "Warsaw",
    airport: "Warsaw Chopin (WAW)",
    stars: 3.75,
    access: "They let you pay for entry.",
    tags: ["paid entry"],
    images: [],
    body: [
      "Wasn't outstanding. Decent selections, but nothing crazy."
    ],
    date: "2026-06-03"
  },
  {
    slug: "plaza-premium-lounge-lhr",
    title: "Plaza Premium Lounge",
    region: "UK",
    city: "London",
    airport: "London Heathrow (LHR)",
    stars: 3.5,
    tags: ["cramped"],
    images: [],
    body: [
      "Decent food options, but so tiny. It feels like they crammed a lounge into whatever small space they could find, and there is not much room to breathe for an airport this size."
    ],
    date: "2026-06-03"
  },
  {
    slug: "club-aspire-lounge-lhr",
    title: "Club Aspire Lounge",
    region: "UK",
    city: "London",
    airport: "London Heathrow (LHR)",
    stars: 3.5,
    tags: ["cramped"],
    images: [],
    body: [
      "Food options are decent, but the lounge is so small it seems shoehorned into a tight corner. Same story as Plaza Premium at LHR. Fine for a bite, not a place to settle in."
    ],
    date: "2026-06-03"
  },
  {
    slug: "essence-escape-lounge-stn",
    title: "Essence by Escape Lounge",
    region: "UK",
    city: "London",
    airport: "London Stansted (STN)",
    stars: 2.75,
    tags: ["long wait", "weak food"],
    images: ["images/IMG_7756.jpg"],
    body: [
      "Very hard to get in, always a waitlist. I showed up early, before opening, and it still took a while to get in after they opened because they put me on a list anyway. It consistently takes very long to get in, and the food is not good."
    ],
    date: "2026-06-03"
  },
  {
    slug: "alfursan-lounge-jed",
    title: "Alfursan Lounge",
    region: "Saudi Arabia",
    city: "Jeddah",
    airport: "Jeddah (JED)",
    stars: 5,
    tags: ["great food", "made to order", "great desserts", "prayer room"],
    images: ["halal-vibes/imgs/fursan.jpg"],
    body: [
      "I have been to several lounges, not only at JED but around the world, and this is my favorite one. They have a counter where a chef custom makes you a pizza, another one for pasta, and a barista. The buffet options are great too. There are a couple of dessert options in the buffet, but most of the good desserts are behind a counter, and they were great. The sleep accommodations were amazing, and there is a nice musallah for prayers.",
      "They also let you in more than three hours before your flight if you have a business class ticket. Certainly worth it."
    ],
    date: "2024-12-01"
  },
  {
    slug: "aerotel-lounge-jed",
    title: "Aerotel Lounge",
    region: "Saudi Arabia",
    city: "Jeddah",
    airport: "Jeddah (JED)",
    stars: 5,
    access: "Not Priority Pass, you have to pay extra for it.",
    tags: ["paid entry", "great food", "great service"],
    images: [],
    body: [
      "Very nice, amazing food, excellent service, and brilliant overall."
    ],
    date: "2026-06-03"
  },
  {
    slug: "iga-lounge-ist",
    title: "iGA Lounge",
    region: "Turkey",
    city: "Istanbul",
    airport: "Istanbul (IST)",
    stars: 5,
    tags: ["spacious"],
    images: ["images/iga.jpg"],
    body: [],
    date: "2025-05-31"
  },
  {
    slug: "primeclass-lounge-med",
    title: "Primeclass Lounge",
    region: "Saudi Arabia",
    city: "Medina",
    airport: "Medina (MED)",
    stars: 4,
    tags: ["great food", "great ambiance", "good wifi"],
    images: [],
    body: [
      "This is a great lounge, especially compared to other options in the Middle East. Their breakfast is bloody brilliant, and the dessert options are pretty decent too. It has an amazing ambiance and I highly recommend it.",
      "Pretty good wifi, and a good location, although it was hard to find at first."
    ],
    date: "2026-09-13"
  },
  {
    slug: "jed-welcome-lounge",
    title: "JED Welcome Lounge",
    region: "Saudi Arabia",
    city: "Jeddah",
    airport: "Jeddah (JED)",
    stars: 4,
    tags: ["cramped"],
    images: [],
    body: [
      "Very good, but not out of this world. A bit small compared to the other Jeddah lounges."
    ],
    date: "2026-06-03"
  },
  {
    slug: "plaza-premium-marmara-saw",
    title: "Plaza Premium Lounge, Marmara",
    region: "Turkey",
    city: "Istanbul",
    airport: "Istanbul Sabiha Gokcen (SAW)",
    stars: 4,
    access: "Priority Pass.",
    tags: ["priority pass", "halal options", "cramped"],
    images: [],
    body: [
      "Very nice. A bit small, but good food with halal options. I enjoyed it and had a nice lounge experience. Not out of this world, but a good lounge."
    ],
    date: "2026-06-03"
  },
  {
    slug: "cac-lounge-cai-t3",
    title: "CAC Lounge (E Lounge)",
    region: "Egypt",
    city: "Cairo",
    airport: "Cairo (CAI), Terminal 3",
    stars: 4,
    tags: [],
    images: [],
    body: [],
    date: "2025-05-31"
  },
  {
    slug: "haramain-rail-lounge-jed",
    title: "Haramain Rail Lounge",
    region: "Saudi Arabia",
    city: "Jeddah",
    airport: "Jeddah, Haramain high speed rail station",
    stars: 1.5,
    tags: ["weak food", "few drinks", "train station"],
    images: [],
    body: [
      "This lounge is incredibly mid. The bakery items are unimpressive, and the drink options are very few, with no sodas and pretty much just two juices. The seating is not that comfortable, and it is really not much better than the normal seating.",
      "Next time, even if I have lounge access, I think I will just buy airport coffee and hang out in the regular seating."
    ],
    date: "2026-09-13"
  },
  {
    slug: "pearl-lounge-hbe",
    title: "Pearl Lounge",
    region: "Egypt",
    city: "Alexandria",
    airport: "Alexandria Borg El Arab (HBE)",
    stars: 1,
    access: "Priority Pass, when they manage to scan it.",
    tags: ["priority pass", "weak food", "long wait", "cramped"],
    images: [],
    body: [
      "No lounge has consistently disappointed me like this one over the years. Every time I get there they struggle to simply scan the Priority Pass QR code, and there is always some kind of hold up. I was even denied entry twice because they weren't able to figure out how to scan it, and I blame their computers, not the employees.",
      "The food options are just awful. You have a few bakery options that taste quite dry if I'm being honest, and the actual good options are few to nil. The seating availability is quite poor too."
    ],
    date: "2026-09-13"
  }
];
