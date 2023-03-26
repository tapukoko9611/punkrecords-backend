const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const RequestIp = require('@supercharge/request-ip');

const Session = require("../models/sessionModel");
const Device = require("../models/deviceModel");
const generateToken = require("../config/generateToken");

const fun = async (ip_addr) => {
    var find = await Device.findOne({ip_addr: ip_addr});

    if(!find) {
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
    return {token, session};
}

const protect = asyncHandler( async (req, res, next) => {
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
            
            console.log("A verified guy eh?");

            next();
        }
        catch (err) {
            await fun(ip_addr)
                .then(({token, session}) => {
                    req.token = token;
                    req.session = session;
                })
                .catch((err) => {
                    console.log(err.message);
                })
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
        await fun(ip_addr)
                .then(({token, session}) => {
                    req.token = token;
                    req.session = session;
                })
                .catch((err) => {
                    console.log(err.message);
                })
        next();
    }
});

module.exports = { protect };