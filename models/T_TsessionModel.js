const mongoose = require("mongoose");

const sessionModel = mongoose.Schema(
    {
        device: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
        },
        name: {
            type: String,
            default: "Who cares??"
        },
        type: {
            type: String,
        },
        time: {
            type: Date,
            default: Date.now(),
        },
    },
);

const Session = mongoose.model("Session", sessionModel);

module.exports = Session;