import { defaultRoom } from "./room";

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
    nextTurnIndexPlayer: 0
}