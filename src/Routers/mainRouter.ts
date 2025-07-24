import { Router } from "express";
import { FileController, GetSaldoController, ListPoKontrabon, MainController } from "../Controllers/mainController";

const mainRouter = Router();

mainRouter.post('/main', MainController);
mainRouter.post('/file', FileController);
mainRouter.post('/kontrabon', ListPoKontrabon);
mainRouter.post('/get-saldo', GetSaldoController)

export default mainRouter