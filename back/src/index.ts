import express, { type Request, type Response } from "express";
import { config } from "./config/config.js";
import { AppRoutes } from "./routes/comercioRoutes/routes.js";

const app = express();

const PORT = config.port;

app.use(express.json());

app.use(AppRoutes.routes)

app.listen(PORT, ()=>{
    console.log("Servidor funcionando.")
})