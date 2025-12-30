import { CLEANUP_JOB_INTERVAL, GAME_TTL, MESSAGE_TTL, ROOM_TTL } from "..";
import { Game, gameManager, messageManager, Room, roomManager } from "../domain";
import { ConsoleLogger } from "../logger";

const logger = new ConsoleLogger("CLEANUP")

export function startCleanupJobs() {
  startMessageCleanup();
  startRoomCleanup();
  startGameCleanup();
}

function startMessageCleanup() {
  setInterval(() => {
    // Borrar mensajes de chat general y los de los rooms mas antiguos
    logger.warn(`Cleaup Messages Job started. MESSAGE_TTL set to ${MESSAGE_TTL}`)
    const allMsgsMap = messageManager.getAll()
    const now = Date.now();

    for (const [roomId, messages] of allMsgsMap.entries()) {
        const filtered = messages.filter( // Filtro los que quiero que se queden asi lo seteo
            message => now - new Date(message.createdAt).getTime() <= MESSAGE_TTL
        );

        allMsgsMap.set(roomId, filtered);
        console.log(allMsgsMap.get(roomId))
    }

  }, CLEANUP_JOB_INTERVAL);
}

function startRoomCleanup() {
  setInterval(() => {
    // Dar de baja a los rooms mas antiguos
    logger.warn(`Cleaup Rooms Job started. ROOM_TTL set to ${ROOM_TTL}`)
    roomManager
        .getRooms()
        .filter((room: Room) => room.isIdle(ROOM_TTL))
        .forEach((room : Room) => roomManager.cleanUpRoom(room.id))
  }, CLEANUP_JOB_INTERVAL);
}

function startGameCleanup() {
  setInterval(() => {
    // Abortar games mas antiguos
    logger.warn(`Cleaup Games Job started. GAME_TTL set to ${GAME_TTL}`)
    gameManager
        .getAll()
        .filter((game: Game) => game.isIdle(GAME_TTL))
        .forEach((game: Game) => gameManager.endGame(game.id))
  }, CLEANUP_JOB_INTERVAL);
}
