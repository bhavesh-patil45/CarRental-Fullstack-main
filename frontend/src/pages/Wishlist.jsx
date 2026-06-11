import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import CarCard from '../components/CarCard'
import { useAppContext } from '../context/AppContext'
import Loader from '../components/Loader'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'

const Wishlist = () => {
  const { axios, user, token } = useAppContext()
  const [favoriteCars, setFavoriteCars] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchWishlist = async () => {
    try {
      setIsLoading(true)
      const { data } = await axios.get('/api/user/favorites')
      if (data.success) {
        setFavoriteCars(data.favorites)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error("Failed to load wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchWishlist()
    } else {
      setIsLoading(false)
    }
  }, [token])

  // Watch global favorites in case they toggle from inside the wishlist cards
  const { favorites } = useAppContext()
  useEffect(() => {
    // If a car is unfavorited locally, filter it out of the displayed list
    setFavoriteCars(prev => prev.filter(car => favorites.includes(car._id)))
  }, [favorites])

  if (isLoading) {
    return <Loader />
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl mx-auto min-h-[60vh] flex flex-col'
    >
      <Title 
        title='My Wishlist'
        subTitle='Keep track of the vehicles you love and want to rent'
        align="left"
      />

      {favoriteCars.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className='flex flex-col items-center justify-center flex-1 border border-dashed border-borderColor rounded-3xl p-10 text-center my-12 bg-gray-50/20'
        >
          <div className='w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl mb-4 border border-red-100 shadow-sm'>
            ❤️
          </div>
          <h2 className='text-xl font-bold text-gray-800 mb-2'>Build Your Wishlist</h2>
          <p className='text-gray-400 max-w-sm mb-6'>Save cars you like and compare them later. Start exploring our premium car collection today!</p>
          <a 
            href='/cars' 
            className='bg-primary hover:bg-primary-dull text-white px-8 py-3 rounded-full font-semibold text-xs tracking-wider transition-all shadow hover:shadow-md cursor-pointer'
          >
            Browse Cars
          </a>
        </motion.div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8 mb-16'>
          {favoriteCars.map((car, index) => (
            <motion.div 
              key={car._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <CarCard car={car} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default Wishlist
