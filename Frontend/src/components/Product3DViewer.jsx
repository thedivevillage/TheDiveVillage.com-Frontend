import OptimizedModelViewer from './OptimizedModelViewer'

/**
 * Product3DViewer is a backward compatible wrapper around OptimizedModelViewer.
 * Employs deferred script loading, interaction reveal (prevents downloading 2MB+ GLBs eagerly),
 * WebP poster fallback, and GPU resource disposal.
 */
export default function Product3DViewer(props) {
  return <OptimizedModelViewer {...props} />
}

export { OptimizedModelViewer }
