const mongoose = require("mongoose");

const fileModel = new mongoose.Schema({
  name: {
    type: String,
  },
  fileUrl: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  },
  isPrivate: {
    type: Boolean, default: false
  },
  password: {
    type: String
  },
  fileType: {
    type: String,
  },
  fileSize: {
    type: Number,
  }, // 10MB limit
  downloads: {
    type: Number, default: 0
  },
  participants: {
    type: Map,
    of: new mongoose.Schema({
      isActive: { type: Boolean, default: true },
      joinedOn: { type: Date, default: Date.now },
    }),
    default: new Map(),
  },
}, { timestamps: true });

const File = mongoose.model("File", fileModel);

module.exports = File;
