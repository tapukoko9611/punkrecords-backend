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
            default: "Immigrant" // only 2 options - Immigrant (guest user) & User (authenticated user)
        },
        rooms: { // roomId: { isAdmin: Boolean, joinedOn: Date, name: String }
            type: Map,
            of: {
                isAdmin: { type: Boolean, default: false },
                joinedOn: { type: Date },
                name: { type: String }
            },
            default: {}
        },
        editors: { // editorId: { isAdmin: Boolean, joinedOn: Date, name: String }
            type: Map,
            of: {
                isAdmin: { type: Boolean, default: false },
                joinedOn: { type: Date },
                name: { type: String }
            },
            default: {}
        },
        files: { // fileId: { isAdmin: Boolean, joinedOn: Date, name: String }
            type: Map,
            of: {
                isAdmin: { type: Boolean, default: false },
                joinedOn: { type: Date },
                name: { type: String }
            },
            default: {}
        },
        calls: { // callId: { isAdmin: Boolean, joinedOn: Date, name: String }
            type: Map,
            of: {
                isAdmin: { type: Boolean, default: false },
                joinedOn: { type: Date },
                name: { type: String }
            },
            default: {}
        },
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userModel);

module.exports = User;