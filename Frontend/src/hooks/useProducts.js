import { useCallback } from 'react'
import useFetch from './useFetch'
import { productService } from '../services/productService'
import { FEATURED_EXPERIENCES } from '../utils/images'

const DEMO_PRODUCTS = FEATURED_EXPERIENCES.map((e) => ({
  id: e.id,
  name: e.title,
  category: e.category,
  price: e.price,
  image: e.image,
  badge: e.badge,
  location: e.location,
  stock: 12,
}))

export default function useProducts(params = {}) {
  const { category, search, sort } = params
  const fetcher = useCallback(async () => {
    try {
      const { data } = await productService.list({ category, search, sort })
      return data?.products || data || []
    } catch {
      return DEMO_PRODUCTS
    }
  }, [category, search, sort])

  return useFetch(fetcher, [fetcher])
}

export function useProduct(id) {
  const fetcher = useCallback(async () => {
    try {
      const { data } = await productService.getById(id)
      return data?.product || data
    } catch {
      return DEMO_PRODUCTS.find((p) => p.id === id) || DEMO_PRODUCTS[0]
    }
  }, [id])

  return useFetch(fetcher, [fetcher], { immediate: Boolean(id) })
}
