export default function ThemeToggle({ isNightDive, className = '' }) {
  return (
    <span
      data-theme-toggle="true"
      className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-300 select-none pointer-events-none ${
        isNightDive
          ? 'bg-[#FFCD00] border border-[#FFCD00] group-hover:bg-[#001C39] group-hover:border-[#001C39]'
          : 'bg-black/35 border border-white/40 group-hover:border-[#001C39]/50 group-hover:bg-[#001C39]/20'
      } ${className}`}
      style={{ width: '38px', height: '20px', padding: '2px' }}
      role="switch"
      aria-checked={!!isNightDive}
      aria-label="Night Dive Toggle"
    >
      <span
        data-theme-toggle-knob="true"
        className={`inline-block rounded-full shadow-sm transform transition-all duration-300 ease-in-out ${
          isNightDive
            ? 'bg-[#001C39] translate-x-[18px] group-hover:bg-[#FFCD00]'
            : 'bg-white translate-x-0 group-hover:bg-white'
        }`}
        style={{ width: '14px', height: '14px' }}
      />
      <span className="sr-only">{isNightDive ? 'Switch to Day Dive' : 'Switch to Night Dive'}</span>
    </span>
  )
}
