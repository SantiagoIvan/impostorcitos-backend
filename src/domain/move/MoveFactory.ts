import { Move, SubmitWordDto } from "../../lib"

export const MoveFactory = {
    createMove: (submitWordDto: SubmitWordDto, roundId: number) : Move => {
        return {
            roundId,
            player: submitWordDto.username,
            word: submitWordDto.word
        }
    }
}
