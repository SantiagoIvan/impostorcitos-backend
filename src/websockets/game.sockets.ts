import { Server, Socket } from "socket.io";
import { Game, GameEvents, SubmitWordDto } from "../shared";

export const registerGameEvents = (socket: Socket, io: Server, game: Game) => {
    socket.on(GameEvents.SUBMIT_WORD, (submitWordDto: SubmitWordDto) => {
        // Cuando alguien hace una jugada, registro el Move en el array de Moves con el current round
        // Calculo el siguiente turno
        // Emito Evento word Submitted.
        // Si ya todos jugaron, emito otro evento para activar la siguiente fase
        console.log("word submitted ", submitWordDto)
    })
}