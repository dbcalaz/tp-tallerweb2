import {
    CatalogoAdminResponseDto,
    CategoriaAdminResponseDto,
    MarcaAdminResponseDto,
} from "../dto/catalogo.dto.js";
import type { CatalogoRepository } from "../repository/catalogo.repository.js";

export class CatalogoService {
    constructor(private readonly catalogoRepository: CatalogoRepository) {}

    async obtenerCatalogoAdmin(): Promise<CatalogoAdminResponseDto> {
        const [categorias, marcas] = await Promise.all([
            this.catalogoRepository.getCategorias(),
            this.catalogoRepository.getMarcas(),
        ]);

        return new CatalogoAdminResponseDto(
            categorias.map((c) => CategoriaAdminResponseDto.fromEntity(c)),
            marcas.map((m) => MarcaAdminResponseDto.fromEntity(m)),
        );
    }

    obtenerOpcionesProducto() { return this.catalogoRepository.getOpcionesProducto(); }

    crearCategoria(nombre: string, imagenUrl: string | null) { return this.catalogoRepository.crearCategoria(nombre, imagenUrl); }
    editarCategoria(id: number, nombre: string, imagenUrl: string | null) { return this.catalogoRepository.editarCategoria(id, nombre, imagenUrl); }
    estadoCategoria(id: number, activo: boolean) { return this.catalogoRepository.estadoCategoria(id, activo); }
    crearTipo(nombre: string, categoriaId: number) { return this.catalogoRepository.crearTipo(nombre, categoriaId); }
    editarTipo(id: number, nombre: string, categoriaId: number) { return this.catalogoRepository.editarTipo(id, nombre, categoriaId); }
    estadoTipo(id: number, activo: boolean) { return this.catalogoRepository.estadoTipo(id, activo); }
    crearMarca(nombre: string) { return this.catalogoRepository.crearMarca(nombre); }
    editarMarca(id: number, nombre: string) { return this.catalogoRepository.editarMarca(id, nombre); }
    estadoMarca(id: number, activo: boolean) { return this.catalogoRepository.estadoMarca(id, activo); }
}
