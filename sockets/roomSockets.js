const roomService = require("../services/roomService");
const { createGuestUser } = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


const setupRoomSockets = (io, socket, userId) => {
    // 1. Frontend asks for room info (check if exists or create)
    socket.on("room:check", async ({ roomName, token }) => {
        // We should have userId available from the main connection handler
        if (!userId) return;

        try {
            const result = await roomService.checkRoomExists(roomName);
            socket.emit("room:checked", result);
        } catch (error) {
            console.error("Error checking/creating room:", error);
            socket.emit("room:error", { isError: true, message: "Failed to check or create room", data: null });
        }
    });

    // 2. Frontend asks to join room
    socket.on("room:join", async ({ roomName, token: clientToken }) => {
        if (!userId) return;

        try {
            const joinResult = await roomService.joinRoom({ roomName, userId });
            socket.join(joinResult.data.room._id.toString()); // Join the Socket.IO room
            socket.emit("room:joined", {...joinResult, token});
            // Optionally emit to others in the room that a user joined
            socket.to(joinResult.data.room._id.toString()).emit("user:joined", { userId });
        } catch (error) {
            console.error("Error joining room:", error);
            socket.emit("room:error", { isError: true, message: "Failed to join room", data: null });
        }
    });

    // 3. Frontend asks for initial/latest messages
    socket.on("room:messages:initial", async ({ roomId, token }) => {
        if (!userId) return;

        try {
            const result = await roomService.getRoomMessages({ roomId });
            socket.emit("room:messages:initial", result);
        } catch (error) {
            console.error("Error fetching initial messages:", error);
            socket.emit("room:error", { isError: true, message: "Failed to fetch initial messages", data: null });
        }
    });

    // 4. Frontend sends a new message
    socket.on("room:message:send", async ({ roomName, text, replyTo, token }) => {
        if (!userId) return;

        try {
            const result = await roomService.postMessage({ roomName, userId, text, replyTo });
            if (!result.isError) {
                io.to(result.data.message.roomId.toString()).emit("room:message:new", result.data.message); // Emit the message data
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
        if (!userId) return;

        try {
            const result = await roomService.getRoomMessages({ roomId, skip: Number(skip) });
            socket.emit("room:messages:loadMore", result);
        } catch (error) {
            console.error("Error loading more messages:", error);
            socket.emit("room:error", { isError: true, message: "Failed to load more messages", data: null });
        }
    });
};


// const setupRoomSockets = (io, socket, userId) => {
//     // 1. Frontend asks for room info (check if exists or create)
//     socket.on("room:check", async ({ roomName, token }) => {
//         // We should have userId available from the main connection handler
//         if (!userId) return;

//         try {
//             const roomExists = await roomService.checkRoomExists(roomName);
//             if (roomExists) {
//                 socket.emit("room:checked", { room: roomExists });
//             } else {
//                 const newRoom = await roomService.findOrCreateRoom({ roomName, userId, isPrivate: false, password: "" });
//                 socket.emit("room:checked", { room: newRoom });
//             }
//         } catch (error) {
//             console.error("Error checking/creating room:", error);
//             socket.emit("room:error", { message: "Failed to check or create room" });
//         }
//     });

//     // 2. Frontend asks to join room
//     socket.on("room:join", async ({ roomName, token }) => {
//         if (!userId) return;

//         try {
//             const room = await roomService.joinRoom({ roomName, userId });
//             socket.join(room._id.toString()); // Join the Socket.IO room
//             socket.emit("room:joined", { roomId: room._id });
//             // Optionally emit to others in the room that a user joined
//             socket.to(room._id.toString()).emit("user:joined", { userId });
//         } catch (error) {
//             console.error("Error joining room:", error);
//             socket.emit("room:error", { message: "Failed to join room" });
//         }
//     });

//     // 3. Frontend asks for initial/latest messages
//     socket.on("room:messages:initial", async ({ roomId, token }) => {
//         if (!userId) return;

//         try {
//             const messages = await roomService.getRoomMessages({ roomId });
//             socket.emit("room:messages:initial", { roomId, messages });
//         } catch (error) {
//             console.error("Error fetching initial messages:", error);
//             socket.emit("room:error", { message: "Failed to fetch initial messages" });
//         }
//     });

//     // 4. Frontend sends a new message
//     socket.on("room:message:send", async ({ roomName, text, replyTo, token }) => {
//         if (!userId) return;

//         try {
//             const message = await roomService.postMessage({ roomName, userId, text, replyTo });
//             io.to(message.roomId.toString()).emit("room:message:new", message); // Emit to all in the room
//         } catch (error) {
//             console.error("Error sending message:", error);
//             socket.emit("room:error", { message: "Failed to send message" });
//         }
//     });

//     // 5. Frontend asks for more previous messages (pagination)
//     socket.on("room:messages:loadMore", async ({ roomId, skip, token }) => {
//         if (!userId) return;

//         try {
//             const messages = await roomService.getRoomMessages({ roomId, skip: Number(skip) });
//             socket.emit("room:messages:loadMore", { roomId, messages });
//         } catch (error) {
//             console.error("Error loading more messages:", error);
//             socket.emit("room:error", { message: "Failed to load more messages" });
//         }
//     });
// };

module.exports = setupRoomSockets;