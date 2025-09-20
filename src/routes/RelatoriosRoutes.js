import express from 'express';
import RelatoriosControllers from '../controllers/RelatoriosControllers.js';

const router = express.Router();

router
    .get('/buscar_feiras', RelatoriosControllers.buscarFeiras)
    .get('/buscar_feiras/:id/overview', RelatoriosControllers.feiraOverview)
    .get('/buscar_produtos', RelatoriosControllers.buscaProdutos)

export default router;

