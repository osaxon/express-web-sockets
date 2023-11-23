import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import {
    SessionSocket,
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
    PollState,
} from "./types";
import session from "express-session";
import { join } from "node:path";
import { Server, Socket } from "socket.io";

const app = express();
const server = createServer(app);

app.use(cors({ origin: "*" }));

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

const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SessionSocket
>(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

io.engine.use(sessionMiddleware);

io.use(addSessionToSocketData);

async function addSessionToSocketData(
    socket: SessionSocket,
    next: (err?: Error) => void
) {
    const session = socket.request.session;
    const user = socket.handshake.auth.token;

    if (session) {
        try {
            socket.data = { ...socket.data, user: user, session };
        } catch (error) {
            console.error(error);
        }
    }
    next();
}

// the server determines the PollState object, i.e. what users will vote on
// this will be sent to the client and displayed on the front-end
const poll: PollState = {
    question: "What are eating for lunch ✨ Let's order",
    options: [
        {
            id: 1,
            text: "Party Pizza Place",
            description: "Best pizza in town",
            votes: [],
        },
        {
            id: 2,
            text: "Best Burger Joint",
            description: "Best burger in town",
            votes: [],
        },
        {
            id: 3,
            text: "Sus Sushi Place",
            description: "Best sushi in town",
            votes: [],
        },
    ],
};

io.on("connection", (defaultSocket: Socket) => {
    const socket = <SessionSocket>defaultSocket;
    console.log("a user connected", socket.data);

    socket.on("askForStateUpdate", () => {
        console.log("client asked for state update");
        socket.emit("updateState", poll);
    });

    socket.on("vote", (optionId: number) => {
        poll.options.forEach((option) => {
            option.votes = option.votes.filter(
                (user) => user !== socket.data.user
            );
        });
        const option = poll.options.find((o) => o.id === optionId);
        if (!option) {
            return;
        }
        option.votes.push(socket.data.user);
        io.emit("updateState", poll);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

export { app, server };
