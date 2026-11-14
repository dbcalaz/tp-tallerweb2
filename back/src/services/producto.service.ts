import type { ProductoRepository } from "../repository/producto.repository.js"

export class ProductoService {

    constructor(private productoRepository: ProductoRepository) { }

    async obtenerProductos(busqueda?: string) {
        return await this.productoRepository.getProductos(busqueda);
    }

    async obtenerProductoPorId(id: number) {
        const producto = await this.productoRepository.getProductoPorId(id);

        if (producto == null) {
            throw new Error("No se encontró ningún producto.")
        }

        return producto;
    }

}