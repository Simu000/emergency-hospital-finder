const express = require("express");
const cors = require("cors");
const path = require("path");  

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Mock hospital data generator
function generateMockHospitals() {
  const hospitals = [];

  for (let i = 1; i <= 10; i++) {
    hospitals.push({
      id: i,
      name: `Hospital ${i}`,
      availableBeds: Math.floor(Math.random() * 50),
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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});