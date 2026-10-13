export default function Skeleton({ className = '', dark = false, rounded = 'rounded-2xl', ...props }) {
  return (
    <div
      className={`${rounded} ${dark ? 'skeleton-shimmer-dark bg-white/5' : 'skeleton-shimmer bg-navy/5'} ${className}`}
      {...props}
    />
  )
}
