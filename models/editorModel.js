import mongoose, { Schema, Document } from "mongoose";

const editorModel = Schema({
  name: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  isPrivate: { type: Boolean, default: false },
  password: { type: String },
  content: { type: String, default: "" },
  language: { type: String },
  participants: {
    type: Map,
    of: Date,
    default: new Map(),
  },
}, { timestamps: true });

const Editor = mongoose.model("Editor", editorModel);

module.exports = Editor;