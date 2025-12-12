import { Socket } from "socket.io";
import { defaultRoom } from "./room";
import { PhaseGame } from "../types";

export const defaultGame = {
    id: "",
    room: defaultRoom,
    topic: "",
    secretWord: "",
    activePlayers: [],
    impostor: "",
    moves: [],
    votes: [],
    impostorWonTheGame: false,
    nextTurnIndexPlayer: 0,
    currentPhase: PhaseGame.PLAY
}

export const defaultUserSocketMap = new Map<string, Socket>()