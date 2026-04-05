# 🚑 Emergency Hospital Finder

A smart web application that helps users quickly locate nearby hospitals during emergencies using real-time geolocation and interactive maps.  
It enhances decision-making by displaying hospital proximity along with simulated availability data.

---

## 🌟 Overview

In emergency situations, finding the nearest hospital quickly can be critical.  
This application provides a fast and intuitive way to:

- Detect your current location  
- Find nearby hospitals within a defined radius  
- Visualize them on an interactive map  
- Access key information to make quick decisions  

---

## 🔥 Features

- 📍 **Real-time Location Detection**
  - Uses browser Geolocation API to detect user's current position

- 🏥 **Nearby Hospital Discovery**
  - Fetches real hospital data using OpenStreetMap (Overpass API)

- 🗺 **Interactive Map View**
  - Displays:
    - User location
    - Hospital locations
  - Automatically centers on user's location

- 📏 **Accurate Distance Calculation**
  - Uses Haversine formula for real-world distance

- 🛏 **Bed Availability Simulation**
  - 🟢 Available beds  
  - 🟡 Limited beds  
  - 🔴 No beds available  
  - ⚪ Unknown status  

- 📞 **Emergency Contact (Mock Data)**
  - Generated for demonstration purposes (always available)

- 📊 **Dashboard Panel**
  - Scrollable list of hospitals
  - Clean and structured layout for quick readability

- 🎯 **Emergency-Focused UI**
  - High contrast design
  - Minimal distractions
  - Built for fast decision-making

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- CSS
- Leaflet

### Backend
- Node.js
- Express

### APIs & Data
- OpenStreetMap (Overpass API)

---

## ⚙️ How It Works

1. User clicks **"Find Nearby Hospitals"**
2. Browser retrieves current location
3. Application queries OpenStreetMap for hospitals within ~15 km
4. Distance is calculated using the Haversine formula
5. Mock data is generated for:
   - Bed availability
   - Contact numbers
6. Results are displayed:
   - On the map (markers)
   - In the dashboard (detailed list)

---

## ⚠️ Important Note

- Hospital **locations and distances are real**
- Bed availability and contact details are **simulated**
- This is a prototype system and not connected to real hospital databases

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/emergency-hospital-finder.git
cd emergency-hospital-finder

```
### 2. Backend Setup
```bash
cd backend
npm install
npm start

```
### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev

```
