import {Router} from "express";
import weather from "../controllers/weather.js"

const router = Router()


router.get('/:city', weather)

export default router