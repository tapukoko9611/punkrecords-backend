const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://root:wgDy2iU1mdoTlPZd@cluster0.dwknpqs.mongodb.net/WTF?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("MongoDB successfully connected");
    }
    catch (err) {
        throw new Error(err.message);
    }
};

const Device = require("../models/deviceModel");
const Session = require("../models/sessionModel");
const Adda = require("../models/addaModel");
//const Message = require("../models/messageModel");
const Storage = require("../models/storageModel");
//const Snippet = require("../models/snippetModel");

module.exports = connectDB;