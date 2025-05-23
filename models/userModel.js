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
        rooms: { 
            type: Map,
            of: {
                isAdmin: { type: Boolean, default: false },
                joinedOn: { type: Date },
                name: { type: String }
            },
            default: {}
        },
        editors: { 
            type: Map,
            of: {
                isAdmin: { type: Boolean, default: false },
                joinedOn: { type: Date },
                name: { type: String }
            },
            default: {}
        },
        files: { 
            type: Map,
            of: {
                isAdmin: { type: Boolean, default: false },
                joinedOn: { type: Date },
                name: { type: String }
            },
            default: {}
        },
        calls: { 
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