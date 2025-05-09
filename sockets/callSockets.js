const callService = require('../services/callService');

// const setupCallSockets = (io, socket, userId) => {
//     // 1. Frontend asks for call info (check if exists or create)
//     socket.on("call:check", async ({ callName, token }) => {
//         if (!userId) return;
//         try {
//             const result = await callService.checkCallExists(callName);
//             socket.emit("call:checked", result);
//         } catch (error) {
//             console.error("Error checking/creating call:", error);
//             socket.emit("call:error", { isError: true, message: "Failed to check or create call", data: null });
//         }
//     });

//     // 2. Frontend asks to join call
//     socket.on("call:join", async ({ callName, token: clientToken }) => {
//         if (!userId) return;
//         try {
//             const result = await callService.joinCall({ callName, userId });
//             socket.join(`call-${result.data.call._id.toString()}`);
//             socket.emit("call:joined", {...result, token});
//             socket.to(`call-${result.data.call._id.toString()}`).emit("user:joined:call", { userId });
//         } catch (error) {
//             console.error("Error joining call:", error);
//             socket.emit("call:error", { isError: true, message: "Failed to join call", data: null });
//         }
//     });

//     // 3. Frontend requests call details
//     socket.on("call:get", async ({ callName, token }) => {
//         if (!userId) return;
//         try {
//             const result = await callService.getCallDetails(callName);
//             socket.emit("call:details", result);
//         } catch (error) {
//             console.error("Error getting call details:", error);
//             socket.emit("call:error", { isError: true, message: "Failed to get call details", data: null });
//         }
//     });

//     // 4. Frontend updates call metadata
//     socket.on("call:meta:update", async ({ callName, password, isPrivate, token }) => {
//         if (!userId) return;
//         try {
//             const result = await callService.updateCallMeta({ callName, userId, password, isPrivate });
//             socket.emit("call:meta:updated", result);
//             io.to(`call-${result.data.call._id.toString()}`).emit("call:updated", { isPrivate: result.data.call.isPrivate });
//         } catch (error) {
//             console.error("Error updating call metadata:", error);
//             socket.emit("call:error", { isError: true, message: "Failed to update call metadata", data: null });
//         }
//     });

//     // 5. Frontend leaves the call
//     socket.on("call:leave", async ({ callName, token }) => {
//         if (!userId) return;
//         try {
//             const result = await callService.leaveCall({ callName, userId });
//             socket.leave(`call-${result.data.call._id.toString()}`);
//             socket.emit("call:left", result);
//             socket.to(`call-${result.data.call._id.toString()}`).emit("user:left:call", { userId });
//         } catch (error) {
//             console.error("Error leaving call:", error);
//             socket.emit("call:error", { isError: true, message: "Failed to leave call", data: null });
//         }
//     });

//     // --- WebRTC Signaling ---
//     socket.on("call:signal", ({ callName, signal, to }) => {
//         socket.to(to).emit("call:signal", { from: socket.id, signal });
//     });
// };

// module.exports = setupCallSockets;



const setupCallSockets = (io, socket, getUserId, getToken) => {
    // 1. Frontend asks for call info (check if exists or create)
    socket.on("call:check", async ({ callName, token }) => {
        if (!getUserId()) return;
        try {
            const result = await callService.checkCallExists(callName);
            socket.emit("call:checked", result);
        } catch (error) {
            console.error("Error checking/creating call:", error);
            socket.emit("call:error", { isError: true, message: "Failed to check or create call", data: null });
        }
    });

    // 2. Frontend asks to join call
    socket.on("call:join", async ({ callName, token: clientToken }) => {
        if (!getUserId()) return;
        try {
            const result = await callService.joinCall({ callName, userId: getUserId() });
            socket.join(`call-${result.data.call._id.toString()}`);
            socket.join(`call-signal-${callName}`); // Join a room for WebRTC signaling based on callName
            socket.emit("call:joined", { ...result, token: getToken(), socketId: socket.id });
            io.to(`call-${result.data.call._id.toString()}`).emit("user:joined:call", { userId: getUserId(), socketId: socket.id });
            io.to(`call-signal-${callName}`).emit("user:joined:signal", { userId: getUserId(), socketId: socket.id }); // Notify others in the signaling room
        } catch (error) {
            console.error("Error joining call:", error);
            socket.emit("call:error", { isError: true, message: "Failed to join call", data: null });
        }
    });

    // 3. Frontend requests call details
    socket.on("call:get", async ({ callName, token }) => {
        if (!getUserId()) return;
        try {
            const result = await callService.getCallDetails(callName);
            socket.emit("call:details", result);
        } catch (error) {
            console.error("Error getting call details:", error);
            socket.emit("call:error", { isError: true, message: "Failed to get call details", data: null });
        }
    });

    // 4. Frontend updates call metadata
    socket.on("call:meta:update", async ({ callName, password, isPrivate, token }) => {
        if (!getUserId()) return;
        try {
            const result = await callService.updateCallMeta({ callName, userId: getUserId(), password, isPrivate });
            socket.emit("call:meta:updated", result);
            io.to(`call-${result.data.call._id.toString()}`).emit("call:updated", { isPrivate: result.data.call.isPrivate });
        } catch (error) {
            console.error("Error updating call metadata:", error);
            socket.emit("call:error", { isError: true, message: "Failed to update call metadata", data: null });
        }
    });

    // 5. Frontend leaves the call
    socket.on("call:leave", async ({ callName, token }) => {
        if (!getUserId()) return;
        try {
            const result = await callService.leaveCall({ callName, userId: getUserId() });
            socket.leave(`call-${result.data.call._id.toString()}`);
            socket.leave(`call-signal-${callName}`); // Leave the signaling room
            socket.emit("call:left", result);
            io.to(`call-${result.data.call._id.toString()}`).emit("user:left:call", { userId: getUserId(), socketId: socket.id });
            io.to(`call-signal-${callName}`).emit("user:left:signal", { userId: getUserId(), socketId: socket.id }); // Notify others in the signaling room
        } catch (error) {
            console.error("Error leaving call:", error);
            socket.emit("call:error", { isError: true, message: "Failed to leave call", data: null });
        }
    });

    // --- WebRTC Signaling (Now based on callName) ---

    // 6. Initiating a call or sending an offer
    socket.on("call:offer", ({ callName, sdp }) => {
        socket.to(`call-signal-${callName}`).emit("call:offer", { from: socket.id, sdp });
    });

    // 7. Sending an answer to an offer
    socket.on("call:answer", ({ callName, sdp }) => {
        socket.to(`call-signal-${callName}`).emit("call:answer", { from: socket.id, sdp });
    });

    // 8. Sending ICE candidates
    socket.on("call:ice-candidate", ({ callName, candidate }) => {
        socket.to(`call-signal-${callName}`).emit("call:ice-candidate", { from: socket.id, candidate });
    });
};



// const callService = require('../services/callService');

// const setupCallSockets = (io, socket, userId, token) => {
//     // 1. Frontend asks for call info (check if exists or create)
//     socket.on("call:check", async ({ callName, token }) => {
//         if (!userId) return;
//         try {
//             const result = await callService.checkCallExists(callName);
//             socket.emit("call:checked", result);
//         } catch (error) {
//             console.error("Error checking/creating call:", error);
//             socket.emit("call:error", { isError: true, message: "Failed to check or create call", data: null });
//         }
//     });

//     // 2. Frontend asks to join call
//     socket.on("call:join", async ({ callName, token: clientToken }) => {
//         if (!userId) return;
//         try {
//             const result = await callService.joinCall({ callName, userId });
//             socket.join(`call-${result.data.call._id.toString()}`);
//             socket.emit("call:joined", { ...result, token });
//             socket.to(`call-${result.data.call._id.toString()}`).emit("user:joined:call", { userId, socketId: socket.id });
//         } catch (error) {
//             console.error("Error joining call:", error);
//             socket.emit("call:error", { isError: true, message: "Failed to join call", data: null });
//         }
//     });

//     // 3. Frontend requests call details
//     socket.on("call:get", async ({ callName, token }) => {
//         if (!userId) return;
//         try {
//             const result = await callService.getCallDetails(callName);
//             socket.emit("call:details", result);
//         } catch (error) {
//             console.error("Error getting call details:", error);
//             socket.emit("call:error", { isError: true, message: "Failed to get call details", data: null });
//         }
//     });

//     // 4. Frontend updates call metadata
//     socket.on("call:meta:update", async ({ callName, password, isPrivate, token }) => {
//         if (!userId) return;
//         try {
//             const result = await callService.updateCallMeta({ callName, userId, password, isPrivate });
//             socket.emit("call:meta:updated", result);
//             io.to(`call-${result.data.call._id.toString()}`).emit("call:updated", { isPrivate: result.data.call.isPrivate });
//         } catch (error) {
//             console.error("Error updating call metadata:", error);
//             socket.emit("call:error", { isError: true, message: "Failed to update call metadata", data: null });
//         }
//     });

//     // 5. Frontend leaves the call
//     socket.on("call:leave", async ({ callName, token }) => {
//         if (!userId) return;
//         try {
//             const result = await callService.leaveCall({ callName, userId });
//             socket.leave(`call-${result.data.call._id.toString()}`);
//             socket.emit("call:left", result);
//             socket.to(`call-${result.data.call._id.toString()}`).emit("user:left:call", { userId, socketId: socket.id });
//         } catch (error) {
//             console.error("Error leaving call:", error);
//             socket.emit("call:error", { isError: true, message: "Failed to leave call", data: null });
//         }
//     });

//     // --- WebRTC Signaling ---

//     // 6. Initiating a call or sending an offer
//     socket.on("call:offer", ({ callName, sdp, to }) => {
//         socket.to(to).emit("call:offer", { from: socket.id, sdp });
//     });

//     // 7. Sending an answer to an offer
//     socket.on("call:answer", ({ callName, sdp, to }) => {
//         socket.to(to).emit("call:answer", { from: socket.id, sdp });
//     });

//     // 8. Sending ICE candidates
//     socket.on("call:ice-candidate", ({ callName, candidate, to }) => {
//         socket.to(to).emit("call:ice-candidate", { from: socket.id, candidate });
//     });
// };

module.exports = setupCallSockets;