export interface AuthenticatedUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
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
