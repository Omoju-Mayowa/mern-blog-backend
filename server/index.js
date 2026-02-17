import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import { default as rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";

import { connectToAvailableMongoDB } from "./utils/db.js";
import __dirname from "./utils/directory.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import uploadRouter from "./routes/upload.js"; // R2 upload route
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// ────────────────────────────────────────────────────────────
// ⚙️ Express setup
// ────────────────────────────────────────────────────────────

const app = express();
app.set("trust proxy", 1);

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const allowedOrigins = [
  process.env.SITE_LINK,
  "https://mern-cloud.vercel.app/",
  "https://mern-cloud-git-main-omoju-mayowas-projects.vercel.app/",
  "https://mern-cloud-fyqsicu8g-omoju-mayowas-projects.vercel.app/",
  "http://localhost:5173/"
  // You can add more Origin URLs here if you cloned the repo.
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS: Origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);

// Allow Authorization header in CORS preflight
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  next();
});

// server/index.js (near app init)
app.set("trust proxy", 1);

// Use memory storage for file uploads (we send to R2 directly)
app.use(fileUpload());

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Register routes
app.use("/api/users/", userRoutes);
app.use("/api/posts/", postRoutes);
app.use("/api/categories/", categoryRoutes);
app.use("/api/upload/", uploadRouter); // Cloudflare R2 upload route

// Error handling
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB
try {
  await connectToAvailableMongoDB();
} catch (err) {
  console.error(
    "❌ No MongoDB instance could be reached (offline or online both failed).",
  );
  process.exit(1);
}

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server Started on port ${PORT}`));
