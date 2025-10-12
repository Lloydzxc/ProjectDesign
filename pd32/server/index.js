import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import helmet from "helmet";

const app = express();

// Enable CORS to allow React app to make requests
app.use(cors());
app.use(express.json({ limit: "15mb" })); // Allow large images

// Use helmet with configured Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:4000", "http://localhost:5173", "http://localhost:8000"],
      scriptSrc: ["'self'", "http://localhost:5173"],
      styleSrc: ["'self'", "'unsafe-inline'", "http://localhost:5173"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

const ML_BASE_URL = process.env.ML_BASE_URL || "http://127.0.0.1:8000"; // FastAPI URL

// Root route - health check
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Foot Classification API Server",
    endpoints: {
      detect: "POST /api/detect"
    }
  });
});

// Proxy /api/detect to FastAPI /detect endpoint
app.post("/api/detect", async (req, res) => {
  try {
    const { image_base64, conf = 0.25, imgsz = 640 } = req.body || {};
    
    if (!image_base64) return res.status(400).json({ error: "image_base64 required" });
    
    console.log("Forwarding detection request to FastAPI...");
    const response = await fetch(`${ML_BASE_URL}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64, conf, imgsz })
    });
    
    const data = await response.json();
    
    // Log if FastAPI returned an error
    if (!response.ok) {
      console.error("FastAPI error:", data);
      return res.status(response.status).json(data);
    }
    
    console.log(`Detection successful: ${data.detections?.length || 0} objects found`);
    res.json(data);
  } catch (error) {
    console.error("Detection error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));