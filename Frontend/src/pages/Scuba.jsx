import CourseTemplate from '../layouts/CourseTemplate'
import SEOHead from '../components/SEOHead'
import { IMAGES, FEATURED_EXPERIENCES } from '../utils/images'
const scubaDiveVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458832/TDV-Media/Services/Scuba_Diver.mp4'

export default function Scuba() {
  const tours = [
    FEATURED_EXPERIENCES[1],
    FEATURED_EXPERIENCES[2],
    {
      id: 'scuba-1',
      title: 'Advanced Open Water',
      desc: 'Take your skills to the next level with deep dives and navigation.',
      price: 'Contact Us',
      image: IMAGES.scubaFeat1,
      spaces: 4,
    }
  ]

  const stats = [
    { value: '15+', label: 'Years Experience' },
    { value: '5k+', label: 'Certified Divers' },
    { value: '0', label: 'Safety Incidents' },
  ]

  return (
    <>
      <SEOHead
        title="Scuba Diving Certification & Courses | The Dive Village"
        description="Learn to scuba dive with certified professional instructors. From Discover Scuba Diving for beginners to Advanced Open Water & Divemaster courses."
        keywords="scuba diving certification, open water dive course, scuba diving lessons, deep sea diving, divemaster training"
        canonicalUrl="https://thedivevillage.com/scuba"
      />
      <CourseTemplate
        heroVideo={scubaDiveVideo}
        heroImage={IMAGES.scubaHero}
        titleTop="SCUBA"
        titleBottom="DIVING"
        heroSubtitle="Select your training, certification level, and schedule. Our certified dive masters will guide your underwater journey."
        aboutSubtitle="About Us"
        aboutTitle="A Community for Ocean Lovers"
        aboutText="The Dive Village was born from a simple belief: that the life-changing magic of the Ocean is a feeling meant to be shared. Here, every dive holds a story, and every visitor who arrives leaves as a member of the Community."
        aboutImg1={IMAGES.scubaFeat1}
        aboutImg2={IMAGES.scubaFeat2}
        toursTitle="Most Popular Programs"
        toursSubtitle="Begin your journey beneath the waves"
        tours={tours}
        statsText="Discover yourself — one breath at a time"
        statsDesc="Scuba diving is an immersive experience where you discover an entirely new world beneath the waves, safely guided by our master divers."
        stats={stats}
        statsImage={IMAGES.scubaStats}
        statsQuote="We get to experience the majestic ocean up close during our dives, watching nature unfold."
        ctaTitle="Experience the thrill of deep diving"
        ctaDesc="Nothing is more exhilarating than coming face to face with magnificent marine life. Join the hundreds of our brave customers."
      />
    </>
  )
}
