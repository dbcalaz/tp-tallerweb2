import { FiltroProductoDto, ProductoResponseDto } from "../dto/producto.dto.js";
import { NotFoundError } from "../errors/http.error.js";
import type { ProductoRepository } from "../repository/producto.repository.js";

export class ProductoService {
    constructor(private readonly productoRepository: ProductoRepository) {}

    async obtenerProductos(filtro: FiltroProductoDto): Promise<ProductoResponseDto[]> {
        const productos = await this.productoRepository.getProductos(filtro.busqueda);
        return ProductoResponseDto.fromEntityList(productos);
    }

    async obtenerProductoPorId(id: number): Promise<ProductoResponseDto> {
        const producto = await this.productoRepository.getProductoPorId(id);

        if (!producto) {
            throw new NotFoundError("No se encontró ningún producto.");
        }

        return ProductoResponseDto.fromEntity(producto);
    }
}
