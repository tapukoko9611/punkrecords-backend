import mongoose, { Schema, Document } from "mongoose";

const editorModel = Schema({
  name: { 
    type: String, 
    required: true },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: "User" },
  isPrivate: { 
    type: Boolean  },
  password: { 
    type: String },
  content: { 
    type: String,},
  language: { 
    type: String },
  participants: {
    type: Map,
    of: Date,
    default: new Map(),
  },
}, { timestamps: true });

const Editor = mongoose.model("Editor", editorModel);

module.exports = Editor;