import { Link } from 'react-router'
import { useMyOrders } from '../hooks/useOrders'
import { formatCurrency } from '../utils/formatCurrency'

export default function Orders() {
  const { data: orders, loading } = useMyOrders()
  const orderList = Array.isArray(orders) ? orders : []

  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-gray-200 gap-3 sm:gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5 block">Activity</span>
          <h2 className="text-2xl font-bold text-slate-900">Your Orders</h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">Review your past gear purchases and diving booking receipts.</p>
        </div>
        <Link
          to="/shop"
          className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition underline underline-offset-4"
        >
          Explore Shop
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 font-medium text-xs sm:text-sm">
          Loading your orders...
        </div>
      ) : orderList.length === 0 ? (
        <div className="mt-6 rounded-xl bg-slate-50/60 p-8 sm:p-12 border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-500 mb-3 border border-gray-200 shadow-2xs">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">You haven't placed any orders yet</h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-sm mb-5">When you purchase gear or book a dive, your receipts and order status will appear here.</p>
          <Link
            to="/shop"
            className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-semibold transition shadow-xs"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {orderList.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-800">#{order.id?.slice(0, 8)}</span>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 uppercase">
                    {order.status || 'Completed'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent Order'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {order.items?.length || 1} item(s) • Total: {formatCurrency(order.totalAmount || order.total || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

