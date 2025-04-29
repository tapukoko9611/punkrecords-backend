const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
    {
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room"
        },
        body: {
            type: String,
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model("Message", messageModel);

module.exports = Message;