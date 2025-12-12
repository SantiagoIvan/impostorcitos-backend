import { randomInt } from "crypto"
import { words } from "../db"
import { topics } from "../db"
import { Player, parseTopic } from "../shared"

export const RandomGeneratorService = {
    generateRandomTopic: () : string => {
        const rnd = randomInt(0, topics.length)
        return topics[rnd]
    },
    generateRandomWordFromTopic: (topic: string): string => {
        const wordsFromTopic = words[parseTopic(topic)]
        const rnd = randomInt(0, wordsFromTopic.length)
        return wordsFromTopic[rnd]
    },
    generateRandomPlayer: (players: Player[]) : string => {
        const rnd = randomInt(0, players.length)
        return players[rnd].name
    }
}
