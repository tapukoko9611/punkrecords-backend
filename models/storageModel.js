const mongoose = require("mongoose");

const storageModel = mongoose.Schema(
    {
        name: {
            type: String,
        },
        time: {
            type: Date,
            default: Date.now,
        },
        database: [
            {
                session: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Session",
                },
                name: {
                    type: String,
                },
                status: {
                    type: String,
                },
                data: {
                    type: String,
                },
                time: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
);

const Storage = mongoose.model("Storage", storageModel);

module.exports = Storage;