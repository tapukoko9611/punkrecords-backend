// const asyncHandler = require("express-async-handler");
// const generateToken = require("../config/generateToken");
// const Editor = require("../models/editorModel");
// const User = require("../models/userModel");
// const Room = require("../models/roomModel");

// // checks if a user w that username exists during signup
// const exists = asyncHandler(async (req, res) => {
//     try {
//         var { userName } = req.params;
//         var user = await User.findOne({ userName: userName });
//         res.status(201).json({
//             status: user != null,
//             token: req.token
//         });
//     } catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // probably called upon every refresh or login or sign-up (mostly afterevery user actioin)
// const get = asyncHandler (async (req, res) => {
//     try {
//         var userId = req.session;

//         var user = await User.findById(userId);
//         if(!user) {
//             throw new Error("User not found");
//         }

//         var rooms = {};
//         for(const [id, date] of user.joinedRooms.entries()) {
//             var room = await Room.findById(id);
//             rooms.set(id, room);
//         }

//         var editors = {};
//         for(const [id, date] of user.joinedEditors.entries()) {
//             var editor = await Editor.findById(id);
//             editors.set(id, editor);
//         }

//         res.status(201).json({
//             user: user,
//             rooms: rooms,
//             editors: editors
//         });

//     } catch(err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // sign-up
// const signup = asyncHandler(async (req, res) => {
//     try {
//         var { userName, password, code } = req.body;
//         var userId = req.session;

//         var userNameSearch = await User.findOne({ userName: userName });
//         if(userNameSearch) {
//             throw new Error("Username already exists");
//         }

//         var user = await User.findById(userId);
//         if(!user) {
//             throw new Error("User not found");
//         }

//         user.userName = userName;
//         user.password = password;
//         user.code = code;
//         user.type = "Citizen"
//         await user.save();

//         res.status(201).json({
//             user: user,
//             message: "welcome aboard"
//         });


//     } catch(err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // update
// const update = asyncHandler(async (req, res) => {
//     try {
//         var { password, code } = req.body;
//         var userId = req.session;

//         var user = await User.findById(userId);
//         if(!user || (user && user.type!="Citizen")) {
//             throw new Error("User not found");
//         }
//         if(user.code!=code) {
//             throw new Error("Wrong code");
//         }

//         user.password = password;
//         await user.save();

//         res.status(201).json({
//             user: user,
//             message: "updated"
//         });


//     } catch(err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // login
// const login = asyncHandler(async (req, res) => {
//     try {
//         var { userName, password } = req.params;
//         var userId = req.session;

//         var user = await User.findOne({userName: userName, password: password});
//         if(!user) {
//             throw new Error("User not found");
//         }

//         res.status(201).json({
//             user: user,
//             token: generateToken(user._id),
//             message: "welcome back!!"
//         });
//     } catch(err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// module.exports = {get, signup, update, login, exists};





// userController.js

const asyncHandler = require("express-async-handler");
const userService = require("../services/userService");

const exists = asyncHandler(async (req, res) => {
    const { userName } = req.params;
    const result = await userService.checkUserExists(userName);
    res.status(200).json({ token: req.token, ...result });
});

const get = asyncHandler(async (req, res) => {
    const userId = req.session;
    const result = await userService.getUserDetails(userId);
    res.status(200).json({ token: req.token, ...result });
});

const signup = asyncHandler(async (req, res) => {
    const { userName, password, code } = req.body;
    const userId = req.session;
    const result = await userService.signupUser(userId, userName, password, code);
    res.status(201).json({ token: req.token, ...result });
});

const update = asyncHandler(async (req, res) => {
    const { userName, password, code } = req.body;
    const userId = req.session;
    const result = await userService.updateUser(userName, password, code);
    if(!result.isError && userId===result.data.user._id) res.status(200).json({ token: req.token, ...result });
    else if(!result.isError && userId!==result.data.user._id) {
        result.data.user=null;
        res.status(200).json({ token: req.token, ...result })
    }
    else {
        res.status(200).json({ token: req.token, ...result })
    }
});

const login = asyncHandler(async (req, res) => {
    const { userName, password } = req.query;
    const result = await userService.loginUser(userName, password);
    if (result.isError) {
        res.status(401).json({ token: req.token, ...result });
    } else {
        res.status(200).json({ token: result.data.token, ...result });
    }
});

module.exports = { get, signup, update, login, exists };