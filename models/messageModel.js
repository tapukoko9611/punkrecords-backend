const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
    {
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
        },
        adda: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Adda"
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

const Message = mongoose.model("Message", messageModel);

module.exports = Message;