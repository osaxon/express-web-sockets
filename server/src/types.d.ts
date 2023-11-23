import type { IncomingMessage } from "http";
import type { SessionData } from "express-session";
import type { Socket } from "socket.io";

declare module "express-session" {
    interface SessionData {
        user: string;
        count: number;
        // ... the rest of the variables you intent to store in the session object
    }
}

interface SessionIncomingMessage extends IncomingMessage {
    session: SessionData;
}

export interface SessionSocket extends Socket {
    request: SessionIncomingMessage;
}

export type PollState = {
    question: string;
    options: {
        id: number;
        text: string;
        description: string;
        votes: string[];
    }[];
};
export interface ClientToServerEvents {
    vote: (optionId: number) => void;
    askForStateUpdate: () => void;
}
export interface ServerToClientEvents {
    updateState: (state: PollState) => void;
}
export interface InterServerEvents {}

export interface SocketData {
    user: string;
}

export type PollState = {
    question: string;
    options: {
        id: number;
        text: string;
        description: string;
        votes: string[];
    }[];
};
