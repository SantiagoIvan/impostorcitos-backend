import { SubmitVoteDto } from "../../lib";
import { Vote } from "./vote.type";

export const VoteFactory = {
    createVote: (submiteVoteDto: SubmitVoteDto, roundId: number): Vote => {
            return {
                player: submiteVoteDto.username,
                votedPlayer: submiteVoteDto.targetPlayer,
                roundId
            }
        }
}