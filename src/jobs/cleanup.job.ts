import { CLEANUP_JOB_INTERVAL, MAX_IDLE_TIME } from "..";
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
    logger.warn("Cleaup Messages Job started")
  }, CLEANUP_JOB_INTERVAL);
}

function startRoomCleanup() {
  setInterval(() => {
    // Dar de baja a los rooms mas antiguos
    logger.warn("Cleaup Rooms Job started")
    roomManager
        .getRooms()
        .filter((room: Room) => room.isIdle(MAX_IDLE_TIME))
        .forEach((room : Room) => roomManager.cleanUpRoom(room.id))
  }, CLEANUP_JOB_INTERVAL);
}

function startGameCleanup() {
  setInterval(() => {
    // Abortar games mas antiguos
    logger.warn("Cleaup Games Job started")
    gameManager
        .getAll()
        .filter((game: Game) => game.isIdle(MAX_IDLE_TIME))
        .forEach((game: Game) => gameManager.endGame(game.id))
  }, CLEANUP_JOB_INTERVAL);
}
