import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response } from "express";
import { DatabaseNotConfiguredError, getPrisma } from "../../prisma.config.js";

const scrypt = promisify(scryptCallback);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegistrationPayload = {
    email?: unknown;
    password?: unknown;
    nombre?: unknown;
    apellido?: unknown;
    direccion?: unknown;
};
type LoginPayload = { email?: unknown; password?: unknown };

function isComplexPassword(password: string): boolean {
    return password.length >= 8
        && /[a-z]/.test(password)
        && /[A-Z]/.test(password)
        && /\d/.test(password)
        && /[^A-Za-z0-9]/.test(password);
}

export class UsuarioController {
    public getUsuarios = async (_req: Request, res: Response) => {
        res.status(200).json({ message: "API de usuarios disponible." });
    };

    public register = async (req: Request, res: Response) => {
        const payload = (req.body ?? {}) as RegistrationPayload;
        const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
        const password = typeof payload.password === "string" ? payload.password : "";
        const nombre = typeof payload.nombre === "string" ? payload.nombre.trim() : "";
        const apellido = typeof payload.apellido === "string" ? payload.apellido.trim() : "";
        const direccion = typeof payload.direccion === "string" ? payload.direccion.trim() : "";

        const fieldErrors: Record<string, string> = {};
        if (!email) fieldErrors.email = "Ingresá tu email.";
        else if (!emailPattern.test(email)) fieldErrors.email = "Ingresá un email con formato válido.";
        if (!password) fieldErrors.password = "Ingresá una contraseña.";
        else if (!isComplexPassword(password)) {
            fieldErrors.password = "Usá al menos 8 caracteres e incluí mayúscula, minúscula, número y símbolo.";
        }
        if (!nombre) fieldErrors.nombre = "Ingresá tu nombre.";
        if (!apellido) fieldErrors.apellido = "Ingresá tu apellido.";
        if (!direccion) fieldErrors.direccion = "Ingresá tu dirección.";

        if (Object.keys(fieldErrors).length > 0) {
            return res.status(400).json({ message: "Revisá los campos marcados.", fieldErrors });
        }

        try {
            const salt = randomBytes(16).toString("hex");
            const derivedKey = await scrypt(password, salt, 64) as Buffer;
            const passwordHash = "scrypt$" + salt + "$" + derivedKey.toString("hex");

            const user = await getPrisma().user.create({
                data: { email, passwordHash, nombre, apellido, direccion },
                select: { id: true, email: true, nombre: true, apellido: true },
            });

            return res.status(201).json({ message: "Tu cuenta se creó correctamente.", user });
        } catch (error: unknown) {
            if (error instanceof DatabaseNotConfiguredError) {
                return res.status(503).json({ message: "La base de datos no está configurada. Definí DATABASE_URL en back/.env." });
            }
            if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
                return res.status(409).json({
                    message: "Ese email ya está registrado. Probá con otro.",
                    fieldErrors: { email: "Ya existe una cuenta con este email." },
                });
            }

            console.error("Error al registrar usuario:", error);
            return res.status(500).json({ message: "No se pudo completar el registro. Intentá nuevamente." });
        }
    };

    public login = async (req: Request, res: Response) => {
        const payload = (req.body ?? {}) as LoginPayload;
        const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
        const password = typeof payload.password === "string" ? payload.password : "";
        if (!emailPattern.test(email) || !password) {
            return res.status(400).json({ message: "Ingresá un email válido y tu contraseña." });
        }

        try {
            const user = await getPrisma().user.findUnique({ where: { email } });
            const [algorithm, salt, hash] = user?.passwordHash.split("$") ?? [];
            let valid = false;
            if (algorithm === "scrypt" && salt && hash && /^[a-f0-9]+$/i.test(hash) && hash.length % 2 === 0) {
                const expected = Buffer.from(hash, "hex");
                const actual = await scrypt(password, salt, expected.length) as Buffer;
                valid = actual.length === expected.length && timingSafeEqual(actual, expected);
            }
            if (!user || !valid) return res.status(401).json({ message: "El email o la contraseña no coinciden." });
            return res.status(200).json({
                message: "Sesión iniciada correctamente.",
                user: { id: user.id, email: user.email, nombre: user.nombre, apellido: user.apellido },
            });
        } catch (error: unknown) {
            if (error instanceof DatabaseNotConfiguredError) {
                return res.status(503).json({ message: "La base de datos no está configurada. Definí DATABASE_URL en back/.env." });
            }
            console.error("Error al iniciar sesión:", error);
            return res.status(503).json({ message: "No se pudo consultar la base de datos. Revisá su configuración e intentá nuevamente." });
        }
    };
}
