const File = require('../models/fileModel');
const User = require('../models/userModel');

const createResponse = (isError, message, data) => ({
    isError,
    message,
    data
});

const findOrCreateFile = async ({ fileName, userId, isPrivate, password, filePath = "", fileType = "", fileSize = 0 }) => {
    let file = await File.findOne({ name: fileName });

    if (!file) {
        file = await File.create({
            name: fileName,
            createdBy: userId,
            isPrivate: isPrivate || false,
            password: password || "",
            filePath: filePath || "",
            fileType: fileType || "",
            fileSize: fileSize || 0,
            participants: {
                [userId]: Date.now()
            },
            downloads: 0
        });
        await User.updateOne({ _id: userId }, { $push: { createdFiles: file._id } });
        return createResponse(false, "File Created", { file });
    } else if (file.filePath === "") {
        const oldCreatedBy = file.createdBy;
        file.createdBy = userId;
        file.isPrivate = isPrivate || false;
        file.password = password || "";
        file.filePath = filePath || "";
        file.fileType = fileType || "";
        file.fileSize = fileSize || 0;
        file.downloads = 0; // Reset downloads for the new owner/upload
        await file.save();
        await User.updateOne({ _id: oldCreatedBy }, { $pull: { createdFiles: file._id } });
        await User.updateOne({ _id: userId }, { $push: { createdFiles: file._id } });
        return createResponse(false, "Existing file name claimed", { file });
    }
    return createResponse(false, "File Found", { file });
};

const checkFileExists = async (fileName) => {
    const file = await File.findOne({ name: fileName });
    return createResponse(false, "File Existence Checked", { file });
};

const joinFile = async (fileName, userId) => {
    const { data: { file } } = await findOrCreateFile({ fileName, userId, isPrivate: false, password: "" });
    const user = await User.findById(userId);

    if (!file.participants.has(userId)) {
        file.participants.set(userId, Date.now());
        await file.save();
    }
    if (!user.joinedFiles.has(file._id)) {
        user.joinedFiles.set(file._id, new Date());
        await user.save();
    }
    return createResponse(false, "Joined File", { file });
};

const uploadFile = async ({ fileName, userId, filePath, fileSize, fileType }) => {
    const { data: { file } } = await findOrCreateFile({ fileName, userId, filePath, fileSize, fileType });
    return createResponse(false, "File Uploaded", { file });
};

const getFileDetails = async (fileName, userId) => {
    const file = await File.findOne({ name: fileName });
    if (!file) {
        return createResponse(true, "File not found", null);
    }
    file.downloads += 1;
    await file.save();
    return createResponse(false, "File Details Retrieved", { file });
};

const updateFileMeta = async ({ fileName, userId, password, isPrivate }) => {
    const { data: { file } } = await findOrCreateFile({ fileName, userId });
    if (!file || String(file.createdBy) !== userId) {
        return createResponse(true, "No admin privileges", null);
    }
    file.password = password;
    file.isPrivate = isPrivate;
    await file.save();
    return createResponse(false, "File Metadata Updated", { file });
};

const clearFile = async ({ fileName, userId }) => {
    const { data: { file } } = await findOrCreateFile({ fileName, userId });
    if (!file || String(file.createdBy) !== userId) {
        return createResponse(true, "No admin privileges", null);
    }
    file.filePath = "";
    file.fileSize = 0;
    file.fileType = "";
    await file.save();
    return createResponse(false, "File Cleared", { file });
};

module.exports = {
    createResponse,
    checkFileExists,
    joinFile,
    uploadFile,
    getFileDetails,
    updateFileMeta,
    clearFile
};