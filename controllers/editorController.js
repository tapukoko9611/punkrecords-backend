const asyncHandler = require("express-async-handler");

const Editor = require("../models/editorModel");
const Message = require("../models/messageModel");

const find = async ({editorName, userId, isPrivate, password}) => {
    try {
        var editor = await Editor.findOne({
            name: editorName,
        });

        if(!editor) {
            editor = await Editor.create({
                name: editorName,
                createdBy: userId,
                isPrivate: isPrivate,
                password: password,
                participants: {
                    userId: {
                        isActive: true,
                        joinedOn: Date.now
                    }
                }
            });
        }
        return editor;
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
};

const join = asyncHandler ((async(req, res) => {
    try {
        var { userId, editorName } = req.body;

        const editor = await find(editorName);
        if(!editor) {
            throw new Error("Problem");
        }

        if(!editor.participants.has(user._id)) {
            editor.participants.set(userId, {
                isActive: true,
                joinedOn: new Date()
              });
            await editor.save();
        } 

        res.status(201).json({
            message: "Joined",
        });

    } catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
}));

const post = asyncHandler ( async (req, res) => {
    try {
        var editorName = req.params.editorName;
        var { text, user, editorName, replyTo } = req.body;

        const editor = await find(editorName);
        if (!editor) {
            throw new Error("Problem");
        }
        if(!editor.participants.has(user._id)) {
            throw new Error("This is a private editor");
        } 

        const msg = new Message({
            fromUser: user._id,
            editorName: editorName,
            body: text,
            replyTo: replyTo
        });
        await msg.save();

        res.status(201).json({
            message: msg,
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const get = asyncHandler ( async (req, res) => {
    try {
        var { editorName, count } = req.body;
        editorName = editorName | req.params.editorName;

        const editor = await find(editorName);
        if (!editor) {
            throw new Error("Problem");
        }

        const messages = await Message.find({ editorName })
        .sort({ createdAt: -1 })
        .skip(Number(count))
        .limit(Number(50));

        res.status(201).json({
            messages: messages
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
}); 

const update = asyncHandler(async (req, res) => {
    try {
        var {userId, editorName, password, isPrivate} = req.body;
        editorName = editorName | req.params.editorName;

        const editor = await find(editorName);
        if (!editor) {
            throw new Error("Problem");
        }
        if(editor.createdBy!=userId) {
            throw new Error("No admin prevallages");
        }

        editor.password = password;
        editor.isPrivate = isPrivate;
        await editor.save();
        
    } catch(err) {
        res.status(401);
        throw new Error(err.message);
    }
});

const clear = asyncHandler ( async (req, res) => {
    try {
        var {userId, editorName} = req.body;
        editorName = editorName | req.params.editorName;

        const editor = await find(editorName);
        if (!editor) {
            throw new Error("Problem");
        }
        if(editor.createdBy!=userId) {
            throw new Error("No admin prevallages");
        }

        await Message.deleteMany({editorName: editorName});

        res.status(201).json({
            // chat: editor.chat,

        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
});

module.exports = { get, post, clear };