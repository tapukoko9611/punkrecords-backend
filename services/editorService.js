const Editor = require('../models/editorModel');
const User = require('../models/userModel');

const createResponse = (isError, message, data) => ({
    isError,
    message,
    data
});

const findOrCreateEditor = async ({ editorName, userId, isPrivate, password }) => {
    let editor = await Editor.findOne({ name: editorName });

    if (!editor) {
        editor = await Editor.create({
            name: editorName,
            createdBy: userId,
            isPrivate,
            password,
            participants: {
                [userId]: {
                    isActive: true,
                    joinedOn: new Date(),
                }
            },
            content: "",
            language: "txt"
        });

        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    [`editors.${editor._id}`]: { isAdmin: true, joinedOn: new Date(), name: editorName },
                },
            }
        );
        return createResponse(false, "Editor Created", { editor });
    }
    return createResponse(false, "Editor Found", { editor });
};

// Check if editor with given name exists
const checkEditorExists = async (editorName) => {
    const editor = await Editor.findOne({ name: editorName });
    return createResponse(false, "Editor Existence Checked", { exists: !!editor });
};

const joinEditor = async ({editorName, userId}) => {
    const { data: { editor } } = await findOrCreateEditor({ editorName, userId, isPrivate: false, password: "" });
    const user = await User.findById(userId);

    if (!editor.participants.has(userId)) {
        editor.participants.set(userId, { isActive: true, joinedOn: new Date() });
        await editor.save();
    }

    if (!user.editors.has(editor._id)) {
        user.editors.set(editor._id, { isAdmin: editor.createdBy==user._id, joinedOn: new Date(), name: editorName });
        await user.save();
    }

    return createResponse(false, "Joined Editor", { editor });
};

// Get editor details
const getEditor = async ({editorName, userId}) => {
    const editor = await findOrCreateEditor({ editorName, userId, isPrivate: false, password: "" });
    return createResponse(false, "Editor", { editor });
};

// Post (update content)
const updateEditorContent = async ({ editorName, userId, text }) => {
    const { data: { editor } } = await findOrCreateEditor({ editorName, userId, isPrivate: false, password: "" });

    if (!editor.participants.has(userId.toString())) {
        return createResponse(true, "Not a participant", null);
    }

    editor.content = text;
    await editor.save();
    return createResponse(false, "Content Updated", { editor });
};

// Update editor metadata
const updateEditorMeta = async ({ editorName, userId, password, isPrivate, language }) => {
    const { data: { editor } } = await findOrCreateEditor({ editorName, userId, isPrivate: false, password: "" });

    if (!editor || editor.createdBy.toString() !== userId.toString()) {
        return createResponse(true, "No admin privileges", null);
    }

    editor.password = password;
    editor.isPrivate = isPrivate;
    editor.language = language;
    await editor.save();

    return createResponse(false, "Editor Updated", { editor });
};

// Clear editor content
const clearEditor = async ({editorName, userId}) => {
    const { data: { editor } } = await findOrCreateEditor({ editorName, userId, isPrivate: false, password: "" });

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
    findOrCreateEditor,
    checkEditorExists,
    joinEditor,
    updateEditorContent,
    getEditor,
    updateEditorMeta,
    clearEditor
};