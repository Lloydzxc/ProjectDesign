import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import helmet from "helmet";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "./models/User.js";
import Detection from "./models/Detection.js";

dotenv.config();

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// Helmet security
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const ML_BASE_URL = process.env.ML_BASE_URL || "http://127.0.0.1:8000";

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Root route
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Foot Classification API Server",
    endpoints: {
      auth: "POST /api/signup, POST /api/login",
      detect: "POST /api/detect",
      history: "GET /api/history, DELETE /api/history/:id"
    }
  });
});

// Sign Up Route
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user
    const user = await User.create({ fullName, email, password });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: "No account found with this email" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Detect endpoint (now saves to database)
app.post("/api/detect", authenticateToken, async (req, res) => {
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
    
    if (!response.ok) {
      console.error("FastAPI error:", data);
      return res.status(response.status).json(data);
    }
    
    // Save detection to database
    const detection = await Detection.create({
      userId: req.user.id,
      imageUrl: image_base64,
      detections: data.detections || [],
      detectionCount: data.detections?.length || 0
    });

    console.log(`Detection successful: ${data.detections?.length || 0} objects found`);
    res.json({
      ...data,
      detectionId: detection._id
    });
  } catch (error) {
    console.error("Detection error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get detection history
app.get("/api/history", authenticateToken, async (req, res) => {
  try {
    const detections = await Detection.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ detections });
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete detection
app.delete("/api/history/:id", authenticateToken, async (req, res) => {
  try {
    const detection = await Detection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id // Ensure user owns this detection
    });

    if (!detection) {
      return res.status(404).json({ error: "Detection not found" });
    }

    res.json({ message: "Detection deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));