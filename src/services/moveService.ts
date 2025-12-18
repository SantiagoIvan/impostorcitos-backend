import { Move, SubmitWordDto } from "../lib"

export const MoveService = {
    createMove: (submitWordDto: SubmitWordDto, roundId: number) : Move => {
        return {
            roundId,
            player: submitWordDto.username,
            word: submitWordDto.word
        }
    }
}
