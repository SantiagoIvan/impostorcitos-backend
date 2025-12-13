import { SubmitVoteDto, Vote } from "../shared";

export const VoteService = {
    createVote: (submiteVoteDto: SubmitVoteDto, roundId: number): Vote => {
        return {
            player: submiteVoteDto.username,
            votedPlayer: submiteVoteDto.targetPlayer,
            roundId
        }
    }
}