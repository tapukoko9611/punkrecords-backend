const asyncHandler = require("express-async-handler");

const Room = require("../models/roomModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

// // a common function to get/create a room w given roomname
// const find = async ({ roomName, userId, isPrivate, password }) => {
//     try {
//         var room = await Room.findOne({
//             name: roomName,
//         });

//         if (!room) {
//             room = await Room.create({
//                 name: roomName,
//                 createdBy: userId,
//                 isPrivate: isPrivate,
//                 password: password,
//                 participants: {
//                     userId: {
//                         isActive: true,
//                         joinedOn: Date.now()
//                     }
//                 }
//             });

//             await User.updateOne(
//                 { _id: userId },  // Find the user by their ID
//                 { $push: { createdRooms: room._id } }  // Push the new room ID
//             );
//         }
//         return room;
//     }
//     catch (err) {
//         throw new Error(err.message);
//     }
// };

// const joinService = asyncHandler(async ({ roomName, userId }) => {
//     try {
//         const room = await find({ roomName, userId, isPrivate: false, password: "" });
//         const user = await User.findById(userId);

//         if (!room.participants.has(userId)) {
//             room.participants.set(userId, {
//                 isActive: true,
//                 joinedOn: new Date()
//             });
//             await room.save();
//         }
//         if (!user.joinedRooms.has(room._id)) {
//             user.joinedRooms.set(room._id, new Date());
//             await user.save();
//         }

//         const messages = await Message.find({ roomId: room._id })
//             .sort({ createdAt: -1 })
//             .skip(Number(0))
//             .limit(Number(50));

//         // res.status(201).json({
//         //     message: "Joined",
//         //     room: room,
//         //     messages: messages
//         // });

//         return {
//             message: "Joined",
//             room: room,
//             messages: messages
//         }
//     } catch (err) {
//         // res.status(401);
//         throw new Error(err.message);
//     }
// });

// const postService = asyncHandler(async ({text, roomName, replyTo, userId}) => {
//     try {
//         const room = await find({ roomName, userId, isPrivate: false, password: "" });
//         if (!room) {
//             throw new Error("Problem");
//         }
//         if (!room.participants.has(userId)) {
//             throw new Error("This is a private room");
//         }

//         const msg = new Message({
//             fromUser: userId,
//             roomId: room._id,
//             body: text,
//             replyTo: replyTo
//         });
//         await msg.save();

//         // res.status(201).json({
//         //     message: msg,
//         // });
//         return {
//             message: msg
//         }
//     }
//     catch (err) {
//         // res.status(401);
//         throw new Error(err.message);
//     }
// });

// const getService = asyncHandler(async ({roomName, count, userId}) => {
//     try {

//         const room = await find({ roomName, userId, isPrivate: false, password: "" });
//         if (!room) {
//             throw new Error("Problem");
//         }

//         const messages = await Message.find({ roomId: room._id })
//             .sort({ createdAt: -1 })
//             .skip(Number(count))
//             .limit(Number(50));

//         return {
//             messages: messages
//         };
//     }
//     catch (err) {
//         throw new Error(err.message);
//     }
// });

// module.exports = { find, joinService, postService, getService }



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
        await User.updateOne({ _id: userId }, { $push: { createdRooms: room._id } });
        return createResponse(false, "Room Created", { room });
    }
    return createResponse(false, "Room Found", { room });
};

const checkRoomExists = async (roomName) => {
    const room = await Room.findOne({ name: roomName });
    return createResponse(false, "Room Existence Checked", { room });
};

const joinRoom = async ({ roomName, userId }) => {
    const { data: { room } } = await findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
    const user = await User.findById(userId);

    if (!room.participants.has(userId)) {
        room.participants.set(userId, { isActive: true, joinedOn: new Date() });
        await room.save();
    }
    if (!user.joinedRooms.has(room._id)) {
        user.joinedRooms.set(room._id, new Date());
        await user.save();
    }

    return createResponse(false, "Joined Room", { room });
};

const getRoomMessages = async ({ roomId, skip = 0, limit = 50 }) => {
    const messages = await Message.find({ roomId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    return createResponse(false, "Messages Retrieved", { messages });
};

const postMessage = async ({ roomName, userId, text, replyTo }) => {
    const { data: { room } } = await findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
    if (!room.participants.has(userId)) {
        return createResponse(true, "Not a participant", null);
    }

    const msg = new Message({
        fromUser: userId,
        roomId: room._id,
        body: text,
        replyTo
    });
    await msg.save();
    return createResponse(false, "Message Sent", { message: msg });
};

const updateRoom = async ({ roomName, userId, password, isPrivate }) => {
    const { data: { room } } = await findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
    if (!room || String(room.createdBy) !== userId) {
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
    return createResponse(false, "Room Messages Cleared", null);
};


// const findOrCreateRoom = async ({ roomName, userId, isPrivate, password }) => {
//     let room = await Room.findOne({ name: roomName });
//     if (!room) {
//         room = await Room.create({
//             name: roomName,
//             createdBy: userId,
//             isPrivate,
//             password,
//             participants: {
//                 [userId]: {
//                     isActive: true,
//                     joinedOn: new Date(),
//                 }
//             }
//         });
//         await User.updateOne({ _id: userId }, { $push: { createdRooms: room._id } });
//     }
//     return room;
// };

// const checkRoomExists = async (roomName) => {
//     return await Room.findOne({ name: roomName });
// };

// const joinRoom = async ({ roomName, userId }) => {
//     const room = await findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
//     const user = await User.findById(userId);

//     if (!room.participants.has(userId)) {
//         room.participants.set(userId, { isActive: true, joinedOn: new Date() });
//         await room.save();
//     }
//     if (!user.joinedRooms.has(room._id)) {
//         user.joinedRooms.set(room._id, new Date());
//         await user.save();
//     }

//     return room;
// };

// const getRoomMessages = async ({ roomId, skip = 0, limit = 50 }) => {
//     return await Message.find({ roomId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
// };

// const postMessage = async ({ roomName, userId, text, replyTo }) => {
//     const room = await findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
//     if (!room.participants.has(userId)) throw new Error("Not a participant");

//     const msg = new Message({
//         fromUser: userId,
//         roomId: room._id,
//         body: text,
//         replyTo
//     });
//     await msg.save();
//     return msg;
// };

// const updateRoom = async ({ roomName, userId, password, isPrivate }) => {
//     const room = await findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
//     if (!room || String(room.createdBy) !== userId) throw new Error("No admin privileges");

//     room.password = password;
//     room.isPrivate = isPrivate;
//     await room.save();
//     return room;
// };

// const clearRoomMessages = async ({ roomName, userId }) => {
//     const room = await findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
//     if (!room || String(room.createdBy) !== userId) throw new Error("No admin privileges");

//     await Message.deleteMany({ roomId: room._id });
//     return true;
// };

module.exports = {
    findOrCreateRoom,
    checkRoomExists,
    joinRoom,
    getRoomMessages,
    postMessage,
    updateRoom,
    clearRoomMessages,
};