import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyCarData } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const CarDetails = () => {

  const {id} = useParams()

  const {cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate, token, setShowLogin, fetchCars} = useAppContext()

  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const currency = import.meta.env.VITE_CURRENCY

  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/car/${id}`)
      if (data.success) {
        setReviews(data.reviews)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [id])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Please select a star rating!")
      return
    }
    if (!comment || comment.trim() === '') {
      toast.error("Please enter a review comment!")
      return
    }
    setIsSubmittingReview(true)
    try {
      const { data } = await axios.post('/api/reviews/add', {
        carId: id,
        rating,
        comment: comment.trim()
      })
      if (data.success) {
        toast.success(data.message)
        setRating(0)
        setComment('')
        fetchReviews()
        fetchCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const [bookedDates, setBookedDates] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Fetch booked dates for this car
  const fetchBookedDates = async () => {
    try {
      const { data } = await axios.get(`/api/bookings/car/${id}`)
      if (data.success) {
        setBookedDates(data.bookings.map(b => ({
          start: new Date(b.pickupDate),
          end: new Date(b.returnDate)
        })))
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchBookedDates()
  }, [id])

  const isDateBooked = (date) => {
    const d = new Date(date)
    d.setHours(0,0,0,0)
    return bookedDates.some(range => {
      const start = new Date(range.start)
      start.setHours(0,0,0,0)
      const end = new Date(range.end)
      end.setHours(0,0,0,0)
      return d >= start && d <= end
    })
  }

  const isRangeBlocked = (start, end) => {
    let d = new Date(start)
    const targetEnd = new Date(end)
    while (d <= targetEnd) {
      if (isDateBooked(d)) return true
      d.setDate(d.getDate() + 1)
    }
    return false
  }

  // Calendar dates generation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const prevMonth = () => {
    const today = new Date()
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
      return // Don't go to past months
    }
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day)
    clickedDate.setHours(0,0,0,0)
    
    const today = new Date()
    today.setHours(0,0,0,0)

    if (clickedDate < today) return
    if (isDateBooked(clickedDate)) return

    const picked = pickupDate ? new Date(pickupDate) : null
    const returned = returnDate ? new Date(returnDate) : null

    if (!picked || (picked && returned)) {
      setPickupDate(clickedDate.toISOString().split('T')[0])
      setReturnDate('')
    } else {
      if (clickedDate <= picked) {
        setPickupDate(clickedDate.toISOString().split('T')[0])
        setReturnDate('')
      } else {
        if (isRangeBlocked(picked, clickedDate)) {
          toast.error("This range contains already booked dates!")
          return
        }
        setReturnDate(clickedDate.toISOString().split('T')[0])
      }
    }
  }

  const handleSubmit = async (e)=>{
    e.preventDefault();
    if (!pickupDate || !returnDate) {
      toast.error("Please select both Pickup and Return dates")
      return
    }
    try {
      const {data} = await axios.post('/api/bookings/create', {
        car: id,
        pickupDate, 
        returnDate
      })

      if (data.success){
        toast.success(data.message)
        navigate('/my-bookings')
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    setCar(cars.find(car => car._id === id))
  },[cars, id])

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>

      <button onClick={()=> navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65'/>
        Back to all cars
       </button>

       <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
          {/* Left: Car Image & Details */}
          <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}

          className='lg:col-span-2'>
              <motion.img 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}

              src={car.image} alt="" className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md'/>
              <motion.div className='space-y-6'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div>
                  <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
                  <p className='text-gray-500 text-lg'>{car.category} • {car.year}</p>
                </div>
                <hr className='border-borderColor my-6'/>

                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                  {[
                    {icon: assets.users_icon, text: `${car.seating_capacity} Seats`},
                    {icon: assets.fuel_icon, text: car.fuel_type},
                    {icon: assets.car_icon, text: car.transmission},
                    {icon: assets.location_icon, text: typeof car.location === 'object' ? car.location.city : car.location},
                  ].map(({icon, text}, index)=>(
                    <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    
                    key={index} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                      <img src={icon} alt="" className='h-5 mb-2'/>
                      {text}
                    </motion.div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <h1 className='text-xl font-medium mb-3'>Description</h1>
                  <p className='text-gray-500'>{car.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h1 className='text-xl font-medium mb-3'>Features</h1>
                  <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {
                      ["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((item)=>(
                        <li key={item} className='flex items-center text-gray-500'>
                          <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                          {item}
                        </li>
                      ))
                    }
                  </ul>
                </div>

                <hr className='border-borderColor my-6'/>

                {/* Reviews Section */}
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h1 className='text-xl font-semibold text-gray-800'>Customer Reviews</h1>
                    {car.averageRating > 0 && (
                      <div className='flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-lg text-sm font-semibold'>
                        <span>★</span>
                        <span>{car.averageRating}</span>
                        <span className='text-gray-400 font-normal'>({car.reviewCount} reviews)</span>
                      </div>
                    )}
                  </div>

                  {/* Review Listing */}
                  <div className='space-y-4 max-h-[400px] overflow-y-auto pr-2'>
                    {reviews.length === 0 ? (
                      <p className='text-gray-400 text-sm italic'>No reviews yet for this vehicle.</p>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev._id} className='bg-gray-50/50 p-4 rounded-xl border border-black/5 space-y-2'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm overflow-hidden'>
                                {rev.user?.image ? (
                                  <img src={rev.user.image} alt="" className='w-full h-full object-cover'/>
                                ) : (
                                  rev.user?.name?.[0].toUpperCase() || 'U'
                                )}
                              </div>
                              <div>
                                <p className='font-semibold text-sm text-gray-800'>{rev.user?.name || 'Anonymous'}</p>
                                <p className='text-[10px] text-gray-400'>{new Date(rev.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            <div className='flex flex-col items-end gap-1'>
                              <div className='flex text-amber-500 text-sm'>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                                ))}
                              </div>
                              {rev.isVerifiedRenter && (
                                <span className='text-[9px] bg-green-500/15 text-green-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider'>Verified Renter</span>
                              )}
                            </div>
                          </div>
                          <p className='text-gray-600 text-sm pl-1'>{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Write a Review Form */}
                  {token ? (
                    <form onSubmit={handleReviewSubmit} className='bg-gray-50/35 border border-black/5 p-5 rounded-2xl space-y-4'>
                      <h2 className='font-semibold text-gray-800 text-sm'>Share Your Experience</h2>
                      
                      {/* Clickable and Hover-interactive Stars */}
                      <div className='flex items-center gap-1.5'>
                        <span className='text-sm text-gray-500 mr-2'>Your Rating:</span>
                        <div className='flex gap-1 text-2xl cursor-pointer'>
                          {Array.from({ length: 5 }).map((_, i) => {
                            const starValue = i + 1
                            const isHighlighted = hoverRating >= starValue || (!hoverRating && rating >= starValue)
                            return (
                              <button
                                key={i}
                                type="button"
                                onMouseEnter={() => setHoverRating(starValue)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(starValue)}
                                className={`focus:outline-none transition-all ${isHighlighted ? 'text-amber-500 scale-110' : 'text-gray-300'}`}
                              >
                                ★
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Comment Box */}
                      <div className='flex flex-col gap-2'>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={3}
                          placeholder='Write your honest review here...'
                          className='w-full px-4 py-3 border border-black/5 rounded-xl bg-white focus:outline-none focus:border-primary/50 text-sm text-gray-600'
                          required
                        />
                      </div>

                      <button
                        type='submit'
                        disabled={isSubmittingReview}
                        className='bg-primary hover:bg-primary-dull text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer disabled:bg-gray-400'
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <div className='bg-gray-50 p-4 rounded-xl border border-black/5 text-center text-xs text-gray-400'>
                      Please <button type="button" onClick={() => setShowLogin(true)} className='text-primary font-semibold underline cursor-pointer'>login</button> to write a review.
                    </div>
                  )}
                </div>

              </motion.div>
          </motion.div>

          {/* Right: Booking Form (Glassmorphism + Visual Calendar) */}
          <motion.form 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}

          onSubmit={handleSubmit} className='backdrop-blur-md bg-white/70 border border-black/5 shadow-xl h-max sticky top-18 rounded-2xl p-6 space-y-6 text-gray-500'>

            <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay}<span className='text-base text-gray-400 font-normal'>per day</span></p> 

            <hr className='border-black/5 my-6'/>

            {/* Custom Interactive Calendar */}
            <div className='bg-gray-50 p-4 rounded-xl border border-black/5 select-none'>
              <div className='flex items-center justify-between mb-4'>
                <button type="button" onClick={prevMonth} className='p-1.5 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer text-gray-700 font-bold'>&lt;</button>
                <h2 className='font-semibold text-gray-800 text-sm'>{monthsList[currentMonth]} {currentYear}</h2>
                <button type="button" onClick={nextMonth} className='p-1.5 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer text-gray-700 font-bold'>&gt;</button>
              </div>

              {/* Day headers */}
              <div className='grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-2'>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
              </div>

              {/* Days grid */}
              <div className='grid grid-cols-7 gap-1 text-center text-xs'>
                {/* Empty slots for offset */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className='p-2'></div>
                ))}
                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const date = new Date(currentYear, currentMonth, day)
                  date.setHours(0,0,0,0)
                  const isBooked = isDateBooked(date)
                  
                  const today = new Date()
                  today.setHours(0,0,0,0)
                  const isPast = date < today

                  const isPicked = pickupDate && date.getTime() === new Date(pickupDate).getTime()
                  const isReturned = returnDate && date.getTime() === new Date(returnDate).getTime()
                  const isInRange = pickupDate && returnDate && date > new Date(pickupDate) && date < new Date(returnDate)

                  let dayClass = 'text-gray-700 hover:bg-primary/10 rounded-lg cursor-pointer'
                  if (isPast || isBooked) {
                    dayClass = 'text-gray-300 line-through cursor-not-allowed'
                  } else if (isPicked || isReturned) {
                    dayClass = 'bg-primary text-white font-semibold rounded-lg shadow-sm'
                  } else if (isInRange) {
                    dayClass = 'bg-primary/15 text-primary rounded-lg font-medium'
                  }

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      disabled={isPast || isBooked}
                      onClick={() => handleDateClick(day)}
                      className={`p-2 focus:outline-none transition-all ${dayClass}`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected dates display */}
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-black/5'>
                <div>
                  <p className='text-[10px] text-gray-400 font-bold uppercase tracking-wider'>Pickup Date</p>
                  <p className='font-semibold text-gray-700 mt-0.5'>{pickupDate ? pickupDate : 'Select date'}</p>
                </div>
                <div className='h-6 w-[1px] bg-gray-200'></div>
                <div className='text-right'>
                  <p className='text-[10px] text-gray-400 font-bold uppercase tracking-wider'>Return Date</p>
                  <p className='font-semibold text-gray-700 mt-0.5'>{returnDate ? returnDate : 'Select date'}</p>
                </div>
              </div>

              {pickupDate && returnDate && (
                <div className='flex justify-between items-center bg-primary/5 p-3 rounded-xl border border-primary/10 text-primary font-medium text-xs'>
                  <span>Duration:</span>
                  <span>
                    {Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24))} Days
                  </span>
                </div>
              )}
            </div>

            <button className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-semibold text-white rounded-xl shadow-sm hover:shadow-lg cursor-pointer'>Book Now</button>

            <p className='text-center text-xs text-gray-400'>No credit card required to reserve</p>

          </motion.form>
       </div>

    </div>
  ) : <Loader />
}

export default CarDetails
