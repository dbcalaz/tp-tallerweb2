export class ProductoRestDto {
  id!: number;
  nombre!: string;
  descripcion!: string | null;
  precio!: number | string;
  stock!: number;
  imagenUrl!: string | null;
  categoriaId?: number;
  activo!: boolean;
  marca?: { id: number; nombre: string };
  tipoProducto?: {
    id: number;
    nombre: string;
    categoriaId?: number;
    categoria?: { id: number; nombre: string };
  };
}

