export default function ThemeToggle({ isNightDive, className = '' }) {
  return (
    <span className={`switch !m-0 pointer-events-none inline-block ${className}`} style={{ fontSize: '14px' }}>
      <input 
        className="switch__input pointer-events-none" 
        type="checkbox" 
        role="switch" 
        checked={!!isNightDive} 
        readOnly 
      />
      <span className="switch__icon">
        <span className="switch__icon-part switch__icon-part--1"></span>
        <span className="switch__icon-part switch__icon-part--2"></span>
        <span className="switch__icon-part switch__icon-part--3"></span>
        <span className="switch__icon-part switch__icon-part--4"></span>
        <span className="switch__icon-part switch__icon-part--5"></span>
        <span className="switch__icon-part switch__icon-part--6"></span>
        <span className="switch__icon-part switch__icon-part--7"></span>
        <span className="switch__icon-part switch__icon-part--8"></span>
        <span className="switch__icon-part switch__icon-part--9"></span>
        <span className="switch__icon-part switch__icon-part--10"></span>
        <span className="switch__icon-part switch__icon-part--11"></span>
      </span>
      <span className="switch__sr">Night Dive Mode</span>
    </span>
  )
}
