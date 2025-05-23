const asyncHandler = require("express-async-handler");
const roomService = require("../services/roomService");

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

module.exports = { exists, search, join, get, post, update, clear };