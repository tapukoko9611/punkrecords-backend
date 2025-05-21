const asyncHandler = require("express-async-handler");
const roomService = require("../services/roomService");

// const Room = require("../models/roomModel");
// const Message = require("../models/messageModel");
// const User = require("../models/userModel");
// const { find, joinService, postService } = require("../services/roomService")


// // a common function to get/create a room w given roomname
// // const find = async ({ roomName, userId, isPrivate, password }) => {
// //     try {
// //         var room = await Room.findOne({
// //             name: roomName,
// //         });

// //         if (!room) {
// //             room = await Room.create({
// //                 name: roomName,
// //                 createdBy: userId,
// //                 isPrivate: isPrivate,
// //                 password: password,
// //                 participants: {
// //                     userId: {
// //                         isActive: true,
// //                         joinedOn: Date.now()
// //                     }
// //                 }
// //             });

// //             await User.updateOne(
// //                 { _id: userId },  // Find the user by their ID
// //                 { $push: { createdRooms: room._id } }  // Push the new room ID
// //             );
// //         }
// //         return room;
// //     }
// //     catch (err) {
// //         throw new Error(err.message);
// //     }
// // };

// // used to quickly look up if a room w that name exists during custom room creation.
// const exists = asyncHandler(async (req, res) => {
//     try {
//         var { roomName } = req.params;
//         var room = await Room.findOne({ name: roomName });
//         res.status(201).json({
//             status: room != null,
//             token: req.token
//         });
//     } catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // called upon state init to get a room details
// const search = asyncHandler(async (req, res) => {
//     try {
//         var { roomName } = req.params;
//         var userId = req.session;

//         const room = await find({ roomName, userId, isPrivate: false, password: "" });

//         res.status(201).json({
//             room: room,
//             message: "here you go"
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // request to join the room
// // const join = asyncHandler(async (req, res) => {
// //     try {
// //         var { roomName } = req.params;
// //         var userId = req.session;

// //         const room = await find({ roomName, userId, isPrivate: false, password: "" });
// //         const user = await User.findById(userId);

// //         if (!room.participants.has(userId)) {
// //             room.participants.set(userId, {
// //                 isActive: true,
// //                 joinedOn: new Date()
// //             });
// //             await room.save();
// //         }
// //         if (!user.joinedRooms.has(room._id)) {
// //             user.joinedRooms.set(room._id, new Date());
// //             await user.save();
// //         }

// //         const messages = await Message.find({ roomId: room._id })
// //             .sort({ createdAt: -1 })
// //             .skip(Number(0))
// //             .limit(Number(50));

// //         res.status(201).json({
// //             message: "Joined",
// //             room: room,
// //             messages: messages
// //         });
// //     } catch (err) {
// //         res.status(401);
// //         throw new Error(err.message);
// //     }
// // });
// const join = asyncHandler(async (req, res) => {
//     try {
//         var { roomName } = req.params;
//         var userId = req.session;

//         const result = await joinService({roomName, userId});

//         res.status(201).json(result);
//     } catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // called to post a messsage to room (can be used w sockets?)
// // const post = asyncHandler(async (req, res) => {
// //     try {
// //         var { text, roomName, replyTo } = req.body;
// //         var userId = req.session;

// //         const room = await find({ roomName, userId, isPrivate: false, password: "" });
// //         if (!room) {
// //             throw new Error("Problem");
// //         }
// //         if (!room.participants.has(userId)) {
// //             throw new Error("This is a private room");
// //         }

// //         const msg = new Message({
// //             fromUser: userId,
// //             roomId: room._id,
// //             body: text,
// //             replyTo: replyTo
// //         });
// //         await msg.save();

// //         res.status(201).json({
// //             message: msg,
// //         });
// //     }
// //     catch (err) {
// //         res.status(401);
// //         throw new Error(err.message);
// //     }
// // });
// const post = asyncHandler(async (req, res) => {
//     try {
//         var { text, roomName, replyTo } = req.body;
//         var userId = req.session;

//         const result = await postService({text, roomName, replyTo, userId});

//         res.status(201).json(result);
//     }
//     catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // used to get 50 messages after skipping already existing messages
// // const get = asyncHandler(async (req, res) => {
// //     try {
// //         var { roomName, count } = req.params;
// //         var userId = req.session;

// //         const room = await find({ roomName, userId, isPrivate: false, password: "" });
// //         if (!room) {
// //             throw new Error("Problem");
// //         }

// //         const messages = await Message.find({ roomId: room._id })
// //             .sort({ createdAt: -1 })
// //             .skip(Number(count))
// //             .limit(Number(50));

// //         res.status(201).json({
// //             messages: messages
// //         });
// //     }
// //     catch (err) {
// //         res.status(401);
// //         throw new Error(err.message);
// //     }
// // });
// const get = asyncHandler(async (req, res) => {
//     try {
//         var { roomName, count } = req.params;
//         var userId = req.session;

//         const result = await getService({roomName, count, userId});

//         res.status(201).json(result);
//     }
//     catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // used to modify room metadata
// const update = asyncHandler(async (req, res) => {
//     try {
//         var { roomName, password, isPrivate } = req.body;
//         var userId = req.session;

//         const room = await find({ roomName, userId, password: "", isPrivate: false });
//         if (!room) {
//             throw new Error("Problem");
//         }
//         if (room.createdBy != userId) {
//             throw new Error("No admin prevallages");
//         }

//         room.password = password;
//         room.isPrivate = isPrivate;
//         await room.save();

//         res.status(201).json({
//             room: room
//         });
//     } catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // used to clear messages in a room
// const clear = asyncHandler(async (req, res) => {
//     try {
//         var { roomName } = req.body;
//         var userId = req.session;

//         const room = await find({ roomName, userId, password: "", isPrivate: false });
//         if (!room) {
//             throw new Error("Problem");
//         }
//         if (room.createdBy != userId) {
//             throw new Error("No admin prevallages");
//         }

//         await Message.deleteMany({ roomId: room._id });

//         res.status(201).json({
//             message: "Done"
//         });
//     }
//     catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// module.exports = { exists, search, join, get, post, update, clear };



const exists = asyncHandler(async (req, res) => {
    const { roomName } = req.params;
    const result = await roomService.checkRoomExists(roomName);
    res.status(200).json({ token: req.token, ...result });
});

const search = asyncHandler(async (req, res) => {
    const { roomName } = req.params;
    const userId = req.session;
    const result = await roomService.findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
    res.status(200).json({ token: req.token, ...result });
});

const join = asyncHandler(async (req, res) => {
    const { roomName } = req.params;
    const userId = req.session;
    const result = await roomService.joinRoom({ roomName, userId });
    // const messagesResult = await roomService.getRoomMessages({ roomId: result.data.room._id });
    res.status(200).json({ token: req.token, ...result });
});

const get = asyncHandler(async (req, res) => {
    const { roomName, count } = req.params;
    const userId = req.session;
    const roomResult = await roomService.findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
    const messagesResult = await roomService.getRoomMessages({ roomId: roomResult.data.room._id, skip: Number(count) });
    res.status(200).json({ token: req.token, ...roomResult, data: { ...roomResult.data, ...messagesResult.data } });
});

const post = asyncHandler(async (req, res) => {
    const { roomName, text, replyTo } = req.body;
    const userId = req.session;
    const result = await roomService.postMessage({ roomName, userId, text, replyTo });
    res.status(200).json({ token: req.token, ...result });
});

const update = asyncHandler(async (req, res) => {
    const { roomName, password, isPrivate } = req.body;
    const userId = req.session;
    const result = await roomService.updateRoom({ roomName, userId, password, isPrivate });
    res.status(200).json({ token: req.token, ...result });
});

const clear = asyncHandler(async (req, res) => {
    const { roomName } = req.body;
    const userId = req.session;
    const result = await roomService.clearRoomMessages({ roomName, userId });
    res.status(200).json({ token: req.token, ...result });
});


// const exists = asyncHandler(async (req, res) => {
//     try {
//         const { roomName } = req.params;
//         const room = await roomService.checkRoomExists(roomName);
//         res.status(200).json({
//             token: req.token,
//             isError: fasle,
//             message: room == null,
//             data: {
//                 room: room,
//                 messages: []
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// const search = asyncHandler(async (req, res) => {
//     try {
//         const { roomName } = req.params;
//         const userId = req.session;
//         const room = await roomService.findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
//         res.status(200).json({
//             token: req.token,
//             isError: fasle,
//             message: "Room Found",
//             data: {
//                 room: room,
//                 messages: []
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// const join = asyncHandler(async (req, res) => {
//     try {
//         const { roomName } = req.params;
//         const userId = req.session;
//         const room = await roomService.joinRoom({ roomName, userId });
//         const messages = await roomService.getRoomMessages({ roomId: room._id });
//         res.status(200).json({
//             token: req.token,
//             isError: fasle,
//             message: "Joined Room",
//             data: {
//                 room: room,
//                 messages: messages
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// const get = asyncHandler(async (req, res) => {
//     try {
//         const { roomName, count } = req.params;
//         const userId = req.session;
//         const room = await roomService.findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
//         const messages = await roomService.getRoomMessages({ roomId: room._id, skip: Number(count) });
//         res.status(200).json({
//             token: req.token,
//             isError: fasle,
//             message: "Messages",
//             data: {
//                 room: room,
//                 messages: messages
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// const post = asyncHandler(async (req, res) => {
//     try {
//         const { roomName, text, replyTo } = req.body;
//         const userId = req.session;
//         const message = await roomService.postMessage({ roomName, userId, text, replyTo });
//         res.status(200).json({
//             token: req.token,
//             isError: fasle,
//             message: "Message",
//             data: {
//                 room: room,
//                 messages: [message]
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// const update = asyncHandler(async (req, res) => {
//     try {
//         const { roomName, password, isPrivate } = req.body;
//         const userId = req.session;
//         const room = await roomService.updateRoom({ roomName, userId, password, isPrivate });
//         res.status(200).json({
//             token: req.token,
//             isError: fasle,
//             message: "Updated",
//             data: {
//                 room: room,
//                 messages: []
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// const clear = asyncHandler(async (req, res) => {
//     try {
//         const { roomName } = req.body;
//         const userId = req.session;
//         await roomService.clearRoomMessages({ roomName, userId });
//         res.status(200).json({
//             token: req.token,
//             isError: fasle,
//             message: "Cleared",
//             data: {
//                 room: null,
//                 messages: []
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

module.exports = { exists, search, join, get, post, update, clear };