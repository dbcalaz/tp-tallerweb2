import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';
import {
    LoginUsuarioDto,
    RestablecerPasswordDto,
    SolicitarRecuperacionDto,
} from '../src/dto/usuario.dto.js';
import type { UsuarioRepository } from '../src/repository/usuario.repository.js';
import { UsuarioService } from '../src/services/usuario.service.js';

const user = {
    id: 7,
    email: 'toti@example.com',
    nombre: 'Toti',
    apellido: 'Polito',
    direccion: 'Calle 123',
    passwordHash: '',
    createdAt: new Date('2026-01-01T00:00:00Z'),
};

function servicioCon(repo: Record<string, (...args: any[]) => any>, email: Record<string, (...args: any[]) => any> = { enviarEnlaceRecuperacion: async () => {} }) {
    return new UsuarioService(repo as unknown as UsuarioRepository, email as any);
}

describe('recuperación de contraseña', () => {
    it('normaliza el email y rechaza formatos inválidos', () => {
        assert.equal(SolicitarRecuperacionDto.fromBody({ email: '  TOTI@Example.com ' }).email, 'toti@example.com');
        assert.throws(() => SolicitarRecuperacionDto.fromBody({ email: 'no-es-mail' }));
    });

    it('genera un token hasheado con vencimiento a 30 minutos y envía el enlace', async () => {
        let saved: { userId: number; tokenHash: string; expiresAt: Date } | undefined;
        let sent: { destination: string; url: string } | undefined;
        const start = Date.now();
        const service = servicioCon({
            findByEmail: async () => user,
            replacePasswordResetToken: async (userId, tokenHash, expiresAt) => { saved = { userId, tokenHash, expiresAt }; },
        }, {
            enviarEnlaceRecuperacion: async (destination, url) => { sent = { destination, url }; },
        });

        await service.solicitarRecuperacion(SolicitarRecuperacionDto.fromBody({ email: user.email }));

        assert.ok(saved);
        assert.equal(saved.userId, user.id);
        assert.ok(Math.abs(saved.expiresAt.getTime() - start - 30 * 60 * 1000) < 100);
        assert.ok(sent);
        assert.equal(sent.destination, user.email);
        const token = new URL(sent.url).searchParams.get('token');
        assert.ok(token);
        assert.notEqual(saved.tokenHash, token);
        assert.equal(saved.tokenHash, createHash('sha256').update(token).digest('hex'));
    });

    it('no revela ni envía nada cuando el email no tiene cuenta', async () => {
        let touched = false;
        const service = servicioCon({
            findByEmail: async () => null,
            replacePasswordResetToken: async () => { touched = true; },
        }, { enviarEnlaceRecuperacion: async () => { touched = true; } });
        await service.solicitarRecuperacion(SolicitarRecuperacionDto.fromBody({ email: 'nadie@example.com' }));
        assert.equal(touched, false);
    });

    it('acepta una nueva contraseña compleja y solo pasa su hash al repositorio', async () => {
        let captured: { tokenHash: string; passwordHash: string } | undefined;
        const service = servicioCon({
            resetPasswordWithToken: async (tokenHash, passwordHash) => {
                captured = { tokenHash, passwordHash };
                return true;
            },
        });
        await service.restablecerPassword(RestablecerPasswordDto.fromBody({ token: 'token-raw', password: 'NuevaClave9!' }));
        assert.ok(captured);
        assert.equal(captured.tokenHash, createHash('sha256').update('token-raw').digest('hex'));
        assert.match(captured.passwordHash, /^scrypt\$/);
        assert.ok(!captured.passwordHash.includes('NuevaClave9!'));
    });

    it('rechaza tokens vencidos o ya usados', async () => {
        const service = servicioCon({ resetPasswordWithToken: async () => false });
        await assert.rejects(
            service.restablecerPassword(RestablecerPasswordDto.fromBody({ token: 'viejo', password: 'NuevaClave9!' })),
            /venció o ya fue utilizado/i,
        );
    });

    it('rechaza contraseña débil y token vacío', () => {
        assert.throws(() => RestablecerPasswordDto.fromBody({ token: 'abc', password: 'password' }));
        assert.throws(() => RestablecerPasswordDto.fromBody({ token: '', password: 'NuevaClave9!' }));
    });
});

describe('autenticación', () => {
    it('normaliza el email del login y requiere una contraseña', () => {
        assert.equal(LoginUsuarioDto.fromBody({ email: ' Toti@Example.com ', password: 'x' }).email, 'toti@example.com');
        assert.throws(() => LoginUsuarioDto.fromBody({ email: 'toti@example.com', password: '' }));
    });

    it('permite entrar con la contraseña registrada y rechaza otra', async () => {
        const registrar = servicioCon({ create: async (data) => ({ ...user, passwordHash: data.passwordHash }) });
        const dto = (await import('../src/dto/usuario.dto.js')).RegistroUsuarioDto.fromBody({
            email: user.email, password: 'ClaveSegura9!', nombre: user.nombre, apellido: user.apellido, direccion: user.direccion,
        });
        const registered = await registrar.registrar(dto);
        const storedUser = { ...user, passwordHash: '', ...registered };
        // El fake conserva el hash generado por registrar para reproducir el almacenamiento.
        const repo = { create: async (data: { passwordHash: string }) => (storedUser.passwordHash = data.passwordHash, { ...storedUser }) };
        const service = servicioCon(repo);
        await service.registrar(dto);
        const loginService = servicioCon({ findByEmail: async () => storedUser });
        assert.equal((await loginService.login(LoginUsuarioDto.fromBody({ email: user.email, password: 'ClaveSegura9!' }))).email, user.email);
        await assert.rejects(loginService.login(LoginUsuarioDto.fromBody({ email: user.email, password: 'OtraClave9!' })));
    });
});
