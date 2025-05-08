// const asyncHandler = require("express-async-handler");

// const Editor = require("../models/editorModel");
// const Message = require("../models/messageModel");
// const User = require("../models/userModel");

const asyncHandler = require("express-async-handler");
const editorService = require("../services/editorService");

// // for creating a custom editor (while picking names)
// const exists = asyncHandler(async (req, res) => {
//     try {
//         var { editorName } = req.params;
//         var editor = await Editor.findOne({ name: editorName });
//         res.status(201).json({
//             status: editor != null,
//             token: req.token
//         });
//     } catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // just find/create an editor by editorName
// const find = async ({ editorName, userId, isPrivate, password }) => {
//     try {
//         var editor = await Editor.findOne({
//             name: editorName,
//         });

//         if (!editor) {
//             editor = await Editor.create({
//                 name: editorName,
//                 createdBy: userId,
//                 isPrivate: isPrivate,
//                 password: password,
//                 participants: {
//                     userId: Date.now()
//                 },
//                 content: "",
//                 language: "txt"
//             });

//             await User.updateOne(
//                 { _id: userId },  // Find the user by their ID
//                 { $push: { createdEditors: editor._id } }  // Push the new editor ID
//             );
//         }
//         return editor;
//     }
//     catch (err) {
//         throw new Error(err.message);
//     }
// };

// // called upon any/every editor init to get editor details
// const search = asyncHandler(async (req, res) => {
//     try {
//         var { editorName } = req.params;
//         var userId = req.session;

//         const editor = await find({ editorName, userId, isPrivate: false, password: "" });

//         res.status(201).json({
//             editor: editor,
//             message: "here you go"
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // called upon joining request for an editor, used to accept a join request
// const join = asyncHandler(async (req, res) => {
//     try {
//         var { editorName } = req.params;
//         var userId = req.session;

//         const editor = await find({ editorName, userId, isPrivate: false, password: "" });
//         const user = await User.findById(userId);

//         if (!editor.participants.has(userId)) {
//             editor.participants.set(userId, Date.now());
//             await editor.save();
//         }
//         if (!user.joinedEditors.has(editor._id)) {
//             user.joinedEditors.set(editor._id, new Date());
//             await user.save();
//         }

//         res.status(201).json({
//             message: "Joined",
//             editor: editor,
//         });
//     } catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // called to change editor contain (can also be handled through sockets?)
// const post = asyncHandler(async (req, res) => {
//     try {
//         var { text, editorName, replyTo } = req.body;
//         var userId = req.session;

//         var editor = await find({ editorName, userId, isPrivate: false, password: "" });
//         if (!editor) {
//             throw new Error("Problem");
//         }
//         if (!editor.participants.has(userId)) {
//             throw new Error("This is a private editor");
//         }

//         editor.content = text;
//         await editor.save();

//         res.status(201).json({
//             editor: editor,
//         });
//     }
//     catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // its a backdoor to get editor details, just incase of a refresh?
// const get = asyncHandler(async (req, res) => {
//     try {
//         var { editorName, } = req.params;
//         var userId = req.session;

//         const editor = await find({ editorName, userId, isPrivate: false, password: "" });
//         if (!editor) {
//             throw new Error("Problem");
//         }

//         res.status(201).json({
//             editor: editor
//         });
//     }
//     catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // used to change editor metadata
// const update = asyncHandler(async (req, res) => {
//     try {
//         var { editorName, password, isPrivate, language } = req.body;
//         var userId = req.session;

//         const editor = await find({ editorName, userId, password: "", isPrivate: false });
//         if (!editor) {
//             throw new Error("Problem");
//         }
//         if (editor.createdBy != userId) {
//             throw new Error("No admin prevallages");
//         }

//         editor.password = password;
//         editor.isPrivate = isPrivate;
//         editor.language = language;
//         await editor.save();

//         res.status(201).json({
//             editor: editor
//         });
//     } catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // used to clear editor content
// const clear = asyncHandler(async (req, res) => {
//     try {
//         var { editorName } = req.body;
//         var userId = req.session;

//         const editor = await find({ editorName, userId, password: "", isPrivate: false });
//         if (!editor) {
//             throw new Error("Problem");
//         }
//         if (editor.createdBy != userId) {
//             throw new Error("No admin prevallages");
//         }

//         editor.content = "";
//         editor.language = "txt";
//         await editor.save();

//         res.status(201).json({
//             message: "Done"
//         });
//     }
//     catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// module.exports = { exists, search, join, get, post, update, clear };



// Check if an editor exists
const exists = asyncHandler(async (req, res) => {
    const { editorName } = req.params;
    const result = await editorService.checkEditorExists(editorName);
    res.status(200).json({ token: req.token, ...result });
});

// Search or create and return editor
const search = asyncHandler(async (req, res) => {
    const { editorName } = req.params;
    const userId = req.session;
    const result = await editorService.getEditor(editorName, userId);
    res.status(200).json({ token: req.token, ...result });
});

// Join editor
const join = asyncHandler(async (req, res) => {
    const { editorName } = req.params;
    const userId = req.session;
    const result = await editorService.joinEditor(editorName, userId);
    res.status(200).json({ token: req.token, ...result });
});

// Update editor content
const post = asyncHandler(async (req, res) => {
    const { text, editorName } = req.body;
    const userId = req.session;
    const result = await editorService.updateEditorContent({ editorName, userId, text });
    res.status(200).json({ token: req.token, ...result });
});

// Get editor details (again)
const get = asyncHandler(async (req, res) => {
    const { editorName } = req.params;
    const userId = req.session;
    const result = await editorService.getEditor(editorName, userId);
    res.status(200).json({ token: req.token, ...result });
});

// Update editor metadata
const update = asyncHandler(async (req, res) => {
    const { editorName, password, isPrivate, language } = req.body;
    const userId = req.session;
    const result = await editorService.updateEditorMeta({ editorName, userId, password, isPrivate, language });
    res.status(200).json({ token: req.token, ...result });
});

// Clear editor content
const clear = asyncHandler(async (req, res) => {
    const { editorName } = req.body;
    const userId = req.session;
    const result = await editorService.clearEditor(editorName, userId);
    res.status(200).json({ token: req.token, ...result });
});

module.exports = {
    exists,
    search,
    join,
    get,
    post,
    update,
    clear,
};



// // Check if an editor exists
// const exists = asyncHandler(async (req, res) => {
//     try {
//         const { editorName } = req.params;

//         const editor = await editorService.checkEditorExists(editorName);

//         res.status(200).json({
//             token: req.token,
//             isError: false,
//             message: editor==null,
//             editor: editor
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// // Search or create and return editor
// const search = asyncHandler(async (req, res) => {
//     try {
//         const { editorName } = req.params;
//         const userId = req.session;
    
//         const editor = await editorService.getEditor(editorName, userId);
    
        
//         res.status(200).json({
//             token: req.token,
//             isError: false,
//             message: "Editor found",
//             editor: editor
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// // Join editor
// const join = asyncHandler(async (req, res) => {
//     try {
//         const { editorName } = req.params;
//         const userId = req.session;
    
//         const editor = await editorService.joinEditor(editorName, userId);
    
        
//         res.status(200).json({
//             token: req.token,
//             isError: false,
//             message: "Joined Editor",
//             editor: editor
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// // Update editor content
// const post = asyncHandler(async (req, res) => {
//     try {
//         const { text, editorName } = req.body;
//         const userId = req.session;
    
//         const editor = await editorService.updateEditorContent({
//             editorName,
//             userId,
//             text,
//         });
    
        
//         res.status(200).json({
//             token: req.token,
//             isError: false,
//             message: "Content Updated",
//             editor: editor
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// // Get editor details (again)
// const get = asyncHandler(async (req, res) => {
//     try {
//         const { editorName } = req.params;
//         const userId = req.session;
    
//         const editor = await editorService.getEditor(editorName, userId);
    
        
//         res.status(200).json({
//             token: req.token,
//             isError: false,
//             message: "Editor Found",
//             editor: editor
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// // Update editor metadata
// const update = asyncHandler(async (req, res) => {
//     try {
//         const { editorName, password, isPrivate, language } = req.body;
//         const userId = req.session;
    
//         const editor = await editorService.updateEditorMeta({
//             editorName,
//             userId,
//             password,
//             isPrivate,
//             language,
//         });
    
        
//         res.status(200).json({
//             token: req.token,
//             isError: false,
//             message: "Editor Updated",
//             editor: editor
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// // Clear editor content
// const clear = asyncHandler(async (req, res) => {
//     try {
//         const { editorName } = req.body;
//         const userId = req.session;
    
//         await editorService.clearEditor(editorName, userId);
    
        
//         res.status(200).json({
//             token: req.token,
//             isError: false,
//             message: "Editor Cleared",
//             editor: editor
//         });
//     } catch (err) {
//         res.status(500).json({
//             token: req.token,
//             isError: true,
//             message: err.message || err || "Something went wrong",
//             data: null
//         });
//     }
// });

// module.exports = {
//     exists,
//     search,
//     join,
//     get,
//     post,
//     update,
//     clear,
// };