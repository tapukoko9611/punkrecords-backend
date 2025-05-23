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