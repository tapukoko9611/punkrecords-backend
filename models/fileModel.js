import mongoose, { Schema, Document } from "mongoose";

const fileModel = new Schema({
  name: { type: String, required: true },
  filePath: { type: String, required: true, unique: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true, max: 10 * 1024 * 1024 }, // 10MB limit
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true },
  isPrivate: { type: Boolean, default: false },
  password: { type: String },
  downloads: { type: Number, default: 0 },
}, { timestamps: true });

FileSchema.index({ filePath: 1 });
FileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
