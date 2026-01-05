import { Router } from "express";
import { createRoomHandler, getRoomsHandler } from "../controllers";

const router = Router();

router.post("/", createRoomHandler);
router.get("/", getRoomsHandler)

export default router;
