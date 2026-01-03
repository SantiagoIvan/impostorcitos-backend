import { Router } from "express";
import { createRoomHandler } from "../controllers";

const router = Router();

router.post("/", createRoomHandler);

export default router;
