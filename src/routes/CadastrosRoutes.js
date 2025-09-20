import express from 'express';
import CadastrosControllers from '../controllers/CadastrosControllers.js';

const router = express.Router();

router
    .post('/cadastrar_feira', CadastrosControllers.cadastrarFeira)
    .post('/cadastrar_feirante', CadastrosControllers.cadastrarFeirante);

export default router;

