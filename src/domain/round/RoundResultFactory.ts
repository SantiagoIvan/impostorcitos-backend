import {  RoundResult, Team } from "../../lib"
import { Game } from "../game";
import { Player } from "../player";

export const RoundResultFactory = {
    createRoundResultDto: (game: Game, lossers: string[]): RoundResult => {
        return {
            roundId: game.getCurrentRound,
            expelledPlayer : lossers.length === 1? lossers[0] : "",
            wasTie: !game.getAborted? (lossers.length !== 1) : false,
            winner: game.getAborted ? {
                team: undefined,
                message: "Quitearon y se tuvo que abortar la partida, ojala te hubiesen abortado a vos hijo de puta"
            } :crewWon(game) ? {
                team: Team.CREW,
                message: "Gano el pueblo trabajador"
            } : impostorWon(game) ? {
                team: Team.IMPOSTOR,
                message: "Gano el impostor"
            } : undefined
        }
    }
}

const crewWon = (game: Game) => !game.getAlivePlayers().some((player: Player) => player.name === game.getImpostor())
const impostorWon = (game: Game) => {
    const alivePlayers = game.getAlivePlayers()
    return alivePlayers.length < 3 && alivePlayers.some((player: Player) => player.name === game.getImpostor())
}