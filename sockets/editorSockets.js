const editorService = require("../services/editorService");

// const setupEditorSockets = (io, socket, userId) => {
//     // 1. Frontend asks for editor info (check if exists or create)
//     socket.on("editor:check", async ({ editorName, token }) => {
//         if (!userId) return;

//         try {
//             const editorExists = await editorService.checkEditorExists(editorName);
//             if (editorExists) {
//                 socket.emit("editor:checked", { editor: editorExists });
//             } else {
//                 const newEditor = await editorService.findEditor({ editorName, userId, isPrivate: false, password: "" });
//                 socket.emit("editor:checked", { editor: newEditor });
//             }
//         } catch (error) {
//             console.error("Error checking/creating editor:", error);
//             socket.emit("editor:error", { message: "Failed to check or create editor" });
//         }
//     });

//     // 2. Frontend asks to join editor
//     socket.on("editor:join", async ({ editorName, token }) => {
//         if (!userId) return;

//         try {
//             const editor = await editorService.joinEditor(editorName, userId);
//             socket.join(`editor-${editor._id.toString()}`); // Join a specific editor room
//             socket.emit("editor:joined", { editorId: editor._id });
//             // Optionally emit to others in the editor that a user joined
//             socket.to(`editor-${editor._id.toString()}`).emit("user:joined:editor", { userId });
//         } catch (error) {
//             console.error("Error joining editor:", error);
//             socket.emit("editor:error", { message: "Failed to join editor" });
//         }
//     });

//     // 3. Frontend sends an update to the editor content
//     socket.on("editor:content:update", async ({ editorName, text, token }) => {
//         if (!userId) return;

//         try {
//             const editor = await editorService.updateEditorContent({ editorName, userId, text });
//             io.to(`editor-${editor._id.toString()}`).emit("editor:content:updated", { content: editor.content });
//         } catch (error) {
//             console.error("Error updating editor content:", error);
//             socket.emit("editor:error", { message: "Failed to update content" });
//         }
//     });

//     // 4. Frontend asks for the current editor content
//     socket.on("editor:content:get", async ({ editorName, token }) => {
//         if (!userId) return;

//         try {
//             const editor = await editorService.getEditor(editorName, userId);
//             socket.emit("editor:content:get", { content: editor.content });
//         } catch (error) {
//             console.error("Error getting editor content:", error);
//             socket.emit("editor:error", { message: "Failed to get content" });
//         }
//     });

//     // 5. Frontend asks to clear the editor content
//     socket.on("editor:content:clear", async ({ editorName, token }) => {
//         if (!userId) return;

//         try {
//             await editorService.clearEditor(editorName, userId);
//             io.to(`editor-${editorName}`).emit("editor:content:cleared"); // Emit to all in the editor
//         } catch (error) {
//             console.error("Error clearing editor content:", error);
//             socket.emit("editor:error", { message: "Failed to clear content" });
//         }
//     });

//     // 6. Frontend updates editor metadata (e.g., language, privacy)
//     socket.on("editor:meta:update", async ({ editorName, password, isPrivate, language, token }) => {
//         if (!userId) return;

//         try {
//             const editor = await editorService.updateEditorMeta({ editorName, userId, password, isPrivate, language });
//             io.to(`editor-${editor._id.toString()}`).emit("editor:meta:updated", { isPrivate: editor.isPrivate, language: editor.language });
//         } catch (error) {
//             console.error("Error updating editor metadata:", error);
//             socket.emit("editor:error", { message: "Failed to update editor metadata" });
//         }
//     });
// };

// module.exports = setupEditorSockets;

const setupEditorSockets = (io, socket, userId) => {
    // 1. Frontend asks for editor info (check if exists or create)
    socket.on("editor:check", async ({ editorName, token }) => {
        if (!userId) return;

        try {
            const result = await editorService.checkEditorExists(editorName);
            socket.emit("editor:checked", result);
        } catch (error) {
            console.error("Error checking/creating editor:", error);
            socket.emit("editor:error", { isError: true, message: "Failed to check or create editor", data: null });
        }
    });

    // 2. Frontend asks to join editor
    socket.on("editor:join", async ({ editorName, token: clientToken }) => {
        if (!userId) return;

        try {
            const result = await editorService.joinEditor(editorName, userId);
            socket.join(`editor-${result.data.editor._id.toString()}`); // Join a specific editor room
            socket.emit("editor:joined", {...result, token});
            // Optionally emit to others in the editor that a user joined
            socket.to(`editor-${result.data.editor._id.toString()}`).emit("user:joined:editor", { userId });
        } catch (error) {
            console.error("Error joining editor:", error);
            socket.emit("editor:error", { isError: true, message: "Failed to join editor", data: null });
        }
    });

    // 3. Frontend sends an update to the editor content
    socket.on("editor:content:update", async ({ editorName, text, token }) => {
        if (!userId) return;

        try {
            const result = await editorService.updateEditorContent({ editorName, userId, text });
            if (!result.isError) {
                io.to(`editor-${result.data.editor._id.toString()}`).emit("editor:content:updated", { content: result.data.editor.content });
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
        if (!userId) return;

        try {
            const result = await editorService.getEditor(editorName, userId);
            socket.emit("editor:content:get", result);
        } catch (error) {
            console.error("Error getting editor content:", error);
            socket.emit("editor:error", { isError: true, message: "Failed to get content", data: null });
        }
    });

    // 5. Frontend asks to clear the editor content
    socket.on("editor:content:clear", async ({ editorName, token }) => {
        if (!userId) return;

        try {
            const result = await editorService.clearEditor(editorName, userId);
            if (!result.isError) {
                io.to(`editor-${result.data.editor._id.toString()}`).emit("editor:content:cleared"); // Emit to all in the editor
            } else {
                socket.emit("editor:error", result);
            }
        } catch (error) {
            console.error("Error clearing editor content:", error);
            socket.emit("editor:error", { isError: true, message: "Failed to clear content", data: null });
        }
    });

    // 6. Frontend updates editor metadata (e.g., language, privacy)
    socket.on("editor:meta:update", async ({ editorName, password, isPrivate, language, token }) => {
        if (!userId) return;

        try {
            const result = await editorService.updateEditorMeta({ editorName, userId, password, isPrivate, language });
            if (!result.isError) {
                io.to(`editor-${result.data.editor._id.toString()}`).emit("editor:meta:updated", { isPrivate: result.data.editor.isPrivate, language: result.data.editor.language });
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