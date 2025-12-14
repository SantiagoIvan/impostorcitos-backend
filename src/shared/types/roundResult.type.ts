import { Team } from "./team.enum";

export interface RoundResult {
  roundId: number;
  expelledPlayer: string
  wasTie: boolean;
  winner?: {
    team: Team | undefined;
    message: string;
  };
}