const Room = require("../models/roomModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

const createResponse = (isError, message, data) => ({
    isError,
    message,
    data
});

const findOrCreateRoom = async ({ roomName, userId, isPrivate, password }) => {
    let room = await Room.findOne({ name: roomName });
    if (!room) {
        room = await Room.create({
            name: roomName,
            createdBy: userId,
            isPrivate,
            password,
            participants: {
                [userId]: {
                    isActive: true,
                    joinedOn: new Date(),
                }
            }
        });
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    [`rooms.${room._id}`]: { isAdmin: true, joinedOn: new Date(), name: roomName },
                },
            }
        );
        return createResponse(false, "Room Created", { room });
    }
    return createResponse(false, "Room Found", { room });
};


const checkRoomExists = async (roomName) => {
    const room = await Room.findOne({ name: roomName });
    return createResponse(false, "Room Existence Checked", { exists: !!room });
};

const joinRoom = async ({ roomName, userId }) => {
    const { data: { room } } = await findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
    const user = await User.findById(userId);

    if (!room.participants.has(userId)) {
        room.participants.set(userId, { isActive: true, joinedOn: new Date() });
        await room.save();
    }
    if (!user.rooms.has(room._id)) {
        user.rooms.set(room._id, { isAdmin: room.createdBy == user._id, joinedOn: new Date(), name: roomName });
        await user.save();
    }

    return createResponse(false, "Joined Room", { room });
};

const getRoomMessages = async ({ roomId, skip = 0, limit = 10 }) => {
    const messages = await Message.find({ roomId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const room = await Room.findById(roomId);
    return createResponse(false, "Messages Retrieved", { room, messages });
};

const postMessage = async ({ roomName, userId, text, replyTo }) => {
    const { data: { room } } = await findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
    console.log(roomName, userId, text, replyTo);
    if (!room.participants.has(userId.toString())) {
        console.log(room.participants)
        return createResponse(true, "Not a participant", null);
    }

    const msg = new Message({
        fromUser: userId,
        roomId: room._id,
        body: text,
        replyTo
    });
    await msg.save();
    return createResponse(false, "Message Sent", { room, messages: [msg] });
};

const updateRoom = async ({ roomName, userId, password, isPrivate }) => {
    const { data: { room } } = await findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
    if (!room || String(room.createdBy) !== String(userId)) {
        return createResponse(true, "No admin privileges", null);
    }

    room.password = password;
    room.isPrivate = isPrivate;
    await room.save();
    return createResponse(false, "Room Updated", { room });
};

const clearRoomMessages = async ({ roomName, userId }) => {
    const { data: { room } } = await findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
    if (!room || String(room.createdBy) !== userId) {
        return createResponse(true, "No admin privileges", null);
    }

    await Message.deleteMany({ roomId: room._id });
    return createResponse(false, "Room Messages Cleared", { room });
};

module.exports = {
    findOrCreateRoom,
    checkRoomExists,
    joinRoom,
    getRoomMessages,
    postMessage,
    updateRoom,
    clearRoomMessages,
};