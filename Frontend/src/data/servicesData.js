// Helper to generate optimized Cloudinary video poster/thumbnail frame
export const getVideoThumbnail = (videoUrl) => {
  if (!videoUrl) return ''
  if (videoUrl.includes('res.cloudinary.com') && videoUrl.includes('/video/upload/')) {
    if (videoUrl.includes('/c_crop,ar_9:16/')) {
      return videoUrl
        .replace('/c_crop,ar_9:16/', '/c_crop,ar_9:16/so_2,w_800,q_auto,f_auto/')
        .replace(/\.(mp4|MP4)$/i, '.jpg')
    }
    return videoUrl
      .replace('/video/upload/', '/video/upload/so_2,w_800,q_auto,f_auto/')
      .replace(/\.(mp4|MP4)$/i, '.jpg')
  }
  return videoUrl.replace(/\.(mp4|MP4)$/i, '.jpg')
}

// Distinct High-Res Images
const imgPhoto86440 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86448 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgIntroProg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691278/TDV-Media/ServicesThumbnails/Introductory%20Programs.webp'
const imgPhoto86450 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86726 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgSnorkelingPng = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691302/TDV-Media/ServicesThumbnails/Snorkeling.webp'
const imgPhoto86451 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86454 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86476 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgScuba1Jpg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgCertCourses = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691284/TDV-Media/ServicesThumbnails/Certified%20Courses.webp'
const imgScuba2Jpg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgScuba3Jpg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgStay = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691313/TDV-Media/AirportToAirport/Stay.webp'
const imgScuba4Jpg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgScuba5Jpg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgScubadiving = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458191/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp';
const imgPhoto86485 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86509 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgCrownOfThorns = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86561 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86567 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86573 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgNightDive = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86574 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86576 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgFlexFunDives = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86578 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgSeaFanJpg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458192/TDV-Media/Extras%20for%20Gallery/Sea_fan.webp';
const imgPhoto86586 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86587 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86588 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86611 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86694 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86723 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgSky1 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86738 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgZero2Hero = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86739 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86742 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86760 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgFreeDivingPng = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691291/TDV-Media/ServicesThumbnails/Free%20Diving.webp'
const imgFreeDivingJpg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86761 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86765 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
const imgPhoto86771 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'

// Extras for Gallery
const extScubaDiving = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp';
const extOpenWater = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458178/TDV-Media/Extras%20for%20Gallery/Open_Water_Scuba_Diving.webp';
const extScubaDiving2 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458189/TDV-Media/Extras%20for%20Gallery/Scubadiving_2.webp';
const extScubadiving1 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458191/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp';
const extSeaFan = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458192/TDV-Media/Extras%20for%20Gallery/Sea_fan.webp';
const extShoal = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458193/TDV-Media/Extras%20for%20Gallery/Shoal.webp';
const extSunset = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458204/TDV-Media/Extras%20for%20Gallery/Sunset.jpg';
const extBandedCoral = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791457833/TDV-Media/Extras%20for%20Gallery/Banded_Coral_Shrimp.webp';
const extVaricose = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458209/TDV-Media/Extras%20for%20Gallery/Varicose_Wart_Slug.webp';
const extYellowback = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458221/TDV-Media/Extras%20for%20Gallery/Yellowback_fusiliers.webp';
const extGiantClam = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458100/TDV-Media/Extras%20for%20Gallery/Giant_Clam.webp';
const extLionfish = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458123/TDV-Media/Extras%20for%20Gallery/Lionfish.webp';
const extBubbleCoral = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458078/TDV-Media/Extras%20for%20Gallery/Bubble_Coral.webp';
const extBaitball = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458179/TDV-Media/Extras%20for%20Gallery/School_of_Baitball.webp';
const extMantaRayVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458144/TDV-Media/Extras%20for%20Gallery/Manta_Ray_2.mp4';
const extBarracudasVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458200/TDV-Media/Extras%20for%20Gallery/Silver_Barracudas.mp4';
const extTurtleVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/c_crop,ar_9:16/v1791458106/TDV-Media/Extras%20for%20Gallery/Hawksbill_Sea_Turtle_2.mp4';
const extTrevallyVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458043/TDV-Media/Extras%20for%20Gallery/Big_Eye_Trevally.mp4';
const extStingrayVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458073/TDV-Media/Extras%20for%20Gallery/Bluespotted_Stingray.mp4';
const extScubaDiverVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458832/TDV-Media/Services/Scuba_Diver.mp4';
const extMorayEelVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791457997/TDV-Media/Extras%20for%20Gallery/A_Moray_Eel_in_a_Giant_Barrel_Sponge.mp4';
const extAnemoneVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458085/TDV-Media/Extras%20for%20Gallery/Clownfish_and_Sea_Anemone.mp4';
const extSeafanVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458006/TDV-Media/Extras%20for%20Gallery/A_Seafan.mp4';

// Exact Service Media Video Imports from Assets/Media/Services
const vidTryDive = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458850/TDV-Media/Services/Try_Dive.mp4';
const vidDSDLite = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458599/TDV-Media/Services/Discover_Scuba_Dive_Lite.mp4';
const vidDiscoverScuba = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458604/TDV-Media/Services/Discover_Scuba_Dive.mp4';
const vidDiscoverSnorkelling = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458610/TDV-Media/Services/Discover_Snorkelling.mp4';
const vidBubblemaker = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458569/TDV-Media/Services/Bubblemaker.mp4';
const vidAddDiveAfterDSD = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458540/TDV-Media/Services/Additional_dive_ater_discover_scuba_dive.mp4';
const vidSkinDiver = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458841/TDV-Media/Services/Skin_Diver.mp4';
const vidScubaDiver = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458832/TDV-Media/Services/Scuba_Diver.mp4';
const vidOpenWater = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458719/TDV-Media/Services/Open_Water_Diver.mp4';
const vidAdventureDiver = 'https://res.cloudinary.com/qvbunv8y/video/upload/c_crop,ar_9:16/v1791458554/TDV-Media/Services/AdventureDiver.mp4';
const vidAdvancedOpenWater = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458550/TDV-Media/Services/Advanced_Open_Water.mp4';
const vidEFR = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458635/TDV-Media/Services/EFR_Primary_Secondary_Care.mp4';
const vidRescueDiver = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458823/TDV-Media/Services/Rescue_Diver.mp4';
const vidReactivate = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458802/TDV-Media/Services/Reactivate_with_dive.mp4';
const vidFullRefresher = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458687/TDV-Media/Services/Full_Refresher_with_dive.mp4';
const vidLiteRefresher = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458695/TDV-Media/Services/Lite_Refresher.mp4';
const vidBuoyancy = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458783/TDV-Media/Services/Peak_Perormance_Buoyancy.mp4';
const vidProjectAware = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458794/TDV-Media/Services/Project_AWARE.mp4';
const vidDeepDiver = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458576/TDV-Media/Services/DeepDiver.mp4';
const vidWreckDiver = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458856/TDV-Media/Services/Wreck_Diver.mp4';
const vidNightDiveBackground = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458701/TDV-Media/Services/Night_Diver.mp4';
const vidNitrox = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458669/TDV-Media/Services/Enriched_Air_Nitrox.mp4';
const vidFunDive = extTurtleVid;
const vidDSDOpenWater = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458588/TDV-Media/Services/Discover_Scuba_Dive_Open_Water.mp4';
const vidOWAdvanced = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458729/TDV-Media/Services/Open_water_Advanced_Openwater.mp4';
const vidEFRRescue = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458642/TDV-Media/Services/Emergency_First_Response_Rescue_Diver.mp4';
const vidDivemaster = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458623/TDV-Media/Services/DiveMaster.mp4';
const vidEFRRescueDM = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458665/TDV-Media/Services/Emergency_First_Response_Rescue_DiveMaster.mp4';
const vidEFRRescueDMPrereq = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458656/TDV-Media/Services/Emergency_First_Response_Rescue_DiveMaster_Prequesites.mp4';
const vidZeroToHero = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458861/TDV-Media/Services/Zero_to_hero_-_Open_Water_to_Dive_Master.mp4';
const vidBasicFreediver = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458559/TDV-Media/Services/BasicFreeDiver.mp4';
const vidFreediver = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458677/TDV-Media/Services/Freediver.mp4';
const vidReefExplorer = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458813/TDV-Media/Services/reefexplorer.mp4';
const vidOceanExplorer = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458710/TDV-Media/Services/oceanexplorer.mp4';
const vidDriftDiver = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458629/TDV-Media/Services/Drift_Dive.mp4';
const vid3DaySurf = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458534/TDV-Media/Services/3_Day_Surf_Academy_Course.mp4';
const vidDiscoverSurfing = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458614/TDV-Media/Services/discover_surfing.mp4';
const vidCanoneering = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791460085/TDV-Media/Services/Other/Canoneering.mp4';

// Add Ons Media (Cloudinary URLs)
const vidTrekking = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791685324/TDV-Media/AddOns/Trekking.mp4'
const imgTrekking = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685508/TDV-Media/AddOns/trekking.webp'
const vidSightseeing = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791685371/TDV-Media/AddOns/sightseeing.mp4'
const imgSightseeing = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685509/TDV-Media/AddOns/sightseeing.webp'
const vidCampers = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791686777/TDV-Media/AddOns/Campers.mp4'
const imgCampers = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685511/TDV-Media/AddOns/campers.webp'
const vidSafari = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791691465/TDV-Media/AirportToAirport/gallery1.mp4'
const imgSafari = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685504/TDV-Media/AddOns/safari.webp'
const vidLiveaboard = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791685388/TDV-Media/AddOns/liveaboard.mp4'
const imgLiveaboard = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685512/TDV-Media/AddOns/liveaboard.webp'

export const CATEGORIES = [
  { key: 'all', label: 'All Services' },
  { key: 'programs', label: 'Programs' },
  { key: 'snorkeling', label: 'Snorkeling' },
  { key: 'courses', label: 'Courses' },
  { key: 'specialities', label: 'Specialities' },
  { key: 'combos', label: 'Combos' },
  { key: 'pro', label: 'Pro Courses' },
  { key: 'freediving', label: 'Freediving' },
  { key: 'surfing', label: 'Surfing' },
  { key: 'addons', label: 'Add Ons' },
]

export const SERVICES_DATA = [
  // 1. Programs
  {
    id: 'prog-1',
    category: 'programs',
    title: 'Try Dive',
    short_desc: 'A short introduction dives for beginners.',
    long_desc: 'Experience scuba safely in shallow water with a briefing, shallow water training and a guided dive upto 4 meters for 10 minutes.',
    video: vidTryDive,
    image: getVideoThumbnail(vidTryDive),
    highlights: 'Max Depth: 4m | Dive Time: 10 mins | Total Time: 45 mins | Photos & videos included',
    min_age: 8.0,
    faqs: [
      {
        q: 'Do I need prior swimming or scuba experience for Try Dive?',
        a: 'No prior experience is required. Try Dive is designed specifically for beginners to safely experience breathing underwater in shallow water.'
      },
      {
        q: 'What is the maximum depth and duration for Try Dive?',
        a: 'The guided dive reaches a maximum depth of 4 meters for 10 minutes, with a total experience time of approximately 45 minutes including briefing and training.'
      },
      {
        q: 'Are photos and videos included with Try Dive?',
        a: 'Yes, underwater photos and videos are included with your Try Dive session.'
      }
    ]
  },
  {
    id: 'prog-2',
    category: 'programs',
    title: 'DSD Lite',
    short_desc: 'A lighter version of Discover Scuba Dive.',
    long_desc: 'Includes a briefing, shallow water training, and a guided dive upto 12 meters for a maximum of 20 minutes.',
    video: vidDSDLite,
    image: getVideoThumbnail(vidDSDLite),
    highlights: 'Max Depth: 12m (or 4m for kids/medical) | Dive Time: 20 mins | Total Time: 1 hr | Photos & videos included',
    min_age: 10.0,
    faqs: [
      {
        q: 'What makes DSD Lite different from standard Discover Scuba?',
        a: 'DSD Lite offers a focused 20-minute dive up to 12 meters (or 4m for kids/medical considerations) with a total 1-hour session duration.'
      },
      {
        q: 'What is the minimum age requirement for DSD Lite?',
        a: 'The minimum age requirement for DSD Lite is 10 years old.'
      },
      {
        q: 'Do I get underwater memories from the dive?',
        a: 'Yes, full photos and videos are included with the package.'
      }
    ]
  },
  {
    id: 'prog-3',
    category: 'programs',
    title: 'Discover Scuba Dive',
    short_desc: 'The official Certified Discover Scuba Diving program.',
    long_desc: "Our official introductory scuba diving program where you will learn the basics of scuba diving, practice skills in confined water, and do an open water dive under upto 12 meters for 45 mins under the close supervision of a Certified Instructor.",
    video: vidDiscoverScuba,
    image: getVideoThumbnail(vidDiscoverScuba),
    highlights: 'Max Depth: 12m | Dive Time: 45 mins | Total Time: 3 hrs | Photos & videos included',
    faqs: [
      {
        q: 'What does the official Certified Discover Scuba Diving program cover?',
        a: 'You will learn fundamental dive theory, practice essential skills in confined water, and complete an open water dive up to 12 meters for 45 minutes with a Certified Instructor.'
      },
      {
        q: 'How long is the total experience?',
        a: 'The complete program lasts approximately 3 hours, ensuring thorough preparation, training, and open water diving time.'
      },
      {
        q: 'Can this count towards my Certified Open Water certification?',
        a: 'Yes! The skills learned in DSD can often be credited towards your full Open Water Diver certification course.'
      }
    ]
  },
  {
    id: 'prog-4',
    category: 'programs',
    title: 'Additional Dive after DSD',
    short_desc: 'Extra guided dive after DSD.',
    long_desc: 'Extend your Discover Scuba Dive experience with a guided dive with a Certified Pro.',
    video: vidAddDiveAfterDSD,
    image: getVideoThumbnail(vidAddDiveAfterDSD),
    highlights: 'Dive Time: 45 mins | Photos & videos may be included',
    faqs: [
      {
        q: 'Who is eligible for the Additional Dive after DSD?',
        a: 'This dive is available to participants who have completed a Discover Scuba Diving session and wish to do an extra guided reef immersion.'
      },
      {
        q: 'How long is the additional guided dive?',
        a: 'The dive time is approximately 45 minutes under the supervision of a certified professional.'
      }
    ]
  },
  {
    id: 'prog-5',
    category: 'programs',
    title: 'Bubblemaker',
    short_desc: 'Scuba fun for kids aged between 8 to 10.',
    long_desc: 'The Bubblemaker introduces children to scuba in a safe pool like environment.',
    video: vidBubblemaker,
    image: getVideoThumbnail(vidBubblemaker),
    highlights: 'Max Depth: 2m | Dive Time: 30 mins | Course registration included',
    min_age: 8.0,
    faqs: [
      {
        q: 'What age group is Bubblemaker suitable for?',
        a: 'Bubblemaker is specifically designed for kids aged 8 to 10 years old.'
      },
      {
        q: 'How deep do children dive during Bubblemaker?',
        a: 'Kids dive to a safe maximum depth of 2 meters for 30 minutes in a calm, pool-like environment under direct supervision.'
      },
      {
        q: 'Is official Course registration included?',
        a: 'Yes, Course registration is included with the Bubblemaker program.'
      }
    ]
  },

  // 2. Snorkeling
  {
    id: 'snork-1',
    category: 'snorkeling',
    title: 'Discover Snorkeling',
    short_desc: 'Learn the basics of snorkeling in a safe, guided setting.',
    long_desc: 'Includes briefing, equipment use orientation, and a 1 hour open water snorkeling session with a professional leading you.',
    video: vidDiscoverSnorkelling,
    image: getVideoThumbnail(vidDiscoverSnorkelling),
    highlights: 'Total Time: 1 hr | Knowledge development + water session',
    faqs: [
      {
        q: 'What is included in the Discover Snorkeling session?',
        a: 'It includes a briefing, equipment use orientation, and a 1-hour open water snorkeling session led by a professional.'
      },
      {
        q: 'Do I need previous snorkeling experience?',
        a: 'No, our professional guides provide full instruction and support for beginners of all skill levels.'
      }
    ]
  },
  {
    id: 'snork-2',
    category: 'snorkeling',
    title: 'Reef Explorer',
    short_desc: 'Guided reef snorkeling for beginners.',
    long_desc: 'Perfect shallow-water snorkel trip to see colorful reef fish, corals, and safe lagoon sites.',
    video: vidReefExplorer,
    image: getVideoThumbnail(vidReefExplorer),
    highlights: 'Total Time: 1–1.5 hrs | Suitable for all ages',
    faqs: [
      {
        q: 'Who is Reef Explorer designed for?',
        a: 'Reef Explorer is a shallow-water snorkeling trip suitable for all ages and beginners seeking colorful marine life in safe lagoon sites.'
      },
      {
        q: 'How long is the Reef Explorer trip?',
        a: 'The total duration is approximately 1 to 1.5 hours.'
      }
    ]
  },
  {
    id: 'snork-3',
    category: 'snorkeling',
    title: 'Ocean Explorer',
    short_desc: 'Snorkel further into the blue.',
    long_desc: 'Explore deeper reef areas, spot turtles and bigger marine life, with guided safety.',
    video: vidOceanExplorer,
    image: getVideoThumbnail(vidOceanExplorer),
    highlights: 'Total Time: 1.5–2 hrs | Includes equipment & guide',
    faqs: [
      {
        q: 'What will I see on the Ocean Explorer trip?',
        a: 'Ocean Explorer explores deeper reef sectors where you have higher chances of spotting sea turtles, rays, and pelagic marine life.'
      },
      {
        q: 'Is equipment included with Ocean Explorer?',
        a: 'Yes, full snorkeling equipment and a professional safety guide are included.'
      }
    ]
  },

  // 3. Courses
  {
    id: 'course-1',
    category: 'courses',
    title: 'Skin Diver',
    short_desc: 'Learn snorkeling & skin diving.',
    long_desc: 'Dive on a single breath upto 6 meters. Learn the basics of breath-hold diving, safety considerations and efficient technique.',
    video: vidSkinDiver,
    image: getVideoThumbnail(vidSkinDiver),
    highlights: 'Duration: 1–2 days | Includes knowledge + water sessions',
    days_min: 1.0,
    days_max: 1.0,
    faqs: [
      {
        q: 'What skills will I learn in Skin Diver?',
        a: 'You will learn breath-hold diving technique up to 6 meters, snorkel clearing, vertical descents, and essential safety considerations.'
      },
      {
        q: 'What is the duration of the course?',
        a: 'The course spans 1 day (1–2 days flexible) with knowledge development and in-water practice sessions.'
      }
    ]
  },
  {
    id: 'course-2',
    category: 'courses',
    title: 'Scuba Diver',
    short_desc: 'Entry-level certification.',
    long_desc: 'The first step towards scuba certification for beginners with limited time. The certification will enable you to dive upto 12m under professional supervision. Upgrade to open water diver anytime by completing the remaining training sections. Includes theory, confined water skill development and 2 open water dives upto 12 meters.',
    video: vidScubaDiver,
    image: getVideoThumbnail(vidScubaDiver),
    highlights: 'Duration: 1–2 days | Credit toward Open Water',
    days_min: 1.0,
    days_max: 2.0,
    min_age: 10.0,
    faqs: [
      {
        q: 'What does the Scuba Diver certification allow me to do?',
        a: 'It qualifies you to dive up to 12 meters under the direct supervision of a certified professional worldwide.'
      },
      {
        q: 'Can I upgrade this certification to Open Water Diver later?',
        a: 'Yes, you can upgrade to full Open Water Diver anytime by completing the remaining theory and open water training dives.'
      },
      {
        q: 'What are the age and time requirements?',
        a: 'The minimum age is 10 years old, and the course takes 1 to 2 days including 2 open water dives.'
      }
    ]
  },
  {
    id: 'course-3',
    category: 'courses',
    title: 'Open Water Diver',
    short_desc: "The world's most popular scuba certification.",
    long_desc: 'Learn essential dive theory, skills, and complete 4 open water dives. This certification lets you dive upto 18m without professional supervision.',
    video: vidOpenWater,
    image: getVideoThumbnail(vidOpenWater),
    highlights: 'Duration: 3–4 days | Certification to 18m',
    days_min: 3.0,
    days_max: 4.0,
    min_age: 10.0,
    faqs: [
      {
        q: 'What is the maximum depth certification for Open Water Diver?',
        a: 'This certification allows you to dive autonomously with a buddy up to 18 meters depth worldwide.'
      },
      {
        q: 'What does the course schedule look like?',
        a: 'The course takes 3 to 4 days, combining dive theory, confined water skills training, and 4 qualifying open water ocean dives.'
      },
      {
        q: 'What is the minimum age to enroll?',
        a: 'The minimum age is 10 years old (qualifies for Junior Open Water Diver, automatically upgrading to Open Water at age 15).'
      }
    ]
  },
  {
    id: 'course-4',
    category: 'courses',
    title: 'Adventure Diver',
    short_desc: 'Complete 3 adventure dives.',
    long_desc: 'Expand skills in areas like navigation, buoyancy, or night diving.',
    video: vidAdventureDiver,
    image: getVideoThumbnail(vidAdventureDiver),
    highlights: 'Duration: 1–2 days | Credit toward Advanced | Prequisites: Open Water Diver',
    days_min: 1.0,
    days_max: 2.0,
    min_age: 10.0,
    faqs: [
      {
        q: 'What are the prerequisites for Adventure Diver?',
        a: 'You must be a certified Open Water Diver (or equivalent qualifying certification) and at least 10 years old.'
      },
      {
        q: 'How many dives are included in Adventure Diver?',
        a: 'You will complete 3 Adventure Dives of your choice (such as Deep, Navigation, Peak Performance Buoyancy, or Night).'
      },
      {
        q: 'Does Adventure Diver credit towards Advanced Open Water?',
        a: 'Yes, all 3 adventure dives count directly toward your Advanced Open Water Diver certification.'
      }
    ]
  },
  {
    id: 'course-5',
    category: 'courses',
    title: 'Advanced Open Water',
    short_desc: 'Take your skills deeper.',
    long_desc: 'Includes 5 adventure dives: Deep + Navigation + 3 electives.',
    video: vidAdvancedOpenWater,
    image: getVideoThumbnail(vidAdvancedOpenWater),
    highlights: 'Duration: 2–3 days | Certification to 30m | Prerequisites: Open water diver',
    days_min: 2.0,
    days_max: 3.0,
    min_age: 12.0,
    faqs: [
      {
        q: 'What is the depth qualification for Advanced Open Water?',
        a: 'This course certifies you to dive to a maximum depth of 30 meters (100 feet).'
      },
      {
        q: 'Which 5 adventure dives are completed in this course?',
        a: 'The course includes Deep Diving, Underwater Navigation, plus 3 elective specialty dives tailored to local marine sites.'
      },
      {
        q: 'What are the course prerequisites?',
        a: 'Prerequisite is Open Water Diver (or equivalent) with a minimum age of 12 years.'
      }
    ]
  },
  {
    id: 'course-6',
    category: 'courses',
    title: 'EFR Primary & Secondary Care',
    short_desc: 'Learn CPR and first aid.',
    long_desc: 'Emergency First Responder course for divers and non-divers. Develop Skills to be able to respond in a medical emergency and make a difference in saving peoples lives.',
    video: vidEFR,
    image: getVideoThumbnail(vidEFR),
    highlights: 'Duration: 1–2 days | Certification valid 2 years',
    days_min: 1.0,
    days_max: 2.0,
    faqs: [
      {
        q: 'Do I need to be a diver to take the EFR course?',
        a: 'No, Emergency First Response is open to both divers and non-divers of all backgrounds.'
      },
      {
        q: 'What skills are taught in Primary & Secondary Care?',
        a: 'You will master CPR, primary assessment, AED use, shock management, spinal injury handling, and basic first aid.'
      },
      {
        q: 'How long is the certification valid?',
        a: 'The EFR certification is internationally recognized and valid for 2 years.'
      }
    ]
  },
  {
    id: 'course-7',
    category: 'courses',
    title: 'Rescue Diver',
    short_desc: 'Expand your rescue skills and become a safer diver.',
    long_desc: 'Learn to manage dive emergencies and assist other divers.',
    video: vidRescueDiver,
    image: getVideoThumbnail(vidRescueDiver),
    highlights: 'Duration: 3–4 days | Prereq: Advanced + EFR',
    days_min: 3.0,
    days_max: 4.0,
    min_age: 12.0,
    faqs: [
      {
        q: 'What are the prerequisites for Rescue Diver?',
        a: 'You must have completed Advanced Open Water and valid EFR Primary & Secondary Care CPR/First Aid training within the last 24 months, with minimum age 12.'
      },
      {
        q: 'What will I practice in the Rescue Diver course?',
        a: 'You will learn self-rescue, recognizing diver stress, managing equipment problems, surfacing unresponsive divers, and orchestrating emergency action plans.'
      },
      {
        q: 'How long does the course take?',
        a: 'The Rescue Diver course spans 3 to 4 days of classroom, pool skill development, and open ocean rescue scenarios.'
      }
    ]
  },
  {
    id: 'course-8',
    category: 'courses',
    title: 'Reactivate (with dive)',
    short_desc: 'Refresh your skills with certification credit.',
    long_desc: 'Includes theory review and 1 open water dive.',
    video: vidReactivate,
    image: getVideoThumbnail(vidReactivate),
    highlights: 'Duration: 1 day | 1 Open Water Dive',
    days_min: 1.0,
    days_max: 1.0,
    faqs: [
      {
        q: 'What is Reactivate?',
        a: 'ReActivate is the official refresher program that reviews key dive theory online and includes an in-water skill session and 1 open water dive to update your Certified certification records.'
      },
      {
        q: 'Do I get an updated certification card?',
        a: 'Yes, completing ReActivate generates a refreshed Certification card showing your ReActivated date.'
      }
    ]
  },
  {
    id: 'course-9',
    category: 'courses',
    title: 'Full Refresher (with dive)',
    short_desc: 'Refresher without certification credit.',
    long_desc: 'Skills practice and 1 open water dive.',
    video: vidFullRefresher,
    image: getVideoThumbnail(vidFullRefresher),
    highlights: 'Duration: 1 day | 1 Open Water Dive',
    days_min: 1.0,
    days_max: 1.0,
    faqs: [
      {
        q: 'What is included in the Full Refresher?',
        a: 'It includes a comprehensive equipment review, in-water skill practice, and 1 guided open water dive with a certified professional.'
      },
      {
        q: 'How does it differ from ReActivate?',
        a: 'Full Refresher is focused entirely on hands-on practice and guided diving without purchasing Online e-learning registration.'
      }
    ]
  },
  {
    id: 'course-10',
    category: 'courses',
    title: 'Lite Refresher (confined only)',
    short_desc: 'Confined water refresher only.',
    long_desc: 'Quick skill refresh in pool or shallow water.',
    video: vidLiteRefresher,
    image: getVideoThumbnail(vidLiteRefresher),
    highlights: 'Duration: 1 day | Confined water only',
    days_min: 1.0,
    days_max: 1.0,
    faqs: [
      {
        q: 'Who is Lite Refresher suitable for?',
        a: 'It is ideal for certified divers who want a quick, convenient refresh of mask clearing, regulator recovery, and buoyancy in pool or shallow water before going on boat dives.'
      },
      {
        q: 'How long is the session?',
        a: 'The session lasts 1 day in confined water.'
      }
    ]
  },

  // 4. Specialities
  {
    id: 'spec-1',
    category: 'specialities',
    title: 'Peak Performance Buoyancy',
    short_desc: 'Become a buoyancy master.',
    long_desc: 'Explore more and dive comfortably while improving air consumption, trim, finning and overall bouyancy skills.',
    video: vidBuoyancy,
    image: getVideoThumbnail(vidBuoyancy),
    highlights: 'Duration: 1–2 days | Includes 2 dives | Preqeruisites: Open Water Diver',
    days_min: 1.0,
    days_max: 1.0,
    faqs: [
      {
        q: 'How does Peak Performance Buoyancy improve my diving?',
        a: 'It optimizes your weight positioning, stream-lines your trim, reduces air consumption, and lets you hover effortlessly near delicate coral reefs.'
      },
      {
        q: 'What are the requirements and dive count?',
        a: 'Prerequisite is Open Water Diver; the course takes 1–2 days and includes 2 focused ocean training dives.'
      }
    ]
  },
  {
    id: 'spec-2',
    category: 'specialities',
    title: 'Project AWARE',
    short_desc: 'Support ocean conservation.',
    long_desc: 'Knowledge-based specialty focused on marine protection.',
    video: vidProjectAware,
    image: getVideoThumbnail(vidProjectAware),
    highlights: 'Duration: 1–2 days | Non-diving course',
    days_min: 1.0,
    days_max: 1.0,
    faqs: [
      {
        q: 'Do I have to dive to take Project AWARE?',
        a: 'No, Project AWARE is a non-diving, knowledge-based conservation specialty accessible to both divers and non-divers.'
      },
      {
        q: 'What topics are covered in the course?',
        a: 'You will learn about ocean ecosystems, marine debris, coral reef preservation, and responsible diver practices.'
      }
    ]
  },
  {
    id: 'spec-3',
    category: 'specialities',
    title: 'Deep Diver',
    short_desc: 'Dive deeper safely.',
    long_desc: 'Learn advanced deep diving by taking planning, techniques, and safety to the next level for 18–40m dives.',
    video: vidDeepDiver,
    image: getVideoThumbnail(vidDeepDiver),
    highlights: 'Duration: 2 days | 4 dives | Preqeruisites: Open Water',
    days_min: 2.0,
    days_max: 3.0,
    faqs: [
      {
        q: 'What is the maximum depth limit taught in Deep Diver?',
        a: 'You will train to dive safely to the maximum recreational limit of 40 meters (130 feet).'
      },
      {
        q: 'How many dives are included in Deep Diver specialty?',
        a: 'The course includes 4 deep ocean training dives over 2 to 3 days covering gas management, narcosis awareness, and emergency decompression procedures.'
      }
    ]
  },
  {
    id: 'spec-4',
    category: 'specialities',
    title: 'Wreck Diver',
    short_desc: 'Explore underwater wrecks.',
    long_desc: 'Learn how to safely and effectively dive in wrecks.',
    video: vidWreckDiver,
    image: getVideoThumbnail(vidWreckDiver),
    highlights: 'Duration: 1–2 days | 4 dives',
    days_min: 2.0,
    days_max: 3.0,
    faqs: [
      {
        q: 'What will I learn during the Wreck Diver specialty?',
        a: 'You will learn safe wreck navigation, mapping, reel line deployment, and avoiding hazards around historic shipwrecks.'
      },
      {
        q: 'How many dives are completed?',
        a: 'The course includes 4 wreck dives over 1 to 2 days.'
      }
    ]
  },
  {
    id: 'spec-5',
    category: 'specialities',
    title: 'Night Diver',
    short_desc: 'Experience diving at night.',
    long_desc: 'Use torches, signals, and practice navigation in the dark.',
    video: vidNightDiveBackground,
    image: getVideoThumbnail(vidNightDiveBackground),
    highlights: 'Duration: 2 days | 3 dives',
    days_min: 2.0,
    days_max: 3.0,
    faqs: [
      {
        q: 'What marine life will I see on Night Dives?',
        a: 'You will encounter nocturnal creatures like active hunting moray eels, bioluminescent plankton, sleeping turtles, and octopus.'
      },
      {
        q: 'How many dives are included in Night Diver specialty?',
        a: 'The course includes 3 night dives over 2 days focusing on light communication, night navigation, and entry/exit safety.'
      }
    ]
  },
  {
    id: 'spec-6',
    category: 'specialities',
    title: 'Enriched Air Nitrox',
    short_desc: 'Extend your bottom time.',
    long_desc: 'Learn safe use of enriched air nitrox for longer no-decompression limits.',
    video: vidNitrox,
    image: getVideoThumbnail(vidNitrox),
    highlights: 'Duration: 1 day | Knowledge + practical session',
    days_min: 1.0,
    days_max: 1.0,
    faqs: [
      {
        q: 'What is the primary benefit of Enriched Air Nitrox?',
        a: 'Nitrox gives you more no-decompression dive time, especially on repetitive and multi-day scuba diving trips.'
      },
      {
        q: 'How long does the Nitrox certification take?',
        a: 'The course can be completed in 1 day through knowledge development, cylinder analysis practice, and oxygen exposure calculations.'
      }
    ]
  },
  {
    id: 'spec-7',
    category: 'specialities',
    title: 'Drift Diver',
    short_desc: 'Go with the flow!',
    long_desc: 'Learn the techiques to be able to dive in moderate to strong current. Many of the world class diving sites are in areas of high current, so this certificaiton is very useful.',
    video: vidDriftDiver,
    image: getVideoThumbnail(vidDriftDiver),
    highlights: 'Prerequisites: Open Water Diver',
    days_min: 2.0,
    days_max: 2.0,
    faqs: [
      {
        q: 'Why should I take the Drift Diver specialty?',
        a: 'Many of the world’s top dive sites and pelagic hotspots have currents. This course teaches you effortless buoyancy, float line deployment, and drift navigation.'
      },
      {
        q: 'What are the prerequisites?',
        a: 'Prerequisite is Open Water Diver certification.'
      }
    ]
  },

  // 5. Combos & Packages
  {
    id: 'combo-1',
    category: 'combos',
    title: 'DSD + Open Water',
    short_desc: 'Start with Discover Scuba Dive then complete Open Water.',
    long_desc: 'A progressive bundle for beginners to move into certification.',
    video: vidDSDOpenWater,
    image: getVideoThumbnail(vidDSDOpenWater),
    highlights: 'Duration: 3–4 days | Includes Course registration',
    days_min: 3.0,
    days_max: 4.0,
    faqs: [
      {
        q: 'How does the DSD + Open Water bundle work?',
        a: 'You begin with a gentle Discover Scuba Dive, and seamlessly transition into the full Open Water Diver certification without losing any training time.'
      },
      {
        q: 'Is Course registration included in the package?',
        a: 'Yes, official Course registration and certification materials are included.'
      }
    ]
  },
  {
    id: 'combo-2',
    category: 'combos',
    title: 'OW + Advanced',
    short_desc: 'Bundle Open Water and Advanced courses.',
    long_desc: 'Go from beginner to advanced diver.',
    video: vidOWAdvanced,
    image: getVideoThumbnail(vidOWAdvanced),
    highlights: 'Duration: 5–7 days | Max Depth: 30m',
    days_min: 5.0,
    days_max: 7.0,
    faqs: [
      {
        q: 'What depth certification do I finish with?',
        a: 'By completing both Open Water and Advanced Open Water, you will be certified to dive up to 30 meters depth worldwide.'
      },
      {
        q: 'How many days does this bundle take?',
        a: 'The full combo is completed across 5 to 7 immersive training days.'
      }
    ]
  },
  {
    id: 'combo-3',
    category: 'combos',
    title: 'EFR + Rescue Diver',
    short_desc: 'Combine first aid with rescue training.',
    long_desc: 'Learn EFR then apply skills in Rescue Diver.',
    video: vidEFRRescue,
    image: getVideoThumbnail(vidEFRRescue),
    highlights: 'Duration: 4–6 days | Prerequisite: Advanced OpenWater',
    days_min: 4.0,
    days_max: 6.0,
    faqs: [
      {
        q: 'Why combine EFR with Rescue Diver?',
        a: 'EFR provides the essential CPR and medical responder foundation required before mastering open ocean diver rescues in Rescue Diver.'
      },
      {
        q: 'What is the course duration and prerequisite?',
        a: 'The combined program spans 4 to 6 days; prerequisite is Advanced Open Water certification.'
      }
    ]
  },
  {
    id: 'combo-fundives',
    category: 'combos',
    title: 'Fun Dives - Multiple',
    short_desc: 'Flexible guided dive packages for certified divers. Choose from 1 to 12+ dives, night dives, and dawn dives.',
    long_desc: 'Explore reefs and walls with flexible guided dive packages tailored directly to your schedule. Choose from 1 to 12+ dives, specialized Night Dives, and Dawn Dives with certified Divemasters.',
    video: vidFunDive,
    image: getVideoThumbnail(vidFunDive),
    highlights: 'Certified divers only | 1 to 12+ Dives | Custom Packages',
    isFunDivesContainer: true,
    faqs: [
      {
        q: 'Who can book Fun Dive packages?',
        a: 'Fun Dive packages are available for certified divers holding an Open Water certification or above.'
      },
      {
        q: 'Are equipment and dive guides included?',
        a: 'Yes, full scuba equipment and a certified Divemaster guide are included with every dive.'
      }
    ]
  },

  // 6. Pro Courses
  {
    id: 'pro-1',
    category: 'pro',
    title: 'Divemaster',
    short_desc: 'The first professional step.',
    long_desc: 'Learn to supervise dives, assist instructors, and lead certified divers.',
    video: vidDivemaster,
    image: getVideoThumbnail(vidDivemaster),
    highlights: 'Duration: 20–25 days | Excludes crewpak & Certification fee',
    days_min: 20.0,
    days_max: 25.0,
    faqs: [
      {
        q: 'What does the Divemaster course qualify me to do?',
        a: 'You will be a certified certified professional qualified to lead certified divers, assist instructors on courses, and conduct specific Certified programs.'
      },
      {
        q: 'What is the duration of the Divemaster internship?',
        a: 'The course takes 20 to 25 days of in-depth theoretical study, divemaster workshops, rescue assessments, and practical boat internships.'
      }
    ]
  },
  {
    id: 'pro-2',
    category: 'pro',
    title: 'EFR + Rescue + Divemaster',
    short_desc: 'Complete pro-level bundle.',
    long_desc: 'Progress from EFR to Rescue Diver, then Divemaster.',
    video: vidEFRRescueDM,
    image: getVideoThumbnail(vidEFRRescueDM),
    highlights: 'Duration: 24–31 days | Excludes crewpak & Certification fees',
    days_min: 24.0,
    days_max: 31.0,
    faqs: [
      {
        q: 'What is included in the EFR + Rescue + Divemaster package?',
        a: 'This bundle takes you through Emergency First Response, Rescue Diver, and the complete professional Divemaster internship.'
      },
      {
        q: 'How long does this pro pathway take?',
        a: 'The complete track spans 24 to 31 days.'
      }
    ]
  },
  {
    id: 'pro-3',
    category: 'pro',
    title: 'EFR + Rescue + DM (prereqs)',
    short_desc: 'Accelerated path with prerequisites.',
    long_desc: 'Skip prior modules and move into Divemaster.',
    video: vidEFRRescueDMPrereq,
    image: getVideoThumbnail(vidEFRRescueDMPrereq),
    highlights: 'Duration: varies | Excludes crewpak & Certification fees',
    faqs: [
      {
        q: 'What is the accelerated prerequisite track?',
        a: 'For divers with existing qualifications or logged dives, this track customizes module progression straight into Divemaster certification.'
      }
    ]
  },
  {
    id: 'pro-4',
    category: 'pro',
    title: 'Zero to Hero (OW to DM)',
    short_desc: 'Pathway from beginner to Divemaster.',
    long_desc: 'Start at OW and continue to Divemaster certification.',
    video: vidZeroToHero,
    image: getVideoThumbnail(vidZeroToHero),
    highlights: 'Duration: 90–120 days | Permit included | Food & stay extra',
    days_min: 90.0,
    days_max: 120.0,
    faqs: [
      {
        q: 'What is the Zero to Hero program?',
        a: 'Zero to Hero is our complete professional career track taking you from a total beginner with zero dives all the way through Open Water, Advanced, Rescue, EFR, Specialties, and professional Divemaster certification.'
      },
      {
        q: 'How long is the Zero to Hero program?',
        a: 'The program spans 90 to 120 days (3 to 4 months) with unlimited diving practice, island permits, and hands-on dive center mentorship.'
      }
    ]
  },

  // 7. Freediving
  {
    id: 'free-1',
    category: 'freediving',
    title: 'Basic Freediver',
    short_desc: 'Learn the basics of breath-hold diving.',
    long_desc: 'Focus on static apnea, dynamic apnea, and safety in confined water.',
    video: vidBasicFreediver,
    image: getVideoThumbnail(vidBasicFreediver),
    highlights: 'Duration: 1–2 days | Confined water + theory',
    days_min: 1.0,
    days_max: 2.0,
    faqs: [
      {
        q: 'What skills are taught in Basic Freediver?',
        a: 'You will learn static apnea, dynamic apnea, equalization, relaxation breathing, and confined water safety protocols.'
      },
      {
        q: 'How long is the Basic Freediver course?',
        a: 'The course takes 1 to 2 days combining theory and pool/confined water sessions.'
      }
    ]
  },
  {
    id: 'free-2',
    category: 'freediving',
    title: 'Freediver',
    short_desc: 'Build strong freediving skills.',
    long_desc: 'Expand breath-hold time and depth techniques in open water.',
    video: vidFreediver,
    image: getVideoThumbnail(vidFreediver),
    highlights: 'Duration: 2–3 days | Includes confined + open water',
    days_min: 2.0,
    days_max: 3.0,
    faqs: [
      {
        q: 'What does the full Freediver course include?',
        a: 'It includes knowledge development, confined water static & dynamic apnea training, and open water depth sessions to master vertical descents and buddy rescues.'
      },
      {
        q: 'What is the course duration?',
        a: 'The course takes 2 to 3 days.'
      }
    ]
  },

  // 8. Surfing
  {
    id: 'surf-1',
    category: 'surfing',
    title: 'Discover Surfing',
    short_desc: 'Introductory surfboard lesson for beginners.',
    long_desc: 'Learn pop-up techniques, wave timing, board balance, and safety in shallow ocean breaks with an experienced instructor.',
    video: vidDiscoverSurfing,
    image: getVideoThumbnail(vidDiscoverSurfing),
    highlights: 'Total Time: 2 hrs | Includes surfboard, rashguard & instructor',
    min_age: 8.0,
    faqs: [
      {
        q: 'Is Discover Surfing suitable for total beginners?',
        a: 'Yes, Discover Surfing is specifically designed for first-timers to learn paddle mechanics, balance, pop-up technique, and wave safety in shallow waters.'
      },
      {
        q: 'What is included in the lesson?',
        a: 'The 2-hour lesson includes surf board rental, rashguard, safety briefing, and personalized coaching.'
      }
    ]
  },
  {
    id: 'surf-3',
    category: 'surfing',
    title: '3-Day Surf Academy Course',
    short_desc: 'Master wave reading, paddling, and maneuvers.',
    long_desc: 'Comprehensive 3-day surfing course covering ocean currents, line-up positioning, turns, and riding green waves.',
    video: vid3DaySurf,
    image: getVideoThumbnail(vid3DaySurf),
    highlights: 'Duration: 3 Days | Video analysis & surf log included',
    days_min: 3.0,
    days_max: 3.0,
    min_age: 10.0,
    faqs: [
      {
        q: 'What skills will I develop in the 3-Day Surf Academy?',
        a: 'You will progress from whitewater basics to riding unbroken green waves, bottom turns, trimming, line-up positioning, and wave reading.'
      },
      {
        q: 'Is video analysis included?',
        a: 'Yes, video review sessions and a personalized surf progression log are included.'
      }
    ]
  },

  // 9. Add Ons
  {
    id: 'addon-1',
    category: 'addons',
    title: 'Canoneering',
    short_desc: 'An adventurous canoneering experience.',
    long_desc: 'Explore the rugged terrains, rappel down waterfalls, and navigate through natural canyons in this thrilling canoneering adventure.',
    video: vidCanoneering,
    image: getVideoThumbnail(vidCanoneering),
    highlights: 'Adventurous | Guided Tour',
    faqs: [
      {
        q: 'Do I need prior experience?',
        a: 'No prior experience is necessary. Our expert guides will provide all the necessary training and equipment.'
      }
    ]
  },
  {
    id: 'addon-trekking',
    category: 'addons',
    title: 'Trekking',
    short_desc: 'Guided nature trails and scenic coastal mountain treks.',
    long_desc: 'Immerse yourself in lush rainforest trails, scenic ridges, and panoramic island viewpoints led by experienced backcountry guides.',
    video: vidTrekking,
    image: imgTrekking,
    highlights: 'Scenic Trails | Guided Expeditions | Panoramic Views',
    faqs: [
      {
        q: 'What should I wear for trekking?',
        a: 'Sturdy hiking or athletic shoes, comfortable lightweight clothing, a hat, and plenty of water are recommended.'
      },
      {
        q: 'What fitness level is required?',
        a: 'Our trekking routes range from easy scenic walks to moderate trail hikes suitable for all active explorers.'
      }
    ]
  },
  {
    id: 'addon-sightseeing',
    category: 'addons',
    title: 'Sightseeing',
    short_desc: 'Discover historical landmarks, viewpoints, and hidden gems.',
    long_desc: 'Experience local culture, historical landmarks, pristine beaches, and breathtaking coastal lookouts on our curated island sightseeing tours.',
    video: vidSightseeing,
    image: imgSightseeing,
    highlights: 'Cultural Landmarks | Island Heritage | Hidden Gems',
    faqs: [
      {
        q: 'Is transportation included?',
        a: 'Yes, full air-conditioned or open-air island transfers are arranged for all sightseeing tour stops.'
      },
      {
        q: 'Can sightseeing tours be customized?',
        a: 'Absolutely! We offer flexible itineraries tailored to your group’s interests and timeline.'
      }
    ]
  },
  {
    id: 'addon-campers',
    category: 'addons',
    title: 'Campers',
    short_desc: 'Overland adventure camper vans for nomadic island exploration.',
    long_desc: 'Hit the open road in fully equipped camper vehicles. Complete with sleeping quarters, outdoor cooking gear, and off-grid amenities for independent island living under the stars.',
    video: vidCampers,
    image: imgCampers,
    highlights: 'Fully Equipped Vehicles | Off-Grid Freedom | Coastal Camping',
    faqs: [
      {
        q: 'What driving license is needed?',
        a: 'A valid standard driver’s license (and an international driving permit if visiting from abroad) is required.'
      },
      {
        q: 'Are amenities included with the camper?',
        a: 'Yes, our camper vehicles come fully outfitted with bedding, cookware, water storage, shade awnings, and emergency gear.'
      }
    ]
  },
  {
    id: 'addon-safari',
    category: 'addons',
    title: 'Safari',
    short_desc: 'Thrilling wildlife safaris and pristine nature expeditions.',
    long_desc: 'Venture deep into protected habitats, mangrove waterways, and wilderness reserves to observe native wildlife, exotic birds, and marine fauna in their natural sanctuary.',
    video: vidSafari,
    image: imgSafari,
    highlights: 'Wildlife Watching | Marine Sanctuaries | Nature Safari',
    faqs: [
      {
        q: 'What wildlife might we encounter?',
        a: 'Depending on the season, you may spot sea turtles, exotic birds, monitor lizards, dolphins, and diverse mangrove wildlife.'
      },
      {
        q: 'Are safaris guided?',
        a: 'Yes, every safari is accompanied by a certified wildlife naturalist and local guide.'
      }
    ]
  },
  {
    id: 'addon-liveaboard',
    category: 'addons',
    title: 'Liveaboard',
    short_desc: 'Multi-day offshore dive yacht excursions and remote reef expeditions.',
    long_desc: 'Sleep, eat, and dive aboard our dedicated expedition vessel. Reach untouched offshore pinnacles, pristine outer reefs, and nocturnal marine sites inaccessible on day trips.',
    video: vidLiveaboard,
    image: imgLiveaboard,
    highlights: 'Remote Dive Sites | All-Inclusive Cabins | Night Diving',
    faqs: [
      {
        q: 'What is included in the liveaboard package?',
        a: 'All meals, cabin accommodation, daily guided dives, tanks, weights, and marine park permits are included.'
      },
      {
        q: 'What certification do I need for liveaboard trips?',
        a: 'Advanced Open Water Diver (or Open Water with verified deep dive experience) is recommended for remote outer reef conditions.'
      }
    ]
  }
]

export const FUN_DIVES_PACKAGES = [
  // Day Dives
  {
    id: 'fun-1',
    dives: 1,
    title: '1 Dive',
    tag: 'Single Dive',
    funType: 'day',
    short_desc: 'A single guided dive for certified divers.',
    long_desc: 'Explore vibrant reefs or steep drop-offs with a certified guide.',
    video: extScubaDiverVid,
    image: getVideoThumbnail(extScubaDiverVid),
    highlights: 'Certified divers only | Full Gear Included',
    badge: 'Single Dive',
    duration: 'Half Day (1 Dive)',
  },
  {
    id: 'fun-2',
    dives: 2,
    title: '2 Dives',
    tag: '1 Day Package',
    funType: 'day',
    short_desc: 'Two guided ocean dives in one day.',
    long_desc: 'Perfect for a short getaway, explore two distinct dive sites.',
    video: extTurtleVid,
    image: getVideoThumbnail(extTurtleVid),
    highlights: 'Certified divers only | 2 Unique Sites',
    badge: '1 Day Trip',
    duration: '1 Day (2 Dives)',
  },
  {
    id: 'fun-4',
    dives: 4,
    title: '4 Dives',
    tag: 'Popular',
    funType: 'day',
    short_desc: 'Four dives spread across your island vacation.',
    long_desc: 'Explore multiple outer reefs and pinnacles with this package.',
    video: extBarracudasVid,
    image: getVideoThumbnail(extBarracudasVid),
    highlights: 'Certified divers only | Multi-Site Access',
    badge: 'Popular',
    duration: '2 Days (4 Dives)',
  },
  {
    id: 'fun-6',
    dives: 6,
    title: '6 Dives',
    tag: 'Great Value',
    funType: 'day',
    short_desc: 'Six dives for extended coral reef exploration.',
    long_desc: 'Enjoy a multi-day immersive dive adventure across premier sites.',
    video: extMantaRayVid,
    image: getVideoThumbnail(extMantaRayVid),
    highlights: 'Certified divers only | Dedicated DM Guide',
    badge: 'Great Value',
    duration: '3 Days (6 Dives)',
  },
  {
    id: 'fun-8',
    dives: 8,
    title: '8 Dives',
    tag: 'Avid Diver',
    funType: 'day',
    short_desc: 'Eight dives for enthusiastic ocean explorers.',
    long_desc: 'Covers multiple days of diving across varied outer reef ecosystems.',
    video: extTrevallyVid,
    image: getVideoThumbnail(extTrevallyVid),
    highlights: 'Certified divers only | Deep & Drift Sites',
    badge: 'Avid Diver',
    duration: '4 Days (8 Dives)',
  },
  {
    id: 'fun-10',
    dives: 10,
    title: '10 Dives',
    tag: 'Best Value',
    funType: 'day',
    short_desc: 'Ten dive package for committed ocean divers.',
    long_desc: 'The perfect balance of cost and deep Andaman exploration.',
    video: extMorayEelVid,
    image: getVideoThumbnail(extMorayEelVid),
    highlights: 'Certified divers only | Island-wide Sites',
    badge: 'Best Value',
    duration: '5 Days (10 Dives)',
  },
  {
    id: 'fun-12',
    dives: 12,
    title: '12 Dives',
    tag: 'Ultimate',
    funType: 'day',
    short_desc: 'Twelve comprehensive dives for dive enthusiasts.',
    long_desc: 'Extended package covering secret walls, coral gardens, and currents.',
    video: extStingrayVid,
    image: getVideoThumbnail(extStingrayVid),
    highlights: 'Certified divers only | Ultimate Expedition',
    badge: 'Ultimate',
    duration: '6 Days (12 Dives)',
  },
  {
    id: 'fun-post',
    dives: 2,
    title: 'Post 12 (extra 2 dives)',
    tag: 'Add-On',
    funType: 'day',
    short_desc: 'Add on two extra dives to keep exploring.',
    long_desc: 'Flexible add-on to extend your multi-day package anytime.',
    video: extAnemoneVid,
    image: getVideoThumbnail(extAnemoneVid),
    highlights: 'Certified divers only | Extension Pack',
    badge: 'Add-On',
    duration: '1 Extra Day',
  },

  // Dawn Dives
  {
    id: 'fun-dawn-1',
    dives: 1,
    title: 'Dawn Dive (Single)',
    tag: 'Sunrise Special',
    funType: 'dawn',
    short_desc: 'Witness early morning pelagic activity as the reef awakens.',
    long_desc: 'Drop in at first light to experience schooling trevally, hunting sharks, and pristine visibility.',
    video: vidAdventureDiver,
    image: getVideoThumbnail(vidAdventureDiver),
    highlights: 'Certified divers only | First Light Departure',
    badge: 'Dawn Special',
    duration: 'Early Morning (1 Dive)',
  },
  {
    id: 'fun-dawn-2',
    dives: 2,
    title: 'Dawn + Morning 2-Dive Combo',
    tag: 'Dawn Explorer',
    funType: 'dawn',
    short_desc: 'Catch the sunrise surge followed by a relaxed morning reef dive.',
    long_desc: 'Experience the active morning feeding hour followed by high-visibility coral exploration.',
    video: extMantaRayVid,
    image: getVideoThumbnail(extMantaRayVid),
    highlights: 'Certified divers only | 2 Morning Dives',
    badge: 'Dawn Combo',
    duration: 'Morning (2 Dives)',
  },

  // Night Dives
  {
    id: 'fun-night-1',
    dives: 1,
    title: 'Night Dive (Single)',
    tag: 'Nocturnal Safari',
    funType: 'night',
    short_desc: 'Experience bioluminescence and nocturnal marine hunters in the dark.',
    long_desc: 'Descend under torchlight to see sleeping turtles, hunting octopus, and glowing plankton.',
    video: vidNightDiveBackground,
    image: getVideoThumbnail(vidNightDiveBackground),
    highlights: 'Certified divers only | Torch & Guide Included',
    badge: 'Night Special',
    duration: 'Evening (1 Dive)',
  },
  {
    id: 'fun-night-2',
    dives: 2,
    title: 'Dusk to Dark 2-Dive Combo',
    tag: 'Twilight & Night',
    funType: 'night',
    short_desc: 'Start at golden sunset and complete your second dive in full darkness.',
    long_desc: 'Watch day shift to night underwater as nocturnal predators emerge and reef fish hide.',
    video: vidNightDiveBackground,
    image: getVideoThumbnail(vidNightDiveBackground),
    highlights: 'Certified divers only | Sunset + Night',
    badge: 'Twilight Combo',
    duration: 'Late Afternoon / Night (2 Dives)',
  }
]

export default SERVICES_DATA
