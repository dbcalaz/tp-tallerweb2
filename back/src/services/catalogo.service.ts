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
}