import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js";
import Review from "../models/Review.js";
import mongoose from "mongoose";


// Generate JWT Token
const generateToken = (userId)=>{
    const payload = userId;
    return jwt.sign(payload, process.env.JWT_SECRET)
}

// Register User
export const registerUser = async (req, res)=>{
    try {
        const {name, email, password} = req.body

        if(!name || !email || !password || password.length < 8){
            return res.json({success: false, message: 'Fill all the fields'})
        }

        const userExists = await User.findOne({email})
        if(userExists){
            return res.json({success: false, message: 'User already exists'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({name, email, password: hashedPassword})
        const token = generateToken(user._id.toString())
        res.json({success: true, token})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Login User 
export const loginUser = async (req, res)=>{
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.json({success: false, message: "User not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.json({success: false, message: "Invalid Credentials" })
        }
        const token = generateToken(user._id.toString())
        res.json({success: true, token})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Get User data using Token (JWT)
export const getUserData = async (req, res) =>{
    try {
        const {user} = req;
        res.json({success: true, user})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Get All Cars for the Frontend
export const getCars = async (req, res) =>{
    try {
        const { lat, lng, radius } = req.query;
        let query = { isAvaliable: true };

        if (lat && lng) {
            const latitude = Number(lat);
            const longitude = Number(lng);
            const radInKm = radius ? Number(radius) : 50;

            if (isNaN(latitude) || latitude < -90 || latitude > 90) {
                return res.json({ success: false, message: "Invalid latitude. Must be between -90 and 90." });
            }
            if (isNaN(longitude) || longitude < -180 || longitude > 180) {
                return res.json({ success: false, message: "Invalid longitude. Must be between -180 and 180." });
            }
            if (isNaN(radInKm) || radInKm <= 0) {
                return res.json({ success: false, message: "Invalid radius. Must be a positive number." });
            }

            query["location.geo"] = {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radInKm * 1000
                }
            };
        }

        const cars = await Car.find(query).lean()
        
        const carsWithStats = await Promise.all(cars.map(async (car) => {
            const stats = await Review.aggregate([
                { $match: { car: car._id } },
                { $group: {
                    _id: "$car",
                    averageRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 }
                }}
            ]);
            return {
                ...car,
                averageRating: stats.length > 0 ? Number(stats[0].averageRating.toFixed(1)) : 0,
                reviewCount: stats.length > 0 ? stats[0].reviewCount : 0
            };
        }));

        res.json({success: true, cars: carsWithStats})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Toggle Car in User's Favorites
export const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user._id;
        const { carId } = req.body;

        if (!carId || !mongoose.isValidObjectId(carId)) {
            return res.json({ success: false, message: "Invalid car ID provided." });
        }

        const carExists = await Car.findById(carId);
        if (!carExists) {
            return res.json({ success: false, message: "Car does not exist." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        const isFavorite = user.favorites.includes(carId);
        if (isFavorite) {
            await User.findByIdAndUpdate(
                userId,
                { $pull: { favorites: carId } }
            );
        } else {
            await User.findByIdAndUpdate(
                userId,
                { $addToSet: { favorites: carId } }
            );
        }

        res.json({
            success: true,
            isFavorite: !isFavorite,
            message: isFavorite ? "Removed from favorites." : "Added to favorites."
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get User's populated Favorite Cars
export const getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate("favorites").lean();
        
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        // Filter out any deleted/null cars
        const validFavorites = user.favorites.filter(car => car !== null && car !== undefined);

        // If there were deleted/null cars, clean up the user's favorites array in DB asynchronously
        if (validFavorites.length !== user.favorites.length) {
            const validIds = validFavorites.map(car => car._id);
            await User.findByIdAndUpdate(userId, { favorites: validIds });
        }

        // Fetch stats (ratings/reviews) for each favorited car
        const favoritesWithStats = await Promise.all(validFavorites.map(async (car) => {
            const stats = await Review.aggregate([
                { $match: { car: car._id } },
                { $group: {
                    _id: "$car",
                    averageRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 }
                }}
            ]);
            return {
                ...car,
                averageRating: stats.length > 0 ? Number(stats[0].averageRating.toFixed(1)) : 0,
                reviewCount: stats.length > 0 ? stats[0].reviewCount : 0
            };
        }));

        res.json({ success: true, favorites: favoritesWithStats });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};