const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const { createGuestUser } = require("./middleware/authMiddleware");
const User = require("./models/userModel");
const setupRoomSockets = require("./sockets/roomSockets");
const setupCallSockets = require("./sockets/callSockets");
const setupEditorSockets = require("./sockets/editorSockets");
const setupFileSockets = require("./sockets/fileSockets");

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
            const authResult = await authenticateSocket(clientToken);
            userId = authResult.userId;
            token = authResult.token;
            socket.userId = userId;
            socket.emit("authenticated", { token });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.userId || "guest");
        });

        setupRoomSockets(socketIo, socket, userId, token); // Pass token as well if needed in handlers
        setupEditorSockets(socketIo, socket, userId, token);
        setupFileSockets(socketIo, socket, userId, token);
        setupCallSockets(socketIo, socket, userId, token);
    });
};

module.exports = setupSocket;