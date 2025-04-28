const mongoose = require("mongoose");

const roomModel = mongoose.Schema(
    {
        name: {
            type: String,
        },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", },
        isPrivate: { type: Boolean, default: false },
        password: { type: String },
        // time: {
        //     type: Date,
        //     default: Date.now,
        // },
        // data: [
        //     {
        //         type:mongoose.Schema.Types.ObjectId,
        //         ref: "Message",
        //     },
        // ],
        // chat: [
        //     {
        //         session: {
        //             type: mongoose.Schema.Types.ObjectId,
        //             ref: "Session",
        //         },
        //         text: {
        //             type: String,
        //         },
        //         time: {
        //             type: Date,
        //             default: Date.now,
        //         },
        //     },
        // ],
        participants: {
            type: Map,
            of: new Schema({
                isActive: { type: Boolean, default: true },
                joinedOn: { type: Date, default: Date.now },
            }),
            default: new Map(),
        },
        activeCall: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const Room = mongoose.model("Room", roomModel);

module.exports = Room;