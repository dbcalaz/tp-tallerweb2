import { CategoriaModel } from "./categoria.model.js";

export class TipoProductoModel {
    id!: number;
    nombre!: string;
    categoriaId!: number;
    categoria?: CategoriaModel; // Relación anidada
}