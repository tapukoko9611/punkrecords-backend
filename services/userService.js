// userServices.js

const User = require("../models/userModel");
const Room = require("../models/roomModel");
const Editor = require("../models/editorModel");
const Call = require("../models/callModel");
const File = require("../models/fileModel");
const generateToken = require("../config/generateToken");

const createUserResponse = (isError, message, data) => ({
    isError,
    message,
    data,
});

const checkUserExists = async (userName) => {
    try {
        const user = await User.findOne({ userName });
        return createUserResponse(false, "User Existence Checked", { exists: !!user });
    } catch (error) {
        console.error("Error checking user existence:", error);
        return createUserResponse(true, "Failed to check user existence", null);
    }
};

const getUserDetails = async (userId) => {
    try {
        // console.log("service - Get user details: ", userId);
        const user = await User.findById(userId);
        if (!user) {
            return createUserResponse(true, "User not found", null);
        }

        const rooms = {};
        for (const [roomId, details] of user.rooms.entries()) {
            const room = await Room.findById(roomId);
            if (room) {
                rooms[roomId] = room;
            }
        }

        const editors = {};
        // for (const [editorId, details] of user.editors.entries()) {
        //     const editor = await Editor.findById(editorId);
        //     if (editor) {
        //         editors[editorId] = { ...details, editorName: editor.name };
        //     }
        // }

        const files = {};
        // for (const [fileId, details] of user.files.entries()) {
        //     // Assuming File model has a 'name' field
        //     const file = await File.findById(fileId);
        //     if (file) {
        //         files[fileId] = { ...details, fileName: file.name };
        //     }
        // }

        const calls = {};
        // for (const [callId, details] of user.calls.entries()) {
        //     // Assuming Call model has a 'name' field
        //     const call = await Call.findById(callId);
        //     if (call) {
        //         calls[callId] = { ...details, callName: call.name };
        //     }
        // }

        // console.log("service - Sent user details")
        return createUserResponse(false, "User Details Retrieved", { user, rooms, editors, files, calls });
    } catch (error) {
        console.error("Error fetching user details:", error);
        return createUserResponse(true, "Failed to retrieve user details", null);
    }
};

const signupUser = async (userId, userName, password, code) => {
    try {
        // console.log("service - Signup user: ", userId);
        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return createUserResponse(true, "Username already exists", null);
        }

        const user = await User.findById(userId);
        if (!user) {
            return createUserResponse(true, "User not found", null);
        }

        user.userName = userName;
        user.password = password;
        user.code = code;
        user.type = "User";
        await user.save();
        
        // console.log("service - User signed up");
        return createUserResponse(false, "Signup successful", { user });
    } catch (error) {
        console.error("Error during signup:", error);
        return createUserResponse(true, "Failed to signup", null);
    }
};

const updateUser = async (userName, password, code) => {
    try {
        const user = await User.findOne({userName});
        // console.log("service - Update userDetails: ", user?._id);
        if (!user || user.type !== "User") {
            return createUserResponse(true, "User not found or not a registered user", null);
        }
        if (user.code !== code) {
            return createUserResponse(true, "Wrong code", null);
        }

        user.password = password;
        await user.save();

        // console.log("service - Updated userDetails");
        return createUserResponse(false, "User updated successfully", { user });
    } catch (error) {
        console.error("Error updating user:", error);
        return createUserResponse(true, "Failed to update user", null);
    }
};

const loginUser = async (userName, password) => {
    try {
        // console.log("service - Login user: ", userName);
        const user = await User.findOne({ userName, password });
        if (!user) {
            return createUserResponse(true, "Invalid credentials", null);
        }
        const token = generateToken(user._id);
        // console.log("service - User logged in");
        return createUserResponse(false, "Login successful", { user, token });
    } catch (error) {
        console.error("Error during login:", error);
        return createUserResponse(true, "Failed to login", null);
    }
};

module.exports = {
    checkUserExists,
    getUserDetails,
    signupUser,
    updateUser,
    loginUser,
};