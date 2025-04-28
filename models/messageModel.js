const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
    {
        // session: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Session",
        // },
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