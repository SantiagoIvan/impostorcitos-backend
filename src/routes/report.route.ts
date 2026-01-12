import { Router } from "express";
import { createReportHandler } from "../controllers";

const router = Router();

router.post("/", createReportHandler);

export default router;
