const mongoose = require("mongoose");

const addaModel = mongoose.Schema(
    {
        name: {
            type: String,
        },
        time: {
            type: Date,
            default: Date.now,
        },
        // data: [
        //     {
        //         type:mongoose.Schema.Types.ObjectId,
        //         ref: "Message",
        //     },
        // ],
        chat: [
            {
                session: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Session",
                },
                text: {
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

const Adda = mongoose.model("Adda", addaModel);

module.exports = Adda;