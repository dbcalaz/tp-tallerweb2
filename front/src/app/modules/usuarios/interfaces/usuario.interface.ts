export interface AuthenticatedUser {
  id: string | number;
  email: string;
  nombre: string;
  apellido: string;
  direccion?: string;
}

export interface SignupData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  direccion: string;
}

export interface SignupResponse {
  message: string;
  user: AuthenticatedUser;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface DetalleCompraItem {
  id: number;
  compraId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  producto: {
    id: number;
    nombre: string;
    imagenUrl?: string;
    precio: number;
  };
}

export interface CompraUsuario {
  id: number;
  userId: number;
  total: number;
  estado: string;
  direccionEnvio?: string;
  createdAt: string;
  detalles: DetalleCompraItem[];
}

export interface PerfilUsuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  direccion: string;
  createdAt: string;
  compras: CompraUsuario[];
}
