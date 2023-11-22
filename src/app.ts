import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import { join } from "node:path";
const { Server } = require("socket.io");

const app = express();

const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "/views/index.html"));
});

io.on("connection", (socket) => {
    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });
});

export { app, server };
