import { defaultRoom } from "./room";

export const defaultGame = {
    id: "",
    room: defaultRoom,
    topic: "",
    secretWord: "",
    activePlayers: [],
    impostor: "",
    rounds: [],
    impostorWonTheGame: false,
    nextTurnIndexPlayer: 0
}