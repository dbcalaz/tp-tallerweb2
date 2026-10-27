import { config } from "./config/config.js";
import { app } from "./app.js";

app.listen(config.port, () => {
    console.log("Servidor funcionando en el puerto " + config.port + ".");
});