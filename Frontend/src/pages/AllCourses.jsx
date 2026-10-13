import LazyVideo from '../components/LazyVideo'
import { Link } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { IMAGES } from '../utils/images'
import Button from '../components/Button'

const scubaVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458719/TDV-Media/Services/Open_Water_Diver.mp4';
const snorkelingVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458610/TDV-Media/Services/Discover_Snorkelling.mp4';
const freedivingVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458677/TDV-Media/Services/Freediver.mp4';

export default function AllCourses() {
  const reduce = useReducedMotion()

  const CATEGORIES = [
    {
      title: 'Scuba Diving',
      desc: 'A form of underwater diving where divers use a Self-Contained Underwater Breathing Apparatus to explore beneath the surface.',
      img: IMAGES.scubaHero,
      video: scubaVid,
      link: '/courses/scuba'
    },
    {
      title: 'Snorkeling',
      desc: 'Discover snorkeling and explore the ocean up close. The ocean welcomes all.',
      img: IMAGES.snorkelingHero,
      video: snorkelingVid,
      link: '/courses/snorkeling'
    },
    {
      title: 'Freediving',
      desc: 'Focus on breath-hold diving and safe descents.',
      img: IMAGES.surfingHero,
      video: freedivingVid,
      link: '/courses/surfing'
    }
  ]

  return (
    <div className="bg-[#f0f9ff] min-h-screen text-navy font-body overflow-x-hidden pt-24 sm:pt-[120px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="text-accent font-bold tracking-widest uppercase text-xs mb-4 block">Our Programs</span>
        <h1 className="font-serif text-5xl sm:text-7xl text-navy leading-[1.1] mb-6">
          All Courses
        </h1>
        <p className="text-navy/70 leading-relaxed text-lg max-w-2xl mx-auto">
          Whether you want to dive deep, stay near the surface, or ride the waves, we have the perfect ocean experience waiting for you.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {CATEGORIES.map((cat, i) => (
          <motion.div 
            key={i}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group block relative rounded-3xl sm:rounded-[40px] overflow-hidden aspect-[4/3] xs:aspect-[16/11] sm:aspect-[3/4] shadow-xl bg-navy"
          >
            {cat.video ? (
              <LazyVideo
                src={cat.video}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                poster={cat.img}
              />
            ) : (
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-end">
              <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl text-white mb-1.5 sm:mb-2 leading-tight">{cat.title}</h2>
              <p className="text-white/85 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-none leading-relaxed">{cat.desc}</p>
              <Button as={Link} to={cat.link} variant="glass" className="self-start !text-xs sm:!text-sm !py-2.5 sm:!py-3 !px-5 sm:!px-6 !rounded-full text-center">
                Explore {cat.title} →
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-[40px] bg-navy text-white p-10 sm:p-16 lg:p-20 relative overflow-hidden shadow-lift">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block bg-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-accent uppercase tracking-widest mb-6">
              Start Your Certification
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white mb-6">
              Not Sure Which Program is Right for You?
            </h2>
            <p className="text-lg text-white/80 max-w-xl mb-10 leading-relaxed">
              Talk to our Master Instructors. We will guide you to the perfect training path based on your schedule, experience, and goals.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button as={Link} to="/book-us" variant="primary">
                Book a Course Today →
              </Button>
              <Button as={Link} to="/services" variant="secondary">
                View All Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
