import type { CategoriaRepository } from "../repository/categoria.repository.js";

export class CategoriaService {

    constructor(private categoriaRepository: CategoriaRepository) { }

    async obtenerCategorias() {
        const categorias = await this.categoriaRepository.getCategorias();

        if (categorias.length == 0) {
            throw new Error("No se encontraron categorías.");
        }

        return categorias.map((categoria) => ({
            id: categoria.id,
            nombre: categoria.nombre,
            imagenUrl: categoria.imagenUrl,
            cantidadProductos: categoria.tiposProducto.reduce(
                (total, tipo) => total + tipo._count.productos,
                0
            ),
        }));
    }
}