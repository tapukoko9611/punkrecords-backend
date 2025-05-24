const asyncHandler = require("express-async-handler");
const fileService = require("../services/fileService");

const File = require("../models/fileModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

// // for creating a custom file (while picking names)
// const exists = asyncHandler(async (req, res) => {
//     try {
//         var { fileName } = req.params;
//         var file = await File.findOne({ name: fileName });
//         res.status(201).json({
//             status: file != null,
//             token: req.token
//         });
//     } catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // just find/create an file by fileName
// const find = async ({ fileName, userId, isPrivate, password }) => {
//     try {
//         var file = await File.findOne({
//             name: fileName,
//         });

//         if (!file) {
//             file = await File.create({
//                 name: fileName,
//                 createdBy: userId,
//                 isPrivate: isPrivate,
//                 password: password,
//                 participants: {
//                     userId: Date.now()
//                 },
//                 content: "",
//                 language: "txt"
//             });
//         } else if(file && file.filePath==="") {
//             var oldUser = file.createdBy;
//             file.createdBy = userId;
//             file.isPrivate=false;
//             file.password = "";
//             await file.save();
//             await User.updateOne(
//                 {_id: oldUser},
//                 { $pop: { createdFiles: file._id }}
//             );
//         }

//         await User.updateOne(
//             { _id: userId },  // Find the user by their ID
//             { $push: { createdFiles: file._id } }  // Push the new file ID
//         );
//         return file;
//     }
//     catch (err) {
//         throw new Error(err.message);
//     }
// };

// // called upon any/every file init to get file details
// const search = asyncHandler(async (req, res) => {
//     try {
//         var { fileName } = req.params;
//         var userId = req.session;

//         const file = await find({ fileName, userId, isPrivate: false, password: "" });

//         res.status(201).json({
//             file: file,
//             message: "here you go"
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // called upon joining request for an file, used to accept a join request
// const join = asyncHandler(async (req, res) => {
//     try {
//         var { fileName } = req.params;
//         var userId = req.session;

//         const file = await find({ fileName, userId, isPrivate: false, password: "" });
//         const user = await User.findById(userId);

//         if (!file.participants.has(userId)) {
//             file.participants.set(userId, Date.now());
//             await file.save();
//         }
//         if (!user.joinedFiles.has(file._id)) {
//             user.joinedFiles.set(file._id, new Date());
//             await user.save();
//         }

//         res.status(201).json({
//             message: "Joined",
//             file: file,
//         });
//     } catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // to-do -----  upload file
// const post = asyncHandler(async (req, res) => {
    
// });

// // to-do ----- download file
// const get = asyncHandler(async (req, res) => {
    
// });

// // used to change file metadata
// const update = asyncHandler(async (req, res) => {
//     try {
//         var { fileName, password, isPrivate } = req.body;
//         var userId = req.session;

//         const file = await find({ fileName, userId, password: "", isPrivate: false });
//         if (!file) {
//             throw new Error("Problem");
//         }
//         if (file.createdBy != userId) {
//             throw new Error("No admin prevallages");
//         }

//         file.password = password;
//         file.isPrivate = isPrivate;
//         await file.save();

//         res.status(201).json({
//             file: file
//         });
//     } catch (err) {
//         res.status(401);
//         throw new Error(err.message);
//     }
// });

// // used to clear file content
// const clear = asyncHandler(async (req, res) => {
//     try {
//         var { fileName } = req.body;
//         var userId = req.session;

//         const file = await find({ fileName, userId, password: "", isPrivate: false });
//         if (!file) {
//             throw new Error("Problem");
//         }
//         if (file.createdBy != userId) {
//             throw new Error("No admin prevallages");
//         }

//         file.filePath = "";
//         await file.save();

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