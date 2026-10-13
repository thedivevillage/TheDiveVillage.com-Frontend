import SectionReveal from '../components/SectionReveal'

export default function PlaceholderPage({ title, accent, blurb }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionReveal>
        <h1 className="font-heading text-h1 font-bold text-white">
          {title}{' '}
          {accent && (
            <span className="font-heading font-bold text-accent">{accent}</span>
          )}
        </h1>
        <p className="mt-4 max-w-xl text-white/80">
          {blurb ||
            'This page is next in the build sequence. Home is complete — review it first, then we continue.'}
        </p>
        <div className="mt-10 rounded-card border border-dashed border-accent/40 bg-accent/5 p-8 text-sm text-white/80">
          Placeholder shell — full interactive UI coming after Home sign-off.
        </div>
      </SectionReveal>
    </div>
  )
}
