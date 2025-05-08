const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io')(server, {
  cors: {
    origin: '*', // Adjust as needed for security
    methods: ['GET', 'POST'],
  },
});
const setupSocket = require('./socket'); // Assuming your socket logic is in './socket.js'
const connectDB = require("./config/db");
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes'); 
const editorRoutes = require('./routes/editorRoutes');
const fileRoutes = require('./routes/fileRoutes');
const callRoutes = require('./routes/callRoutes');

dotenv.config();

// Middleware
app.use(express.json());
app.set("trust proxy", true);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/editors', editorRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/calls', callRoutes);

// Socket.IO Setup
setupSocket(socketIo); // Pass the Socket.IO instance to your setup function

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