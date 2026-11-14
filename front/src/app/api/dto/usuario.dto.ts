import {
  AuthenticatedUser,
  CompraUsuario,
  DetalleCompraItem,
  LoginData,
  PerfilUsuario,
  SignupData,
} from '../../modules/usuarios/interfaces/usuario.interface';

export class LoginRequestDto implements LoginData {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

export class RegistroRequestDto implements SignupData {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly nombre: string,
    public readonly apellido: string,
    public readonly direccion: string,
  ) {}
}

export class ActualizarPerfilRequestDto {
  constructor(
    public readonly nombre: string,
    public readonly apellido: string,
    public readonly direccion: string,
  ) {}
}

export class UsuarioResponseDto implements AuthenticatedUser {
  id!: string | number;
  email!: string;
  nombre!: string;
  apellido!: string;
  direccion?: string;
  createdAt?: string;
}

export class AuthResponseDto {
  message!: string;
  user!: UsuarioResponseDto;
}

export class DetalleCompraResponseDto implements DetalleCompraItem {
  id!: number;
  compraId!: number;
  productoId!: number;
  cantidad!: number;
  precioUnitario!: number;
  producto!: {
    id: number;
    nombre: string;
    imagenUrl?: string;
    precio: number;
  };
}

export class CompraResponseDto implements CompraUsuario {
  id!: number;
  userId!: number;
  total!: number;
  estado!: string;
  direccionEnvio?: string;
  createdAt!: string;
  detalles!: DetalleCompraResponseDto[];
}

export class PerfilUsuarioResponseDto implements PerfilUsuario {
  id!: number;
  email!: string;
  nombre!: string;
  apellido!: string;
  direccion!: string;
  createdAt!: string;
  compras!: CompraResponseDto[];
}

