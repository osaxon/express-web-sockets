import express from "express";
import { createServer } from "node:http";
import { SessionSocket } from "./types";
import session from "express-session";
import { join } from "node:path";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = createServer(app);

const sessionMiddleware = session({
    secret: "super-secret-message",
    resave: true,
    saveUninitialized: true,
});

app.use(sessionMiddleware);

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "/views/index.html"));
});

app.post("/incr", (req, res) => {
    const session = req.session;
    session.count = (session.count || 0) + 1;
    res.status(200).end("" + session.count);
});

const io = new Server(server);
io.engine.use(sessionMiddleware);

// const wrapper = (middleware: any) => (socket: Socket, next: any) =>
//     middleware(socket.request, {}, next);
// io.use(wrapper(session));

function doSomethingWithSocket(socket: SessionSocket) {
    console.log(socket.request.session);
}

io.on("connection", (defaultSocket: Socket) => {
    const socket = <SessionSocket>defaultSocket;
    doSomethingWithSocket(socket);

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });
});

export { app, server };
