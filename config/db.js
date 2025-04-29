const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://tapukoko9611:PWUdSewJ9q7yc6Tt@cluster0.b4zsy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("MongoDB successfully connected");
    }
    catch (err) {
        throw new Error(err.message);
    }
};

const User = require("../models/userModel");
const Room = require("../models/roomModel");
const Message = require("../models/messageModel");

module.exports = connectDB;