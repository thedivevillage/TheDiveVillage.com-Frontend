import { ReactLenis, defaultLenisOptions } from '../utils/lenisReact'

export default function SmoothScroll({ children, options = {} }) {
  return (
    <ReactLenis
      root
      options={{
        ...defaultLenisOptions,
        ...options,
      }}
    >
      {children}
    </ReactLenis>
  )
}
