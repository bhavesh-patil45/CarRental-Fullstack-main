import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

// Add a review
export const addReview = async (req, res) => {
    try {
        const { carId, rating, comment } = req.body;
        const userId = req.user._id;

        // 1. Validate input fields
        if (!carId || rating === undefined || !comment || comment.trim() === "") {
            return res.json({ success: false, message: "Please fill all fields" });
        }

        const ratingNum = Number(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        // 2. Check if user has a completed booking for this car
        const completedBooking = await Booking.findOne({
            user: userId,
            car: carId,
            status: "confirmed",
            returnDate: { $lt: new Date() }
        });

        if (!completedBooking) {
            return res.json({ success: false, message: "You can only review cars you have successfully rented and completed the trip!" });
        }

        // 3. Create the review
        try {
            await Review.create({
                car: carId,
                user: userId,
                rating: ratingNum,
                comment: comment.trim()
            });
            res.json({ success: true, message: "Review added successfully!" });
        } catch (dbError) {
            if (dbError.code === 11000) {
                return res.json({ success: false, message: "You have already reviewed this car!" });
            }
            throw dbError;
        }

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get reviews for a car
export const getCarReviews = async (req, res) => {
    try {
        const { carId } = req.params;

        // Populate user name and avatar only (protecting other sensitive data)
        const reviews = await Review.find({ car: carId })
            .populate("user", "name image")
            .sort({ createdAt: -1 });

        // Add verified renter flags dynamically
        const reviewsWithVerification = await Promise.all(reviews.map(async (review) => {
            if (!review.user) return { ...review._doc, isVerifiedRenter: false };
            
            const hasCompletedBooking = await Booking.findOne({
                user: review.user._id,
                car: carId,
                status: "confirmed",
                returnDate: { $lt: new Date() }
            });
            return {
                ...review._doc,
                isVerifiedRenter: !!hasCompletedBooking
            };
        }));

        res.json({ success: true, reviews: reviewsWithVerification });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
