import { Game, RoundResult, Team } from "../shared"
import { GameService } from "./game.service";

export const RoundResultService = {
    createRoundResultDto: (game: Game, lossers: string[]): RoundResult => {
        return {
            roundId: game.currentRound,
            expelledPlayer : lossers.length === 1? lossers[0] : "",
            wasTie: lossers.length > 1 || lossers.length === 0,
            winner: GameService.hasCrewWon(game, lossers) ? {
                team: Team.CREW,
                message: "Gano el pueblo trabajador"
            } : GameService.hasImpostorWon(game, lossers) ? {
                team: Team.IMPOSTOR,
                message: "Gano el impostor"
            } : undefined
        }
    }
}