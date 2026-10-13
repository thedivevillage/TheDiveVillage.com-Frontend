// Curated Gallery & High-Res Diving Photos from assets/Gallery
const p1 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp';
const p2 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458048/TDV-Media/Extras%20for%20Gallery/Blue_Lincka.webp';
const p3 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458178/TDV-Media/Extras%20for%20Gallery/Open_Water_Scuba_Diving.webp';
const p4 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458189/TDV-Media/Extras%20for%20Gallery/Scubadiving_2.webp';
const p6 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458191/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp';
const p7 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458192/TDV-Media/Extras%20for%20Gallery/Sea_fan.webp';
const p8 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458193/TDV-Media/Extras%20for%20Gallery/Shoal.webp';
const p9 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458204/TDV-Media/Extras%20for%20Gallery/Sunset.jpg';
const p10 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791457833/TDV-Media/Extras%20for%20Gallery/Banded_Coral_Shrimp.webp';
const p11 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458209/TDV-Media/Extras%20for%20Gallery/Varicose_Wart_Slug.webp';
const p12 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458221/TDV-Media/Extras%20for%20Gallery/Yellowback_fusiliers.webp';

export const PANEL_IMAGES = [
  "https://res.cloudinary.com/qvbunv8y/image/upload/v1791691582/TDV-Media/Panels/1Threadfin%20Butterflyfish.webp",
  "https://res.cloudinary.com/qvbunv8y/image/upload/v1791691592/TDV-Media/Panels/2Lionfish.webp",
  "https://res.cloudinary.com/qvbunv8y/image/upload/v1791691597/TDV-Media/Panels/3Crown%20Jellyfish.webp",
  "https://res.cloudinary.com/qvbunv8y/image/upload/v1791691607/TDV-Media/Panels/4Blue%20and%20Gold%20Fusilier.webp",
  "https://res.cloudinary.com/qvbunv8y/image/upload/v1791691615/TDV-Media/Panels/5Bubble%20Coral.webp",
  "https://res.cloudinary.com/qvbunv8y/image/upload/v1791691628/TDV-Media/Panels/6Crown%20of%20thorns%20Starfish.webp",
  "https://res.cloudinary.com/qvbunv8y/image/upload/v1791691636/TDV-Media/Panels/7Toadstool%20Leather%20Coral.webp",
  "https://res.cloudinary.com/qvbunv8y/image/upload/v1791691647/TDV-Media/Panels/8Feather%20Star%20%282%29.webp",
  "https://res.cloudinary.com/qvbunv8y/image/upload/v1791691652/TDV-Media/Panels/9Giant%20Clam.webp",
  "https://res.cloudinary.com/qvbunv8y/image/upload/v1791691660/TDV-Media/Panels/10Greenfish%20Sea%20Cucumber.webp"
]
export const CAROUSEL_IMAGES = PANEL_IMAGES.slice(0, 6)

/** Verified high-resolution diving photography */
export const IMAGES = {
  hero: p1,
  whyChoose: p2,
  dest1: p3,
  dest2: p4,
  dest3: p6,
  dest4: p7,
  gallery1: p7,
  gallery2: p8,
  gallery3: p9,
  instructor1: p4,
  instructor2: p6,
  gear1: p7,
  gear2: p1,
  contact: p2,
  snorkelingHero: p3,
  snorkelingFeat1: p4,
  snorkelingFeat2: p6,
  snorkelingStats: p7,
  scubaHero: p1,
  scubaFeat1: p2,
  scubaFeat2: p3,
  scubaStats: p4,
  surfingHero: p6,
  surfingFeat1: p7,
  surfingFeat2: p8,
  surfingStats: p9,
}

export const FEATURED_EXPERIENCES = [
  {
    id: 'exp-1',
    title: 'Try Dive Experience',
    location: 'Kadmat Island, Lakshadweep',
    category: 'Beginner',
    price: 9999,
    badge: 'Popular',
    badgeTone: 'accent',
    image: p1,
  },
  {
    id: 'exp-2',
    title: 'Open Water Diver',
    location: 'Agatti Island, Lakshadweep',
    category: 'Certification',
    price: 19999,
    badge: 'Certification',
    badgeTone: 'cta',
    image: p2,
  },
  {
    id: 'exp-3',
    title: 'Discover Snorkeling',
    location: 'Coral Gardens, Kadmat',
    category: 'Non-Divers',
    price: 4999,
    badge: 'Relaxing',
    badgeTone: 'accent',
    image: p3,
  },
  {
    id: 'exp-4',
    title: 'Fun Dives Package',
    location: 'White Sands, Agatti',
    category: 'Packages',
    price: 14999,
    badge: 'Flexible',
    badgeTone: 'cta',
    image: p4,
  },
]
