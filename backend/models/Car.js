import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const carSchema = new mongoose.Schema({
    owner: {type: ObjectId, ref: 'User'},
    brand: {type: String, required: true},
    model: {type: String, required: true},
    image: {type: String, required: true},
    year: {type: Number, required: true},
    category: {type: String, required: true},
    seating_capacity: {type: Number, required: true},
    fuel_type: { type: String, required: true },
    transmission: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    location: {
        city: { type: String, required: true },
        geo: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], required: true } // [longitude, latitude]
        }
    },
    description: { type: String, required: true },
    isAvaliable: {type: Boolean, default: true}
},{timestamps: true})

carSchema.index({ "location.geo": "2dsphere" });

const Car = mongoose.model('Car', carSchema)

export default Car