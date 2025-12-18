import { SubmitVoteDto, Vote } from "../lib";

export const VoteService = {
    createVote: (submiteVoteDto: SubmitVoteDto, roundId: number): Vote => {
        return {
            player: submiteVoteDto.username,
            votedPlayer: submiteVoteDto.targetPlayer,
            roundId
        }
    }
}