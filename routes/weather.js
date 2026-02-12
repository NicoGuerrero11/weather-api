import { Router } from "express";
import weather, { getStats } from "../controllers/weather.js";

const router = Router();

// Stats endpoint (should be first to avoid conflict with /:city)
router.get('/stats', getStats);

// Weather by city
router.get('/:city', weather);

export default router;