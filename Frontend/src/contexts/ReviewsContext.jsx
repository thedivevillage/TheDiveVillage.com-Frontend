import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { CAROUSEL_IMAGES } from '../utils/images'

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    name: "Sofia Stalance",
    role: "Open Water Diver",
    text: "The pre-dive briefing was thorough, and my instructor stayed right by my side until my breathing relaxed. By dive two, my buoyancy felt like second nature—truly unforgettable.",
    mobileText: "The pre-dive briefing was thorough, and my instructor stayed right by my side until my breathing relaxed. By dive two, my buoyancy felt like second nature.",
    rating: 5,
    image: CAROUSEL_IMAGES[1],
    approved: true,
    createdAt: '2026-08-15',
  },
  {
    id: 'rev-2',
    name: "Krishawn Rahul",
    role: "Certified Diver",
    text: "Every dive felt relaxed and unhurried. Top-notch equipment, small groups, and instructors who focus on safety and technique. Pure weightlessness from start to finish.",
    mobileText: "Every dive felt relaxed and unhurried. Top-notch equipment, small groups, and instructors who focus on safety and technique.",
    rating: 5,
    image: CAROUSEL_IMAGES[2],
    approved: true,
    createdAt: '2026-08-20',
  },
  {
    id: 'rev-3',
    name: "Michael Antony",
    role: "Experienced Diver",
    text: "One of the most professional dive centers I've dived with. Flawless gear, seamless surface support, and well-executed dive plans every single time.",
    rating: 5,
    image: CAROUSEL_IMAGES[0],
    approved: true,
    createdAt: '2026-08-28',
  }
]

const ReviewsContext = createContext(null)

export function ReviewsProvider({ children }) {
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('tdv_reviews')
      if (!saved) return INITIAL_REVIEWS
      const parsed = JSON.parse(saved)
      const defaultMap = Object.fromEntries(INITIAL_REVIEWS.map((r) => [r.id, r]))
      const hasDefault = parsed.some((r) => defaultMap[r.id])
      if (!hasDefault) {
        return [...INITIAL_REVIEWS, ...parsed]
      }
      return parsed.map((r) => (defaultMap[r.id] ? { ...defaultMap[r.id] } : r))
    } catch {
      return INITIAL_REVIEWS
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('tdv_reviews', JSON.stringify(reviews))
    } catch (err) {
      console.error('Failed to save reviews to localStorage:', err)
    }
  }, [reviews])

  const addReview = useCallback(({ name, role, text, rating }) => {
    const newRev = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      role: role?.trim() || 'Ocean Diver',
      text: text.trim(),
      rating: Number(rating) || 5,
      image: CAROUSEL_IMAGES[Math.floor(Math.random() * CAROUSEL_IMAGES.length)],
      approved: false,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setReviews((prev) => [newRev, ...prev])
    return newRev
  }, [])

  const approveReview = useCallback((id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: true } : r))
    )
  }, [])

  const deleteReview = useCallback((id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const approvedReviews = reviews.filter((r) => r.approved)
  const pendingReviews = reviews.filter((r) => !r.approved)

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        approvedReviews,
        pendingReviews,
        addReview,
        approveReview,
        deleteReview,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  )
}

export function useReviews() {
  const ctx = useContext(ReviewsContext)
  if (!ctx) {
    throw new Error('useReviews must be used within a ReviewsProvider')
  }
  return ctx
}
