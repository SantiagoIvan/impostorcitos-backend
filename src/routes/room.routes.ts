import { Router } from "express";
import { createRoomHandler, getRoomsHandler, joinRoomController } from "../controllers";

const router = Router();

router.post("/", createRoomHandler);
router.get("/", getRoomsHandler)
router.post("/", createRoomHandler);
router.post("/join", joinRoomController)

export default router;
