import {  RoundResult, Team } from "../../lib"
import { Game } from "../game";

export const RoundResultFactory = {
    createRoundResultDto: (game: Game, lossers: string[]): RoundResult => {
        return {
            roundId: game.getCurrentRound,
            expelledPlayer : lossers.length === 1? lossers[0] : "",
            wasTie: !game.getAborted? lossers.length > 1 || lossers.length === 0 : false,
            winner: game.hasCrewWon(lossers) ? {
                team: Team.CREW,
                message: "Gano el pueblo trabajador"
            } : game.hasImpostorWon(lossers) ? {
                team: Team.IMPOSTOR,
                message: "Gano el impostor"
            } : game.getAborted ? {
                team: undefined,
                message: "Quitearon y se tuvo que abortar la partida, ojala te hubiesen abortado a vos hijo de puta"
            } : undefined
        }
    }
}