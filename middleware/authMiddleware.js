const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const generateToken = require("../config/generateToken");
const User = require("../models/userModel");


function createRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const createGuestUser = async (req, res) => {
    try {
        var userName = "Guest-" + createRandomString(7);
        const user = await User.create({
            userName: userName,
            password: "",
            code: "",
            type: "Guest",
            createdRooms: [],
            createdEditors: [],
            joinedRooms: {},
            joinedCalls: {},
            joinedEditors: {},
        })
        return { token: generateToken(user._id), session: user._id };
    } catch (e) {
        throw e;
    }
}

const protect = asyncHandler(async (req, res, next) => {

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, 'JWT_SECRET');

            req.session = decoded.id;
            req.token = token;

            console.log("Not first time");

            next();
        }
        catch (err) {
            await createGuestUser().then(({ token, session }) => {
                req.token = token;
                req.session = session;
            }).catch((err) => console.log(err));
            next();
        }
    }
    else {
        await createGuestUser().then(({ token, session }) => {
            req.token = token;
            req.session = session;
        }).catch((err) => console.log(err));
        next();
    }
});

module.exports = { protect };