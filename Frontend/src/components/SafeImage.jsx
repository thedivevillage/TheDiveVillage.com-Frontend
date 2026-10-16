import OptimizedImage from './OptimizedImage'

/**
 * SafeImage is an alias and drop-in backward compatible wrapper around OptimizedImage.
 * All optimizations (f_auto, q_auto:good, LQIP, responsive srcset) are applied automatically.
 */
export default function SafeImage(props) {
  return <OptimizedImage {...props} />
}

export { OptimizedImage }
