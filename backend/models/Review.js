import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const reviewSchema = new mongoose.Schema({
    car: { type: ObjectId, ref: 'Car', required: true, index: true },
    user: { type: ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });

// Compound unique index to prevent a user from leaving duplicate reviews for the same car
reviewSchema.index({ user: 1, car: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
