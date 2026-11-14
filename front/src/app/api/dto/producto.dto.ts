export class ProductoRestDto {
  id!: number;
  nombre!: string;
  descripcion!: string | null;
  precio!: number | string;
  stock!: number;
  imagenUrl!: string | null;
  marca?: { id: number; nombre: string };
  tipoProducto?: {
    id: number;
    nombre: string;
    categoria?: { id: number; nombre: string };
  };
}

