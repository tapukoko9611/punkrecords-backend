const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const Editor = require("../models/editorModel");
const User = require("../models/userModel");
const Room = require("../models/roomModel");

// checks if a user w that username exists during signup
const exists = asyncHandler(async (req, res) => {
    try {
        var { userName } = req.params;
        var user = await User.findOne({ userName: userName });
        res.status(201).json({
            status: user != null,
            token: req.token
        });
    } catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

// probably called upon every refresh or login or sign-up (mostly afterevery user actioin)
const get = asyncHandler (async (req, res) => {
    try {
        var userId = req.session;

        var user = await User.findById(userId);
        if(!user) {
            throw new Error("User not found");
        }

        var rooms = {};
        for(const [id, date] of user.joinedRooms.entries()) {
            var room = await Room.findById(id);
            rooms.set(id, room);
        }

        var editors = {};
        for(const [id, date] of user.joinedEditors.entries()) {
            var editor = await Editor.findById(id);
            editors.set(id, editor);
        }

        res.status(201).json({
            user: user,
            rooms: rooms,
            editors: editors
        });

    } catch(err) {
        res.status(401);
        throw new Error(err.message);
    }
});

// sign-up
const signup = asyncHandler(async (req, res) => {
    try {
        var { userName, password, code } = req.body;
        var userId = req.session;

        var user = await User.findById(userId);
        if(!user) {
            throw new Error("User not found");
        }

        user.userName = userName;
        user.password = password;
        user.code = code;
        user.type = "Citizen"
        await user.save();

        res.status(201).json({
            user: user,
            message: "welcome aboard"
        });
        

    } catch(err) {
        res.status(401);
        throw new Error(err.message);
    }
});

// update
const update = asyncHandler(async (req, res) => {
    try {
        var { password, code } = req.body;
        var userId = req.session;

        var user = await User.findById(userId);
        if(!user || (user && user.type!="Citizen")) {
            throw new Error("User not found");
        }
        if(user.code!=code) {
            throw new Error("Wrong code");
        }

        user.password = password;
        await user.save();

        res.status(201).json({
            user: user,
            message: "updated"
        });
        

    } catch(err) {
        res.status(401);
        throw new Error(err.message);
    }
});

// login
const login = asyncHandler(async (req, res) => {
    try {
        var { userName, password } = req.params;
        var userId = req.session;

        var user = await User.findOne({userName: userName, password: password});
        if(!user) {
            throw new Error("User not found");
        }

        res.status(201).json({
            user: user,
            token: generateToken(user._id),
            message: "welcome back!!"
        });
    } catch(err) {
        res.status(401);
        throw new Error(err.message);
    }
});

module.exports = {get, signup, update, login};