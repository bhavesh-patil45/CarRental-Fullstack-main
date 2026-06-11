import React, { useEffect, useState, useRef } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const Cars = () => {

  // getting search params from url
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  const {cars, axios, favorites} = useAppContext()
  const [input, setInput] = useState('')
  const [filteredCars, setFilteredCars] = useState([])
  const [activeTab, setActiveTab] = useState('list') // 'list' or 'map'

  const [mapInstance, setMapInstance] = useState(null)
  const userMarkerRef = useRef(null)
  const markersGroupRef = useRef(null)

  const isSearchData = pickupLocation && pickupDate && returnDate

  const cityCoordinates = {
    "New York": [40.7128, -74.0060],
    "Los Angeles": [34.0522, -118.2437],
    "Houston": [29.7604, -95.3698],
    "Chicago": [41.8781, -87.6298]
  }

  const applyFilter = async ()=>{
    if(input === ''){
      setFilteredCars(cars)
      return null
    }

    const filtered = cars.slice().filter((car)=>{
      return car.brand.toLowerCase().includes(input.toLowerCase())
      || car.model.toLowerCase().includes(input.toLowerCase())  
      || car.category.toLowerCase().includes(input.toLowerCase())  
      || car.transmission.toLowerCase().includes(input.toLowerCase())
    })
    setFilteredCars(filtered)
  }

  const searchCarAvailablity = async () =>{
    try {
      const {data} = await axios.post('/api/bookings/check-availability', {location: pickupLocation, pickupDate, returnDate})
      if (data.success) {
        setFilteredCars(data.availableCars)
        if(data.availableCars.length === 0){
          toast('No cars available')
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.")
      return
    }
    
    const toastId = toast.loading("Finding your location...")
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        toast.dismiss(toastId)
        const { latitude, longitude } = position.coords;
        toast.success("Location retrieved!")
        
        try {
          const { data } = await axios.get(`/api/user/cars?lat=${latitude}&lng=${longitude}&radius=50`)
          if (data.success) {
            setFilteredCars(data.cars)
            setActiveTab('map') // automatically focus map to show results
            
            if (mapInstance) {
              mapInstance.setView([latitude, longitude], 12)
              
              if (userMarkerRef.current) {
                mapInstance.removeLayer(userMarkerRef.current)
              }
              
              const userIcon = window.L.divIcon({
                html: `<div style="width:16px;height:16px;background:#3b82f6;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.5);" class="animate-pulse"></div>`,
                className: 'bg-transparent',
                iconSize: [16, 16]
              });
              userMarkerRef.current = window.L.marker([latitude, longitude], { icon: userIcon })
                .addTo(mapInstance)
                .bindPopup("<b>You are here</b>")
                .openPopup();
            }
          } else {
            toast.error(data.message)
          }
        } catch (error) {
          toast.error("Failed to query nearby cars.")
        }
      },
      (error) => {
        toast.dismiss(toastId)
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please allow location access.")
        } else {
          toast.error("Failed to retrieve your location.")
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }

  // Fetch / filter cars initially
  useEffect(()=>{
    isSearchData ? searchCarAvailablity() : applyFilter()
  },[])

  useEffect(()=>{
    cars.length > 0 && !isSearchData && applyFilter()
  },[input, cars])

  // Initialize Leaflet map
  useEffect(() => {
    if (!window.L || !document.getElementById('map-container')) return

    const center = pickupLocation && cityCoordinates[pickupLocation] ? cityCoordinates[pickupLocation] : [20.5937, 78.9629]
    const zoom = pickupLocation && cityCoordinates[pickupLocation] ? 11 : 5
    
    const map = window.L.map('map-container', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView(center, zoom)

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    markersGroupRef.current = window.L.layerGroup().addTo(map)
    setMapInstance(map)

    return () => {
      map.remove()
    }
  }, [pickupLocation])

  // Invalidate map size on tab toggle (prevents Leaflet tile glitches)
  useEffect(() => {
    if (mapInstance && activeTab === 'map') {
      setTimeout(() => {
        mapInstance.invalidateSize()
      }, 100)
    }
  }, [activeTab, mapInstance])

  // Update map markers when filteredCars change
  useEffect(() => {
    if (!mapInstance || !markersGroupRef.current || !window.L) return

    markersGroupRef.current.clearLayers()

    filteredCars.forEach((car) => {
      if (car.location?.geo?.coordinates) {
        const [lng, lat] = car.location.geo.coordinates;
        
        const ratingHTML = car.averageRating > 0 
          ? `<div style="display:flex;align-items:center;gap:3px;color:#f59e0b;font-weight:600;font-size:11px;margin-top:2px;">★ ${car.averageRating} (${car.reviewCount})</div>`
          : '';

        const isFav = favorites.includes(car._id);
        const favoriteHTML = isFav 
          ? `<div style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:bold;color:#ef4444;background:#fef2f2;border:1px solid #fee2e2;padding:1px 4px;border-radius:4px;margin-top:4px;">❤️ Wishlist</div>`
          : '';

        const popupHTML = `
          <div style="width:180px;font-family:sans-serif;color:#374151;">
            <img src="${car.image}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;" />
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:8px;">
              <h3 style="margin:0;font-weight:600;font-size:14px;color:#111827;">${car.brand} ${car.model}</h3>
              ${favoriteHTML}
            </div>
            <p style="margin:4px 0 0 0;font-size:11px;color:#9ca3af;">${car.location.city} • ${car.year}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
              <span style="font-weight:700;font-size:13px;color:#3b82f6;">$${car.pricePerDay}/day</span>
              ${ratingHTML}
            </div>
            <a href="/car-details/${car._id}" style="display:block;text-align:center;background:#3b82f6;color:#fff;text-decoration:none;padding:8px;border-radius:8px;font-size:12px;font-weight:600;margin-top:8px;transition:all 0.2s;">View Details</a>
          </div>
        `;

        window.L.marker([lat, lng])
          .addTo(markersGroupRef.current)
          .bindPopup(popupHTML)
      }
    })
  }, [filteredCars, mapInstance, favorites])

  return (
    <div>

      <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}

      className='flex flex-col items-center py-20 bg-light max-md:px-4'>
        <Title title='Available Cars' subTitle='Browse our selection of premium vehicles available for your next adventure'/>

        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}

        className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow'>
          <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2'/>

          <input onChange={(e)=> setInput(e.target.value)} value={input} type="text" placeholder='Search by make, model, or features' className='w-full h-full outline-none text-gray-500'/>

          <img src={assets.filter_icon} alt="" className='w-4.5 h-4.5 ml-2'/>
        </motion.div>
      </motion.div>

      {/* Mobile Tab Switcher */}
      <div className='flex md:hidden justify-center bg-gray-100 p-1 rounded-xl w-60 mx-auto mt-6 border border-black/5'>
        <button onClick={() => setActiveTab('list')} className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all ${activeTab === 'list' ? 'bg-white shadow text-gray-800' : 'text-gray-400'}`}>List View</button>
        <button onClick={() => setActiveTab('map')} className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all ${activeTab === 'map' ? 'bg-white shadow text-gray-800' : 'text-gray-400'}`}>Map View</button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}

      className='px-6 md:px-12 lg:px-20 mt-10 max-w-7xl mx-auto w-full mb-16'>
        <div className='flex flex-col md:flex-row gap-8 min-h-[500px] h-[calc(100vh-280px)]'>
          
          {/* Map View */}
          <div className={`${activeTab === 'map' ? 'block' : 'hidden'} md:block md:w-1/2 h-full min-h-[350px] relative`}>
            <div id="map-container" className='w-full h-full min-h-[350px] rounded-2xl border border-black/5 shadow-sm overflow-hidden z-10'></div>
            <button onClick={handleNearMe} className='absolute top-4 right-4 z-20 bg-white/90 backdrop-blur border border-black/5 hover:bg-white text-gray-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition-all cursor-pointer'>
              📍 Near Me
            </button>
          </div>

          {/* List View */}
          <div className={`${activeTab === 'list' ? 'block' : 'hidden'} md:block md:w-1/2 h-full overflow-y-auto pr-2`}>
            <p className='text-gray-400 text-sm mb-3'>Showing {filteredCars.length} Cars</p>
            
            {filteredCars.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-48 border border-dashed border-gray-200 rounded-2xl p-6 text-center'>
                <p className='text-gray-400 font-medium text-sm'>No cars found in this range.</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                {filteredCars.map((car, index)=> (
                  <motion.div key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.3 }}
                  >
                    <CarCard car={car}/>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </motion.div>

    </div>
  )
}

export default Cars
