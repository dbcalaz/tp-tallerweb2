import express from "express";
import { AppRoutes } from "./routes/index.js";

export const app = express();

app.use(express.json());
app.use(AppRoutes.routes);