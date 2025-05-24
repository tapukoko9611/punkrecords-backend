const callService = require('../services/callService');

const setupCallSockets = (io, socket, getUserId, getToken) => {
    // 1. Frontend asks for call info (check if exists or create)
    socket.on("call:search", async ({ callName, token, privacy, password }) => {
        if (!getUserId()) return;
        try {
            const result = await callService.findOrCreateCall({ callName, userId: getUserId(), isPrivate: privacy, password });
            socket.emit("call:searched", result);
        } catch (error) {
            console.error("Error checking/creating call:", error);
            socket.emit("call:error", { isError: true, message: "Failed to check or create call", data: null });
        }
    });

    // 2. Frontend asks to join call
    socket.on("call:join", async ({ callName, type = "No", token: clientToken }) => {
        if (!getUserId()) return;
        try {
            const result = await callService.joinCall({ callName, userId: getUserId() });
            socket.join(`call-${result.data.call._id.toString()}`);
            /* if(type!="Initial") */ socket.join(`call-signal-${callName}`); // Join a room for WebRTC signaling based on callName
            socket.emit("call:joined", { ...result, token: getToken(), socketId: socket.id });
            io.to(`call-${result.data.call._id.toString()}`).emit("user:joined:call", { userId: getUserId(), socketId: socket.id });
            /* if(type!="Initial") */ io.to(`call-signal-${callName}`).emit("user:joined:signal", { userId: getUserId(), socketId: socket.id }); // Notify others in the signaling room
        } catch (error) {
            console.error("Error joining call:", error);
            socket.emit("call:error", { isError: true, message: "Failed to join call", data: null });
        }
    });

    // 3. Frontend requests call details
    socket.on("call:content:get", async ({ callName, token }) => {
        if (!getUserId()) return;
        try {
            const result = await callService.getCallDetails(callName);
            socket.emit("call:content:got", result);
        } catch (error) {
            console.error("Error getting call details:", error);
            socket.emit("call:error", { isError: true, message: "Failed to get call details", data: null });
        }
    });

    // 4. Frontend updates call metadata
    socket.on("call:metadata:update", async ({ callName, password, isPrivate, token }) => {
        if (!getUserId()) return;
        try {
            const result = await callService.updateCallMeta({ callName, userId: getUserId(), password, isPrivate });
            socket.emit("call:metadata:updated", result);
            // io.to(`call-${result.data.call._id.toString()}`).emit("call:updated", { isPrivate: result.data.call.isPrivate });
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
    socket.on("webrtc:offer", (data) => {
        // data should be: { callId, sdp }
        // Broadcast the offer to everyone else in the call room.
        const roomName = `call-${data.callId}`;
        // We send the offer along with the sender socket id.
        socket.to(roomName).emit("webrtc:offer", { sdp: data.sdp, senderSocketId: socket.id });
    });

    socket.on("webrtc:answer", (data) => {
        // data: { callId, sdp, targetSocketId }
        // Send the answer directly back to the original offer sender.
        socket.to(data.targetSocketId).emit("webrtc:answer", { sdp: data.sdp, senderSocketId: socket.id });
    });

    socket.on("webrtc:candidate", (data) => {
        // data: { callId, candidate }
        const roomName = `call-${data.callId}`;
        // Broadcast ICE candidate from sender to everyone in the room (or you can send only to a target)
        socket.to(roomName).emit("webrtc:candidate", { candidate: data.candidate, senderSocketId: socket.id });
    });
};

module.exports = setupCallSockets;