import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const navigate = useNavigate()
  const { user, role, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg text-center py-16">
        <h2 className="text-xl font-bold text-slate-900">
          Not Signed In
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Please sign in to view your profile and account settings.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 text-sm font-semibold transition shadow-xs cursor-pointer"
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8 antialiased">
      {/* 1. Profile Header (Clean, unobstructed layout without overlapping cover) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Profile'}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-gray-100 shadow-sm object-cover bg-white shrink-0"
            />
          ) : (
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-2xl sm:text-3xl font-bold shadow-sm">
              {(user.displayName || user.email || 'D')[0].toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {user.displayName || 'Ocean Diver'}
              </h2>
              <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-gray-200">
                {role || 'Customer'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Account Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center self-start sm:self-center">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* 2. Account Information Details */}
      <div className="space-y-6 pt-2">
        <h3 className="text-base font-bold text-slate-900 border-b border-gray-200 pb-3">
          Account Information
        </h3>

        {/* Display Name (Non-editable) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 items-center">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800">
              Display Name
            </label>
            <span className="text-xs text-slate-500">Name linked to your account.</span>
          </div>
          <div className="sm:col-span-2">
            <input
              type="text"
              value={user.displayName || 'Ocean Diver'}
              readOnly
              disabled
              className="w-full rounded-lg border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 shadow-xs cursor-not-allowed font-medium"
            />
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Email Address */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 items-center">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800">
              Email Address
            </label>
            <span className="text-xs text-slate-500">Primary contact email address.</span>
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <input
              type="email"
              value={user.email || ''}
              readOnly
              disabled
              className="w-full rounded-lg border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 shadow-xs cursor-not-allowed font-medium"
            />
            {user.emailVerified ? (
              <span className="shrink-0 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1">
                Verified
              </span>
            ) : (
              <span className="shrink-0 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1">
                Unverified
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Account Activity Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 items-start">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800">
              Account Activity
            </label>
            <span className="text-xs text-slate-500">Registration and session history.</span>
          </div>
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 bg-slate-50/70 p-3.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">Member Since</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 block">
                {user.creationTime
                  ? new Date(user.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                  : 'Active Diver'}
              </span>
            </div>

            <div className="rounded-lg border border-gray-200 bg-slate-50/70 p-3.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">Last Active</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 block">
                {user.lastSignInTime
                  ? new Date(user.lastSignInTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                  : 'Today'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
