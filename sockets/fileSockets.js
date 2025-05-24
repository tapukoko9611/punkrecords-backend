const fileService = require("../services/fileService");

const setupFileSockets = (io, socket, getUserId, getToken) => {
    // 1. Frontend asks for file info (check if exists or create)
    socket.on("file:search", async ({ fileName, token, privacy, password }) => {
        if (!getUserId()) return;

        try {
        const result = await fileService.findOrCreateFile({fileName, userId: getUserId(), isPrivate: privacy, password});
            socket.emit("file:searched", result);
        } catch (error) {
            console.error("Error checking/creating file:", error);
            socket.emit("file:error", { isError: true, message: "Failed to check or create file", data: null });
        }
    });

    // 2. Frontend asks to join file
    socket.on("file:join", async ({ fileName, type="No", token: clientToken }) => {
        if (!getUserId()) return;

        try {
            const result = await fileService.joinFile({fileName, userId: getUserId()});
            socket.join(`file-${result.data.file._id.toString()}`);
            socket.emit("file:joined", {...result, token: getToken(), type});
            
            socket.to(`file-${result.data.file._id.toString()}`).emit("user:joined:file", { userId: getUserId() });
        } catch (error) {
            console.error("Error joining file:", error);
            socket.emit("file:error", { isError: true, message: "Failed to join file", data: null });
        }
    });

    // 3. Frontend sends an update to the file content
    socket.on("file:content:update", async ({ fileName, fileUrl, fileSize, fileType, token }) => {
        if (!getUserId()) return;

        try {
            const result = await fileService.updateFileContent({ fileName, userId: getUserId(), fileUrl, fileSize, fileType });
            if (!result.isError) {
                io.to(`file-${result.data.file._id.toString()}`).emit("file:content:updated", result);
            } else {
                socket.emit("file:error", result);
            }
        } catch (error) {
            console.error("Error updating file content:", error);
            socket.emit("file:error", { isError: true, message: "Failed to update content", data: null });
        }
    });
 
    // 4. Frontend asks for the current file content
    socket.on("file:content:get", async ({ fileName, token }) => {
        if (!getUserId()) return;

        try {
            const result = await fileService.getFileDetails({fileName, userId: getUserId()});
            socket.emit("file:content:got", result);
        } catch (error) {
            console.error("Error getting file content:", error);
            socket.emit("file:error", { isError: true, message: "Failed to get content", data: null });
        }
    });

    // 5. Frontend asks to clear the file content
    socket.on("file:content:clear", async ({ fileName, token }) => {
        if (!getUserId()) return;

        try {
            const result = await fileService.clearFile({fileName, userId: getUserId()});
            if (!result.isError) {
                io.to(`file-${result.data.file._id.toString()}`).emit("file:content:cleared");
            } else {
                socket.emit("file:error", result);
            }
        } catch (error) {
            console.error("Error clearing file content:", error);
            socket.emit("file:error", { isError: true, message: "Failed to clear content", data: null });
        }
    });

    // 6. Frontend updates file metadata (e.g., language, privacy)
    socket.on("file:metadata:update", async ({ fileName, password, privacy, token }) => {
        if (!getUserId()) return;

        try {
            const result = await fileService.updateFileMeta({ fileName, userId: getUserId(), password, isPrivate: privacy });
            if (!result.isError) {
                // io.to(`file-${result.data.file._id.toString()}`).emit("file:meta:updated", { isPrivate: result.data.file.isPrivate, language: result.data.file.language });
                socket.emit("file:metadata:updated", result);
            } else {
                socket.emit("file:error", result);
            }
        } catch (error) {
            console.error("Error updating file metadata:", error);
            socket.emit("file:error", { isError: true, message: "Failed to update file metadata", data: null });
        }
    });
};

module.exports = setupFileSockets;