const asyncHandler = require("express-async-handler");

const Device = require("../models/deviceModel");
const Session = require("../models/sessionModel");
const Room = require("../models/roomModel");

const find = async (roomId) => {
    try {
        var room = await Room.findOne({
            name: roomId,
        });

        if(!room) {
            room = await Room.create({
                name: roomId,
            });
        }

        return room;
    }
    catch (err) {
        return null;
    }
};

const post = asyncHandler ( async (req, res) => {
    try {
        var roomId = req.params.roomId;
        var { text } = req.body;

        const room = await find(roomId);
        if (!room) {
            throw new Error("Problem");
        }

        room.chat = [
            ...room.chat, 
            {
                session: req.session,
                text: text,
            },
        ];
        await room.save();

        res.status(201).json({
            chat: {
                session: req.session,
                text: text,
            },
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const get = asyncHandler ( async (req, res) => {
    try {
        var roomId = req.params.roomId;

        const room = await find(roomId);
        if (!room) {
            throw new Error("Problem");
        }

        res.status(201).json({
            token: req.token,
            session: req.session,
            chat: room.chat,
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
}); 

const clear = asyncHandler ( async (req, res) => {
    try {
        var roomId = req.params.roomId;

        const room = await find(roomId);
        if (!room) {
            throw new Error("Problem");
        }

        room.chat = [
            {
                session: req.session,
                text: `${req.session._id} cleared the chat`,
            }
        ];
        await room.save();

        res.status(201).json({
            chat: room.chat,
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

module.exports = { get, post, clear };