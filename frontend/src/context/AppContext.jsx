import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext();

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY

    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [isOwner, setIsOwner] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')
    const [favorites, setFavorites] = useState([])

    const [cars, setCars] = useState([])

    // Function to check if user is logged in
    const fetchUser = async ()=>{
        try {
           const {data} = await axios.get('/api/user/data')
           if (data.success) {
            setUser(data.user)
            setIsOwner(data.user.role === 'owner')
            setFavorites(data.user.favorites || [])
           }else{
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
            setIsOwner(false)
            setFavorites([])
            axios.defaults.headers.common['Authorization'] = ''
            navigate('/')
           }
        } catch (error) {
            toast.error(error.message)
        }
    }
    // Function to fetch all cars from the server

    const fetchCars = async () =>{
        try {
            const {data} = await axios.get('/api/user/cars')
            data.success ? setCars(data.cars) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to toggle favorite
    const toggleFavorite = async (carId) => {
        if (!token) {
            toast.error("Please login to add cars to wishlist")
            setShowLogin(true)
            return
        }

        const prevFavorites = [...favorites]
        const isAlreadyFav = favorites.includes(carId)

        // Optimistic UI update
        if (isAlreadyFav) {
            setFavorites(favorites.filter(id => id !== carId))
        } else {
            setFavorites([...favorites, carId])
        }

        try {
            const { data } = await axios.post('/api/user/favorites/toggle', { carId })
            if (data.success) {
                toast.success(data.message)
                if (data.isFavorite) {
                    setFavorites(prev => [...new Set([...prev, carId])])
                } else {
                    setFavorites(prev => prev.filter(id => id !== carId))
                }
            } else {
                toast.error(data.message)
                setFavorites(prevFavorites)
            }
        } catch (error) {
            toast.error("Failed to update favorites")
            setFavorites(prevFavorites)
        }
    }

    // Function to log out the user
    const logout = ()=>{
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsOwner(false)
        setFavorites([])
        axios.defaults.headers.common['Authorization'] = ''
        toast.success('You have been logged out')
    }


    // useEffect to retrieve the token from localStorage
    useEffect(()=>{
        const token = localStorage.getItem('token')
        setToken(token)
        fetchCars()
    },[])

    // useEffect to fetch user data when token is available
    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['Authorization'] = `${token}`
            fetchUser()
        }
    },[token])

    const value = {
        navigate, currency, axios, user, setUser,
        token, setToken, isOwner, setIsOwner, fetchUser, showLogin, setShowLogin, logout, fetchCars, cars, setCars, 
        pickupDate, setPickupDate, returnDate, setReturnDate,
        favorites, setFavorites, toggleFavorite
    }

    return (
    <AppContext.Provider value={value}>
        { children }
    </AppContext.Provider>
    )
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}