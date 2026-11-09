import { MarcaModel } from "./marca.model.js";
import { TipoProductoModel } from "./tipo-producto.model.js";

export class ProductoModel {
    id!: number;
    nombre!: string;
    descripcion?: string | null;
    precio!: number; // O Decimal dependiendo de cómo lo maneje Prisma
    stock!: number;
    imagenUrl?: string | null;
    marcaId!: number;
    tipoProductoId!: number;

    // Relaciones completas que traes desde el backend con el include
    marca?: MarcaModel;
    tipoProducto?: TipoProductoModel;
}