const mongoose = require("mongoose");

const userModel = mongoose.Schema(
    {
        userName: {
            type: String,
        },
        password: {
            type: String,
        },
        code: {
            type: String,
        },
        type: {
            type: String,
            default: "Guest"
        },
        createdRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
        joinedRooms: {
            type: Map,
            of: Date
        },
        joinedCalls: {
            type: Map,
            of: String
        },
        joinedEditors: {
            type: Map,
            of: Date
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userModel);

module.exports = User;