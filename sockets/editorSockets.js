const editorService = require("../services/editorService");

const setupEditorSockets = (io, socket, getUserId, getToken) => {
    // 1. Frontend asks for editor info (check if exists or create)
    socket.on("editor:search", async ({ editorName, token, privacy, password }) => {
        if (!getUserId()) return;

        try {
        const result = await editorService.findOrCreateEditor({editorName, userId: getUserId(), isPrivate: privacy, password});
            socket.emit("editor:searched", result);
        } catch (error) {
            console.error("Error checking/creating editor:", error);
            socket.emit("editor:error", { isError: true, message: "Failed to check or create editor", data: null });
        }
    });

    // 2. Frontend asks to join editor
    socket.on("editor:join", async ({ editorName, type="No", token: clientToken }) => {
        if (!getUserId()) return;

        try {
            const result = await editorService.joinEditor({editorName, userId: getUserId()});
            socket.join(`editor-${result.data.editor._id.toString()}`);
            socket.emit("editor:joined", {...result, token: getToken(), type});
            
            socket.to(`editor-${result.data.editor._id.toString()}`).emit("user:joined:editor", { userId: getUserId() });
        } catch (error) {
            console.error("Error joining editor:", error);
            socket.emit("editor:error", { isError: true, message: "Failed to join editor", data: null });
        }
    });

    // 3. Frontend sends an update to the editor content
    socket.on("editor:content:update", async ({ editorName, text, token }) => {
        if (!getUserId()) return;

        try {
            const result = await editorService.updateEditorContent({ editorName, userId: getUserId(), text });
            if (!result.isError) {
                io.to(`editor-${result.data.editor._id.toString()}`).emit("editor:content:updated", result);
            } else {
                socket.emit("editor:error", result);
            }
        } catch (error) {
            console.error("Error updating editor content:", error);
            socket.emit("editor:error", { isError: true, message: "Failed to update content", data: null });
        }
    });
 
    // 4. Frontend asks for the current editor content
    socket.on("editor:content:get", async ({ editorName, token }) => {
        if (!getUserId()) return;

        try {
            const result = await editorService.getEditor({editorName, userId: getUserId()});
            socket.emit("editor:content:got", result);
        } catch (error) {
            console.error("Error getting editor content:", error);
            socket.emit("editor:error", { isError: true, message: "Failed to get content", data: null });
        }
    });

    // 5. Frontend asks to clear the editor content
    socket.on("editor:content:clear", async ({ editorName, token }) => {
        if (!getUserId()) return;

        try {
            const result = await editorService.clearEditor({editorName, userId: getUserId()});
            if (!result.isError) {
                io.to(`editor-${result.data.editor._id.toString()}`).emit("editor:content:cleared");
            } else {
                socket.emit("editor:error", result);
            }
        } catch (error) {
            console.error("Error clearing editor content:", error);
            socket.emit("editor:error", { isError: true, message: "Failed to clear content", data: null });
        }
    });

    // 6. Frontend updates editor metadata (e.g., language, privacy)
    socket.on("editor:metadata:update", async ({ editorName, password, privacy, language, token }) => {
        if (!getUserId()) return;

        try {
            const result = await editorService.updateEditorMeta({ editorName, userId: getUserId(), password, isPrivate: privacy, language });
            if (!result.isError) {
                // io.to(`editor-${result.data.editor._id.toString()}`).emit("editor:meta:updated", { isPrivate: result.data.editor.isPrivate, language: result.data.editor.language });
                socket.emit("editor:metadata:updated", result);
            } else {
                socket.emit("editor:error", result);
            }
        } catch (error) {
            console.error("Error updating editor metadata:", error);
            socket.emit("editor:error", { isError: true, message: "Failed to update editor metadata", data: null });
        }
    });
};

module.exports = setupEditorSockets;