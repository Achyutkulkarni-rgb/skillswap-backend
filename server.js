const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./Routes/auth");
const matchRoutes = require("./Routes/match");

const app = express();
app.use(cors());
app.use(express.json());

// Existing routes
app.use("/api", authRoutes);
app.use("/api", matchRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"));

// 🆕 Socket.io setup
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // or set to your frontend URL
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("send_message", (data) => {
    io.emit("receive_message", data); // broadcast message
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

// 🆕 Replace app.listen with server.listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
