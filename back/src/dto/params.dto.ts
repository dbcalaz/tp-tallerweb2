import { BadRequestError } from "../errors/http.error.js";

export class IdParamDto {
    static parse(rawValue: unknown, label = "ID"): number {
        const id = Number(rawValue);
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestError(`${label} inválido.`);
        }
        return id;
    }
}

