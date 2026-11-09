import dotenv from "dotenv/config";
import env from "env-var";

export const config = {
    port: env.get('PORT').default('5555').asPortNumber(),
    db: env.get('DATABASE_URL').required().asString()
}
