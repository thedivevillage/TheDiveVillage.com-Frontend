import { NavLink, Outlet } from 'react-router'
import Navbar from '../components/Navbar'
import { useAuth } from '../hooks/useAuth'

const LINKS = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/profile', label: 'Your Profile' },
  { to: '/dashboard/orders', label: 'Your Orders' },
  { to: '/dashboard/wishlist', label: 'Saved Wishlist' },
  { to: '/dashboard/cart', label: 'Shopping Cart' },
]

export default function DashboardLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-slate-900 pt-20 sm:pt-28 pb-12 sm:pb-16 antialiased">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Minimalist Top Profile Header Strip */}
        <div className="mb-6 sm:mb-8 pb-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {user?.displayName || 'My Account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your profile details, orders, and dive activity.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
          {/* Navigation Sidebar (Vertical pill with active indicator matching reference) */}
          <aside className="w-full shrink-0 lg:w-64">
            <nav className="rounded-2xl bg-white border border-gray-200/90 p-2 sm:p-2.5 shadow-xs sticky top-20 sm:top-28 lg:top-32 flex flex-row lg:flex-col gap-1 overflow-x-auto no-scrollbar">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 relative ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="min-w-0 flex-1 w-full">
            <div className="rounded-2xl bg-white border border-gray-200/90 p-5 sm:p-8 lg:p-10 shadow-xs min-h-[55vh] text-slate-900">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
