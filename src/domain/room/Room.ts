import { RoomType } from "../../lib"
import { Player } from "../player"

export class Room{
    public players = new Map<string, Player>();

    constructor(
        public readonly id: string,
        public readonly privacy: RoomType,
        public readonly admin: string,
        public readonly name: string,
        public readonly createdAt: Date,
        public readonly discussionTime: number,
        public readonly voteTime: number,
        public readonly moveTime: number,
        public readonly maxPlayers: number,
        private password?: string
    ){}

    isPublic(): boolean { return this.privacy === RoomType.PUBLIC}

    removePlayer(playerName: string) : Room {
        this.players.delete(playerName);
        return this
    }
    canJoin(passwordAttempt?: string): boolean {
        if(this.getPlayerCount() >= this.maxPlayers){
            throw new Error("Can't join the room. Too much players");
        }
        if (this.privacy === RoomType.PUBLIC) return true;
        return this.password === passwordAttempt;
    }

    addPlayer(player: Player, passwordAttempt?: string): void {
        if (!this.canJoin(passwordAttempt)) {
            throw new Error("Invalid room password");
        }
        this.players.set(player.name, player);
    }

    isEmpty(): boolean {
        return this.players.size === 0;
    }

    getPlayerCount(): number {
        return this.players.size;
    }
    isFull(): boolean {
        return this.players.size === this.maxPlayers
    }
    hasPlayer(name: string) : boolean {
        return this.players.has(name)
    }
}