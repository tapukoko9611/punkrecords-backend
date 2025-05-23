const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const { createGuestUser } = require("./middleware/authMiddleware");
const User = require("./models/userModel");
const setupRoomSockets = require("./sockets/roomSockets");
const setupCallSockets = require("./sockets/callSockets");
const setupEditorSockets = require("./sockets/editorSockets");
const setupFileSockets = require("./sockets/fileSockets");
const setupUserSockets = require("./sockets/userSockets");

const setupSocket = (socketIo) => {
    socketIo.on("connection", async (socket) => {
        let userId = null;
        let token = null;

        socket.emit("connected");
        console.log("socket connected: ", socket.id);

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
            const { token, session } = await createGuestUser();
            return { userId: session, token: token };
        };

        socket.on("authenticate", async ({ token: clientToken }) => {
            const authResult = await authenticateSocket(clientToken);
            userId = authResult.userId;
            token = authResult.token;
            socket.emit("authenticated", { token });

            setupRoomSockets(socketIo, socket, getUserId, getToken);
            setupEditorSockets(socketIo, socket, getUserId, getToken);
            setupFileSockets(socketIo, socket, getUserId, getToken);
            setupCallSockets(socketIo, socket, getUserId, getToken);
            setupUserSockets(socketIo, socket, getUserId, getToken);

        });

        socket.on("re-authenticate", async ({ token: newClientToken }) => {
            try {
                const decoded = jwt.verify(newClientToken, "JWT_SECRET");
                const loggedInUser = await User.findById(decoded.id);
                if (loggedInUser) {
                    userId = loggedInUser._id;
                    token = newClientToken;
                    socket.emit("re-authenticated", { token });
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
            console.log("socket disconnected:", socket.id);
        });
    });
};

module.exports = setupSocket;