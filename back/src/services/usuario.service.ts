import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import {
    ActualizarPerfilDto,
    LoginUsuarioDto,
    PerfilUsuarioResponseDto,
    RegistroUsuarioDto,
    RestablecerPasswordDto,
    SolicitarRecuperacionDto,
    UsuarioResponseDto,
} from "../dto/usuario.dto.js";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../errors/http.error.js";
import type { UsuarioRepository } from "../repository/usuario.repository.js";
import { EmailService } from "./email.service.js";
import jwt from "jsonwebtoken";

const scrypt = promisify(scryptCallback);

export class UsuarioService {
    constructor(
        private readonly usuarioRepository: UsuarioRepository,
        private readonly emailService = new EmailService(),
    ) { }

    emitirToken(user: UsuarioResponseDto): string {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("Falta configurar JWT_SECRET en back/.env.");
        }
        return jwt.sign({ rol: user.rol }, secret, {
            subject: String(user.id),
            expiresIn: "8h",
        });
    }

    async registrar(dto: RegistroUsuarioDto): Promise<UsuarioResponseDto> {
        const salt = randomBytes(16).toString("hex");
        const derivedKey = await scrypt(dto.password, salt, 64) as Buffer;
        const passwordHash = `scrypt$${salt}$${derivedKey.toString("hex")}`;

        try {
            const user = await this.usuarioRepository.create({
                email: dto.email,
                passwordHash,
                nombre: dto.nombre,
                apellido: dto.apellido,
                direccion: dto.direccion,
            });
            return UsuarioResponseDto.fromEntity(user);
        } catch (error: unknown) {
            if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
                throw new ConflictError("Ese email ya está registrado. Probá con otro.", {
                    email: "Ya existe una cuenta con este email.",
                });
            }
            throw error;
        }
    }

    async login(dto: LoginUsuarioDto): Promise<UsuarioResponseDto> {
        const user = await this.usuarioRepository.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedError("No existe una cuenta registrada con este email. Registrate primero.");
        }

        const [algorithm, salt, hash] = user.passwordHash.split("$");
        let valid = false;
        if (algorithm === "scrypt" && salt && hash && /^[a-f0-9]+$/i.test(hash) && hash.length % 2 === 0) {
            const expected = Buffer.from(hash, "hex");
            const actual = await scrypt(dto.password, salt, expected.length) as Buffer;
            valid = actual.length === expected.length && timingSafeEqual(actual, expected);
        }

        if (!valid) {
            throw new UnauthorizedError("La contraseña ingresada es incorrecta.");
        }

        return UsuarioResponseDto.fromEntity(user);
    }

    async solicitarRecuperacion(dto: SolicitarRecuperacionDto): Promise<void> {
        const user = await this.usuarioRepository.findByEmail(dto.email);
        if (!user) return;

        const token = randomBytes(32).toString("base64url");
        const tokenHash = createHash("sha256").update(token).digest("hex");
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await this.usuarioRepository.replacePasswordResetToken(user.id, tokenHash, expiresAt);

        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:4200").replace(/\/+$/, "");
        const resetUrl = `${frontendUrl}/restablecer-contrasena?token=${encodeURIComponent(token)}`;
        await this.emailService.enviarEnlaceRecuperacion(user.email, resetUrl);
    }

    async restablecerPassword(dto: RestablecerPasswordDto): Promise<void> {
        const salt = randomBytes(16).toString("hex");
        const derivedKey = await scrypt(dto.password, salt, 64) as Buffer;
        const passwordHash = `scrypt$${salt}$${derivedKey.toString("hex")}`;
        const tokenHash = createHash("sha256").update(dto.token).digest("hex");
        const actualizado = await this.usuarioRepository.resetPasswordWithToken(tokenHash, passwordHash);

        if (!actualizado) {
            throw new BadRequestError("El enlace venció o ya fue utilizado. Solicitá uno nuevo.", {
                token: "El enlace venció o ya fue utilizado.",
            });
        }
    }

    async obtenerPerfil(userId: number): Promise<PerfilUsuarioResponseDto> {
        const user = await this.usuarioRepository.findByIdWithCompras(userId);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado.");
        }
        return PerfilUsuarioResponseDto.fromEntity(user);
    }

    async actualizarPerfil(userId: number, dto: ActualizarPerfilDto): Promise<UsuarioResponseDto> {
        try {
            const updated = await this.usuarioRepository.updateProfile(userId, {
                nombre: dto.nombre,
                apellido: dto.apellido,
                direccion: dto.direccion,
            });
            return UsuarioResponseDto.fromEntity(updated);
        } catch (error: unknown) {
            if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
                throw new NotFoundError("Usuario no encontrado.");
            }
            throw error;
        }
    }
}

