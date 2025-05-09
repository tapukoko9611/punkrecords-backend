const fileService = require('../services/fileService');

const setupFileSockets = (io, socket, getUserId, getToken) => {
    // 1. Frontend asks if a file name exists
    socket.on("file:check", async ({ fileName, token }) => {
        if (!getUserId()) return;
        try {
            const result = await fileService.checkFileExists(fileName);
            socket.emit("file:checked", result);
        } catch (error) {
            console.error("Error checking file existence:", error);
            socket.emit("file:error", { isError: true, message: "Failed to check file existence", data: null });
        }
    });

    // 2. Frontend asks to join a file (find or create)
    socket.on("file:join", async ({ fileName, token: clientToken }) => {
        if (!getUserId()) return;
        try {
            const result = await fileService.joinFile(fileName, getUserId());
            socket.join(`file-${result.data.file._id.toString()}`);
            socket.emit("file:joined", {...result, token: getToken()});
            socket.to(`file-${result.data.file._id.toString()}`).emit("user:joined:file", { userId: getUserId() });
        } catch (error) {
            console.error("Error joining file:", error);
            socket.emit("file:error", { isError: true, message: "Failed to join file", data: null });
        }
    });

    // 3. Frontend uploads a file (sends metadata)
    socket.on("file:upload", async ({ fileName, filePath, fileSize, fileType, token }) => {
        if (!getUserId()) return;
        try {
            const result = await fileService.uploadFile({ fileName, userId: getUserId(), filePath, fileSize, fileType });
            socket.emit("file:uploaded", result);
            io.to(`file-${result.data.file._id.toString()}`).emit("file:updated", { filePath: result.data.file.filePath });
        } catch (error) {
            console.error("Error uploading file:", error);
            socket.emit("file:error", { isError: true, message: "Failed to upload file", data: null });
        }
    });

    // 4. Frontend requests file details (for download)
    socket.on("file:get", async ({ fileName, token }) => {
        if (!getUserId()) return;
        try {
            const result = await fileService.getFileDetails(fileName, getUserId());
            socket.emit("file:details", result);
            // Optionally emit to others about the download? (Consider privacy implications)
        } catch (error) {
            console.error("Error getting file details:", error);
            socket.emit("file:error", { isError: true, message: "Failed to get file details", data: null });
        }
    });

    // 5. Frontend updates file metadata
    socket.on("file:meta:update", async ({ fileName, password, isPrivate, token }) => {
        if (!getUserId()) return;
        try {
            const result = await fileService.updateFileMeta({ fileName, userId: getUserId(), password, isPrivate });
            socket.emit("file:meta:updated", result);
            io.to(`file-${result.data.file._id.toString()}`).emit("file:updated", { isPrivate: result.data.file.isPrivate });
        } catch (error) {
            console.error("Error updating file metadata:", error);
            socket.emit("file:error", { isError: true, message: "Failed to update file metadata", data: null });
        }
    });

    // 6. Frontend clears the file (removes filePath)
    socket.on("file:clear", async ({ fileName, token }) => {
        if (!getUserId()) return;
        try {
            const result = await fileService.clearFile({ fileName, userId: getUserId() });
            socket.emit("file:cleared", result);
            io.to(`file-${result.data.file._id.toString()}`).emit("file:updated", { filePath: "" });
        } catch (error) {
            console.error("Error clearing file:", error);
            socket.emit("file:error", { isError: true, message: "Failed to clear file", data: null });
        }
    });
};

module.exports = setupFileSockets;