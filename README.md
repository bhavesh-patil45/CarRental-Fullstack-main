
# 🚗 Car Rental System

A full-stack car rental application that allows users to browse cars, book rentals, and enables admins to manage inventory and bookings. Built with the MERN stack, featuring JWT-based authentication, role-based access control, optimized image delivery using ImageKit, and a clean, scalable architecture.

<img width="1917" height="1031" alt="Screenshot 2025-12-08 232248" src="https://github.com/user-attachments/assets/6e893c97-fd79-417d-a5df-2801cee879b3" />

<img width="1839" height="943" alt="Screenshot 2025-12-08 232333" src="https://github.com/user-attachments/assets/0ab642cc-67dd-4d3e-8ad9-befd4acb3d23" />

---

## 💡 What is Car Rental System?

Traditional rental workflows require manual management and often lead to double-bookings or inefficiencies.  
This app automates that process:

- Users can browse available cars, apply filters, and book a vehicle.
- Admins can manage the entire fleet, update inventory, and track user bookings.
- A modern, responsive UI creates a smooth booking experience.

This project is designed to showcase real-world full-stack development skills, making it a strong portfolio project.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind 
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB + Mongoose  
- **Authentication:** JWT (JSON Web Tokens), bcrypt  
- **Media Storage:** ImageKit (CDN optimized image delivery)  
- **Tools:** Postman, Git/GitHub, dotenv  

---

## ✅ Key Features

- 🔐 **Authentication & Authorization**  
  - Secure login & registration  
  - Role-based access (User / Admin)  
  - JWT-powered protected APIs  

- 🚗 **Car Listings**  
  - View all available cars  
  - Car details: name, brand, price per day, fuel type, capacity, image  

- 📅 **Booking System**  
  - Users can book cars for selected dates  
  - Prevents overlapping or double bookings  
  - Booking data stored securely with user association  

- 🛠️ **Admin Dashboard**  
  - Add new cars with image upload via ImageKit  
  - Manage all cars: update / delete  
  - View and manage all user bookings  

- 🖼️ **Media Management**  
  - Car images stored on ImageKit  
  - Automatic compression + responsive image URLs  
  - Faster loading times and improved performance  

---
## 🔗 Live Demo

👉 **Try the Live App:**  
### 🔥 https://car-rental-ivory-xi.vercel.app
---

## 🚀 Installation & Setup (Local Development)

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/YOUR-USERNAME/CarRental-Fullstack.git
cd CarRental-Fullstack
```

## 🔧 Backend Setup
### 2️⃣ Install dependencies:
```
cd backend
npm install
```
### 3️⃣ Create .env file:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_endpoint
```
### 4️⃣ Start backend:
```
npm start
```
## 🎨 Frontend Setup
### 5️⃣ Install frontend dependencies:
```
cd ../frontend
npm install
```
### 6️⃣ Run frontend:
```
npm start
```
Your frontend is now available at:
👉 http://localhost:3000

Backend typically runs at:
👉 http://localhost:5000 (or your configured port)
