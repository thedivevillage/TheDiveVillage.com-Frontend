import { Outlet, useLocation } from 'react-router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import VideoSphereBackground from '../components/VideoSphereBackground'

export default function PublicLayout() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <div className="flex min-h-screen flex-col bg-transparent relative isolate">
      {/* Global Interactive 360 Video Background */}
      <VideoSphereBackground />

      {!isAuthPage && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}
