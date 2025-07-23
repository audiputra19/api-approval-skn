import { Router } from "express";
import { ChangePinController } from "../Controllers/changePinController";

const changePinRouter = Router();

changePinRouter.post('/pin-change', ChangePinController);

export default changePinRouter;