import { useCallback } from 'react'
import useFetch from './useFetch'
import { orderService } from '../services/orderService'

export default function useOrders(orderId) {
  const fetcher = useCallback(async () => {
    if (!orderId) return null
    const { data } = await orderService.getById(orderId)
    return data?.order || data
  }, [orderId])

  return useFetch(fetcher, [fetcher], { immediate: Boolean(orderId) })
}

export function useMyOrders() {
  const fetcher = useCallback(async () => {
    const { data } = await orderService.getMyOrders()
    const orders = data?.data?.orders || data?.orders || data
    return Array.isArray(orders) ? orders : []
  }, [])

  return useFetch(fetcher, [fetcher])
}

export function useAdminOrders(params) {
  const fetcher = useCallback(async () => {
    const { data } = await orderService.adminList(params)
    const orders = data?.data?.orders || data?.orders || (Array.isArray(data) ? data : [])
    return Array.isArray(orders) ? orders : []
  }, [params])

  return useFetch(fetcher, [fetcher])
}

