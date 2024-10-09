import { Router } from "express";
import { MainController } from "../Controllers/mainController";

const mainRouter = Router();

mainRouter.post('/main', MainController);

export default mainRouter