import { Router } from "express";
import { AccessController } from "../Controllers/accessController";
import { PinAccessMiddleware } from "../Middlewares/pinAccessMiddleware";

const accessRouter = Router();

accessRouter.post('/pin-access', PinAccessMiddleware, AccessController);

export default accessRouter;