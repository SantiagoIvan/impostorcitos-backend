import { Router } from "express";
import { ping } from "../controllers";

const router = Router();

router.get("/", ping);

export default router;
