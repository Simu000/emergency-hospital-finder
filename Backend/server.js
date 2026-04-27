const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// Mock hospital data generator
function generateMockHospitals() {
  const hospitals = [];
  for (let i = 1; i <= 10; i++) {
    hospitals.push({
      id: i,
      name: `Hospital ${i}`,
      availableBeds: Math.floor(Math.random() * 50),
      emergencyContact: `+91-98${Math.floor(10000000 + Math.random() * 90000000)}`,
    });
  }
  return hospitals;
}

// API endpoints
app.get("/hospitals/mock", (req, res) => {
  res.json(generateMockHospitals());
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

//  Catch-all route (your version preserved)
app.get(/(.*)/, (req, res) => {
  const indexPath = path.join(publicPath, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // fallback for CI test environment
    res.status(200).send("<html><body><h1>App</h1></body></html>");
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;