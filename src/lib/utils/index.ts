export function shuffle<T>(array: T[]): T[] {
  const result = [...array]; // no muta el original

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function getPlayersWithMostVotes(
  votes: Map<string, number>
): { playerIds: string[]; votes: number } {
  let maxVotes = 0;
  let lossers: string[] = [];

  for (const [playerId, count] of votes.entries()) {
    if (count > maxVotes) {
      maxVotes = count;
      lossers = [playerId];
    } else if (count === maxVotes) {
      lossers.push(playerId);
    }
  }

  return {
    playerIds: lossers,
    votes: maxVotes,
  };
}

export function transformSecondsToMS(duration : number) : number { return duration * 1000 }
