const callService = require("../services/callService");
const asyncHandler = require("express-async-handler");

const exists = asyncHandler(async (req, res) => {
    const { callName } = req.params;
    const result = await callService.checkCallExists(callName);
    res.status(200).json({ token: req.token, ...result });
});

const search = asyncHandler(async (req, res) => {
    const { callName } = req.params;
    const userId = req.session;
    const result = await callService.findOrCreateCall({ callName, userId, isPrivate: false, password: "" });
    res.status(200).json({ token: req.token, ...result });
});

const join = asyncHandler(async (req, res) => {
    const { callName } = req.params;
    const userId = req.session;
    const result = await callService.joinCall({ callName, userId });
    res.status(200).json({ token: req.token, ...result });
});

const get = asyncHandler(async (req, res) => {
    const { callName } = req.params;
    const userId = req.session;
    const result = await callService.getCallDetails(callName, userId);
    res.status(200).json({ token: req.token, ...result });
});

const update = asyncHandler(async (req, res) => {
    const { callName, password, isPrivate } = req.body;
    const userId = req.session;
    const result = await callService.updateCallMeta({ callName, userId, password, isPrivate });
    res.status(200).json({ token: req.token, ...result });
});

const leave = asyncHandler(async (req, res) => {
    const { callName } = req.params;
    const userId = req.session;
    const result = await callService.leaveCall({ callName, userId });
    res.status(200).json({ token: req.token, ...result });
});

module.exports = { exists, search, join, get, update, leave };