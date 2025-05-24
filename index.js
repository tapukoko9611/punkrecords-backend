const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io')(server, {
  cors: {
    origin: "https://punkrecords.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const setupSocket = require('./socket'); 
const connectDB = require("./config/db");
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes'); 
const editorRoutes = require('./routes/editorRoutes');
const fileRoutes = require('./routes/fileRoutes');
const callRoutes = require('./routes/callRoutes');

dotenv.config();

app.use(express.json());
app.set("trust proxy", true);
app.use(cors({
  origin: "https://punkrecords.onrender.com",
  credentials: true,
}));

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/editors', editorRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/calls', callRoutes);

setupSocket(socketIo);

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  try {
      await connectDB();
      console.log(`Server running on port ${PORT}`);
  }
  catch (e) {
      console.log(e);
  }
});