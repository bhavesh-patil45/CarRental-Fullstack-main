import express from "express";
import { addReview, getCarReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", protect, addReview);
reviewRouter.get("/car/:carId", getCarReviews);

export default reviewRouter;
