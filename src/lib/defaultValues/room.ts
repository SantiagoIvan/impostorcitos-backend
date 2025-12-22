import { RoomType } from "../../domain";

export const defaultRoom = {
    id: "0",
    admin: "",
    name: "",
    password: "",
    privacy: RoomType.PUBLIC,
    createdAt: "",
    discussionTime: 0,
    voteTime: 0,
    moveTime: 0,
    maxPlayers: 0,
    players: []
}