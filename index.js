const express = require("express");
const cors = require('cors');

const connectDB = require("./config/db");

const addaRoutes = require("./routes/addaRoutes");
const storageRoutes = require("./routes/storageRoutes");
const Storage = require("./models/storageModel");
const path = require("path");


const app = express();
const http = require('http').Server(app);
app.use(cors());
app.use(express.json());
app.set("trust proxy", true);

const  socketIO = require("socket.io")(http, {
    cors: {
        origin: "*"
    }
});


app.get("/trail", (req, res) => {
    res.json({"msg": "The first MF step: doneee"});
});

app.get("/wtf/ign/:query", async (req, res) => {
    try {
        var query = req.params.query;
        query = query.split("&");

        const storage = await Storage.findOne({name: query[0]});
        if (!storage) {
            res.status(201).json({
                data: "Storage does not exist"
            });
        }

        var data;

        for (let i=0; i<storage.database.length; i++) {
            if (storage.database[i].name == query[1]) {
                data = storage.database[i].data;
            }
        }

        res.status(201).json({
            data: data? data: "Container does not exist",
        });
    }
    catch (err) {
        res.status(401);
        throw new Error(err.message);
    }
})

app.use("/wtf/adda", addaRoutes);
app.use("/wtf/storage", storageRoutes);


socketIO.on("connection", (socket) => {
    console.log(`${socket.id} user just connected`);
    socket.broadcast.emit("connections", `${socket.id} user just connected`);

    socket.on("new message", (msg) => {
        const { roomId } = msg;
        delete msg.roomId;
        //socket.broadcast.emit("new message", msg);
        socket.broadcast.to(roomId).emit("new message", msg);
    });

    socket.on("clear chat", (msg) => {
        const { roomId } = msg;
        delete msg.roomId;
        //socket.broadcast.emit("clear chat", msg);
        socket.broadcast.to(roomId).emit("clear chat", msg);
    });

    socket.on("join room", (roomId) => {
        //socket.broadcast.emit("new container", container);
        socket.leave();
        socket.join(roomId);
        socketIO.sockets.in(roomId).emit('connectToRoom', "User: "+socket.id+"Joined the room: "+roomId);
    });

    socket.on("new container", (container) => {
        const { roomId } = container;
        delete container.roomId;
        //socketIO.broadcast.to(roomId).emit("new container", container);
        //socket.broadcast.emit("new container", container);
        socket.broadcast.to(roomId).emit("new container", container);
    });

    socket.on("update container", (container) => {
        const { roomId } = container;
        delete container.roomId;
        //socket.broadcast.emit("update container", container);
        socket.broadcast.to(roomId).emit("update container", container);
    });

    socket.on("clear store", (msg) => {
        const { roomId } = msg;
        delete msg.roomId;
        //socket.broadcast.emit("clear store", msg);
        socket.broadcast.to(roomId).emit("clear store", msg);
    });

    socket.on("disconnect", () => {
        console.log(`${socket.id} user disconnected`);
        socket.broadcast.emit("connections", `${socket.id} user disconnected`);
    })
});


// app.use(express.static(path.join(__dirname, "../frontend/build")));
// app.get("*", function (_, res) {
//     res.sendFile(
//         path.join(__dirname, "../frontend/build/index.html"),
//         function (err) {
//             res.status(500).send(err);
//         }
//     );
// });


http.listen(5000, async () => {
    try {
        await connectDB();
        console.log("Listening on port 500");
    }
    catch (e) {
        console.log(err.msg);
    }
});