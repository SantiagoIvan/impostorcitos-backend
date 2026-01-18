import { Router } from "express";
import { createRoomHandler, getRoomsHandler, joinRoomController, getRoomById } from "../controllers";

const router = Router();

router.post("/", createRoomHandler);
router.get("/", getRoomsHandler)
router.post("/", createRoomHandler);
router.post("/join", joinRoomController)
router.get("/:id", getRoomById)

export default router;
