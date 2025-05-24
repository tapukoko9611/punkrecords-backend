const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isPrivate: {
        type: Boolean
    },
    password: {
        type: String
    },
    participants: {
        type: Map, // userId: { joinedOn: Date, isActive: Boolean }
        of: {
            joinedOn: { type: Date, default: Date.now },
            isActive: { type: Boolean, default: true }
        },
        default: {}
    },
}, { timestamps: true });

const Call = mongoose.model('Call', callSchema);

module.exports = Call;