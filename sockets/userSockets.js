const userService = require("../services/userService");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


const setupUserSockets = (io, socket, getUserId, getToken) => {
    socket.on("userName:check", async ({ userName, token }) => {
        if (!getUserId()) return;

        try {
            const result = await userService.checkUserExists(userName);
            socket.emit("userName:checked", result);
        } catch (error) {
            console.error("Error checking username:", error);
            socket.emit("user:error", { isError: true, message: "Failed to check userName", data: null });
        }
    });
};

module.exports = setupUserSockets;