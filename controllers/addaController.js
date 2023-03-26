const asyncHandler = require("express-async-handler");

const Device = require("../models/deviceModel");
const Session = require("../models/sessionModel");
const Adda = require("../models/addaModel");

const find = async (addaId) => {
    try {
        var adda = await Adda.findOne({
            name: addaId,
        });

        if(!adda) {
            adda = await Adda.create({
                name: addaId,
            });
        }

        return adda;
    }
    catch (err) {
        return null;
    }
};

const post = asyncHandler ( async (req, res) => {
    try {
        var addaId = req.params.addaId;
        var { text } = req.body;

        const adda = await find(addaId);
        if (!adda) {
            throw new Error("Problem");
        }

        adda.chat = [
            ...adda.chat, 
            {
                session: req.session,
                text: text,
            },
        ];
        await adda.save();

        res.status(201).json({
            chat: {
                session: req.session,
                text: text,
            },
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const get = asyncHandler ( async (req, res) => {
    try {
        var addaId = req.params.addaId;

        const adda = await find(addaId);
        if (!adda) {
            throw new Error("Problem");
        }

        res.status(201).json({
            token: req.token,
            session: req.session,
            chat: adda.chat,
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
}); 

const clear = asyncHandler ( async (req, res) => {
    try {
        var addaId = req.params.addaId;

        const adda = await find(addaId);
        if (!adda) {
            throw new Error("Problem");
        }

        adda.chat = [
            {
                session: req.session,
                text: `${req.session._id} cleared the chat`,
            }
        ];
        await adda.save();

        res.status(201).json({
            chat: adda.chat,
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

module.exports = { get, post, clear };