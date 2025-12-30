import { Vote } from "../domain";
import { VoteDto } from "../lib";

export function toVoteDTO(vote: Vote): VoteDto {
  return {
    roundId: vote.roundId,
    votedPlayer: vote.votedPlayer
  };
}

export function toVoteArrayDTO(votes: Vote[]): VoteDto[]{
  return votes.map((vote: Vote) => 
    toVoteDTO(vote)
  )
}
