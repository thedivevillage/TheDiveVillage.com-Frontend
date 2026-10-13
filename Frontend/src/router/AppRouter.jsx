import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from './ProtectedRoute'
import ErrorBoundary from '../components/ErrorBoundary'

// Initial home page is direct for fast startup
import Home from '../pages/Home'

// Helper to retry dynamic component imports if chunk loading fails
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageAlreadyRefreshed = JSON.parse(
      window.sessionStorage.getItem('page_has_been_refreshed') || 'false'
    )
    try {
      const component = await componentImport()
      window.sessionStorage.setItem('page_has_been_refreshed', 'false')
      return component
    } catch (error) {
      if (!pageAlreadyRefreshed) {
        window.sessionStorage.setItem('page_has_been_refreshed', 'true')
        window.location.reload()
        return { default: () => null }
      }
      throw error
    }
  })

// Dynamic lazy imports for all secondary routes to enable route-level code splitting
const About = lazyWithRetry(() => import('../pages/About'))
const Services = lazyWithRetry(() => import('../pages/Services'))
const ServiceDetail = lazyWithRetry(() => import('../pages/ServiceDetail'))
const AllCourses = lazyWithRetry(() => import('../pages/AllCourses'))
const Scuba = lazyWithRetry(() => import('../pages/Scuba'))
const Snorkeling = lazyWithRetry(() => import('../pages/Snorkeling'))
const Surfing = lazyWithRetry(() => import('../pages/Surfing'))
const Gallery = lazyWithRetry(() => import('../pages/Gallery'))
const BookUs = lazyWithRetry(() => import('../pages/BookUs'))
const Shop = lazyWithRetry(() => import('../pages/Shop'))
const ProductDetail = lazyWithRetry(() => import('../pages/ProductDetail'))
const Cart = lazyWithRetry(() => import('../pages/Cart'))
const Checkout = lazyWithRetry(() => import('../pages/Checkout'))
const Contact = lazyWithRetry(() => import('../pages/Contact'))
const Login = lazyWithRetry(() => import('../pages/Login'))
const Signup = lazyWithRetry(() => import('../pages/Signup'))
const Wishlist = lazyWithRetry(() => import('../pages/Wishlist'))

// Dashboard pages
const Dashboard = lazyWithRetry(() => import('../pages/Dashboard'))
const Profile = lazyWithRetry(() => import('../pages/Profile'))
const Orders = lazyWithRetry(() => import('../pages/Orders'))

// Admin pages
const AdminDashboard = lazyWithRetry(() => import('../pages/admin/Dashboard'))
const AdminCatalog = lazyWithRetry(() => import('../pages/admin/Catalog'))
const AdminOrders = lazyWithRetry(() => import('../pages/admin/Orders'))
const AdminCustomers = lazyWithRetry(() => import('../pages/admin/Customers'))
const AdminContent = lazyWithRetry(() => import('../pages/admin/Content'))

function PageLiquid({ children }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export default function AppRouter() {
  const location = useLocation()

  return (
    <Routes location={location}>
      <Route element={<PublicLayout />}>
        <Route
          index
          element={
            <PageLiquid>
              <Home />
            </PageLiquid>
          }
        />
        <Route path="about" element={<PageLiquid><About /></PageLiquid>} />
        <Route path="services" element={<PageLiquid><Services /></PageLiquid>} />
        <Route path="our-services" element={<PageLiquid><Services /></PageLiquid>} />
        <Route path="services/:id" element={<PageLiquid><ServiceDetail /></PageLiquid>} />
        <Route path="courses" element={<PageLiquid><AllCourses /></PageLiquid>} />
        <Route path="courses/scuba" element={<PageLiquid><Scuba /></PageLiquid>} />
        <Route path="courses/snorkeling" element={<PageLiquid><Snorkeling /></PageLiquid>} />
        <Route path="courses/surfing" element={<PageLiquid><Surfing /></PageLiquid>} />
        <Route path="scuba-diving" element={<PageLiquid><Scuba /></PageLiquid>} />
        <Route path="snorkeling" element={<PageLiquid><Snorkeling /></PageLiquid>} />
        <Route path="freediving" element={<PageLiquid><Surfing /></PageLiquid>} />
        <Route path="gallery" element={<PageLiquid><Gallery /></PageLiquid>} />
        <Route path="book-us" element={<PageLiquid><BookUs /></PageLiquid>} />
        <Route path="dive-explorer" element={<Navigate to="/book-us" replace />} />
        <Route path="shop" element={<PageLiquid><Shop /></PageLiquid>} />
        <Route path="shop/:id" element={<PageLiquid><ProductDetail /></PageLiquid>} />
        <Route path="cart" element={<PageLiquid><Cart /></PageLiquid>} />
        <Route path="wishlist" element={<PageLiquid><Wishlist /></PageLiquid>} />
        <Route path="checkout" element={<PageLiquid><Checkout /></PageLiquid>} />
        <Route path="contact" element={<PageLiquid><Contact /></PageLiquid>} />
        <Route path="login" element={<PageLiquid><Login /></PageLiquid>} />
        <Route path="signup" element={<PageLiquid><Signup /></PageLiquid>} />
        <Route path="profile" element={<Navigate to="/dashboard/profile" replace />} />
      </Route>

      <Route
        path="dashboard"
        element={
          <ProtectedRoute roles={['customer', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PageLiquid><Dashboard /></PageLiquid>} />
        <Route path="profile" element={<PageLiquid><Profile /></PageLiquid>} />
        <Route path="orders" element={<PageLiquid><Orders /></PageLiquid>} />
        <Route path="wishlist" element={<PageLiquid><Wishlist /></PageLiquid>} />
        <Route path="cart" element={<PageLiquid><Cart /></PageLiquid>} />
      </Route>

      <Route
        path="admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PageLiquid><AdminDashboard /></PageLiquid>} />
        <Route path="catalog" element={<PageLiquid><AdminCatalog /></PageLiquid>} />
        <Route path="orders" element={<PageLiquid><AdminOrders /></PageLiquid>} />
        <Route path="customers" element={<PageLiquid><AdminCustomers /></PageLiquid>} />
        <Route path="content" element={<PageLiquid><AdminContent /></PageLiquid>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
