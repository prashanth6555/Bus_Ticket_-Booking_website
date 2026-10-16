const corridors = [
  { from: 'Mumbai', to: 'Pune', minutes: 195, base: 499 },
  { from: 'Mumbai', to: 'Goa', minutes: 630, base: 1099 },
  { from: 'Pune', to: 'Goa', minutes: 510, base: 949 },
  { from: 'Mumbai', to: 'Ahmedabad', minutes: 525, base: 799 },
  { from: 'Ahmedabad', to: 'Surat', minutes: 270, base: 399 },
  { from: 'Delhi', to: 'Jaipur', minutes: 330, base: 599 },
  { from: 'Delhi', to: 'Agra', minutes: 225, base: 449 },
  { from: 'Jaipur', to: 'Udaipur', minutes: 390, base: 649 },
  { from: 'Delhi', to: 'Chandigarh', minutes: 285, base: 549 },
  { from: 'Delhi', to: 'Lucknow', minutes: 510, base: 849 },
  { from: 'Bangalore', to: 'Hyderabad', minutes: 510, base: 799 },
  { from: 'Bangalore', to: 'Chennai', minutes: 360, base: 699 },
  { from: 'Bangalore', to: 'Mysore', minutes: 180, base: 349 },
  { from: 'Bangalore', to: 'Kochi', minutes: 600, base: 1049 },
  { from: 'Hyderabad', to: 'Chennai', minutes: 660, base: 999 },
  { from: 'Chennai', to: 'Kochi', minutes: 630, base: 999 },
  { from: 'Indore', to: 'Mumbai', minutes: 600, base: 899 },
  { from: 'Pune', to: 'Bangalore', minutes: 840, base: 1299 },
]

const services = [
  {
    name: 'VistaGo Platinum',
    type: 'AC Sleeper',
    layout: 'sleeper',
    mult: 1.45,
    rating: 4.8,
    amenities: ['Wi-Fi', 'Charging port', 'Blanket', 'Water bottle', 'Live tracking', 'Reading light'],
  },
  {
    name: 'Coastliner Premier',
    type: 'AC Sleeper',
    layout: 'sleeper',
    mult: 1.72,
    rating: 4.9,
    amenities: ['Wi-Fi', 'Charging port', 'Blanket', 'Snack', 'Live tracking', 'Personal screen'],
  },
  {
    name: 'NightOwl Berth',
    type: 'Non-AC Sleeper',
    layout: 'sleeper',
    mult: 0.82,
    rating: 4.2,
    amenities: ['Blanket', 'Charging port', 'Water bottle'],
  },
  {
    name: 'VistaGo Swift',
    type: 'AC Seater',
    layout: 'seater',
    mult: 1.05,
    rating: 4.6,
    amenities: ['Charging port', 'Water bottle', 'Live tracking', 'Recliner'],
  },
  {
    name: 'MetroLine Express',
    type: 'AC Seater',
    layout: 'seater',
    mult: 0.92,
    rating: 4.4,
    amenities: ['Charging port', 'Live tracking', 'Water bottle'],
  },
  {
    name: 'RoyalSeater Deluxe',
    type: 'Non-AC Seater',
    layout: 'seater',
    mult: 0.7,
    rating: 4.1,
    amenities: ['Charging port', 'Recliner'],
  },
]

const departures = ['05:45', '08:20', '11:10', '14:40', '18:15', '22:30']

const pointBook = {
  Mumbai: ['Dadar TT', 'Borivali East', 'Sion Circle', 'Vashi Plaza'],
  Pune: ['Shivajinagar', 'Wakad Bridge', 'Swargate', 'Hinjawadi'],
  Goa: ['Panaji Kadamba', 'Mapusa Stand', 'Margao', 'Madgaon Station'],
  Ahmedabad: ['Gita Mandir', 'Paldi', 'Ranip', 'Iscon Cross'],
  Surat: ['Surat Central', 'Adajan', 'Udhna', 'Varachha'],
  Delhi: ['Kashmere Gate', 'RK Ashram', 'Dhaula Kuan', 'Sarai Kale Khan'],
  Jaipur: ['Sindhi Camp', 'Narayan Singh Circle', 'Tonk Road', 'Ajmer Road'],
  Agra: ['Idgah Bus Stand', 'Tajganj', 'Rambagh', 'Sikandra'],
  Udaipur: ['Udaipur Depot', 'Surajpole', 'Hiran Magri', 'Fatehpura'],
  Chandigarh: ['ISBT 43', 'ISBT 17', 'Tribune Chowk', 'Mohali'],
  Lucknow: ['Alambagh', 'Kaiserbagh', 'Charbagh', 'Gomti Nagar'],
  Bangalore: ['Majestic', 'Electronic City', 'Silk Board', 'Yelahanka'],
  Hyderabad: ['MGBS', 'Jubilee Bus Station', 'Gachibowli', 'Kukatpally'],
  Chennai: ['Koyambedu', 'Tambaram', 'Guindy', 'Vadapalani'],
  Mysore: ['Mysore Bus Stand', 'Hebbal', 'Columbia Circle', 'Nanjangud Road'],
  Kochi: ['Vyttila Hub', 'Ernakulam Jetty', 'Aluva', 'Kakkanad'],
  Indore: ['Sarwate', 'Vijay Nagar', 'Bhawarkuan', 'Navlakha'],
}

function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const dayOffset = Math.floor(total / 1440)
  const mins = ((total % 1440) + 1440) % 1440
  const hh = String(Math.floor(mins / 60)).padStart(2, '0')
  const mm = String(mins % 60).padStart(2, '0')
  return { time: `${hh}:${mm}`, dayOffset }
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function seatIds(layout) {
  if (layout === 'sleeper') {
    return [
      ...Array.from({ length: 12 }, (_, i) => `L${i + 1}`),
      ...Array.from({ length: 12 }, (_, i) => `U${i + 1}`),
    ]
  }
  const ids = []
  for (let row = 1; row <= 10; row += 1) {
    ids.push(`${row}A`, `${row}B`, `${row}C`, `${row}D`)
  }
  return ids
}

function buildBuses() {
  const list = []
  const directions = corridors.flatMap((route) => [
    route,
    { from: route.to, to: route.from, minutes: route.minutes + 15, base: route.base },
  ])

  directions.forEach((route) => {
    services.forEach((service, index) => {
      const id = `${route.from}-${route.to}-${index}`.toLowerCase().replace(/\s+/g, '-')
      const rand = mulberry32(hashString(id))
      const ids = seatIds(service.layout)
      const bookedCount = Math.min(ids.length - 6, 5 + Math.floor(rand() * 11))
      const pool = [...ids]
      const booked = []
      while (booked.length < bookedCount && pool.length) {
        const pick = Math.floor(rand() * pool.length)
        const seat = pool.splice(pick, 1)[0]
        booked.push({ id: seat, gender: rand() > 0.7 ? 'F' : 'M' })
      }
      const arrival = addMinutes(departures[index], route.minutes)
      const rating = Math.min(
        5,
        Math.max(3.8, Math.round((service.rating + (rand() - 0.5) * 0.28) * 10) / 10),
      )
      list.push({
        id,
        name: service.name,
        type: service.type,
        layout: service.layout,
        from: route.from,
        to: route.to,
        departure: departures[index],
        arrival: arrival.time,
        dayOffset: arrival.dayOffset,
        durationMin: route.minutes,
        duration: formatDuration(route.minutes),
        price: Math.round((route.base * service.mult) / 10) * 10,
        rating,
        reviews: 140 + Math.floor(rand() * 2900),
        amenities: service.amenities,
        booked,
        totalSeats: ids.length,
      })
    })
  })

  return list
}

export const buses = buildBuses()

export const cities = [...new Set(corridors.flatMap((route) => [route.from, route.to]))].sort()

export const spotlights = [
  { from: 'Mumbai', to: 'Goa', image: '/images/goa.jpg', title: 'Goa', line: 'Palm coast by morning' },
  { from: 'Delhi', to: 'Jaipur', image: '/images/jaipur.jpg', title: 'Jaipur', line: 'Pink city, overnight' },
  { from: 'Delhi', to: 'Agra', image: '/images/taj.jpg', title: 'Agra', line: 'Taj light before noon' },
  { from: 'Bangalore', to: 'Kochi', image: '/images/kerala.jpg', title: 'Kochi', line: 'Backwaters at the last stop' },
  { from: 'Jaipur', to: 'Delhi', image: '/images/delhi.jpg', title: 'Delhi', line: 'India Gate after dark' },
  { from: 'Pune', to: 'Mumbai', image: '/images/mumbai.jpg', title: 'Mumbai', line: 'Gateway, right on time' },
]

export function pointsFor(city) {
  return pointBook[city] || [`${city} Central Bus Stand`, `${city} Railway Station`]
}

export function searchBuses(from, to) {
  return buses.filter((bus) => bus.from === from && bus.to === to)
}

export function getBus(id) {
  return buses.find((bus) => bus.id === id) || null
}

export function seatsLeft(bus) {
  return bus.totalSeats - bus.booked.length
}

export function lowestFare(from, to) {
  const list = searchBuses(from, to)
  if (!list.length) return null
  return Math.min(...list.map((bus) => bus.price))
}

export function findBus(from, to, name) {
  return (
    buses.find((bus) => bus.from === from && bus.to === to && bus.name === name) ||
    searchBuses(from, to)[0] ||
    null
  )
}

export function timeSlot(hhmm) {
  const hour = Number(hhmm.slice(0, 2))
  if (hour < 6) return 'early'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'night'
}

export const slotMeta = [
  { id: 'early', label: 'Before 6 AM' },
  { id: 'morning', label: '6 AM – 12 PM' },
  { id: 'afternoon', label: '12 PM – 6 PM' },
  { id: 'night', label: 'After 6 PM' },
]
