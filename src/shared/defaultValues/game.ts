import { Socket } from "socket.io";
import { defaultRoom } from "./room";
import { GamePhase } from "../types";

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
    orderToPlay: [],
    currentPhase: GamePhase.PLAY,
    currentRound: 0
}

export const defaultUserSocketMap = new Map<string, Socket>()