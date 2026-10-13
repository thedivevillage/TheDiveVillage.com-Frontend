import CourseTemplate from '../layouts/CourseTemplate'
import SEOHead from '../components/SEOHead'
import { IMAGES, FEATURED_EXPERIENCES } from '../utils/images'
const turtleSnorkelVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458610/TDV-Media/Services/Discover_Snorkelling.mp4';

export default function Snorkeling() {
  const tours = [
    FEATURED_EXPERIENCES[0],
    {
      ...FEATURED_EXPERIENCES[3],
      title: 'Night Snorkeling Adventure',
      category: 'Excursion'
    },
    {
      id: 'snork-1',
      title: 'Reef Discovery Snorkel',
      desc: 'Perfect for beginners. Explore shallow reefs with a guide.',
      price: 'Contact Us',
      image: IMAGES.snorkelingFeat1,
      spaces: 8,
    }
  ]

  const stats = [
    { value: '15+', label: 'Years Experience' },
    { value: '2k+', label: 'Happy Snorkelers' },
    { value: '100%', label: 'Safety Record' },
  ]

  return (
    <>
      <SEOHead
        title="Guided Snorkeling Tours & Coral Reef Safaris | The Dive Village"
        description="Experience guided snorkeling tours and coral reef safaris with marine experts. Perfect for families, beginners, and sea turtle lovers."
        keywords="guided snorkeling tours, coral reef safari, marine wildlife snorkeling, family snorkeling trips, snorkeling equipment"
        canonicalUrl="https://thedivevillage.com/snorkeling"
      />
      <CourseTemplate
        heroVideo={turtleSnorkelVideo}
        heroImage={IMAGES.snorkelingHero}
        titleTop="SNORKELING"
        titleBottom="PROGRAMS"
        heroSubtitle="Explore shallow reefs, crystal-clear turquoise waters, and vibrant marine life with our marine experts."
        aboutSubtitle="What is Snorkeling"
        aboutTitle="The easiest way to discover the ocean"
        aboutText="Snorkeling allows you to glide along the surface and gaze into the vibrant marine world below without the need for heavy equipment or extensive training. It's the perfect family activity and a serene way to connect with nature."
        aboutImg1={IMAGES.snorkelingFeat1}
        aboutImg2={IMAGES.snorkelingFeat2}
        toursTitle="Snorkeling Courses & Tours"
        toursSubtitle="Ready to dive in from the top?"
        tours={tours}
        statsText="Just take the plunge"
        statsDesc="Our snorkeling excursions are guided by experts who know exactly where to find the most colorful reefs and gentle marine life."
        stats={stats}
        statsImage={IMAGES.snorkelingStats}
        statsQuote="Floating above a coral reef is like flying over a bustling underwater city."
        ctaTitle="Experience the thrill of the reef"
        ctaDesc="Nothing is more exhilarating than coming face to face with a sea turtle or a school of vibrant fish just beneath the waves."
      />
    </>
  )
}
