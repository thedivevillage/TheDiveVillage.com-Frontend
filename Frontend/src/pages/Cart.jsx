import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../utils/formatCurrency'
import Button from '../components/Button'

export default function Cart() {
  const { items, itemCount, subtotal, loading, removeItem, updateQuantity } = useCart()
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')
  const finalTotal = subtotal

  return (
    <div
      className={isDashboard ? 'text-navy font-body' : 'min-h-screen bg-[#FAFAFA] text-navy font-body pt-24 sm:pt-32 pb-32 sm:pb-24'}
      style={{ textShadow: 'none' }}
    >
      <div className={isDashboard ? 'w-full' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'}>
        
        {/* Header */}
        <div className="mb-8 border-b border-navy/10 pb-6 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 block">Shopping Bag</span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy tracking-tight">Your Cart</h1>
            <p className="mt-1 text-sm text-navy/60 font-medium">
              {loading ? 'Updating cart...' : `${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`}
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-bold text-navy hover:text-accent transition underline decoration-2 underline-offset-4"
          >
            ← Continue Shopping
          </Link>
        </div>

        {items.length === 0 && !loading ? (
          <div className="py-16 sm:py-20 text-center max-w-xl mx-auto bg-[#F8FAFC] rounded-[36px] p-8 sm:p-12 shadow-sm border border-navy/5">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 text-navy/60 shadow-sm border border-navy/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3 text-navy">Your cart is empty.</h2>
            <p className="text-navy/60 mb-8 text-sm leading-relaxed max-w-md mx-auto">
              Explore our ocean-crafted hoodies, pro dive suits, rash guards, and branded essentials, or reserve your next certification course.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button as={Link} to="/shop" className="w-full sm:w-auto justify-center bg-navy text-white hover:bg-accent">
                Explore Merchandise Store →
              </Button>
              <Button as={Link} to="/book-us" variant="secondary" className="w-full sm:w-auto justify-center border-navy/20 text-navy hover:bg-navy/5">
                Explore Courses
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-8 space-y-6">

              {/* Items List */}
              <div className="bg-white rounded-[32px] border border-navy/5 p-6 sm:p-8 shadow-card divide-y divide-navy/10">
                {items.map((item) => {
                  const product = item.product || {}
                  const itemPrice = item.price ?? product.price ?? 0
                  const itemSubtotal = item.subtotal ?? itemPrice * (item.quantity || 1)

                  return (
                    <div key={item.id || item.inventoryId} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                      
                      {/* Image */}
                      <Link
                        to={`/shop/${product.id || ''}`}
                        className="w-24 sm:w-28 h-28 sm:h-32 shrink-0 rounded-2xl overflow-hidden bg-white border border-navy/10 p-2 flex items-center justify-center hover:opacity-90 transition"
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title || product.name || 'Product'}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-navy/40">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1 sm:gap-4 mb-2">
                          <Link
                            to={`/shop/${product.id || ''}`}
                            className="font-heading text-base sm:text-lg font-bold text-navy hover:text-accent transition leading-snug"
                          >
                            {product.title || product.name || 'Dive Item'}
                          </Link>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-navy/60 mb-4">
                          {product.selectedSize && product.selectedSize !== 'Standard' && (
                            <span className="bg-[#F0F2F5] px-2.5 py-1 rounded-lg font-semibold text-navy">
                              Size: {product.selectedSize}
                            </span>
                          )}
                          {product.selectedColor && product.selectedColor !== 'Standard' && (
                            <span className="bg-[#F0F2F5] px-2.5 py-1 rounded-lg font-semibold text-navy">
                              Color: {product.selectedColor}
                            </span>
                          )}
                          {product.category && (
                            <span className="text-[10px] uppercase font-bold text-accent tracking-wider">
                              {product.category}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls & Remove */}
                        <div className="flex items-center justify-between gap-4 pt-1">
                          <div className="inline-flex items-center rounded-xl border border-navy/20 p-0.5 bg-white shadow-xs">
                            <button
                              type="button"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-navy transition hover:bg-[#F0F2F5] font-bold cursor-pointer disabled:opacity-40"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-navy">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-navy transition hover:bg-[#F0F2F5] font-bold cursor-pointer"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 transition flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-rose-50 cursor-pointer"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                            Remove
                          </button>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>

            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 sticky top-28 rounded-[36px] bg-white border border-navy/5 p-6 sm:p-8 shadow-card space-y-6">
              <h2 className="font-heading text-xl font-bold text-navy pb-4 border-b border-navy/10">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm font-medium text-navy/70">
                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span className="font-bold text-navy">{itemCount}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-2 rounded-full bg-navy hover:bg-accent text-white hover:text-navy px-8 py-4 text-sm font-bold transition shadow-md cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <span>→</span>
              </Link>
            </div>

          </div>
        )}

      </div>

      {/* Sticky Mobile Checkout Bar */}
      {items.length > 0 && !loading && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-navy/10 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex flex-col min-w-0">
            <span className="font-heading text-sm font-bold text-navy leading-none">
              {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
            </span>
          </div>

          <Link
            to="/checkout"
            className="bg-navy active:scale-95 hover:bg-accent text-white hover:text-navy font-bold py-3 px-6 rounded-full transition shadow-md flex items-center gap-2 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
          >
            <span>Checkout</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  )
}

