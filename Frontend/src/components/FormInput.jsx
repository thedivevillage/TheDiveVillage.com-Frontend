export default function FormInput({
  label,
  id,
  error,
  className = '',
  ...props
}) {
  const inputId = id || props.name
  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      {label && (
        <span className="mb-1.5 block text-sm font-heading font-semibold text-white">
          {label}
        </span>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 text-white outline-none transition duration-hover placeholder:text-white/40 focus:border-accent focus:ring-2 focus:ring-accent/30 ${
          error ? 'border-cta' : 'border-navy/15'
        }`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-cta">{error}</span>}
    </label>
  )
}
