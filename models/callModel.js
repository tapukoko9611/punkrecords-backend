const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        trim: true
    },
    participants: {
        type: Map, // userId: { joinedOn: Date, isActive: Boolean }
        of: {
            joinedOn: { type: Date, default: Date.now },
            isActive: { type: Boolean, default: true }
        },
        default: {}
    },
    startedAt: {
        type: Date
    },
    endedAt: {
        type: Date
    }
}, { timestamps: true });

const Call = mongoose.model('Call', callSchema);

module.exports = Call;