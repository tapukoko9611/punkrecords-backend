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
            default: "Immigrant"
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
        createdEditors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Editor" }],
        joinedEditors: {
            type: Map,
            of: Date
        },
        createdFiles: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
        joinedFiles: {
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