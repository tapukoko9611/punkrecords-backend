const mongoose = require("mongoose");

const deviceModel = mongoose.Schema(
    {
        name: {
            type: String,
            default: "Who caares",
        },
        ip_addr: {
            type: String,
        },
        time: {
            type: Date,
            default: Date.now(),
        },
        sessions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Session",
            },
        ],
    },
);

const Device = mongoose.model("Device", deviceModel);

module.exports = Device;