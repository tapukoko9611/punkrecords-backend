import mongoose, { Schema, Document } from "mongoose";

const fileModel = new Schema({
  name: { 
    type: String, },
  filePath: { 
    type: String, },
  fileType: { 
    type: String, },
  fileSize: { 
    type: Number, }, // 10MB limit
  createdBy: { 
    type: Schema.Types.ObjectId, ref: "User" },
  expiresAt: { 
    type: Date, },
  isPrivate: { 
    type: Boolean, default: false },
  password: { 
    type: String },
  downloads: { 
    type: Number, default: 0 },
}, { timestamps: true });

const File = mongoose.model("File", fileModel);

module.exports = File;
