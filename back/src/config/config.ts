import dotenv from "dotenv/config";
import env from "env-var";

export const config = {
    port: env.get('PORT').required().asPortNumber()
}