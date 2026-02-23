require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Connect Database
connectDB();

// ✅ FIX: Move high-limit middlewares to the TOP
// This ensures large signature images (Base64) aren't rejected
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded PDFs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/docs", require("./routes/docRoutes"));
app.use("/api/signatures", require("./routes/signatureRoutes"));
app.use("/api/audit", require("./routes/auditRoutes"));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);