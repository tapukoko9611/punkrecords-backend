const roomService = require("../services/roomService");
const { createGuestUser } = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


const setupRoomSockets = (io, socket, getUserId, getToken) => {
    // 1. Frontend asks for room info (check if exists or create)
    socket.on("room:search", async ({ roomName, token, privacy, password }) => {
        if (!getUserId()) return;

        try {
            console.log("socket - Searching room");
            const result = await roomService.findOrCreateRoom({roomName, userId: getUserId(), isPrivate:privacy, password: password});
            socket.emit("room:searched", result);
            console.log("socket - Searched room");
        } catch (error) {
            console.error("Error checking/creating room:", error);
            socket.emit("room:error", { isError: true, message: "Failed to check or create room", data: null });
        }
    });

    // 2. Frontend asks to join room
    socket.on("room:join", async ({ roomName, token: clientToken }) => {
        if (!getUserId()) return;

        try {
            console.log("socket - Joining room");
            const joinResult = await roomService.joinRoom({ roomName, userId: getUserId() });
            socket.join(`room-${joinResult.data.room._id.toString()}`);
            socket.emit("room:joined", {...joinResult, token: getToken()});
            console.log("socket - Joined room");
            
            socket.to(`room-${joinResult.data.room._id.toString()}`).emit("user:joined", { userId: getUserId() });
        } catch (error) {
            console.error("Error joining room:", error);
            socket.emit("room:error", { isError: true, message: "Failed to join room", data: null });
        }
    });

    // 3. Frontend asks for initial/latest messages
    socket.on("room:messages:initial", async ({ roomId, token }) => {
        if (!getUserId()) return;

        try {
            console.log("socket - Get initial messages");
            const result = await roomService.getRoomMessages({ roomId });
            socket.emit("room:messages:initial", result);
            console.log("socket - Given initial messages");
        } catch (error) {
            console.error("Error fetching initial messages:", error);
            socket.emit("room:error", { isError: true, message: "Failed to fetch initial messages", data: null });
        }
    });

    // 4. Frontend sends a new message
    socket.on("room:message:send", async ({ roomName, text, replyTo, token }) => {
        if (!getUserId()) return;

        try {
            console.log("socket - Send message");
            const result = await roomService.postMessage({ roomName, userId: getUserId(), text, replyTo });
            if (!result.isError) {
            console.log("socket - Sent message");
                io.to(`room-${result.data.messages[0].roomId.toString()}`).emit("room:message:new", result.data.messages); // Emit the message data
            } else {
                socket.emit("room:error", result);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("room:error", { isError: true, message: "Failed to send message", data: null });
        }
    });

    // 5. Frontend asks for more previous messages (pagination)
    socket.on("room:messages:loadMore", async ({ roomId, skip, token }) => {
        if (!getUserId()) return;

        try {
            console.log("socket - More messages");
            const result = await roomService.getRoomMessages({ roomId, skip: Number(skip) });
            console.log("socket - Mored messages");
            socket.emit("room:messages:loadedMore", result);
        } catch (error) {
            console.error("Error loading more messages:", error);
            socket.emit("room:error", { isError: true, message: "Failed to load more messages", data: null });
        }
    });
};

module.exports = setupRoomSockets;