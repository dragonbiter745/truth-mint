// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 4000;

// 1. Enable CORS
app.use(cors()); 

// 2. Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. API Routes
app.use("/api", apiRoutes);

// 4. Serve the Frontend Static Files
// This assumes your folder structure is truthmint/backend and truthmint/frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Default Route: Serve index.html for any unknown path
app.get("*", (req, res) => {
    // Only serve index if not an API call
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, "../frontend/index.html"));
    }
});

app.listen(PORT, '0.0.0.0',() => {
  console.log(`🚀 TruthMint Server running on http://localhost:${PORT}`);
  console.log(`🔗 Blockchain Network: Flare Coston2`);
  console.log(`📡 Accepting external tunnel connections`);
});