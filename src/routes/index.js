import express from "express";
import CadastriosRoutes from './CadastrosRoutes.js';
import RelatoriosRoutes from "./RelatoriosRoutes.js";

const routes = (app) => {
    app.route('/').get((req, res) => {
        res.status(200).send({titulo: 'Pagina inicial'})
    })

    app.route('/ping').get((req, res) => {
        res.status(200).send({titulo: 'pong!'})
    })

    app.use(
        express.json(),
        CadastriosRoutes,
        RelatoriosRoutes
    )
}

export default routes;