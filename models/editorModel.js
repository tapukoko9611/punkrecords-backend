const mongoose = require("mongoose");

const editorModel = mongoose.Schema({
  name: { 
    type: String, 
    required: true },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
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
                of: new mongoose.Schema({
                    isActive: { type: Boolean, default: true },
                    joinedOn: { type: Date, default: Date.now },
                }),
                default: new Map(),
            },
}, { timestamps: true });

const Editor = mongoose.model("Editor", editorModel);

module.exports = Editor;