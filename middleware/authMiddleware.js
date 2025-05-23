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

const createGuestUser = async () => {
    try {
        var userName = "Immigrant-" + createRandomString(7);
        const user = await User.create({
            userName: userName,
            password: "",
            code: "",
            type: "Immigrant",
            rooms: {},
            editors: {},
            files: {},
            calls: {}
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

module.exports = { protect, createGuestUser };