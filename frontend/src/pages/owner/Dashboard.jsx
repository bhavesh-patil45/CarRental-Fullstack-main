import React, { useEffect, useState } from 'react'
import { assets, dummyDashboardData } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Dashboard = () => {

  const {axios, isOwner, currency} = useAppContext()

  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  const dashboardCards = [
    {title: "Total Cars", value: data.totalCars, icon: assets.carIconColored, glowClass: 'border-blue-500/20 hover:border-blue-500/50 shadow-blue-500/5', bgClass: 'bg-blue-500/10'},
    {title: "Total Bookings", value: data.totalBookings, icon: assets.listIconColored, glowClass: 'border-purple-500/20 hover:border-purple-500/50 shadow-purple-500/5', bgClass: 'bg-purple-500/10'},
    {title: "Pending", value: data.pendingBookings, icon: assets.cautionIconColored, glowClass: 'border-amber-500/20 hover:border-amber-500/50 shadow-amber-500/5', bgClass: 'bg-amber-500/10'},
    {title: "Confirmed", value: data.completedBookings, icon: assets.listIconColored, glowClass: 'border-emerald-500/20 hover:border-emerald-500/50 shadow-emerald-500/5', bgClass: 'bg-emerald-500/10'},
  ]

  const fetchDashboardData = async ()=>{
    try {
       const { data } = await axios.get('/api/owner/dashboard')
       if (data.success){
        setData(data.dashboardData)
       }else{
        toast.error(data.message)
       }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    if(isOwner){
      fetchDashboardData()
    }
  },[isOwner])

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <Title title="Admin Dashboard" subTitle="Monitor overall platform performance including total cars, bookings, revenue, and recent activities"/>

      <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl'>
        {dashboardCards.map((card, index)=>(
          <div key={index} className={`flex gap-2 items-center justify-between p-5 rounded-2xl border transition-all duration-300 shadow-sm ${card.glowClass} bg-white`}>
            <div>
              <h1 className='text-xs text-gray-400 font-medium tracking-wide uppercase'>{card.title}</h1>
              <p className='text-2xl font-bold text-gray-800 mt-1'>{card.value}</p>
            </div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.bgClass}`}>
              <img src={card.icon} alt="" className='h-5 w-5'/>
            </div>
          </div>
        ))}
      </div>


      <div className='flex flex-wrap items-start gap-6 mb-8 w-full'>
        {/* recent booking  */}
        <div className='p-5 md:p-6 border border-black/5 rounded-2xl shadow-sm bg-white max-w-lg w-full'>
          <h1 className='text-lg font-semibold text-gray-800'>Recent Bookings</h1>
          <p className='text-gray-400 text-sm'>Latest customer bookings</p>
          {data.recentBookings.map((booking, index)=>(
            <div key={index} className='mt-4 flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0'>

              <div className='flex items-center gap-3'>
                <div className='hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10'>
                  <img src={assets.listIconColored} alt="" className='h-5 w-5'/>
                </div>
                <div>
                  <p className='font-medium text-gray-800'>{booking.car.brand} {booking.car.model}</p>
                  <p className='text-xs text-gray-400'>{booking.createdAt.split('T')[0]}</p>
                </div>
              </div>

              <div className='flex items-center gap-3 font-semibold text-gray-700'>
                <p className='text-sm'>{currency}{booking.price}</p>
                <p className='px-3 py-0.5 border border-borderColor rounded-full text-xs text-gray-500 bg-gray-50'>{booking.status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* monthly revenue */}
        <div className='p-5 md:p-6 mb-6 border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl shadow-sm bg-white transition-all duration-300 w-full md:max-w-xs'>
          <h1 className='text-lg font-semibold text-gray-800'>Monthly Revenue</h1>
          <p className='text-gray-400 text-sm'>Revenue for current month</p>
          <p className='text-3xl mt-6 font-bold text-emerald-500'>{currency}{data.monthlyRevenue}</p>
        </div>
        
      </div>


    </div>
  )
}

export default Dashboard
