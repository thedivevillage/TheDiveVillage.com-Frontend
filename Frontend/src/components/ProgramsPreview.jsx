import LazyVideo from './LazyVideo'
import { Link, useNavigate } from 'react-router'
import SectionReveal, { StaggerGrid, StaggerItem } from './SectionReveal'
import { CAROUSEL_IMAGES } from '../utils/images'
const diveSuitVid = 'https://res.cloudinary.com/bbgt5nk7/video/upload/v1790240882/dive-village/reviews/merch_5_mp4.mp4';
const tryDiveVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458850/TDV-Media/Services/Try_Dive.mp4';
const certVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458719/TDV-Media/Services/Open_Water_Diver.mp4';

const PROGRAMS = [
  {
    id: 'merch',
    title: 'Dive Village Merch',
    tag: 'Official Gear',
    desc: 'Take a piece of the ocean home with our exclusive dive apparel, suits, and accessories.',
    img: CAROUSEL_IMAGES[2],
    video: diveSuitVid,
    link: '/services',
    btnText: 'Explore Services',
  },
  {
    id: 'try-experiences',
    title: 'Try Experiences',
    tag: 'For Beginners',
    desc: 'Perfect for first-timers. Experience scuba safely in shallow water with professional 1-on-1 supervision.',
    img: CAROUSEL_IMAGES[0],
    video: tryDiveVid,
    link: '/services',
    btnText: 'Explore Services',
  },
  {
    id: 'certification',
    title: 'Certification Pathway',
    tag: 'Certified Courses',
    desc: 'From Open Water Diver to Divemaster, start or advance your international dive certification.',
    img: CAROUSEL_IMAGES[1],
    video: certVid,
    link: '/services',
    btnText: 'Explore Services',
  },
]

export default function ProgramsPreview() {
  return (
    <section id="programs" className="relative py-24 sm:py-32 scroll-mt-20 pointer-events-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="mb-16 flex flex-col items-center text-center">
          <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-accent uppercase tracking-widest mb-4 shadow-sm">
            Featured Offerings
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
            Explore <span className="text-accent font-bold">The Dive Village</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base sm:text-lg text-white/90 font-medium drop-shadow-md text-justify">
            From your very first breath underwater to professional divemaster certifications.
          </p>
          <Link
            to="/services"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 px-6 py-3 text-xs font-bold text-white uppercase tracking-widest transition-all duration-300 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] shadow-md"
          >
            <span>View All Services</span>
            <span className="text-sm">→</span>
          </Link>
        </SectionReveal>

        <StaggerGrid className="grid gap-8 md:grid-cols-3">
          {PROGRAMS.map((program) => (
            <StaggerItem key={program.id}>
              <Card program={program} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}

function Card({ program }) {
  const navigate = useNavigate()

  return (
    <div 
      onClick={() => navigate(program.link || '/services')}
      className="group flex h-full flex-col rounded-[32px] bg-navy/90 backdrop-blur-xl border border-white/20 p-6 sm:p-7 shadow-2xl transition duration-500 hover:-translate-y-2 hover:border-accent/60 hover:shadow-float cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-6 bg-black/20 shrink-0">
        {program.video ? (
          <LazyVideo
            src={program.video}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : program.img ? (
          <img
            src={program.img}
            alt={program.title}
            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent pointer-events-none" />
        <span className="absolute top-3 left-3 bg-navy/80 backdrop-blur-md border border-white/20 text-accent text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
          {program.tag}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <h3 className="font-heading text-2xl font-bold text-white tracking-tight mb-2 leading-tight">
          {program.title}
        </h3>
        
        {/* Accent Bar */}
        <div className="w-8 h-1 bg-accent rounded-full mb-4"></div>

        <p className="text-white/80 text-sm leading-relaxed font-medium mb-8 flex-1 text-left">
          {program.desc}
        </p>

        {/* Button */}
        <Link
          to={program.link || '/services'}
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="w-full py-3.5 px-6 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg mt-auto cursor-pointer"
        >
          <span>{program.btnText}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
