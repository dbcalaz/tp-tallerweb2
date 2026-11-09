import type { ProductoRepository } from "../repository/producto.repository.js"

export class ProductoService {

    constructor(private productoRepository: ProductoRepository) { }

    async obtenerProductos() {
        const productos = await this.productoRepository.getProductos();

        if(productos.length == 0){
            throw new Error("No se encontró ningún producto.")
        }

        return productos;
    }

}