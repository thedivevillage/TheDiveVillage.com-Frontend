const tones = {
  accent: 'bg-accent text-[#001e3d]',
  cta: 'bg-cta text-white',
  navy: 'bg-navy text-white',
}

export default function Badge({ children, tone = 'accent', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-heading font-bold uppercase tracking-wider shadow-soft ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
