const asyncHandler = require("express-async-handler");

const Device = require("../models/deviceModel");
const Session = require("../models/sessionModel");
const Storage = require("../models/storageModel");

const find = async (storageId) => {
    try {
        var storage = await Storage.findOne({
            name: storageId,
        });

        if(!storage) {
            storage = await Storage.create({
                name: storageId,
            });
        }

        return storage;
    }
    catch (err) {
        return null;
    }
};

const post = asyncHandler ( async (req, res) => {
    try {
        var storageId = req.params.storageId;
        var { name, data } = req.body;

        const storage = await find(storageId);
        if (!storage) {
            throw new Error("Problem");
        }

        for (let i=0; i<storage.database.length; i++) {
            if (storage.database[i].name == name) {
                storage.database.splice(i, 1);
            }
        }

        storage.database = [
            ...storage.database, 
            {
                session: req.session,
                data: data,
                name: name,
            },
        ];
        await storage.save();

        res.status(201).json({
            data: {
                session: req.session,
                data: data,
                name: name,
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
        var storageId = req.params.storageId;

        const storage = await find(storageId);
        if (!storage) {
            throw new Error("Problem");
        }

        res.status(201).json({
            token: req.token,
            session: req.session,
            database: storage.database,
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const clear = asyncHandler ( async (req, res) => {
    try {
        var storageId = req.params.storageId;

        const storage = await find(storageId);
        if (!storage) {
            throw new Error("Problem");
        }

        storage.database = [
            // {
            //     session: req.session._id,
            //     name: "Cleared",
            //     data: `${req.session._id} cleared the database`,
            // },
        ];
        await storage.save();

        res.status(201).json({
            // data: {
            //     session: req.session,
            //     data: {
            //         session: req.session._id,
            //         name: "Cleared",
            //         data: `${req.session._id} cleared the database`,
            //     },
            //     name: "Cleared",
            // },
            msg: "Cleared the chat"
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const update = asyncHandler ( async (req, res) => {
    try {
        var storageId = req.params.storageId;
        var { name, data } = req.body;
        console.log(data);

        const storage = await find(storageId);
        if (!storage) {
            throw new Error("Problem");
        }

        for (let i=0; i<storage.database.length; i++) {
            if (storage.database[i].name == name) {
                storage.database[i].data = data;
                break;
            }
        }
        await storage.save();

        res.status(201).json({
            data: {
                session: req.session,
                data: data,
                name: name,
            },
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const remove = asyncHandler ( async (req, res) => {
    try {
        var storageId = req.params.storageId;
        var { name, data } = req.body;

        const storage = await find(storageId);
        if (!storage) {
            throw new Error("Problem");
        }

        for (let i=0; i<storage.database.length; i++) {
            if (storage.database[i].name == name) {
                storage.database.splice(i, 1);
            }
        }
        await storage.save();

        res.status(201).json({
            token: req.token,
            //session: req.session,
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const incognito = asyncHandler ( async (req, res) => {
    try {
        var query = req.params.query;
        query = query.split("&");

        const storage = await find(query[0]);
        if (!storage) {
            throw new Error("Problem");
        }

        var data;

        for (let i=0; i<storage.database.length; i++) {
            if (storage.database[i].name == query[1]) {
                data = storage.database[i].data;
            }
        }

        res.status(201).json({
            data: data? data: "",
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

module.exports = { get, post, clear, update, remove, incognito };