import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const BookingContext = createContext(null)
const DRAFT_KEY = 'vistago-draft'
const BOOKINGS_KEY = 'vistago-bookings'
const LAST_KEY = 'vistago-last'

const emptyDraft = {
  search: { from: '', to: '', date: '' },
  busId: '',
  seats: [],
  boarding: '',
  dropping: '',
  contact: { email: '', phone: '' },
  passengers: {},
  promoCode: '',
}

function readDraft() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null')
    return saved ? { ...emptyDraft, ...saved, contact: { ...emptyDraft.contact, ...saved.contact } } : emptyDraft
  } catch {
    return emptyDraft
  }
}

function readBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]')
  } catch {
    return []
  }
}

export function BookingProvider({ children }) {
  const [draft, setDraft] = useState(readDraft)
  const [bookings, setBookings] = useState(readBookings)
  const [lastBookingId, setLastBookingId] = useState(() => sessionStorage.getItem(LAST_KEY) || '')

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [draft])

  const setSearch = useCallback((search) => {
    setDraft((current) => ({ ...current, search }))
  }, [])

  const chooseBus = useCallback((busId, search) => {
    setDraft((current) => {
      const same = current.busId === busId
      return {
        ...current,
        search: search || current.search,
        busId,
        seats: same ? current.seats : [],
        boarding: same ? current.boarding : '',
        dropping: same ? current.dropping : '',
        passengers: same ? current.passengers : {},
        promoCode: same ? current.promoCode : '',
      }
    })
  }, [])

  const toggleSeat = useCallback((id) => {
    if (draft.seats.includes(id)) {
      setDraft((current) => {
        const passengers = { ...current.passengers }
        delete passengers[id]
        return { ...current, seats: current.seats.filter((seat) => seat !== id), passengers }
      })
      return ''
    }
    if (draft.seats.length >= 6) return 'You can hold up to 6 seats on one ticket.'
    setDraft((current) => {
      if (current.seats.includes(id) || current.seats.length >= 6) return current
      return { ...current, seats: [...current.seats, id] }
    })
    return ''
  }, [draft.seats])

  const setBoarding = useCallback((boarding) => {
    setDraft((current) => ({ ...current, boarding }))
  }, [])

  const setDropping = useCallback((dropping) => {
    setDraft((current) => ({ ...current, dropping }))
  }, [])

  const setContact = useCallback((contact) => {
    setDraft((current) => ({ ...current, contact: { ...current.contact, ...contact } }))
  }, [])

  const updatePassenger = useCallback((seat, patch) => {
    setDraft((current) => ({
      ...current,
      passengers: {
        ...current.passengers,
        [seat]: { name: '', age: '', gender: '', ...current.passengers[seat], ...patch },
      },
    }))
  }, [])

  const setPromoCode = useCallback((promoCode) => {
    setDraft((current) => ({ ...current, promoCode }))
  }, [])

  const confirmBooking = useCallback((booking) => {
    setBookings((current) => {
      const next = [booking, ...current]
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(next))
      return next
    })
    sessionStorage.setItem(LAST_KEY, booking.id)
    sessionStorage.setItem('vistago-last-booking', JSON.stringify(booking))
    setLastBookingId(booking.id)
    setDraft((current) => ({
      ...emptyDraft,
      search: current.search,
      contact: current.contact,
    }))
  }, [])

  const removeBooking = useCallback((id) => {
    setBookings((current) => {
      const next = current.filter((booking) => booking.id !== id)
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      draft,
      bookings,
      lastBookingId,
      setSearch,
      chooseBus,
      toggleSeat,
      setBoarding,
      setDropping,
      setContact,
      updatePassenger,
      setPromoCode,
      confirmBooking,
      removeBooking,
    }),
    [
      draft,
      bookings,
      lastBookingId,
      setSearch,
      chooseBus,
      toggleSeat,
      setBoarding,
      setDropping,
      setContact,
      updatePassenger,
      setPromoCode,
      confirmBooking,
      removeBooking,
    ],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}
