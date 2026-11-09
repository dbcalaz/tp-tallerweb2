export interface ProductoRest {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number | string; // Prisma Decimal suele llegar como string
  stock: number;
  imagenUrl: string | null;
  marca?: { id: number; nombre: string };
  tipoProducto?: { id: number; nombre: string; categoria?: { id: number; nombre: string } };
}
