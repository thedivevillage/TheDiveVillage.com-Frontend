import SectionReveal from './SectionReveal'

export default function AboutSection() {
  return (
    <section id="about" className="relative py-16 sm:py-20 scroll-mt-20 pointer-events-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-heading font-bold uppercase tracking-[0.18em] text-white/80 border border-white/20 backdrop-blur-md">
              Our Story
            </span>
            <h2 className="mt-4 font-heading text-h2 font-bold text-white">
              About <span className="font-heading font-bold text-accent">Sanjeev</span> and His Passion for Diving
            </h2>
            <p className="mt-6 text-lg text-white/90 leading-relaxed">
              The Dive Village began with one man and one belief. For Sanjeev, the ocean was more than a passion—it was a sanctuary. A place of healing, discovery, and profound transformation. And he knew, deep down, that this magic was not meant to be kept to himself.
            </p>
            <p className="mt-4 text-lg text-white/90 leading-relaxed">
              So he built a door to 'The Dive Village,' a community for divers. A home beneath the waves, built by ocean lovers, for ocean lovers.
            </p>
            <p className="mt-6 font-heading font-bold text-white">Sanjeev Bajaj — Founder</p>
          </div>
        </SectionReveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:gap-10">
          <SectionReveal delay={0.1}>
            <div className="h-full rounded-card border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-soft">
              <h3 className="font-heading text-xl font-bold text-white">Our Vision</h3>
              <p className="mt-4 text-white/80 leading-relaxed">
                To unite the world's ocean lovers into a global community—driven by passion, connected by purpose, and committed to protection.
              </p>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <div className="h-full rounded-card border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-soft">
              <h3 className="font-heading text-xl font-bold text-white">Our Mission</h3>
              <p className="mt-4 text-white/80 leading-relaxed">
                At The Dive Village, our mission is to inspire adventure and foster respect for the ocean by providing safe, sustainable, and unforgettable scuba diving experiences.
              </p>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  )
}
