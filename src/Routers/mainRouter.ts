import { Router } from "express";
import { FileController, ListPoKontrabon, MainController } from "../Controllers/mainController";

const mainRouter = Router();

mainRouter.post('/main', MainController);
mainRouter.post('/file', FileController);
mainRouter.post('/kontrabon', ListPoKontrabon);

export default mainRouter