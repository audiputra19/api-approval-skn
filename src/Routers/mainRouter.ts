import { Router } from "express";
import { FileController, MainController } from "../Controllers/mainController";

const mainRouter = Router();

mainRouter.post('/main', MainController);
mainRouter.post('/file', FileController);

export default mainRouter