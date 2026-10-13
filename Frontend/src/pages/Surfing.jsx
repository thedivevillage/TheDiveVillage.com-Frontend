import CourseTemplate from '../layouts/CourseTemplate'
import SEOHead from '../components/SEOHead'
import { IMAGES } from '../utils/images'
const freediveVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458677/TDV-Media/Services/Freediver.mp4';

export default function Surfing() {
  const tours = [
    {
      id: 'surf-1',
      title: 'Skin Diver',
      desc: 'Focus on breath-hold diving and safe descents.',
      price: 'Contact Us',
      image: IMAGES.surfingFeat1,
      spaces: 6,
    },
    {
      id: 'surf-2',
      title: 'Breath-hold Freediving',
      desc: 'Explore the ocean with just your natural abilities.',
      price: 'Contact Us',
      image: IMAGES.surfingFeat2,
      spaces: 4,
    }
  ]

  const stats = [
    { value: '15+', label: 'Years Experience' },
    { value: '1k+', label: 'Certified Divers' },
    { value: '0', label: 'Safety Incidents' },
  ]

  return (
    <>
      <SEOHead
        title="Freediving Courses & Breath-Hold Training | The Dive Village"
        description="Master breath-hold diving with certified freediving instructors at The Dive Village. Learn relaxation, equalizing techniques, and deep diving safety."
        keywords="freediving courses, breath hold diving, skin diving certification, apnea training, freedive school"
        canonicalUrl="https://thedivevillage.com/freediving"
      />
      <CourseTemplate
        heroVideo={freediveVideo}
        heroImage={IMAGES.surfingHero}
        titleTop="FREEDIVING"
        titleBottom="COURSES"
        heroSubtitle="Master breath-hold diving techniques with certified instructors and experience pure freedom beneath the waves."
        aboutSubtitle="What is Freediving"
        aboutTitle="Connect with the ocean's raw energy"
        aboutText="Freediving teaches balance, patience, and a deep respect for the ocean's rhythm. Join us to experience the ultimate freedom on the water with just a single breath."
        aboutImg1={IMAGES.surfingFeat1}
        aboutImg2={IMAGES.surfingFeat2}
        toursTitle="Freediving Courses"
        toursSubtitle="Ready to hold your breath?"
        tours={tours}
        statsText="Just take the plunge"
        statsDesc="Our professional instructors are dedicated to getting you comfortable with breath-holds and feeling the calm of the ocean safely and confidently."
        stats={stats}
        statsImage={IMAGES.surfingStats}
        statsQuote="There is no feeling quite like the rush of diving into the deep blue."
        ctaTitle="Experience the thrill of freediving"
        ctaDesc="Join our community and embrace the ocean's energy."
      />
    </>
  )
}
