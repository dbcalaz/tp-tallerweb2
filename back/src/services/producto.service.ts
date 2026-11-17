import { FiltroProductoDto, ProductoResponseDto, FiltroProductoAdminDto, ActualizarActivoDto, GuardarProductoAdminDto } from "../dto/producto.dto.js";
import { NotFoundError } from "../errors/http.error.js";
import type { ProductoRepository } from "../repository/producto.repository.js";

export class ProductoService {
    constructor(private readonly productoRepository: ProductoRepository) { }

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

    async obtenerProductosAdmin(filtro: FiltroProductoAdminDto) {
        const { items, total } = await this.productoRepository.getProductosAdmin(filtro);
        return {
            items: ProductoResponseDto.fromEntityList(items),
            total,
            pagina: filtro.pagina,
            limite: filtro.limite,
            totalPaginas: Math.max(1, Math.ceil(total / filtro.limite)),
        };
    }

    async cambiarActivo(id: number, dto: ActualizarActivoDto): Promise<ProductoResponseDto> {
        try {
            const producto = await this.productoRepository.actualizarActivo(id, dto.activo);
            return ProductoResponseDto.fromEntity(producto);
        } catch (error: unknown) {
            if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
                throw new NotFoundError("No se encontró ningún producto.");
            }
            throw error;
        }
    }

    async obtenerProductoAdminPorId(id: number): Promise<ProductoResponseDto> {
        const producto = await this.productoRepository.getProductoAdminPorId(id);
        if (!producto) throw new NotFoundError("No se encontró ningún producto.");
        return ProductoResponseDto.fromEntity(producto);
    }

    async crearProductoAdmin(dto: GuardarProductoAdminDto): Promise<ProductoResponseDto> {
        return ProductoResponseDto.fromEntity(await this.productoRepository.crearProductoAdmin(dto));
    }

    async editarProductoAdmin(id: number, dto: GuardarProductoAdminDto): Promise<ProductoResponseDto> {
        try { return ProductoResponseDto.fromEntity(await this.productoRepository.editarProductoAdmin(id, dto)); }
        catch (error: unknown) {
            if (error && typeof error === "object" && "code" in error && error.code === "P2025") throw new NotFoundError("No se encontró el producto o una relación seleccionada.");
            throw error;
        }
    }
}
