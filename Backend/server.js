const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock hospital data generator
function generateMockHospitals() {
  const hospitals = [];

  for (let i = 1; i <= 10; i++) {
    hospitals.push({
      id: i,
      name: `Hospital ${i}`,
      availableBeds: Math.floor(Math.random() * 50), // 0–49 beds
      emergencyContact: `+91-98${Math.floor(10000000 + Math.random() * 90000000)}`
    });
  }

  return hospitals;
}

// API endpoint
app.get("/hospitals/mock", (req, res) => {
  const data = generateMockHospitals();
  res.json(data);
});

// Root route (for testing)
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});