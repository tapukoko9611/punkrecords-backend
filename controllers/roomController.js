const asyncHandler = require("express-async-handler");

const Room = require("../models/roomModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

const exists = asyncHandler(async (req, res) => {
    try {
        var { roomName } = req.params;
        var room = await Room.findOne({ roomName });
        res.status(201).json({
            status: room != null,
            token: req.token
        });
    } catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const find = async ({ roomName, userId, isPrivate, password }) => {
    try {
        var room = await Room.findOne({
            name: roomName,
        });

        if (!room) {
            room = await Room.create({
                name: roomName,
                createdBy: userId,
                isPrivate: isPrivate,
                password: password,
                participants: {
                    userId: {
                        isActive: true,
                        joinedOn: Date.now()
                    }
                }
            });

            await User.updateOne(
                { _id: userId },  // Find the user by their ID
                { $push: { createdRooms: room._id } }  // Push the new room ID
            );
        }
        return room;
    }
    catch (err) {
        throw new Error(err.message);
    }
};

const search = asyncHandler(async (req, res) => {
    try {
        var { roomName } = req.params;
        var userId = req.session;

        const room = await find({ roomName, userId, isPrivate: false, password: "" });

        res.status(201).json({
            room: room,
            message: "here you go"
        });
    } catch (err) {
        console.log(err);
        res.status(401);
        throw new Error(err.message);
    }
});

const join = asyncHandler(async (req, res) => {
    try {
        var { roomName } = req.params;
        var userId = req.session;

        const room = await find({ roomName, userId, isPrivate: false, password: "" });
        const user = await User.findById(userId);

        if (!room.participants.has(userId)) {
            room.participants.set(userId, {
                isActive: true,
                joinedOn: new Date()
            });
            await room.save();
        }
        if (!user.joinedRooms.has(room._id)) {
            user.joinedRooms.set(room._id, new Date());
            await user.save();
        }

        const messages = await Message.find({ roomId: room._id })
            .sort({ createdAt: -1 })
            .skip(Number(0))
            .limit(Number(50));

        res.status(201).json({
            message: "Joined",
            room: room,
            messages: messages
        });
    } catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const post = asyncHandler(async (req, res) => {
    try {
        var { text, roomName, replyTo } = req.body;
        var userId = req.session;

        const room = await find({ roomName, userId, isPrivate: false, password: "" });
        if (!room) {
            throw new Error("Problem");
        }
        if (!room.participants.has(userId)) {
            throw new Error("This is a private room");
        }

        const msg = new Message({
            fromUser: userId,
            roomId: room._id,
            body: text,
            replyTo: replyTo
        });
        await msg.save();

        res.status(201).json({
            message: msg,
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const get = asyncHandler(async (req, res) => {
    try {
        var { roomName, count } = req.params;
        var userId = req.session;

        const room = await find({ roomName, userId, isPrivate: false, password: "" });
        if (!room) {
            throw new Error("Problem");
        }

        const messages = await Message.find({ roomId: room._id })
            .sort({ createdAt: -1 })
            .skip(Number(count))
            .limit(Number(50));

        res.status(201).json({
            messages: messages
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const update = asyncHandler(async (req, res) => {
    try {
        var { roomName, password, isPrivate } = req.body;
        var userId = req.session;

        const room = await find({ roomName, userId, password: "", isPrivate: false });
        if (!room) {
            throw new Error("Problem");
        }
        if (room.createdBy != userId) {
            throw new Error("No admin prevallages");
        }

        room.password = password;
        room.isPrivate = isPrivate;
        await room.save();

        res.status(201).json({
            room: room
        });
    } catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const clear = asyncHandler(async (req, res) => {
    try {
        var { roomName } = req.body;
        var userId = req.session;

        const room = await find({ roomName, userId, password: "", isPrivate: false });
        if (!room) {
            throw new Error("Problem");
        }
        if (room.createdBy != userId) {
            throw new Error("No admin prevallages");
        }

        await Message.deleteMany({ roomId: room._id });

        res.status(201).json({
            message: "Done"
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

module.exports = { exists, search, join, get, post, update, clear };