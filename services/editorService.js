const Editor = require('../models/editorModel');
const User = require('../models/userModel');

// // Create or find editor
// const findEditor = async ({ editorName, userId, isPrivate, password }) => {
//     let editor = await Editor.findOne({ name: editorName });

//     if (!editor) {
//         editor = await Editor.create({
//             name: editorName,
//             createdBy: userId,
//             isPrivate,
//             password,
//             participants: {
//                 [userId]: Date.now()
//             },
//             content: "",
//             language: "txt"
//         });

//         await User.updateOne(
//             { _id: userId },
//             { $push: { createdEditors: editor._id } }
//         );
//     }

//     return editor;
// };

// // Check if editor with given name exists
// const checkEditorExists = async (editorName) => {
//     const editor = await Editor.findOne({ name: editorName });
//     return editor;
// };

// // Join editor
// const joinEditor = async (editorName, userId) => {
//     const editor = await findEditor({ editorName, userId, isPrivate: false, password: "" });
//     const user = await User.findById(userId);

//     if (!editor.participants.has(userId)) {
//         editor.participants.set(userId, Date.now());
//         await editor.save();
//     }

//     if (!user.joinedEditors.has(editor._id)) {
//         user.joinedEditors.set(editor._id, new Date());
//         await user.save();
//     }

//     return editor;
// };

// // Post (update content)
// const updateEditorContent = async ({ editorName, userId, text }) => {
//     const editor = await findEditor({ editorName, userId, isPrivate: false, password: "" });

//     if (!editor.participants.has(userId)) {
//         throw new Error("This is a private editor");
//     }

//     editor.content = text;
//     await editor.save();
//     return editor;
// };

// // Get editor details
// const getEditor = async (editorName, userId) => {
//     return await findEditor({ editorName, userId, isPrivate: false, password: "" });
// };

// // Update editor metadata
// const updateEditorMeta = async ({ editorName, userId, password, isPrivate, language }) => {
//     const editor = await findEditor({ editorName, userId, isPrivate: false, password: "" });

//     if (editor.createdBy.toString() !== userId.toString()) {
//         throw new Error("No admin privileges");
//     }

//     editor.password = password;
//     editor.isPrivate = isPrivate;
//     editor.language = language;
//     await editor.save();

//     return editor;
// };

// // Clear editor content
// const clearEditor = async (editorName, userId) => {
//     const editor = await findEditor({ editorName, userId, isPrivate: false, password: "" });

//     if (editor.createdBy.toString() !== userId.toString()) {
//         throw new Error("No admin privileges");
//     }

//     editor.content = "";
//     editor.language = "txt";
//     await editor.save();

//     return true;
// };

// module.exports = {
//     findEditor,
//     checkEditorExists,
//     joinEditor,
//     updateEditorContent,
//     getEditor,
//     updateEditorMeta,
//     clearEditor
// };



const createResponse = (isError, message, data) => ({
    isError,
    message,
    data
});

// Create or find editor
const findEditor = async ({ editorName, userId, isPrivate, password }) => {
    let editor = await Editor.findOne({ name: editorName });

    if (!editor) {
        editor = await Editor.create({
            name: editorName,
            createdBy: userId,
            isPrivate,
            password,
            participants: {
                [userId]: Date.now()
            },
            content: "",
            language: "txt"
        });

        await User.updateOne(
            { _id: userId },
            { $push: { createdEditors: editor._id } }
        );
        return createResponse(false, "Editor Created", { editor });
    }
    return createResponse(false, "Editor Found", { editor });
};

// Check if editor with given name exists
const checkEditorExists = async (editorName) => {
    const editor = await Editor.findOne({ name: editorName });
    return createResponse(false, "Editor Existence Checked", { editor });
};

// Join editor
const joinEditor = async (editorName, userId) => {
    const { data: { editor } } = await findEditor({ editorName, userId, isPrivate: false, password: "" });
    const user = await User.findById(userId);

    if (!editor.participants.has(userId)) {
        editor.participants.set(userId, Date.now());
        await editor.save();
    }

    if (!user.joinedEditors.has(editor._id)) {
        user.joinedEditors.set(editor._id, new Date());
        await user.save();
    }

    return createResponse(false, "Joined Editor", { editor });
};

// Post (update content)
const updateEditorContent = async ({ editorName, userId, text }) => {
    const { data: { editor } } = await findEditor({ editorName, userId, isPrivate: false, password: "" });

    if (!editor.participants.has(userId)) {
        return createResponse(true, "Not a participant", null);
    }

    editor.content = text;
    await editor.save();
    return createResponse(false, "Content Updated", { editor });
};

// Get editor details
const getEditor = async (editorName, userId) => {
    const result = await findEditor({ editorName, userId, isPrivate: false, password: "" });
    return result;
};

// Update editor metadata
const updateEditorMeta = async ({ editorName, userId, password, isPrivate, language }) => {
    const { data: { editor } } = await findEditor({ editorName, userId, isPrivate: false, password: "" });

    if (editor.createdBy.toString() !== userId.toString()) {
        return createResponse(true, "No admin privileges", null);
    }

    editor.password = password;
    editor.isPrivate = isPrivate;
    editor.language = language;
    await editor.save();

    return createResponse(false, "Editor Updated", { editor });
};

// Clear editor content
const clearEditor = async (editorName, userId) => {
    const { data: { editor } } = await findEditor({ editorName, userId, isPrivate: false, password: "" });

    if (editor.createdBy.toString() !== userId.toString()) {
        return createResponse(true, "No admin privileges", null);
    }

    editor.content = "";
    editor.language = "txt";
    await editor.save();

    return createResponse(false, "Editor Cleared", { editor });
};

module.exports = {
    createResponse,
    findEditor,
    checkEditorExists,
    joinEditor,
    updateEditorContent,
    getEditor,
    updateEditorMeta,
    clearEditor
};