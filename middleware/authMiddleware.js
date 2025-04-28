const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const RequestIp = require('@supercharge/request-ip');

const Session = require("../models/sessionModel");
const Device = require("../models/deviceModel");
const generateToken = require("../config/generateToken");
const req = require("express/lib/request");
const User = require("../models/userModel");

const fun = async (ip_addr) => {
    var find = await Device.findOne({ ip_addr: ip_addr });

    if (!find) {
        find = await Device.create({
            ip_addr: ip_addr,
        });
    }

    var session = await Session.create({
        device: find._id,
    });

    await Device.findByIdAndUpdate(
        find._id,
        {
            "$push": {
                "sessions": session._id,
            },
        },
    );

    var token = generateToken(session._id);
    session = session._id;

    //const decoded = jwt.verify(token, 'JWT_SECRET');

    console.log("Come verified the next time, will ya?");
    return { token, session };
}

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
        })
        return {token: generateToken(user._id), session: user._id};
    } catch(e) {
        throw e;
    }
}

const protect = asyncHandler(async (req, res, next) => {
    const ip_addr = RequestIp.getClientIp(req);

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
            // await fun(ip_addr)
            //     .then(({ token, session }) => {
            //         req.token = token;
            //         req.session = session;
            //     })
            //     .catch((err) => {
            //         console.log(err.message);
            //     })

            await createGuestUser().then(({token, session}) => {
                req.token=token;
                req.session=session;
            }).catch((err) => console.log(err));
            next();
        }
    }
    else {
        // try {

        // }
        // catch (err) {
        //     res.status(401);
        //     throw new Error(`${err.message}`);
        // }

        // await fun(ip_addr)
        //     .then(({ token, session }) => {
        //         req.token = token;
        //         req.session = session;
        //     })
        //     .catch((err) => {
        //         console.log(err.message);
        //     })
        
        await createGuestUser().then(({token, session}) => {
            req.token=token;
            req.session=session;
        }).catch((err) => console.log(err));
        next();
    }
});

module.exports = { protect };