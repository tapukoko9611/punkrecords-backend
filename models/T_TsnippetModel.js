const mongoose = require("mongoose");

const snippetModel = mongoose.Schema(
    {
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
        },
        storage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Storage"
        },
        name: {
            type: String,
        },
        status: {
            type: String,
        },
        body: {
            type: String,
        },
        time: {
            type: Date,
            default: Date.now,
        },
    },
);

const Snippet = mongoose.model("Snippet", snippetModel);

module.exports = Snippet;