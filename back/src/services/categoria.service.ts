import { CategoriaResponseDto } from "../dto/categoria.dto.js";
import { NotFoundError } from "../errors/http.error.js";
import type { CategoriaRepository } from "../repository/categoria.repository.js";

export class CategoriaService {
    constructor(private readonly categoriaRepository: CategoriaRepository) {}

    async obtenerCategorias(): Promise<CategoriaResponseDto[]> {
        const categorias = await this.categoriaRepository.getCategorias();

        if (categorias.length === 0) {
            throw new NotFoundError("No se encontraron categorías.");
        }

        return CategoriaResponseDto.fromEntityList(categorias);
    }
}
