import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import xssClean from "xss-clean";

import { connectToAvailableMongoDB } from "./src/utils/db.js";
import __dirname from "./src/utils/directory.js";
import userRoutes from "./src/routes/userRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import uploadRouter from "./src/routes/upload.js"; // R2 upload route
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, slow down." },
  skip: (req) => {
    return req.path.includes("/post/stream");
  }
})

// ────────────────────────────────────────────────────────────
// ⚙️ Express setup
// ────────────────────────────────────────────────────────────

export const app = express();

const normalize = (s="") => s.trim().replace(/\/$/, "")
const allowedOrigins = (process.env.SITE_LINK || "")
  .split(',')
  .map(normalize)
  .filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(normalize(origin))) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"]
}));



console.log(process.env.NODE_ENV)


app.set("trust proxy", 1);
app.use(express.json({ extended: true, limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use(cookieParser())
app.use(globalLimiter)
app.use(mongoSanitize())
app.use(xssClean())

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
