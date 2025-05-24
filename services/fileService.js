const File = require('../models/fileModel');
const User = require('../models/userModel');

const createResponse = (isError, message, data) => ({
    isError,
    message,
    data
});

const findOrCreateFile = async ({ fileName, userId, isPrivate, password, fileUrl = "", fileType = "", fileSize = 0 }) => {
    let file = await File.findOne({ name: fileName });

    if (!file) {
        file = await File.create({
            name: fileName,
            createdBy: userId,
            isPrivate: isPrivate || false,
            password: password || "",
            fileUrl: fileUrl || "",
            fileType: fileType || "",
            fileSize: fileSize || 0,
            participants: {
                [userId]: {
                    isActive: true,
                    joinedOn: new Date(),
                }
            },
            downloads: 0
        });
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    [`files.${file._id}`]: { isAdmin: true, joinedOn: new Date(), name: fileName },
                },
            }
        );
        return createResponse(false, "File Created", { file });
    } else if (file.fileUrl === "") {
        const oldCreatedBy = file.createdBy;
        file.createdBy = userId;
        file.isPrivate = isPrivate || false;
        file.password = password || "";
        file.fileUrl = fileUrl || "";
        file.fileType = fileType || "";
        file.fileSize = fileSize || 0;
        file.downloads = 0;
        await file.save();
        await User.updateOne({ _id: oldCreatedBy }, { $unset: { [`files.${file._id}`]: 1 } });
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    [`files.${file._id}`]: { isAdmin: true, joinedOn: new Date(), name: fileName },
                },
            }
        );
        return createResponse(false, "Existing file name claimed", { file });
    }
    return createResponse(false, "File Found", { file });
};


const checkFileExists = async (fileName) => {
    const file = await File.findOne({ name: fileName });
    return createResponse(false, "File Existence Checked", { exists: (!!file || (file && file?.fileUrl === "")) });
};


const joinFile = async ({ fileName, userId }) => {
    const { data: { file } } = await findOrCreateFile({ fileName, userId, isPrivate: false, password: "" });
    const user = await User.findById(userId);

    if (!file.participants.has(userId)) {
        file.participants.set(userId, { isActive: true, joinedOn: new Date() });
        file.downloads = file.downloads+1;
        await file.save();
    }
    if (!user.files.has(file._id)) {
        user.files.set(file._id, { isAdmin: file.createdBy == user._id, joinedOn: new Date(), name: fileName });
        await user.save();
    }
    return createResponse(false, "Joined File", { file });
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

// Post (update content)
const updateFileContent = async ({ fileName, userId, fileUrl, fileType = "", fileSize = 0 }) => {
    const { data: { file } } = await findOrCreateFile({ fileName, userId, isPrivate: false, password: "", fileUrl, fileType, fileSize });

    if (!file.participants.has(userId.toString())) {
        return createResponse(true, "Not a participant", null);
    }

    file.fileUrl = fileUrl;
    file.fileType = fileType;
    file.fileSize = fileSize;
    file.downloads = 1;
    await file.save();
    return createResponse(false, "Content Updated", { file });
};

const updateFileMeta = async ({ fileName, userId, password, isPrivate }) => {
    const { data: { file } } = await findOrCreateFile({ fileName, userId, isPrivate: false, password: "" });
    if (!file || String(file.createdBy) !== userId.toString()) {
        return createResponse(true, "No admin privileges", null);
    }
    file.password = password;
    file.isPrivate = isPrivate;
    await file.save();
    return createResponse(false, "File Metadata Updated", { file });
};

const clearFile = async ({ fileName, userId }) => {
    const { data: { file } } = await findOrCreateFile({ fileName, userId, isPrivate: false, password: "" });
    if (!file || String(file.createdBy) !== userId.toString()) {
        return createResponse(true, "No admin privileges", null);
    }
    file.fileUrl = "";
    file.fileSize = 0;
    file.fileType = "";
    file.downloads = 0;
    await file.save();
    return createResponse(false, "File Cleared", { file });
};

module.exports = {
    findOrCreateFile,
    createResponse,
    checkFileExists,
    joinFile,
    getFileDetails,
    updateFileContent,
    updateFileMeta,
    clearFile
};