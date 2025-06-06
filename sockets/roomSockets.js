const roomService = require("../services/roomService");

const setupRoomSockets = (io, socket, getUserId, getToken) => {
    // 1. Frontend asks for room info (check if exists or create)
    socket.on("room:search", async ({ roomName, token, privacy, password }) => {
        if (!getUserId()) return;

        try {
            const result = await roomService.findOrCreateRoom({roomName, userId: getUserId(), isPrivate:privacy, password: password});
            socket.emit("room:searched", result);
        } catch (error) {
            console.error("Error checking/creating room:", error);
            socket.emit("room:error", { isError: true, message: "Failed to check or create room", data: null });
        }
    });

    socket.on("room:update", async ({ roomName, privacy, password }) => {
        if (!getUserId()) return;

        try {
            const result = await roomService.updateRoom({roomName, userId: getUserId(), isPrivate:privacy, password: password});
            socket.emit("room:updated", result);
        } catch (error) {
            console.error("Error checking/creating room:", error);
            socket.emit("room:error", { isError: true, message: "Failed to check or create room", data: null });
        }
    });

    // 2. Frontend asks to join room
    socket.on("room:join", async ({ roomName, type="No", token: clientToken }) => {
        if (!getUserId()) return;

        try {
            const joinResult = await roomService.joinRoom({ roomName, userId: getUserId() });
            socket.join(`room-${joinResult.data.room._id.toString()}`);
            socket.emit("room:joined", {...joinResult, token: getToken(), type: type});
            
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
            const result = await roomService.postMessage({ roomName, userId: getUserId(), text, replyTo });
            if (!result.isError) {
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
            const result = await roomService.getRoomMessages({ roomId, skip: Number(skip) });
            socket.emit("room:messages:loadedMore", result);
        } catch (error) {
            console.error("Error loading more messages:", error);
            socket.emit("room:error", { isError: true, message: "Failed to load more messages", data: null });
        }
    });
};

module.exports = setupRoomSockets;