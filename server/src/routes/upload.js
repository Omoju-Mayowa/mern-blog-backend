import express from "express";
import s3 from "../utils/r2Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!req.files || !req.files.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }

    const file = req.files.file;
    const ext = path.extname(file.name);
    const key = `mern/${crypto.randomUUID()}${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: key,
        Body: file.data,
        ContentType: file.mimetype,
      })
    );

    const fileUrl = `${process.env.CLOUDFLARE_R2_ASSETS_URL}/${key}`;
    res.json({ url: fileUrl });
  })
);

export default router;