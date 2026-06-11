import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const CarCard = ({car}) => {

    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()
    const { favorites, toggleFavorite } = useAppContext()

    const isFav = favorites.includes(car._id)

    const handleFavoriteClick = (e) => {
        e.stopPropagation()
        toggleFavorite(car._id)
    }

  return (
    <div onClick={()=> {navigate(`/car-details/${car._id}`); scrollTo(0,0)}} className='group rounded-2xl overflow-hidden bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer relative'>
      
      <div className='relative h-48 overflow-hidden'> 
        <img src={car.image} alt="Car Image" className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'/>

        {car.isAvaliable && <p className='absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full shadow-sm'>Available Now</p>}

        <button 
          onClick={handleFavoriteClick} 
          className='absolute top-4 right-4 z-10 bg-white/85 hover:bg-white backdrop-blur-md p-2 rounded-full shadow-sm transition-all border border-black/5 active:scale-90 hover:scale-105 cursor-pointer'
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={isFav ? "#ef4444" : "none"} 
            stroke={isFav ? "#ef4444" : "#4b5563"} 
            strokeWidth="2.5" 
            className="w-4 h-4 transition-all duration-300"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>

        <div className='absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-white/10 shadow-sm'>
            <span className='font-semibold'>{currency}{car.pricePerDay}</span>
            <span className='text-sm text-white/80'> / day</span>
        </div>
      </div>

      <div className='p-4 sm:p-5'>
        <div className='flex justify-between items-start mb-2'>
            <div>
                <h3 className='text-lg font-medium'>{car.brand} {car.model}</h3>
                <div className='flex items-center gap-2 mt-0.5'>
                    <p className='text-muted-foreground text-sm'>{car.category} • {car.year}</p>
                    {car.averageRating > 0 && (
                        <div className='flex items-center gap-1 text-xs bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded'>
                            <span>★</span>
                            <span className='font-semibold'>{car.averageRating}</span>
                            <span className='text-[10px] text-amber-500'>({car.reviewCount})</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className='mt-4 grid grid-cols-2 gap-y-2 text-gray-600'>
            <div className='flex items-center text-sm text-muted-foreground'>
                <img src={assets.users_icon} alt="" className='h-4 mr-2'/>
                <span>{car.seating_capacity} Seats</span>
            </div>
            <div className='flex items-center text-sm text-muted-foreground'>
                <img src={assets.fuel_icon} alt="" className='h-4 mr-2'/>
                <span>{car.fuel_type}</span>
            </div>
            <div className='flex items-center text-sm text-muted-foreground'>
                <img src={assets.car_icon} alt="" className='h-4 mr-2'/>
                <span>{car.transmission}</span>
            </div>
            <div className='flex items-center text-sm text-muted-foreground'>
                <img src={assets.location_icon} alt="" className='h-4 mr-2'/>
                <span>{typeof car.location === 'object' ? car.location.city : car.location}</span>
            </div>
        </div>

      </div>

    </div>
  )
}

export default CarCard
