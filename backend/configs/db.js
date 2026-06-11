import mongoose from "mongoose";
import Car from "../models/Car.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import bcrypt from "bcrypt";

const cityCoordinates = {
    "New York": [-74.0060, 40.7128],
    "Los Angeles": [-118.2437, 34.0522],
    "Houston": [-95.3698, 29.7604],
    "Chicago": [-87.6298, 41.8781]
};

const runMigration = async () => {
    try {
        // Ensure default owner user exists in the database
        let owner = await User.findOne({ email: "owner@rental.com" });
        if (!owner) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            owner = await User.create({
                name: "Default Owner",
                email: "owner@rental.com",
                password: hashedPassword,
                role: "owner"
            });
            console.log("Created default owner user:", owner.email);
        }

        // Check if database is empty and seed dummy data if so
        const carCount = await Car.countDocuments();
        if (carCount === 0) {
            console.log("No cars found in database. Seeding initial dummy cars...");
            
            const dummyCars = [
                {
                    brand: "BMW",
                    model: "X5",
                    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1280&q=80",
                    year: 2022,
                    category: "SUV",
                    seating_capacity: 5,
                    fuel_type: "Hybrid",
                    transmission: "Automatic",
                    pricePerDay: 150,
                    location: "New York",
                    description: "The BMW X5 is a mid-size luxury SUV. This hybrid model offers great performance and luxury features.",
                    isAvaliable: true,
                    owner: owner._id
                },
                {
                    brand: "Toyota",
                    model: "Corolla",
                    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1280&q=80",
                    year: 2021,
                    category: "Sedan",
                    seating_capacity: 5,
                    fuel_type: "Gas",
                    transmission: "Automatic",
                    pricePerDay: 45,
                    location: "Chicago",
                    description: "A reliable and fuel-efficient Toyota Corolla, perfect for city driving and long commutes.",
                    isAvaliable: true,
                    owner: owner._id
                },
                {
                    brand: "Jeep",
                    model: "Wrangler",
                    image: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1280&q=80",
                    year: 2023,
                    category: "SUV",
                    seating_capacity: 4,
                    fuel_type: "Gas",
                    transmission: "Automatic",
                    pricePerDay: 120,
                    location: "Los Angeles",
                    description: "The ultimate off-road adventure vehicle. Jeep Wrangler is perfect for coastal drives and rugged trails.",
                    isAvaliable: true,
                    owner: owner._id
                },
                {
                    brand: "Ford",
                    model: "Mustang",
                    image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1280&q=80",
                    year: 2022,
                    category: "Sedan",
                    seating_capacity: 4,
                    fuel_type: "Gas",
                    transmission: "Automatic",
                    pricePerDay: 95,
                    location: "Houston",
                    description: "Experience the thrill of an iconic American muscle car. Clean design and powerful V8 engine.",
                    isAvaliable: true,
                    owner: owner._id
                }
            ];

            for (const car of dummyCars) {
                const center = cityCoordinates[car.location] || [-74.0060, 40.7128];
                const jitterLng = (Math.random() - 0.5) * 0.02;
                const jitterLat = (Math.random() - 0.5) * 0.02;

                await Car.create({
                    ...car,
                    location: {
                        city: car.location,
                        geo: {
                            type: "Point",
                            coordinates: [center[0] + jitterLng, center[1] + jitterLat]
                        }
                    }
                });
            }
            console.log("Dummy cars seeded successfully!");
        }

        // Correct any existing legacy/broken image URLs for already seeded cars
        await Car.updateMany(
            { image: "https://images.unsplash.com/photo-1623860840534-130b4c3f2bdf?auto=format&fit=crop&w=1280&q=80" },
            { $set: { image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1280&q=80" } }
        );
        await Car.updateMany(
            { image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1280&q=80" },
            { $set: { image: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1280&q=80" } }
        );
        await Car.updateMany(
            { image: "https://images.unsplash.com/photo-1611245801314-e0a5df9238a3?auto=format&fit=crop&w=1280&q=80" },
            { $set: { image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1280&q=80" } }
        );

        // Migrate legacy cars
        const legacyCars = await Car.find({
            $or: [
                { "location.geo": { $exists: false } },
                { "location": { $type: "string" } }
            ]
        });

        if (legacyCars.length > 0) {
            console.log(`Found ${legacyCars.length} legacy car documents. Starting migration...`);
            for (const car of legacyCars) {
                const cityName = typeof car.location === "string" ? car.location : (car.location?.city || "New York");
                const center = cityCoordinates[cityName] || [-74.0060, 40.7128];
                const jitterLng = (Math.random() - 0.5) * 0.02;
                const jitterLat = (Math.random() - 0.5) * 0.02;

                car.location = {
                    city: cityName,
                    geo: {
                        type: "Point",
                        coordinates: [center[0] + jitterLng, center[1] + jitterLat]
                    }
                };
                await car.save();
            }
            console.log("Migration complete!");
        }
        // Re-assign all seeded cars and bookings to the Default Owner (owner@rental.com)
        const defaultOwner = await User.findOne({ email: "owner@rental.com" });
        if (defaultOwner) {
            await Car.updateMany(
                { brand: { $in: ["BMW", "Toyota", "Jeep", "Ford"] } },
                { $set: { owner: defaultOwner._id } }
            );
            await Booking.updateMany(
                {},
                { $set: { owner: defaultOwner._id } }
            );
            console.log("Re-assigned seeded cars and bookings to Default Owner!");
        }
    } catch (err) {
        console.error("Migration/Seeding failed:", err.message);
    }
};

const connectDB = async ()=>{
    try {
        mongoose.connection.on('connected', ()=> console.log("Database Connected"));
        const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(`${dbUri}/car-rental`)
        await runMigration();
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB;