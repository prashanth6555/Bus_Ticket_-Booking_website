import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import AuthPage from './pages/AuthPage'
import BusDetails from './pages/BusDetails'
import Confirmation from './pages/Confirmation'
import Home from './pages/Home'
import Passengers from './pages/Passengers'
import SearchResults from './pages/SearchResults'
import Trips from './pages/Trips'

function NotFound() {
  return (
    <div className="shell py-24 text-center">
      <h1 className="display text-5xl">This stop is not on the route.</h1>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white">
        Back home
      </Link>
    </div>
  )
}

function Frame() {
  const { pathname } = useLocation()
  const home = pathname === '/'
  const auth = pathname === '/login' || pathname === '/signup'
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main" className={`w-full flex-1 ${home ? '-mt-[72px]' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/bus/:id" element={<BusDetails />} />
          <Route path="/booking" element={<Passengers />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!auth && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <BookingProvider>
            <Frame />
          </BookingProvider>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  )
}
