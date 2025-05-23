const asyncHandler = require("express-async-handler");
const editorService = require("../services/editorService");

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
    const result = await editorService.getEditor({editorName, userId, isPrivate: false, password: ""});
    res.status(200).json({ token: req.token, ...result });
});

// Join editor
const join = asyncHandler(async (req, res) => {
    const { editorName } = req.params;
    const userId = req.session;
    const result = await editorService.joinEditor({editorName, userId});
    res.status(200).json({ token: req.token, ...result });
});

// Get editor details (again)
const get = asyncHandler(async (req, res) => {
    const { editorName } = req.params;
    const userId = req.session;
    const result = await editorService.getEditor(editorName, userId);
    res.status(200).json({ token: req.token, ...result });
});

// Update editor content
const post = asyncHandler(async (req, res) => {
    const { text, editorName } = req.body;
    const userId = req.session;
    const result = await editorService.updateEditorContent({ editorName, userId, text });
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
    const result = await editorService.clearEditor({editorName, userId});
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