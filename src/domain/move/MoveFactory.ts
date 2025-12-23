import { SubmitWordDto } from "../../lib"
import { Move } from "./move.type"

export const MoveFactory = {
    createMove: (submitWordDto: SubmitWordDto, roundId: number) : Move => {
        return {
            roundId,
            player: submitWordDto.username,
            word: submitWordDto.word
        }
    }
}
