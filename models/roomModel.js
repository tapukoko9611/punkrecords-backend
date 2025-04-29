const mongoose = require("mongoose");

const roomModel = mongoose.Schema(
    {
        name: {
            type: String,
        },
        createdBy: { 
            type: mongoose.Schema.Types.ObjectId, ref: "User", },
        isPrivate: { 
            type: Boolean, },
        password: { 
            type: String },
        participants: {
            type: Map,
            of: new mongoose.Schema({
                isActive: { type: Boolean, default: true },
                joinedOn: { type: Date, default: Date.now },
            }),
            default: new Map(),
        },
        activeCall: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const Room = mongoose.model("Room", roomModel);

module.exports = Room;