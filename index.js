const express = require("express");
const cors = require('cors');

const connectDB = require("./config/db");

const roomRoutes = require("./routes/roomRoutes")


const app = express();
const http = require('http').Server(app);
app.use(cors());
app.use(express.json());
app.set("trust proxy", true);

const io = require("socket.io")(http, {
    cors: {
        origin: "*"
    }
});


app.get("/trail", (req, res) => {
    res.json({ "msg": "The first step: doneee" });
});


// socketIO.on("connection", (socket) => {
//     console.log(`${socket.id} user just connected`);
//     socket.broadcast.emit("connections", `${socket.id} user just connected`);

//     socket.on("new message", (msg) => {
//         const { roomId } = msg;
//         delete msg.roomId;
//         //socket.broadcast.emit("new message", msg);
//         socket.broadcast.to(roomId).emit("new message", msg);
//     });

//     socket.on("clear chat", (msg) => {
//         const { roomId } = msg;
//         delete msg.roomId;
//         //socket.broadcast.emit("clear chat", msg);
//         socket.broadcast.to(roomId).emit("clear chat", msg);
//     });

//     socket.on("join room", (roomId) => {
//         //socket.broadcast.emit("new container", container);
//         socket.leave();
//         socket.join(roomId);
//         socketIO.sockets.in(roomId).emit('connectToRoom', "User: "+socket.id+"Joined the room: "+roomId);
//     });

//     socket.on("new container", (container) => {
//         const { roomId } = container;
//         delete container.roomId;
//         //socketIO.broadcast.to(roomId).emit("new container", container);
//         //socket.broadcast.emit("new container", container);
//         socket.broadcast.to(roomId).emit("new container", container);
//     });

//     socket.on("update container", (container) => {
//         const { roomId } = container;
//         delete container.roomId;
//         //socket.broadcast.emit("update container", container);
//         socket.broadcast.to(roomId).emit("update container", container);
//     });

//     socket.on("clear store", (msg) => {
//         const { roomId } = msg;
//         delete msg.roomId;
//         //socket.broadcast.emit("clear store", msg);
//         socket.broadcast.to(roomId).emit("clear store", msg);
//     });

//     socket.on("disconnect", () => {
//         console.log(`${socket.id} user disconnected`);
//         socket.broadcast.emit("connections", `${socket.id} user disconnected`);
//     })
// });



app.use("/wtf/room", roomRoutes);

// Global map: roomId => Set of active userIds
const roomUserMap = new Map();

// Tracks each socket's userId and rooms
const socketUserMap = new Map(); // socket.id => { userId, rooms: Set }

let peers = {};

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-room", ({ roomId, userId }) => {
        // Track socket to user and rooms
        if (!socketUserMap.has(socket.id)) {
            socketUserMap.set(socket.id, { userId, rooms: new Set() });
        }

        // Add user to the room's set
        if (!roomUserMap.has(roomId)) {
            roomUserMap.set(roomId, new Set());
        }

        roomUserMap.get(roomId).add(userId);
        socket.join(roomId);
        socketUserMap.get(socket.id).rooms.add(roomId);

        // Broadcast updated room users
        io.to(roomId).emit("room-users", {
            roomId,
            users: Array.from(roomUserMap.get(roomId)),
            newUser: userId
        });

        console.log(`${userId} joined room ${roomId}`);
    });

    socket.on("join-editor", ({ editorId, userId }) => {
        socket.join(editorId);

        // activeUsers.set(userId, socket.id); // mark user as active

        // Broadcast to the room
        socket.to(editorId).emit("editor-user-status", {
            // userId,
            // status: "online",
            // activeUsers: activeUsers,
            newUser: userId
        });

        console.log(`${userId} joined editor ${editorId}`);
    });

    socket.on("send-message", ({ roomId, message, userId }) => {
        io.to(roomId).emit("receive-message", {
            userId,
            message,
        });
    });

    socket.on("editor-update", ({ editorId, content, userId }) => {
        io.to(editorId).emit("receive-editor-update", {
            userId,
            content,
        });
    });

    socket.on("disconnect", () => {
        const userData = socketUserMap.get(socket.id);
        if (!userData) return;

        const { userId, rooms } = userData;
        delete peers[socket.id];

        for (const roomId of rooms) {
            const userSet = roomUserMap.get(roomId);
            if (userSet) {
                userSet.delete(userId);
                if (userSet.size === 0) {
                    roomUserMap.delete(roomId);
                } else {
                    io.to(roomId).emit("room-users", {
                        roomId,
                        users: Array.from(userSet),
                    });
                }
            }
        }

        socketUserMap.delete(socket.id);
        console.log(`${userId} disconnected`);
    });


    // socket.on("join-call", (callId) => {
    //     socket.join(callId);
    //     socket.to(callId).emit("user-joined", socket.id);
    // });

    // // Relay offer
    // socket.on("offer", ({ target, offer }) => {
    //     io.to(target).emit("offer", { sender: socket.id, offer });
    // });

    // // Relay answer
    // socket.on("answer", ({ target, answer }) => {
    //     io.to(target).emit("answer", { sender: socket.id, answer });
    // });

    // // Relay ICE candidates
    // socket.on("ice-candidate", ({ target, candidate }) => {
    //     io.to(target).emit("ice-candidate", { sender: socket.id, candidate });
    // });

    socket.on('join-call', () => {
        console.log(`${socket.id} joined the call`);
        peers[socket.id] = socket;
        const currentPeers = Object.keys(peers);
        console.log('Current peers on server:', currentPeers);
        io.emit('all-users', currentPeers);
        console.log('Emitted all-users:', currentPeers, 'to all clients');
    });

    socket.on('offer', (data) => {
        console.log(`Sending offer from ${socket.id} to ${data.target}`);
        if (peers[data.target]) {
            peers[data.target].emit('offer', { userId: socket.id, offer: data.offer });
        } else {
            console.log(`Target user ${data.target} not found`);
        }
    });

    socket.on('answer', (data) => {
        console.log(`Sending answer from ${socket.id} to ${data.target}`);
        if (peers[data.target]) {
            peers[data.target].emit('answer', { userId: socket.id, answer: data.answer });
        } else {
            console.log(`Target user ${data.target} not found`);
        }
    });

    socket.on('ice-candidate', (data) => {
        if (peers[data.target]) {
            peers[data.target].emit('ice-candidate', { userId: socket.id, candidate: data.candidate });
        } else {
            console.log(`Target user ${data.target} not found`);
        }
    });

});

// Simple broadcast timer for testing
setInterval(() => {
    console.log("Emitted");
    io.emit('heartbeat', 'Server heartbeat');
}, 4000);

http.listen(5000, async () => {
    try {
        await connectDB();
        console.log("Listening on port 5000");
    }
    catch (e) {
        console.log(e);
    }
});


// https://github.com/thebeautyofcoding/discord_clone_nestjs_reactjs