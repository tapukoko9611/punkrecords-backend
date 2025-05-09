const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const { createGuestUser } = require("./middleware/authMiddleware");
const User = require("./models/userModel");
const setupRoomSockets = require("./sockets/roomSockets");
const setupCallSockets = require("./sockets/callSockets");
const setupEditorSockets = require("./sockets/editorSockets");
const setupFileSockets = require("./sockets/fileSockets");
const generateToken = require("./config/generateToken");

// const setupSocket = (io) => {
//     io.on("connection", async (socket) => {
//         console.log(`User connected: ${socket.id}`);

//         let userId;

//         // Authentication middleware for the socket connection
//         const authenticateSocket = async (token) => {
//             if (token) {
//                 try {
//                     const decoded = jwt.verify(token, 'JWT_SECRET');
//                     userId = decoded.id;
//                     const user = await User.findById(userId);
//                     if (user) {
//                         socket.userId = userId; // Attach userId to the socket object
//                         console.log(`Socket ${socket.id} authenticated as user ${userId}`);
//                         return true;
//                     }
//                 } catch (err) {
//                     console.error("Socket authentication error:", err);
//                 }
//             }
//             // If no token or invalid token, create a guest user
//             const guestInfo = await createGuestUser();
//             userId = guestInfo.session;
//             socket.userId = userId;
//             socket.emit("guestUserCreated", { token: guestInfo.token, sessionId: guestInfo.session });
//             console.log(`Socket ${socket.id} created guest user ${userId}`);
//             return true; // For simplicity, we'll treat guest creation as successful auth for this socket
//         };

//         // Client emits this event with their token
//         socket.on("authenticate", async (data) => {
//             await authenticateSocket(data.token);
//         });

//         setupRoomSockets(io, socket, socket.userId);
//         //   setupCallSockets(io, socket, socket.userId);
//           setupEditorSockets(io, socket, socket.userId);
//         //   setupFileSockets(io, socket, socket.userId);


//         socket.on("disconnect", () => {
//             console.log(`User disconnected: ${socket.id}`);
//         });
//     });
// };

const setupSocket = (socketIo) => {
    socketIo.on("connection", async (socket) => {
        let userId = null;
        let token = null;
        let currentSocket = null;

        const getUserId = () => userId;
        const getToken = () => token;

        const authenticateSocket = async (clientToken) => {
            if (clientToken) {
                try {
                    const decoded = jwt.verify(clientToken, "JWT_SECRET");
                    const user = await User.findById(decoded.id);
                    if (user) {
                        return { userId: user._id, token: clientToken };
                    }
                } catch (error) {
                    console.error("Invalid token on socket connection:", error);
                }
            }
            const guestUser = await createGuestUser();
            const guestToken = generateToken(guestUser._id);
            return { userId: guestUser._id, token: guestToken };
        };

        socket.on("authenticate", async ({ token: clientToken }) => {
            currentSocket = socket;
            const authResult = await authenticateSocket(clientToken);
            userId = authResult.userId;
            token = authResult.token;
            socket.userId = userId;
            socket.emit("authenticated", { token });

            setupRoomSockets(socketIo, socket, getUserId, getToken); // Pass token as well if needed in handlers
            setupEditorSockets(socketIo, socket, getUserId, getToken);
            setupFileSockets(socketIo, socket, getUserId, getToken);
            setupCallSockets(socketIo, socket, getUserId, getToken);

        });

        // socket.on("user:logged-in-socket", async () => {
        //     if (socket.userId) {
        //         try {
        //             const user = await User.findById(socket.userId);
        //             if (user && user.type === "User") {
        //                 console.log(`User ${user.userName} (${socket.userId}) logged in via HTTP - joining existing modules by name.`);

        //                 // Join rooms by name
        //                 for (const [roomId, details] of user.rooms.entries()) {
        //                     const roomName = details.name;
        //                     if (roomName) {
        //                         socket.join(roomName);
        //                         console.log(`Socket ${socket.id} joined room ${roomName}`);
        //                     }
        //                 }

        //                 // Join editors by name
        //                 for (const [editorId, details] of user.editors.entries()) {
        //                     const editorName = details.name;
        //                     if (editorName) {
        //                         socket.join(`editor-${editorName}`); // Assuming your editor rooms are prefixed
        //                         console.log(`Socket ${socket.id} joined editor editor-${editorName}`);
        //                     }
        //                 }

        //                 // // Join calls by name (for both call room and signaling)
        //                 // for (const [callId, details] of user.calls.entries()) {
        //                 //     const callName = details.name;
        //                 //     if (callName) {
        //                 //         socket.join(`call-${callName}`); // Assuming your call rooms are prefixed
        //                 //         socket.join(`call-signal-${callName}`);
        //                 //         console.log(`Socket ${socket.id} joined call call-${callName} and signal call-signal-${callName}`);
        //                 //     }
        //                 // }
        //             }
        //         } catch (error) {
        //             console.error("Error joining modules by name after login:", error);
        //         }
        //     }
        // });

        socket.on("re-authenticate", async ({ token: newClientToken }) => {
            try {
                const decoded = jwt.verify(newClientToken, "JWT_SECRET");
                const loggedInUser = await User.findById(decoded.id);
                if (loggedInUser) {
                    console.log(`User ${loggedInUser.userName} (${loggedInUser._id}) re-authenticated.`);
                    userId = loggedInUser._id;
                    token = newClientToken;
                    socket.userId = userId;
                    socket.emit("re-authenticated", { token });

                    // Join all participated modules by name for the logged-in user
                    for (const [roomId, details] of loggedInUser.rooms.entries()) {
                        const roomName = details.name;
                        if (roomName) {
                            socket.join(`room-${roomId}`);
                            console.log(`Socket ${socket.id} joined room ${roomName}`);
                        }
                    }

                    for (const [editorId, details] of loggedInUser.editors.entries()) {
                        const editorName = details.name;
                        if (editorName) {
                            socket.join(`editor-${editorId}`);
                            console.log(`Socket ${socket.id} joined editor editor-${editorName}`);
                        }
                    }

                    // for (const [callId, details] of loggedInUser.calls.entries()) {
                    //     const callName = details.name;
                    //     if (callName) {
                    //         socket.join(`call-${callName}`);
                    //         socket.join(`call-signal-${callName}`);
                    //         console.log(`Socket ${socket.id} joined call ${callName} and signal call-signal-${callName}`);
                    //     }
                    // }
                } else {
                    console.error("Re-authentication failed: User not found.");
                    socket.emit("re-authentication-failed", { message: "Invalid token." });
                    socket.disconnect(true);
                }
            } catch (error) {
                console.error("Error during re-authentication:", error);
                socket.emit("re-authentication-failed", { message: "Invalid token." });
                socket.disconnect(true);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.userId || "guest");
        });

        // setupRoomSockets(socketIo, socket, userId, token); // Pass token as well if needed in handlers
        // setupEditorSockets(socketIo, socket, userId, token);
        // setupFileSockets(socketIo, socket, userId, token);
        // setupCallSockets(socketIo, socket, userId, token);
    });
};

module.exports = setupSocket;