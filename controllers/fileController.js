const asyncHandler = require("express-async-handler");
const fileService = require("../services/fileService");

const File = require("../models/fileModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

// Check if a file name exists
const exists = asyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const result = await fileService.checkFileExists(fileName);
    res.status(200).json({ token: req.token, ...result });
});

// Find or create a file by fileName
const search = asyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const userId = req.session;
    const result = await fileService.findOrCreateFile({ fileName, userId, isPrivate: false, password: "" });
    res.status(201).json({ token: req.token, ...result });
});

// Join a file
const join = asyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const userId = req.session;
    const result = await fileService.joinFile({fileName, userId});
    res.status(201).json({ token: req.token, ...result });
});

// Upload a file (receive filePath/URL and metadata)
const post = asyncHandler(async (req, res) => {
    const { fileName, filePath, fileSize, fileType } = req.body;
    const userId = req.session;
    const result = await fileService.uploadFile({ fileName, userId, filePath, fileSize, fileType });
    res.status(201).json({ token: req.token, ...result });
});

// Download file (get file details and increment download count)
const get = asyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const userId = req.session;
    const result = await fileService.getFileDetails(fileName, userId);
    res.status(200).json({ token: req.token, ...result });
});

// Update file metadata
const update = asyncHandler(async (req, res) => {
    const { fileName, password, isPrivate } = req.body;
    const userId = req.session;
    const result = await fileService.updateFileMeta({ fileName, userId, password, isPrivate });
    res.status(201).json({ token: req.token, ...result });
});

// Clear file path (effectively deleting the uploaded file reference)
const clear = asyncHandler(async (req, res) => {
    const { fileName } = req.body;
    const userId = req.session;
    const result = await fileService.clearFile({ fileName, userId });
    res.status(201).json({ token: req.token, ...result });
});

module.exports = { exists, search, join, get, post, update, clear };